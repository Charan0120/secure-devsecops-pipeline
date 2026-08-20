import sys
import os

from flask import Flask, render_template

# Allow Python to find the security folder
PROJECT_ROOT = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        ".."
    )
)

sys.path.insert(0, PROJECT_ROOT)

from security.vulnerability_parser import parse_all


app = Flask(__name__)


def calculate_risk(findings):

    weights = {
        "CRITICAL": 10,
        "HIGH": 7,
        "MEDIUM": 4,
        "LOW": 1,
        "INFO": 0
    }

    score = 0

    for finding in findings:

        severity = finding.get(
            "severity",
            "INFO"
        ).upper()

        score += weights.get(
            severity,
            0
        )

    return score


def get_status(score):

    if score >= 50:
        return "BLOCK"

    elif score >= 20:
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
def home():

    # Read all scanner reports
    findings = parse_all()

    # Calculate risk
    score = calculate_risk(
        findings
    )

    # Determine status
    status = get_status(
        score
    )

    # Calculate severity counts
    summary = get_summary(
        findings
    )

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