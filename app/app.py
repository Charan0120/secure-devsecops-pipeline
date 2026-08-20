<<<<<<< HEAD
from flask import Flask,request

app = Flask(__name__)

@app.route('/')
def home():
    return """
    <h1>Secure DevSecOps Pipeline version 2</h1>
    """
@app.route("/test")
def test_vulnerability():
    user_input = request.args.get("code")
    exec(user_input)
    return "Executed"
=======
import sys
import os

sys.path.insert(
    0,
    os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            ".."
        )
    )
)

from security.vulnerability_parser import parse_all
import json
import os

from flask import Flask, render_template

from security.vulnerability_parser import parse_all


app = Flask(__name__)

>>>>>>> e8427c0 (Test Trivy vulnerability detection)

def calculate_risk(findings):
    score = 0

<<<<<<< HEAD
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
=======
    weights = {
        "CRITICAL": 10,
        "HIGH": 7,
        "MEDIUM": 4,
        "LOW": 1,
        "INFO": 0
    }

    for finding in findings:
        severity = finding.get("severity", "INFO").upper()
        score += weights.get(severity, 0)

    return score


def get_status(score):
    if score >= 50:
        return "BLOCK"

    if score >= 20:
        return "WARNING"

    return "PASS"


def get_summary(findings):

    summary = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }

    for finding in findings:

        severity = finding.get(
            "severity",
            "INFO"
        ).lower()

        if severity in summary:
            summary[severity] += 1

    return summary


@app.route("/")
def dashboard():

    findings = parse_all()

    score = calculate_risk(findings)

    status = get_status(score)

    summary = get_summary(findings)

    return render_template(
        "index.html",
        findings=findings,
        score=score,
        status=status,
        summary=summary
    )


if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
>>>>>>> e8427c0 (Test Trivy vulnerability detection)
