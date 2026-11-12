import os
import sys
import json
import urllib.parse

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

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from security.vulnerability_parser import get_dashboard_summary, parse_chatbot_security

app = Flask(__name__)

# Knowledge base for AI remediation explanations
AI_REMEDIATIONS = {
    "aws-access-token-leak": {
        "title": "AWS Hardcoded Access Key Exposure",
        "cwe": "CWE-798: Use of Hard-coded Credentials",
        "owasp": "A07:2021 - Identification and Authentication Failures",
        "impact": "Exposed cloud credentials allow unauthorized attackers to access AWS cloud resources, provision compute, extract customer databases, or modify production deployments.",
        "fix": """1. Revoke the exposed AWS Access Key ID (AKIAIOSFODNN7EXAMPLE) immediately in AWS IAM Console.
2. Remove secret.txt from Git tracking:
   git rm --cached secret.txt
   echo "secret.txt" >> .gitignore
3. Use environment variables or AWS Secrets Manager:
   export AWS_ACCESS_KEY_ID="${{ secrets.AWS_ACCESS_KEY_ID }}"
   export AWS_SECRET_ACCESS_KEY="${{ secrets.AWS_SECRET_ACCESS_KEY }}"
4. Rotate any IAM credentials with zero-downtime policy."""
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
    image: python:3.11@sha256:d41d8cd98f00b204e9800998ecf8427e"""
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
2. Keep all third-party dependencies updated to their latest patched releases.
3. Apply least-privilege permissions across IAM, container execution, and cloud resources.
4. Verify continuous integration tests pass the security Quality Gate before deployment."""
    }
}


@app.route("/")
def home():
    data = get_dashboard_summary()

    return render_template(
        "index.html",
        findings=data["findings"],
        chatbot=data["chatbot"],
        score=data["score"],
        status=data["status"],
        summary=data["summary"],
        scanners=data["scannersCount"],
        scanner_status=data.get("scanners", {})
    )

@app.route("/api/summary", methods=["GET"])
def api_summary():
    return jsonify(get_dashboard_summary())

@app.route("/api/ai-explain", methods=["POST"])
def api_ai_explain():
    body = request.get_json(silent=True) or {}
    rule = body.get("rule", "")
    message = body.get("message", "")

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
    except Exception as e:
        return jsonify({"ok": False, "error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"[*] Starting DevSecOps Security Dashboard on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
