import json
import os
from flask import Flask, render_template

app = Flask(__name__)

def load_results():

    data = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "semgrep": 0,
        "checkov": 0,
        "score": 0,
        "status": "PASS"
    }

    # --------------------
    # Trivy
    # --------------------
    if os.path.exists("../trivy-results.json"):

        with open("../trivy-results.json", "r") as f:
            trivy = json.load(f)

        for result in trivy.get("Results", []):

            for vuln in result.get("Vulnerabilities", []):

                sev = vuln.get("Severity", "").upper()

                if sev == "CRITICAL":
                    data["critical"] += 1

                elif sev == "HIGH":
                    data["high"] += 1

                elif sev == "MEDIUM":
                    data["medium"] += 1

                elif sev == "LOW":
                    data["low"] += 1

    # --------------------
    # Semgrep
    # --------------------
    if os.path.exists("../semgrep-results.json"):

        with open("../semgrep-results.json", "r") as f:
            semgrep = json.load(f)

        data["semgrep"] = len(
            semgrep.get("results", [])
        )

    # --------------------
    # Checkov
    # --------------------
    if os.path.exists("../checkov-results.json"):

        with open("../checkov-results.json", "r") as f:
            checkov = json.load(f)

        print(checkov)
    

    data["score"] = (
        data["critical"] * 10 +
        data["high"] * 7 +
        data["medium"] * 4 +
        data["low"] +
        data["semgrep"] * 2 +
        data["checkov"] * 3
    )

    if data["score"] > 50:
        data["status"] = "BLOCK"

    elif data["score"] > 20:
        data["status"] = "WARNING"

    return data


@app.route("/")
def home():
    return render_template(
        "index.html",
        data=load_results()
    )


if __name__ == "__main__":
    app.run(debug=True)