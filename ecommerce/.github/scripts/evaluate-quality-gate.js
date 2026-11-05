#!/usr/bin/env node

/**
 * DevSecOps Quality Gate Evaluator
 * Aggregates findings from Semgrep, Trivy, and Checkov SARIF/JSON outputs
 * and enforces deployment gating policy:
 * - Block if any CRITICAL severity vulnerability exists.
 * - Block if HIGH severity findings exceed threshold (default max 3).
 */

const fs = require('fs');
const path = require('path');

const MAX_CRITICAL = parseInt(process.env.QUALITY_GATE_MAX_CRITICAL || '0', 10);
const MAX_HIGH = parseInt(process.env.QUALITY_GATE_MAX_HIGH || '3', 10);

console.log('====================================================');
console.log(' DEVSECOPS SECURITY QUALITY GATE EVALUATION');
console.log('====================================================');
console.log(`Policy Configuration:`);
console.log(` - Maximum Allowed Critical Findings: ${MAX_CRITICAL}`);
console.log(` - Maximum Allowed High Findings:     ${MAX_HIGH}`);
console.log('----------------------------------------------------');

let totalCritical = 0;
let totalHigh = 0;
let totalMedium = 0;
let totalLow = 0;
const findings = [];

function parseSarif(filePath, toolName) {
  if (!fs.existsSync(filePath)) {
    console.log(`[-] Warning: ${toolName} SARIF file not found at ${filePath}`);
    return;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const sarif = JSON.parse(raw);
    const runs = sarif.runs || [];
    for (const run of runs) {
      const results = run.results || [];
      for (const res of results) {
        const level = (res.level || 'warning').toLowerCase();
        let severity = 'MEDIUM';
        if (level === 'error') {
          severity = 'HIGH';
          totalHigh++;
        } else if (level === 'warning') {
          severity = 'MEDIUM';
          totalMedium++;
        } else {
          severity = 'LOW';
          totalLow++;
        }

        findings.push({
          tool: toolName,
          ruleId: res.ruleId,
          message: res.message?.text || 'Security finding',
          severity
        });
      }
    }
    console.log(`[+] Parsed ${runs.reduce((acc, r) => acc + (r.results?.length || 0), 0)} results from ${toolName}`);
  } catch (err) {
    console.error(`[-] Error reading ${toolName} SARIF:`, err.message);
  }
}

// Check for reports in reports directory
const reportsDir = path.resolve(process.cwd(), 'reports');
parseSarif(path.join(reportsDir, 'semgrep.sarif'), 'SEMGREP');
parseSarif(path.join(reportsDir, 'trivy.sarif'), 'TRIVY');
parseSarif(path.join(reportsDir, 'checkov.sarif'), 'CHECKOV');
parseSarif(path.join(reportsDir, 'chatbot-agent-security.sarif'), 'AI_CHATBOT_AGENT');

console.log('====================================================');
console.log(`Aggregated Findings Summary:`);
console.log(` - Critical: ${totalCritical}`);
console.log(` - High:     ${totalHigh}`);
console.log(` - Medium:   ${totalMedium}`);
console.log(` - Low/Info: ${totalLow}`);
console.log('====================================================');

let gatePassed = true;
const failureReasons = [];

if (totalCritical > MAX_CRITICAL) {
  gatePassed = false;
  failureReasons.push(`Critical vulnerabilities (${totalCritical}) exceed threshold (${MAX_CRITICAL})`);
}

if (totalHigh > MAX_HIGH) {
  gatePassed = false;
  failureReasons.push(`High severity vulnerabilities (${totalHigh}) exceed threshold (${MAX_HIGH})`);
}

if (!gatePassed) {
  console.error('\x1b[31m[FAILED] SECURITY QUALITY GATE VIOLATED!\x1b[0m');
  for (const r of failureReasons) {
    console.error(`  ✖ ${r}`);
  }
  console.error('Deployment is blocked until security violations are remediated.');
  process.exit(1);
} else {
  console.log('\x1b[32m[PASSED] All DevSecOps Quality Gate requirements met!\x1b[0m');
  console.log('Proceeding to deployment phase.');
  process.exit(0);
}
