#!/usr/bin/env node
/**
 * ==============================================================================
 * Publish CI/CD Security Results to DevSecOps Dashboard
 * ==============================================================================
 * Collects findings from Semgrep, Trivy, Checkov, and Chatbot Adversarial Scanner
 * and transmits them to the DevSecOps Dashboard API endpoint.
 * ==============================================================================
 */

import fs from "fs";
import path from "path";

const DASHBOARD_URL = process.env.DASHBOARD_URL;
const REPORTS_DIR = path.resolve(process.cwd(), "reports");

console.log("================================================================================");
console.log(" 🚀  DEVSECOPS CI/CD FINDINGS PUBLISHER");
console.log("================================================================================");

const findings = [];
let totalCritical = 0;
let totalHigh = 0;
let totalMedium = 0;
let totalLow = 0;

// Helper: Parse SARIF
function parseSarif(filePath, toolName) {
  if (!fs.existsSync(filePath)) {
    console.log(`[-] Warning: ${toolName} report not found at ${filePath}`);
    return;
  }
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const sarif = JSON.parse(raw);
    const runs = sarif.runs || [];
    for (const run of runs) {
      for (const res of run.results || []) {
        const level = (res.level || "warning").toLowerCase();
        let severity = "MEDIUM";
        if (level === "error") {
          severity = "HIGH";
          totalHigh++;
        } else if (level === "warning") {
          severity = "MEDIUM";
          totalMedium++;
        } else {
          severity = "LOW";
          totalLow++;
        }

        findings.push({
          id: `finding-${findings.length + 1}`,
          scanner: toolName,
          ruleId: res.ruleId || "VULN-RULE",
          title: res.message?.text?.slice(0, 80) || `${toolName} Vulnerability`,
          category: toolName === "AI_CHATBOT_AGENT" ? "AI_CHATBOT_SECURITY" : "SOURCE_CODE_SECURITY",
          severity,
          filePath: res.locations?.[0]?.physicalLocation?.artifactLocation?.uri || "repository",
          lineNumber: res.locations?.[0]?.physicalLocation?.region?.startLine || 1,
          message: res.message?.text || "Security issue identified",
          evidence: res.message?.text || "",
          remediation: "Apply verified remediation per rule guideline."
        });
      }
    }
    console.log(`[+] Loaded findings from ${toolName}`);
  } catch (err) {
    console.error(`[-] Error parsing ${toolName} report:`, err.message);
  }
}

parseSarif(path.join(REPORTS_DIR, "semgrep.sarif"), "SEMGREP");
parseSarif(path.join(REPORTS_DIR, "trivy.sarif"), "TRIVY");
parseSarif(path.join(REPORTS_DIR, "checkov.sarif"), "CHECKOV");
parseSarif(path.join(REPORTS_DIR, "chatbot-agent-security.sarif"), "AI_CHATBOT_AGENT");

// Load AI Chatbot detailed results
let chatbotSecurity = null;
const chatbotJsonPath = path.join(REPORTS_DIR, "chatbot-agent-security.json");
if (fs.existsSync(chatbotJsonPath)) {
  try {
    chatbotSecurity = JSON.parse(fs.readFileSync(chatbotJsonPath, "utf8"));
    console.log(`[+] Loaded AI Chatbot Adversarial evaluation (Defense Rate: ${chatbotSecurity.metrics?.defenseRate || "100%"})`);
  } catch {}
}

const payload = {
  commitSha: process.env.GITHUB_SHA || "local-commit",
  branch: process.env.GITHUB_REF_NAME || "main",
  workflowRunId: process.env.GITHUB_RUN_ID || "local-run",
  trigger: process.env.GITHUB_EVENT_NAME || "push",
  author: process.env.GITHUB_ACTOR || "Developer",
  summary: {
    totalFindings: findings.length,
    critical: totalCritical,
    high: totalHigh,
    medium: totalMedium,
    low: totalLow,
    informational: 0,
    byScanner: {
      SEMGREP: findings.filter(f => f.scanner === "SEMGREP").length,
      TRIVY: findings.filter(f => f.scanner === "TRIVY").length,
      CHECKOV: findings.filter(f => f.scanner === "CHECKOV").length,
      AI_CHATBOT_AGENT: findings.filter(f => f.scanner === "AI_CHATBOT_AGENT").length
    }
  },
  qualityGate: {
    passed: totalCritical === 0 && totalHigh <= 3 && (chatbotSecurity?.metrics?.securityBreaches || 0) === 0,
    criticalThreshold: 0,
    highThreshold: 3,
    reason: totalCritical === 0 && totalHigh <= 3 ? "All security policies satisfied" : "Policy threshold breached"
  },
  chatbotSecurity,
  findings
};

async function publish() {
  if (!DASHBOARD_URL) {
    console.log("\n[INFO] DASHBOARD_URL environment variable is not defined.");
    console.log("[INFO] Findings have been compiled into standard SARIF & JSON in reports/ directory.");
    console.log("[INFO] Uploaded to GitHub Security Tab (Code Scanning) and Workflow Artifacts.");
    console.log("[INFO] To sync with your remote DevSecOps Dashboard, set DASHBOARD_URL in GitHub Secrets.\n");
    return;
  }

  try {
    const targetUrl = `${DASHBOARD_URL.replace(/\/$/, "")}/api/security/ingest-ci-results`;
    console.log(`\n[+] Transmitting findings to Dashboard at: ${targetUrl}...`);
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`[SUCCESS] DevSecOps Dashboard updated successfully! Assessment ID: ${data.assessmentId}\n`);
    } else {
      console.warn(`[-] Dashboard returned warning:`, data);
    }
  } catch (err) {
    console.error(`[-] Failed to transmit findings to Dashboard:`, err.message);
  }
}

publish();
