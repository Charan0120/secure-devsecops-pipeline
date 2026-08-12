import json
import os

critical = 0
high = 0
medium = 0
low = 0

# ---------- Trivy ----------
if os.path.exists("trivy-results.json"):
    with open("trivy-results.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    for result in data.get("Results", []):
        for vuln in result.get("Vulnerabilities", []):
            sev = vuln.get("Severity", "").upper()

            if sev == "CRITICAL":
                critical += 1
            elif sev == "HIGH":
                high += 1
            elif sev == "MEDIUM":
                medium += 1
            elif sev == "LOW":
                low += 1

# ---------- Semgrep ----------
if os.path.exists("semgrep-results.json"):
    with open("semgrep-results.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    findings = len(data.get("results", []))
    medium += findings

# ---------- Checkov ----------
if os.path.exists("checkov-results.json"):
    with open("checkov-results.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    failed = len(data.get("results", {}).get("failed_checks", []))
    high += failed

score = (
    critical * 10 +
    high * 7 +
    medium * 4 +
    low * 1
)

print("\n===== SECURITY REPORT =====")
print(f"Critical : {critical}")
print(f"High     : {high}")
print(f"Medium   : {medium}")
print(f"Low      : {low}")
print(f"\nRisk Score: {score}")

if score > 50:
    print("BLOCK DEPLOYMENT")
    exit(1)

elif score > 20:
    print("WARNING")

else:
    print("PASS")