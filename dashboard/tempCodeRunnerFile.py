from flask import Flask, render_template
import json
import os

app = Flask(__name__)

def load_results():
    data = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0,
        "score": 0,
        "status": "PASS"
    }

    try:
        if os.path.exists("../trivy-results.json"):
            with open("../trivy-results.json") as f:
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

        data["score"] = (
            data["critical"] * 10 +
            data["high"] * 7 +
            data["medium"] * 4 +
            data["low"] * 1
        )

        if data["score"] > 50:
            data["status"] = "BLOCK"
        elif data["score"] > 20:
            data["status"] = "WARNING"
        else:
            data["status"] = "PASS"

    except Exception as e:
        print(e)

    return data

@app.route("/")
def home():
    return render_template("index.html", data=load_results())

if __name__ == "__main__":
    app.run(debug=True)