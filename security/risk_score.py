import json
import os

critical = 0
high = 0
medium = 0
low = 0

# --------------------
# Trivy Results
# --------------------
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


# --------------------
# Semgrep Results
# --------------------
if os.path.exists("semgrep-results.json"):

    with open("semgrep-results.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    medium += len(data.get("results", []))


# --------------------
# Checkov Results
# --------------------
if (
    os.path.exists("checkov-results.json")
    and os.path.isfile("checkov-results.json")
):

    with open("checkov-results.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    if "results" in data:
        high += len(
            data["results"].get("failed_checks", [])
        )


# --------------------
# Risk Calculation
# --------------------
score = (
    critical * 10
    + high * 7
    + medium * 4
    + low * 1
)

print("\n==============================")
print("SECURITY RISK REPORT")
print("==============================")

print(f"Critical : {critical}")
print(f"High     : {high}")
print(f"Medium   : {medium}")
print(f"Low      : {low}")

print("\nRisk Score:", score)

if score > 50:
    print("BLOCK DEPLOYMENT")
    exit(1)

elif score > 20:
    print("WARNING")

else:
    print("PASS")