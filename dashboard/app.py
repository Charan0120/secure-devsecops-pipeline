import os
import sys
import json
import time
import threading
import urllib.parse
import urllib.request
import urllib.error
import zipfile
import io
import tempfile
import shutil
from datetime import datetime, timezone

# Werkzeug 3.x / Flask backward-compatibility shim
try:
    import werkzeug.urls
    if not hasattr(werkzeug.urls, "url_quote"):
        werkzeug.urls.url_quote = urllib.parse.quote
    if not hasattr(werkzeug.urls, "url_unquote"):
        werkzeug.urls.url_unquote = urllib.parse.unquote
except (ImportError, AttributeError):
    pass

from flask import Flask, render_template, jsonify, request
from dotenv import load_dotenv

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

# Load environment variables from .env in root or app/.env
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))
load_dotenv(os.path.join(PROJECT_ROOT, "app", ".env"))

from security.vulnerability_parser import get_dashboard_summary, parse_chatbot_security

try:
    from security.monitoring_store import get_recent_events, get_event_counts
except ImportError:
    get_recent_events = None
    get_event_counts = None


app = Flask(__name__)

# ── GitHub configuration ────────────────────────────────────────────────────
GITHUB_OWNER = "Charan0120"
GITHUB_REPO = "secure-devsecops-pipeline"
GITHUB_BRANCH = "main"
ARTIFACT_NAME = "security-reports"
GITHUB_API = "https://api.github.com"

# Optional: set GITHUB_TOKEN env var for authenticated artifact downloads.
# Without a token the GitHub API list endpoints still work for public repos,
# but artifact ZIP downloads require authentication.
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")

REPORTS_DIR = os.path.join(PROJECT_ROOT, "reports")
SYNC_INTERVAL_SECONDS = 300  # 5 min cache between GitHub sync attempts

EXPECTED_REPORTS = {
    "semgrep-results.json",
    "trivy-results.json",
    "checkov-results.sarif",
    "chatbot-agent-security.json",
    "scanner-status.json",
    "garak-results.json",
}

# ── Sync state ──────────────────────────────────────────────────────────────
_sync_lock = threading.Lock()

# Detect if local reports are present for a sensible initial state.
_local_reports_present = all(
    os.path.isfile(os.path.join(REPORTS_DIR, f))
    for f in EXPECTED_REPORTS
)

_sync_state = {
    "last_attempt": None,
    "last_success": None,
    "status": "LOCAL" if _local_reports_present else "NOT_SYNCED",
    "message": (
        "Local scan reports loaded successfully."
        if _local_reports_present
        else "No local reports found. Upload a security-reports ZIP or push to GitHub."
    ),
    "run_id": None,
    "run_url": f"https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}/actions",
    "source": "local" if _local_reports_present else "none",
}

# ── File watcher ────────────────────────────────────────────────────────────
# Watches reports/ for file changes so the dashboard data refreshes automatically
# without restarting the server.
_reports_mtimes: dict = {}
_reports_dirty = threading.Event()


def _get_report_mtimes() -> dict:
    mtimes = {}
    for fname in EXPECTED_REPORTS:
        path = os.path.join(REPORTS_DIR, fname)
        try:
            mtimes[fname] = os.path.getmtime(path)
        except OSError:
            mtimes[fname] = None
    return mtimes


def _file_watcher():
    """Background thread: polls reports/ every 3 s and flags dirty on change."""
    global _reports_mtimes
    _reports_mtimes = _get_report_mtimes()
    while True:
        time.sleep(3)
        current = _get_report_mtimes()
        if current != _reports_mtimes:
            _reports_mtimes = current
            _reports_dirty.set()
            print(
                f"[watcher] Report files changed at "
                f"{datetime.now().strftime('%H:%M:%S')} — dashboard will refresh."
            )


_watcher_thread = threading.Thread(target=_file_watcher, daemon=True)
_watcher_thread.start()


# ── Helpers ─────────────────────────────────────────────────────────────────

def _github_headers() -> dict:
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "SecureDevSecOps-local-dashboard",
    }
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


def _github_json(url: str):
    req = urllib.request.Request(url, headers=_github_headers(), method="GET")
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _find_latest_artifact():
    runs_url = (
        f"{GITHUB_API}/repos/{GITHUB_OWNER}/{GITHUB_REPO}/actions/runs"
        f"?branch={urllib.parse.quote(GITHUB_BRANCH)}&status=success&per_page=10"
    )
    runs_data = _github_json(runs_url)

    for run in runs_data.get("workflow_runs", []):
        run_id = run.get("id")
        if not run_id:
            continue
        artifacts_url = (
            f"{GITHUB_API}/repos/{GITHUB_OWNER}/{GITHUB_REPO}"
            f"/actions/runs/{run_id}/artifacts?per_page=100"
        )
        artifacts_data = _github_json(artifacts_url)

        for artifact in artifacts_data.get("artifacts", []):
            if (
                artifact.get("name") == ARTIFACT_NAME
                and not artifact.get("expired", False)
            ):
                return run, artifact

    raise RuntimeError(
        f"No unexpired '{ARTIFACT_NAME}' artifact found in the latest "
        f"10 successful runs of branch '{GITHUB_BRANCH}'."
    )


def _extract_zip_to_reports(archive_bytes: bytes) -> list[str]:
    """Extract expected report files from a zip archive into REPORTS_DIR.

    Returns the list of extracted file names.
    """
    if len(archive_bytes) > 50 * 1024 * 1024:
        raise RuntimeError("Archive is larger than 50 MB — rejected.")

    extracted: dict[str, bytes] = {}
    with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
        for info in archive.infolist():
            if info.is_dir():
                continue
            normalized = info.filename.replace("\\", "/")
            basename = normalized.rsplit("/", 1)[-1]
            if basename not in EXPECTED_REPORTS:
                continue
            if info.file_size > 15 * 1024 * 1024:
                raise RuntimeError(f"Report file too large: {basename}")
            extracted[basename] = archive.read(info)

    if not extracted:
        raise RuntimeError(
            "No expected report files found in the archive. "
            f"Expected one or more of: {', '.join(sorted(EXPECTED_REPORTS))}"
        )

    os.makedirs(REPORTS_DIR, exist_ok=True)
    staging_dir = tempfile.mkdtemp(prefix=".reports-sync-", dir=REPORTS_DIR)
    try:
        for fname, content in extracted.items():
            with open(os.path.join(staging_dir, fname), "wb") as fh:
                fh.write(content)
        for fname in extracted:
            os.replace(
                os.path.join(staging_dir, fname),
                os.path.join(REPORTS_DIR, fname),
            )
    finally:
        shutil.rmtree(staging_dir, ignore_errors=True)

    return list(extracted.keys())


def _download_and_extract(artifact) -> list[str]:
    """Download a GitHub Actions artifact zip and extract it."""
    if not GITHUB_TOKEN:
        raise RuntimeError(
            "GitHub artifact downloads require authentication. "
            "Set the GITHUB_TOKEN environment variable and restart the dashboard."
        )

    download_url = (
        f"{GITHUB_API}/repos/{GITHUB_OWNER}/{GITHUB_REPO}"
        f"/actions/artifacts/{artifact['id']}/zip"
    )
    req = urllib.request.Request(
        download_url, headers=_github_headers(), method="GET"
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        archive_bytes = resp.read()

    return _extract_zip_to_reports(archive_bytes)


def _has_local_reports() -> bool:
    return all(
        os.path.isfile(os.path.join(REPORTS_DIR, f)) for f in EXPECTED_REPORTS
    )


def sync_latest_reports(force: bool = False) -> dict:
    """Attempt GitHub sync; fall back gracefully to local reports."""
    with _sync_lock:
        now = time.time()
        last_attempt = _sync_state.get("_last_attempt_epoch", 0)

        # Skip if recently synced successfully from GitHub (not LOCAL / NOT_SYNCED).
        if (
            not force
            and _sync_state["status"] == "COMPLETED"
            and now - last_attempt < SYNC_INTERVAL_SECONDS
        ):
            return {k: v for k, v in _sync_state.items() if not k.startswith("_")}

        _sync_state["_last_attempt_epoch"] = now
        _sync_state["last_attempt"] = datetime.now(timezone.utc).isoformat()

        # Skip GitHub if no token is configured.
        if not GITHUB_TOKEN:
            if _has_local_reports():
                _sync_state["status"] = "LOCAL"
                _sync_state["message"] = (
                    "Local reports in use. "
                    "Set GITHUB_TOKEN to enable automatic GitHub Actions sync."
                )
                _sync_state["source"] = "local"
            else:
                _sync_state["status"] = "NOT_SYNCED"
                _sync_state["message"] = (
                    "No local reports found and no GITHUB_TOKEN set. "
                    "Upload a security-reports ZIP via the dashboard button."
                )
                _sync_state["source"] = "none"
            return {k: v for k, v in _sync_state.items() if not k.startswith("_")}

        # Attempt GitHub sync when a token is available.
        _sync_state["status"] = "SYNCING"
        _sync_state["message"] = "Checking GitHub Actions for the latest reports…"

        try:
            run, artifact = _find_latest_artifact()
            extracted = _download_and_extract(artifact)
            _sync_state.update({
                "last_success": datetime.now(timezone.utc).isoformat(),
                "status": "COMPLETED",
                "message": (
                    f"Downloaded {len(extracted)} report(s) from GitHub Actions "
                    f"(run #{run.get('id')})."
                ),
                "run_id": run.get("id"),
                "run_url": run.get("html_url"),
                "source": "github",
            })
            print(f"[sync] GitHub sync OK — run #{run.get('id')}")
        except Exception as error:
            if _has_local_reports():
                _sync_state["status"] = "LOCAL"
                _sync_state["message"] = (
                    f"GitHub sync failed — using local reports. ({str(error)[:120]})"
                )
                _sync_state["source"] = "local"
            else:
                _sync_state["status"] = "ERROR"
                _sync_state["message"] = str(error)
                _sync_state["source"] = "none"
            print(f"[sync] GitHub sync error: {error}")

        return {k: v for k, v in _sync_state.items() if not k.startswith("_")}


# ── Knowledge base for AI remediation explanations ──────────────────────────
AI_REMEDIATIONS = {
    "aws-access-token-leak": {
        "title": "AWS Hardcoded Access Key Exposure",
        "cwe": "CWE-798: Use of Hard-coded Credentials",
        "owasp": "A07:2021 - Identification and Authentication Failures",
        "impact": "Exposed cloud credentials allow unauthorized attackers to access AWS cloud resources, provision compute, extract customer databases, or modify production deployments.",
        "fix": """1. Revoke the exposed AWS Access Key ID immediately in AWS IAM Console.
2. Remove secret.txt from Git tracking:
   git rm --cached secret.txt
   echo "secret.txt" >> .gitignore
3. Use environment variables or AWS Secrets Manager.
4. Rotate any IAM credentials with a zero-downtime policy."""
    },
    "CKV_K8S_43": {
        "title": "Kubernetes Pod Missing Image Digest Tag",
        "cwe": "CWE-1188: Insecure Default Initialization of Resource",
        "owasp": "A05:2021 - Security Misconfiguration",
        "impact": "Using mutable container tags (like :latest) can lead to unexpected image updates, breaking builds or pulling compromised images if an upstream registry is tampered with.",
        "fix": """Pin the container image using its immutable SHA-256 digest:
spec:
  containers:
  - name: secure-app
    image: python:3.11@sha256:<verified-image-digest>"""
    },
    "CKV_K8S_21": {
        "title": "Container Running Without Read-Only Root Filesystem",
        "cwe": "CWE-732: Incorrect Permission Assignment for Critical Resource",
        "owasp": "A05:2021 - Security Misconfiguration",
        "impact": "If an attacker achieves remote code execution inside the container, a writable root filesystem allows installing rootkits, modifying binaries, and downloading malicious payloads.",
        "fix": """Enable readOnlyRootFilesystem in the Pod securityContext:
securityContext:
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 10001"""
    },
    "default": {
        "title": "Automated Security Remediation Guidance",
        "cwe": "CWE-699: Software Development Security Vulnerability",
        "owasp": "OWASP Top 10 Security Standard",
        "impact": "Potential security vulnerability identified by automated static/dynamic scanning tool.",
        "fix": """1. Validate and sanitize all user-supplied inputs using strict whitelists.
2. Keep third-party dependencies updated to their latest patched releases.
3. Apply least-privilege permissions across IAM, container execution, and cloud resources.
4. Verify continuous integration tests pass the security Quality Gate before deployment."""
    }
}


# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    _reports_dirty.clear()          # Clear dirty flag on page load
    sync_state = sync_latest_reports()
    data = get_dashboard_summary()
    return render_template(
        "index.html",
        findings=data["findings"],
        chatbot=data["chatbot"],
        score=data["score"],
        status=data["status"],
        summary=data["summary"],
        scanners=data["scannersCount"],
        scanner_status=data.get("scanners", {}),
        report_sync=sync_state,
    )


@app.route("/api/summary", methods=["GET"])
def api_summary():
    sync_state = sync_latest_reports()
    data = get_dashboard_summary()
    data["reportSync"] = sync_state

    # Include per-file metadata so the UI can show last-updated times.
    report_files = {}
    for filename in sorted(EXPECTED_REPORTS):
        report_path = os.path.join(REPORTS_DIR, filename)
        if os.path.isfile(report_path):
            stat = os.stat(report_path)
            report_files[filename] = {
                "updatedAt": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                "sizeBytes": stat.st_size,
            }
        else:
            report_files[filename] = None
    data["reportFiles"] = report_files

    # Tell the client whether the data has changed since last check.
    data["dirty"] = _reports_dirty.is_set()

    return jsonify(data)


@app.route("/api/report-sync", methods=["POST"])
def api_report_sync():
    """Force an immediate GitHub sync (requires GITHUB_TOKEN)."""
    sync_state = sync_latest_reports(force=True)
    data = get_dashboard_summary()
    ok = sync_state.get("status") in ("COMPLETED", "LOCAL")
    return jsonify({
        "ok": ok,
        "reportSync": sync_state,
        "summary": data,
    }), (200 if ok else 502)


@app.route("/api/upload-reports", methods=["POST"])
def api_upload_reports():
    """Accept a security-reports ZIP file and extract it into reports/.

    Usage:
        curl -X POST http://127.0.0.1:5001/api/upload-reports \\
             -F "file=@security-reports.zip"

    Or drag-and-drop via the dashboard upload button.
    """
    if "file" not in request.files:
        return jsonify({"ok": False, "error": "No 'file' field in request."}), 400

    uploaded = request.files["file"]
    if not uploaded.filename:
        return jsonify({"ok": False, "error": "Empty filename."}), 400
    if not uploaded.filename.lower().endswith(".zip"):
        return jsonify({"ok": False, "error": "Only .zip files are accepted."}), 400

    archive_bytes = uploaded.read()

    try:
        extracted = _extract_zip_to_reports(archive_bytes)
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 422

    # Update sync state to reflect the upload.
    with _sync_lock:
        _sync_state.update({
            "last_success": datetime.now(timezone.utc).isoformat(),
            "status": "LOCAL",
            "message": (
                f"Reports updated from uploaded ZIP "
                f"({len(extracted)} file(s): {', '.join(sorted(extracted))})."
            ),
            "source": "upload",
        })

    data = get_dashboard_summary()
    return jsonify({
        "ok": True,
        "extracted": sorted(extracted),
        "summary": {
            "findings": len(data["findings"]),
            "score": data["score"],
            "status": data["status"],
            "summary": data["summary"],
            "chatbot": {
                "defenseRate": data["chatbot"].get("defenseRate"),
                "status": data["chatbot"].get("status"),
                "attacksNeutralized": data["chatbot"].get("attacksNeutralized"),
            },
        },
    })


@app.route("/api/reports-status", methods=["GET"])
def api_reports_status():
    """Return per-file report metadata and dirty flag for polling clients."""
    report_files = {}
    for filename in sorted(EXPECTED_REPORTS):
        path = os.path.join(REPORTS_DIR, filename)
        if os.path.isfile(path):
            stat = os.stat(path)
            report_files[filename] = {
                "present": True,
                "updatedAt": datetime.fromtimestamp(stat.st_mtime, timezone.utc).isoformat(),
                "sizeBytes": stat.st_size,
            }
        else:
            report_files[filename] = {"present": False}

    return jsonify({
        "ok": True,
        "dirty": _reports_dirty.is_set(),
        "files": report_files,
        "syncState": {k: v for k, v in _sync_state.items() if not k.startswith("_")},
    })


@app.route("/api/monitoring/events", methods=["GET"])
def api_monitoring_events():
    """Return chatbot security-event metadata only; never expose prompt/answer text."""
    try:
        if get_recent_events is None or get_event_counts is None:
            return jsonify({
                "ok": True,
                "available": False,
                "events": [],
                "counts": {"total": 0, "blocked": 0, "allowed": 0},
                "message": "Live monitoring helper is not installed yet.",
            })

        events = get_recent_events(request.args.get("limit", 100))
        counts = get_event_counts()
        safe_events = [{
            "id": event.get("id"),
            "created_at": event.get("created_at"),
            "source": event.get("source"),
            "category": event.get("category"),
            "severity": event.get("severity"),
            "outcome": event.get("outcome"),
            "is_predefined": bool(event.get("is_predefined")),
            "details": event.get("details", ""),
        } for event in events]
        return jsonify({"ok": True, "available": True, "events": safe_events, "counts": counts})
    except Exception as error:
        return jsonify({
            "ok": True,
            "available": False,
            "events": [],
            "counts": {"total": 0, "blocked": 0, "allowed": 0},
            "message": str(error),
        })


@app.route("/api/ai-explain", methods=["POST"])
def api_ai_explain():
    body = request.get_json(silent=True) or {}
    rule = body.get("rule", "")
    remediation = AI_REMEDIATIONS.get(rule) or AI_REMEDIATIONS.get("default")
    return jsonify({
        "ok": True,
        "rule": rule,
        "title": remediation["title"],
        "cwe": remediation["cwe"],
        "owasp": remediation["owasp"],
        "impact": remediation["impact"],
        "remediationCode": remediation["fix"],
    })


@app.route("/api/run-chatbot-tests", methods=["POST"])
def run_chatbot_tests():
    try:
        from security.chatbot_agent_scanner import run
        run()
        data = parse_chatbot_security()
        return jsonify({"ok": True, "chatbot": data})
    except Exception as error:
        return jsonify({"ok": False, "error": str(error)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    token_status = "✓ GITHUB_TOKEN set" if GITHUB_TOKEN else "✗ no GITHUB_TOKEN (local/upload mode)"
    print(f"[*] Starting DevSecOps Security Dashboard on http://127.0.0.1:{port}")
    print(f"[*] Repository : https://github.com/{GITHUB_OWNER}/{GITHUB_REPO}")
    print(f"[*] Auth status: {token_status}")
    print(f"[*] Reports dir: {REPORTS_DIR}")
    print(f"[*] Upload URL : http://127.0.0.1:{port}/api/upload-reports")
    app.run(host="127.0.0.1", port=port, debug=False)
