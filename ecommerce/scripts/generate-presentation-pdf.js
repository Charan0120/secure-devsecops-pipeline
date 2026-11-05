import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const slides = [
  // Slide 1: Title
  `
  <div class="slide slide-title">
    <div class="glow-orb glow-1"></div>
    <div class="glow-orb glow-2"></div>
    
    <div class="title-top">
      <div class="tag-badge">
        <span class="badge-dot"></span>
        ACADEMIC CAPSTONE PROJECT &bull; DEVSECOPS &amp; APPLICATION SECURITY
      </div>
      <div class="inst-tag">Department of Computer Science &amp; Information Security</div>
    </div>

    <div class="title-main">
      <h1 class="hero-title">
        Secure DevSecOps Pipeline<br/>
        <span class="gradient-text">with Automated AI Chatbot</span><br/>
        Vulnerability Assessment
      </h1>
      <p class="hero-subtitle">
        A shift-left security architecture integrating static analysis, dependency composition, secret detection, 
        and infrastructure-as-code verification with real-time conversational barrier enforcement.
      </p>
    </div>

    <div class="title-footer-grid">
      <div class="title-card">
        <div class="card-label">CORE SECURITY SCANNERS</div>
        <div class="card-val text-cyan">SEMGREP &bull; TRIVY &bull; CHECKOV</div>
      </div>
      <div class="title-card">
        <div class="card-label">TARGET SYSTEM</div>
        <div class="card-val text-emerald">Aura AI Assistant &amp; Full-Stack Platform</div>
      </div>
      <div class="title-card">
        <div class="card-label">POLICY ENFORCEMENT</div>
        <div class="card-val text-amber">Automated CI/CD Quality Gate (0 Critical)</div>
      </div>
      <div class="title-card">
        <div class="card-label">RUNTIME BARRIER</div>
        <div class="card-val text-blue">11 Whitelisted Prompts &bull; CWE Isolation</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Academic Presentation</span>
      <span>Slide 01 / 14</span>
    </div>
  </div>
  `,

  // Slide 2: Abstract & Executive Summary
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">PROJECT FOUNDATION</div>
      <h2 class="slide-title">Executive Summary &amp; Research Abstract</h2>
      <p class="slide-desc">Bridging the gap between rapid generative AI adoption and enterprise application security engineering.</p>
    </div>

    <div class="grid-2-col">
      <div class="info-block">
        <h3 class="block-title text-cyan">Research Background &amp; Motivation</h3>
        <p class="text-body">
          The proliferation of conversational AI chatbots in commercial platforms introduces critical attack surfaces. 
          Traditional security auditing often happens late in the release cycle (post-production penetration testing), 
          which is slow, costly, and ineffective against dynamic prompt manipulation, dependency vulnerabilities, and cloud misconfigurations.
        </p>
        <p class="text-body mt-3">
          This academic project designs and implements an <strong>automated, continuous DevSecOps pipeline</strong> that evaluates 
          the AI Chatbot application across its entire lifecycle: source code, dependencies, secrets, container images, and infrastructure templates.
        </p>
      </div>

      <div class="feature-stack">
        <div class="feature-item border-cyan">
          <div class="feature-num">01</div>
          <div>
            <strong>Strict Three-Tool Scanning Core:</strong> Semgrep (SAST), Aqua Trivy (SCA &amp; Secrets), and Bridgecrew Checkov (IaC), eliminating generic tool sprawl.
          </div>
        </div>
        <div class="feature-item border-emerald">
          <div class="feature-num">02</div>
          <div>
            <strong>6-Stage Continuous Lifecycle:</strong> From developer local commit to automated multi-engine scanning, unified finding correlation, and deployment gating.
          </div>
        </div>
        <div class="feature-item border-purple">
          <div class="feature-num">03</div>
          <div>
            <strong>Aura AI Chatbot Runtime Barrier:</strong> Strict 11-prompt authorized perimeter. Non-whitelisted queries and injection attacks are blocked and logged into the security audit database in real time.
          </div>
        </div>
        <div class="feature-item border-amber">
          <div class="feature-num">04</div>
          <div>
            <strong>Automated Quality Gate Enforcement:</strong> Fails CI/CD build deployments if any Critical vulnerability is found, ensuring zero-day risk containment.
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Executive Summary</span>
      <span>Slide 02 / 14</span>
    </div>
  </div>
  `,

  // Slide 3: Problem Statement
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag text-red">THREAT LANDSCAPE &amp; CHALLENGES</div>
      <h2 class="slide-title">Problem Statement: AI Chatbot Attack Vectors</h2>
      <p class="slide-desc">Identifying real-world security vulnerabilities threatening modern AI-powered applications.</p>
    </div>

    <div class="grid-4-col">
      <div class="threat-card">
        <div class="threat-badge bg-red">CWE-89 / CWE-78</div>
        <h4 class="threat-title">Code &amp; Injection Sinks</h4>
        <p class="threat-desc">
          Chatbot backends frequently interface with databases and system utilities. Without strict parameterization, attackers execute SQL injection or OS command injection via conversational inputs.
        </p>
        <div class="threat-stat">Risk: Remote Code Execution (RCE)</div>
      </div>

      <div class="threat-card">
        <div class="threat-badge bg-orange">CWE-1395 / CVEs</div>
        <h4 class="threat-title">Supply Chain Vulnerabilities</h4>
        <p class="threat-desc">
          Modern AI backends pull hundreds of third-party NPM and Python packages. Unpatched packages introduce transitive CVEs, prototype pollution, and denial-of-service flaws.
        </p>
        <div class="threat-stat">Risk: Compromised Dependencies</div>
      </div>

      <div class="threat-card">
        <div class="threat-badge bg-yellow">CWE-798</div>
        <h4 class="threat-title">Hardcoded Secrets &amp; Keys</h4>
        <p class="threat-desc">
          Developers accidentally commit cloud access tokens, OpenAI API keys, database connection strings, or JWT signing secrets directly into git repositories and container filesystems.
        </p>
        <div class="threat-stat">Risk: Credential Exfiltration</div>
      </div>

      <div class="threat-card">
        <div class="threat-badge bg-blue">CIS Benchmarks</div>
        <h4 class="threat-title">Insecure Container &amp; IaC</h4>
        <p class="threat-desc">
          Dockerfiles running as root, exposed sensitive ports, missing container resource limits, and permissive Kubernetes security contexts enable container breakout into host environments.
        </p>
        <div class="threat-stat">Risk: Infrastructure Takeover</div>
      </div>
    </div>

    <div class="callout-box bg-red-dim border-red mt-4">
      <strong class="text-red">The Core Academic Challenge:</strong> How can development teams continuously and automatically discover, correlate, and remediate all four threat tiers before code reaches production, without disrupting the developer workflow?
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Threat Modeling</span>
      <span>Slide 03 / 14</span>
    </div>
  </div>
  `,

  // Slide 4: Methodology: Shift-Left Security
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">PARADIGM SHIFT</div>
      <h2 class="slide-title">DevSecOps Methodology: Shift-Left Security</h2>
      <p class="slide-desc">Transforming security from an isolated gatekeeper into an automated, continuous pipeline companion.</p>
    </div>

    <div class="grid-2-col">
      <div class="comparison-card border-red">
        <div class="comp-header text-red">TRADITIONAL DEVSECOPS (ANTI-PATTERN)</div>
        <ul class="comp-list">
          <li><strong>Late Testing:</strong> Security audits conducted weeks after code deployment.</li>
          <li><strong>Manual Bottlenecks:</strong> Human penetration testers manually inspect codebase.</li>
          <li><strong>Disjointed Tools:</strong> Incompatible reports from fragmented scanners.</li>
          <li><strong>High Remediation Cost:</strong> Fixing flaws in production costs 30x more than in development.</li>
          <li><strong>Developer Friction:</strong> Developers receive vague PDF tickets without exact line numbers or fix guidance.</li>
        </ul>
      </div>

      <div class="comparison-card border-emerald">
        <div class="comp-header text-emerald">OUR SHIFT-LEFT DEVSECOPS PLATFORM</div>
        <ul class="comp-list">
          <li><strong>Immediate Feedback:</strong> Scanners execute at code commit and pull request time.</li>
          <li><strong>100% Automated:</strong> Background worker orchestration with zero manual delay.</li>
          <li><strong>Unified Correlation:</strong> Standardized finding schema combining Semgrep, Trivy, and Checkov.</li>
          <li><strong>Cost Reduction:</strong> Vulnerabilities caught and remediated during development.</li>
          <li><strong>Actionable Guidance:</strong> Exact file paths, line numbers, CWE codes, and drop-in code remedies.</li>
        </ul>
      </div>
    </div>

    <div class="stats-ribbon mt-4">
      <div class="ribbon-item">
        <div class="ribbon-val text-cyan">&lt; 15s</div>
        <div class="ribbon-lbl">Full Multi-Scanner Run Time</div>
      </div>
      <div class="ribbon-item">
        <div class="ribbon-val text-emerald">0</div>
        <div class="ribbon-lbl">Critical Tolerated in Production</div>
      </div>
      <div class="ribbon-item">
        <div class="ribbon-val text-purple">100%</div>
        <div class="ribbon-lbl">Secret Redaction Coverage</div>
      </div>
      <div class="ribbon-item">
        <div class="ribbon-val text-amber">3 Primary</div>
        <div class="ribbon-lbl">Best-of-Breed Scanners</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Methodology</span>
      <span>Slide 04 / 14</span>
    </div>
  </div>
  `,

  // Slide 5: The 3-Tool Scanning Suite
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">TECHNOLOGY ARCHITECTURE</div>
      <h2 class="slide-title">The Three-Tool Primary Scanning Suite</h2>
      <p class="slide-desc">Carefully selected, complementary, non-overlapping scanning engines covering all architectural layers.</p>
    </div>

    <div class="grid-3-col">
      <!-- Tool 1: Semgrep -->
      <div class="scanner-card border-cyan">
        <div class="scanner-head">
          <div class="scanner-title text-cyan">TOOL 1: SEMGREP</div>
          <span class="version-tag">v1.183.0</span>
        </div>
        <div class="scanner-role">Static Application Security Testing (SAST)</div>
        <p class="scanner-desc">
          Parses Abstract Syntax Trees (AST) across Python, JavaScript, TypeScript, Java, and C/C++ without requiring code execution or builds.
        </p>
        <div class="scanner-section">
          <strong>Key Detection Capabilities:</strong>
          <ul>
            <li>SQL Injection patterns (CWE-89)</li>
            <li>OS Command Injection sinks (CWE-78)</li>
            <li>Insecure deserialization &amp; eval()</li>
            <li>Broken authorization logic &amp; CSRF</li>
            <li>Hardcoded cryptographic keys &amp; tokens</li>
          </ul>
        </div>
        <div class="scanner-badge">Outputs: JSON &bull; SARIF &bull; Unified Schema</div>
      </div>

      <!-- Tool 2: Trivy -->
      <div class="scanner-card border-emerald">
        <div class="scanner-head">
          <div class="scanner-title text-emerald">TOOL 2: AQUA TRIVY</div>
          <span class="version-tag">v0.76.1</span>
        </div>
        <div class="scanner-role">SCA, Secrets &amp; Container Security</div>
        <p class="scanner-desc">
          Comprehensive scanner for open-source dependency manifests, container layers, and sensitive high-entropy credentials.
        </p>
        <div class="scanner-section">
          <strong>Key Detection Capabilities:</strong>
          <ul>
            <li>Vulnerable packages in package.json &amp; lockfiles</li>
            <li>Known CVE matching with CVSS scores</li>
            <li>Exposed API keys &amp; high-entropy tokens</li>
            <li>Container OS package vulnerabilities</li>
            <li>Automated zero-leakage token redaction</li>
          </ul>
        </div>
        <div class="scanner-badge">Outputs: JSON &bull; CVE Mappings &bull; Fix Versions</div>
      </div>

      <!-- Tool 3: Checkov -->
      <div class="scanner-card border-amber">
        <div class="scanner-head">
          <div class="scanner-title text-amber">TOOL 3: CHECKOV</div>
          <span class="version-tag">v3.4.3</span>
        </div>
        <div class="scanner-role">Infrastructure as Code (IaC) Security</div>
        <p class="scanner-desc">
          Policy-as-code enforcement engine evaluating Dockerfiles, docker-compose, Kubernetes manifests, and Terraform templates against CIS benchmarks.
        </p>
        <div class="scanner-section">
          <strong>Key Detection Capabilities:</strong>
          <ul>
            <li>Privileged and root-user containers</li>
            <li>Missing CPU/Memory resource constraints</li>
            <li>Insecure exposed network ports</li>
            <li>Unencrypted storage and missing tags</li>
            <li>Kubernetes pod security standard violations</li>
          </ul>
        </div>
        <div class="scanner-badge">Outputs: JSON &bull; CIS Rule IDs &bull; Hardening Fixes</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Scanning Tools</span>
      <span>Slide 05 / 14</span>
    </div>
  </div>
  `,

  // Slide 6: 6-Stage DevSecOps Lifecycle Flowchart
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">PIPELINE WORKFLOW</div>
      <h2 class="slide-title">The 6-Stage DevSecOps Lifecycle Flowchart</h2>
      <p class="slide-desc">End-to-end continuous security lifecycle strictly implementing the project architecture design.</p>
    </div>

    <div class="flowchart-container">
      <div class="flow-step">
        <div class="step-num">STAGE 1</div>
        <div class="step-icon">&lt;/&gt;</div>
        <div class="step-title">Developer Writes Code</div>
        <div class="step-sub">Website source, API backend, database queries &amp; AI chatbot logic</div>
      </div>

      <div class="flow-arrow">&rarr;</div>

      <div class="flow-step">
        <div class="step-num">STAGE 2</div>
        <div class="step-icon">&uarr;</div>
        <div class="step-title">Push to GitHub</div>
        <div class="step-sub">Git commit or pull request triggers automated GitHub Actions workflow</div>
      </div>

      <div class="flow-arrow">&rarr;</div>

      <div class="flow-step highlight-step">
        <div class="step-num">STAGE 3</div>
        <div class="step-icon">&#9881;</div>
        <div class="step-title">Automated Scanning</div>
        <div class="step-sub">
          &bull; Semgrep &rarr; Source code<br/>
          &bull; Trivy &rarr; Dependencies &amp; Secrets<br/>
          &bull; Checkov &rarr; IaC &amp; Docker
        </div>
      </div>

      <div class="flow-arrow">&rarr;</div>

      <div class="flow-step">
        <div class="step-num">STAGE 4</div>
        <div class="step-icon">&#8987;</div>
        <div class="step-title">Vulnerability Algorithm</div>
        <div class="step-sub">Normalizes, deduplicates, ranks severity and maps CWE/CVE references</div>
      </div>

      <div class="flow-arrow">&rarr;</div>

      <div class="flow-step">
        <div class="step-num">STAGE 5</div>
        <div class="step-icon">&#128196;</div>
        <div class="step-title">Consolidated Report</div>
        <div class="step-sub">Multi-format export: PDF report, HTML dashboard, SARIF &amp; JSON</div>
      </div>

      <div class="flow-arrow">&rarr;</div>

      <div class="flow-step gate-step">
        <div class="step-num">STAGE 6</div>
        <div class="gate-split">
          <div class="gate-pass">PASS &rarr; Deploy</div>
          <div class="gate-fail">FAIL &rarr; Block</div>
        </div>
        <div class="step-sub">0 Critical / max 3 High policy threshold enforcement</div>
      </div>
    </div>

    <div class="callout-box bg-slate-dim mt-4">
      <div class="grid-3-col text-center">
        <div><strong>Trigger:</strong> Automated CI/CD Webhook or Manual UI</div>
        <div><strong>Execution:</strong> Sandboxed &amp; Isolated Concurrency</div>
        <div><strong>Outcome:</strong> Verifiable Pass/Fail Compliance Audit</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Lifecycle Architecture</span>
      <span>Slide 06 / 14</span>
    </div>
  </div>
  `,

  // Slide 7: Universal File Support Matrix
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">SCOPE &amp; COVERAGE</div>
      <h2 class="slide-title">Universal File Support Matrix (Section 5)</h2>
      <p class="slide-desc">Automatic scanner mapping across source code, dependencies, infrastructure manifests, and archives.</p>
    </div>

    <div class="grid-4-col">
      <div class="file-card border-cyan">
        <div class="file-icon text-cyan">&#128196;</div>
        <h4 class="file-cat">Source Code</h4>
        <div class="file-scanner text-cyan">Scanner: SEMGREP</div>
        <div class="file-exts">
          <span class="ext-badge">.py</span>
          <span class="ext-badge">.java</span>
          <span class="ext-badge">.js</span>
          <span class="ext-badge">.ts</span>
          <span class="ext-badge">.c</span>
          <span class="ext-badge">.cpp</span>
          <span class="ext-badge">.h</span>
          <span class="ext-badge">.hpp</span>
        </div>
        <p class="file-desc">Evaluates AST patterns for injection, tainted input handling, and security coding bugs.</p>
      </div>

      <div class="file-card border-emerald">
        <div class="file-icon text-emerald">&#128230;</div>
        <h4 class="file-cat">Dependency Manifests</h4>
        <div class="file-scanner text-emerald">Scanner: TRIVY</div>
        <div class="file-exts">
          <span class="ext-badge">package.json</span>
          <span class="ext-badge">package-lock.json</span>
          <span class="ext-badge">requirements.txt</span>
          <span class="ext-badge">pyproject.toml</span>
          <span class="ext-badge">pom.xml</span>
          <span class="ext-badge">build.gradle</span>
        </div>
        <p class="file-desc">Checks vulnerability databases (NVD, GitHub Advisories) and flags exposed API tokens.</p>
      </div>

      <div class="file-card border-amber">
        <div class="file-icon text-amber">&#9881;</div>
        <h4 class="file-cat">Infrastructure as Code</h4>
        <div class="file-scanner text-amber">Scanner: CHECKOV</div>
        <div class="file-exts">
          <span class="ext-badge">Dockerfile</span>
          <span class="ext-badge">docker-compose.yml</span>
          <span class="ext-badge">*.k8s.yaml</span>
          <span class="ext-badge">*.tf</span>
          <span class="ext-badge">*.tfvars</span>
        </div>
        <p class="file-desc">Validates container definitions, root users, port bindings, and cloud security baselines.</p>
      </div>

      <div class="file-card border-purple">
        <div class="file-icon text-purple">&#128206;</div>
        <h4 class="file-cat">Upload Packages</h4>
        <div class="file-scanner text-purple">Scanner: AUTO-MAPPED</div>
        <div class="file-exts">
          <span class="ext-badge">.zip</span>
          <span class="ext-badge">Safe Sandbox</span>
          <span class="ext-badge">Quotas (50MB)</span>
        </div>
        <p class="file-desc">Securely unzips authorized assessment archives, enforces size quotas, and blocks executable scripts.</p>
      </div>
    </div>

    <div class="callout-box bg-cyan-dim border-cyan mt-4">
      <strong>Zero Execution Guarantee:</strong> Uploaded source code and build scripts are parsed statically as text files. The orchestration engine never runs arbitrary scripts, shell commands, or npm install on target packages.
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; File Support</span>
      <span>Slide 07 / 14</span>
    </div>
  </div>
  `,

  // Slide 8: Scanner Orchestration Engine
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">BACKEND ARCHITECTURE</div>
      <h2 class="slide-title">Scanner Orchestration Engine</h2>
      <p class="slide-desc">Resilient, isolated, and concurrent multi-scanner execution management service.</p>
    </div>

    <div class="grid-2-col">
      <div class="info-block">
        <h3 class="block-title text-cyan">Orchestrator Architecture Responsibilities</h3>
        <div class="checklist">
          <div class="check-item">&#10003; <strong>Binary &amp; Version Discovery:</strong> Probes system PATH to verify Semgrep, Trivy, and Checkov versions before initiation.</div>
          <div class="check-item">&#10003; <strong>Independent Concurrency:</strong> Executes scanners via isolated Node.js child processes in parallel.</div>
          <div class="check-item">&#10003; <strong>Fault Isolation:</strong> Failure or timeout in one scanner never halts or invalidates the remaining tools.</div>
          <div class="check-item">&#10003; <strong>Streaming Log Interception:</strong> Live stdout/stderr piped directly to the interactive terminal console.</div>
          <div class="check-item">&#10003; <strong>Socket Isolation:</strong> The Docker daemon socket is never exposed to scanned application code.</div>
        </div>
      </div>

      <div class="terminal-preview">
        <div class="term-titlebar">
          <span class="term-dot red"></span>
          <span class="term-dot yellow"></span>
          <span class="term-dot green"></span>
          <span class="term-label">Scanner Orchestrator Console Stream (Live)</span>
        </div>
        <div class="term-code">
          <span class="text-slate-500">[00:01.02]</span> <span class="text-cyan">[Semgrep]</span> Scanning 14 source files against OWASP Top 10 rules...<br/>
          <span class="text-slate-500">[00:01.88]</span> <span class="text-emerald">[Trivy]</span> Scanning package.json &amp; package-lock.json for known CVEs...<br/>
          <span class="text-slate-500">[00:02.15]</span> <span class="text-amber">[Checkov]</span> Parsing Dockerfile, docker-compose.yml &amp; K8s manifests...<br/>
          <span class="text-slate-500">[00:03.40]</span> <span class="text-cyan">[Semgrep]</span> Flagged 1 Command Injection vector (CWE-78) in apps/api/src/routes<br/>
          <span class="text-slate-500">[00:04.10]</span> <span class="text-emerald">[Trivy]</span> Scanned 34 dependencies. 2 High CVEs flagged. Secrets redacted.<br/>
          <span class="text-slate-500">[00:04.90]</span> <span class="text-amber">[Checkov]</span> Passed 18 checks, 2 failed (CKV_DOCKER_3: Root container user)<br/>
          <span class="text-slate-500">[00:05.20]</span> <span class="text-purple">[Correlation]</span> Normalized 5 findings into unified finding schema.<br/>
          <span class="text-slate-500">[00:05.45]</span> <span class="text-red">[QualityGate]</span> Evaluated policy: FAILED (Critical findings: 1 &gt; 0 limit).
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Orchestration Engine</span>
      <span>Slide 08 / 14</span>
    </div>
  </div>
  `,

  // Slide 9: Unified Vulnerability Analysis & Normalization
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">DATA CORRELATION</div>
      <h2 class="slide-title">Unified Vulnerability Analysis &amp; Schema</h2>
      <p class="slide-desc">Synthesizing heterogeneous scanner outputs into a single, standardized security finding schema.</p>
    </div>

    <div class="grid-2-col">
      <div class="schema-table-card">
        <h3 class="block-title text-cyan mb-2">Normalized Finding Schema</h3>
        <table class="schema-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>id</code></td>
              <td>String</td>
              <td>Unique UUID for each finding record</td>
            </tr>
            <tr>
              <td><code>scanner</code></td>
              <td>Enum</td>
              <td>SEMGREP | TRIVY | CHECKOV</td>
            </tr>
            <tr>
              <td><code>severity</code></td>
              <td>Enum</td>
              <td>CRITICAL | HIGH | MEDIUM | LOW | INFO</td>
            </tr>
            <tr>
              <td><code>ruleId</code></td>
              <td>String</td>
              <td>Original scanner rule or benchmark ID</td>
            </tr>
            <tr>
              <td><code>filePath</code></td>
              <td>String</td>
              <td>Relative path to vulnerable source or config</td>
            </tr>
            <tr>
              <td><code>lineNumber</code></td>
              <td>Number</td>
              <td>Exact start line in source code</td>
            </tr>
            <tr>
              <td><code>cwe / cve</code></td>
              <td>String[]</td>
              <td>Official MITRE CWE or NIST CVE references</td>
            </tr>
            <tr>
              <td><code>evidence</code></td>
              <td>String</td>
              <td>Vulnerable code snippet (Secrets redacted)</td>
            </tr>
            <tr>
              <td><code>remediation</code></td>
              <td>String</td>
              <td>Actionable remediation instructions</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="correlation-logic">
        <h3 class="block-title text-emerald mb-2">Correlation &amp; Integrity Rules</h3>
        <div class="rule-box">
          <strong>1. Strict Severity Preservation:</strong>
          <p>The original scanner severity is maintained without synthetic inflation or arbitrary down-ranking.</p>
        </div>
        <div class="rule-box">
          <strong>2. Zero Finding Fabrication:</strong>
          <p>The system never hallucinates or invents CVEs/CWEs. If a scanner is offline, it reports <code>TOOL UNAVAILABLE</code>.</p>
        </div>
        <div class="rule-box">
          <strong>3. Automatic Secret Redaction:</strong>
          <p>Any detected JWT, private key, or password in <code>evidence</code> is masked as <code>[REDACTED_SECRET]</code> before storage.</p>
        </div>
        <div class="rule-box">
          <strong>4. Multi-Format Output:</strong>
          <p>Unified findings serialize natively to SARIF v2.1.0, JSON, HTML report, and executive PDF format.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Vulnerability Normalization</span>
      <span>Slide 09 / 14</span>
    </div>
  </div>
  `,

  // Slide 10: Aura AI Chatbot & Runtime Security Barrier
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag text-purple">AI DEFENSE IN DEPTH</div>
      <h2 class="slide-title">Aura AI Chatbot &amp; Runtime Security Barrier</h2>
      <p class="slide-desc">Predefined perimeter enforcement with automated threat classification and audit telemetry.</p>
    </div>

    <div class="grid-2-col">
      <div class="chatbot-architecture">
        <h3 class="block-title text-purple mb-2">Dual-Layer Chatbot Defense</h3>
        <div class="defense-tier tier-1">
          <div class="tier-badge">LAYER 1: PREDEFINED PERIMETER WHITELIST</div>
          <p>The Aura AI Assistant on the Blackbucks store is configured with <strong>11 authorized predefined prompts</strong> covering products (8) and store policies (3). Whitelisted inputs receive verified, accurate responses with zero false positives.</p>
        </div>

        <div class="defense-tier tier-2 mt-3">
          <div class="tier-badge bg-red">LAYER 2: DEVSECOPS SECURITY BARRIER</div>
          <p>Any input outside the 11 authorized prompts is intercepted by <code>classifyChatInput()</code>, scanned for injection vectors, blocked from backend execution, and routed to the DevSecOps Audit Dashboard.</p>
        </div>

        <div class="threat-grid-mini mt-3">
          <div class="mini-threat bg-red-dim border-red">
            <strong>SQLi (CWE-89):</strong> Intercepts <code>' OR 1=1</code>, <code>UNION SELECT</code>
          </div>
          <div class="mini-threat bg-orange-dim border-orange">
            <strong>Command Injection (CWE-78):</strong> Intercepts <code>; cat /etc/passwd</code>
          </div>
          <div class="mini-threat bg-yellow-dim border-yellow">
            <strong>XSS (CWE-79):</strong> Intercepts <code>&lt;script&gt;</code>, <code>onerror=</code>
          </div>
          <div class="mini-threat bg-blue-dim border-blue">
            <strong>Prompt Injection (CWE-20):</strong> Intercepts <code>Ignore previous rules</code>
          </div>
        </div>
      </div>

      <div class="chat-bubble-preview">
        <div class="chat-window-mockup">
          <div class="mockup-header">
            <span>Aura AI Assistant &bull; Blackbucks Website</span>
            <span class="live-pill">GUARD ACTIVE</span>
          </div>
          <div class="mockup-body">
            <div class="user-bubble-mock">
              '; DROP TABLE users; --
            </div>
            <div class="bot-barrier-mock">
              <div class="barrier-flag">&#9888; DEVSECOPS SECURITY BARRIER ACTIVATED</div>
              <p>Your query was flagged as an un-sanctioned input (CRITICAL severity).</p>
              <div class="barrier-details">
                &bull; Vulnerability Code: CWE-89: SQL Injection<br/>
                &bull; Telemetry ID: sec-evt-07dc55f21b11<br/>
                &bull; Action: Intercepted &amp; logged to DevSecOps Dashboard
              </div>
              <div class="btn-mock">View in DevSecOps Audit Dashboard &nearr;</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; AI Chatbot Security</span>
      <span>Slide 10 / 14</span>
    </div>
  </div>
  `,

  // Slide 11: Real-Time DevSecOps Security Audit Dashboard
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag text-cyan">MONITORING &amp; AUDITABILITY</div>
      <h2 class="slide-title">Real-Time DevSecOps Security Audit Dashboard</h2>
      <p class="slide-desc">Dedicated web portal for security engineers to inspect vulnerabilities, telemetry, and system compliance.</p>
    </div>

    <div class="grid-3-col">
      <div class="dash-feature-card">
        <h4 class="card-head text-cyan">1. Executive Overview &amp; Analytics</h4>
        <ul>
          <li>Total Assessments &amp; Files Scanned metrics</li>
          <li>Vulnerability distribution by Severity (Critical, High, Medium, Low)</li>
          <li>Scanner breakdown (Semgrep SAST vs Trivy SCA vs Checkov IaC)</li>
          <li>Historical security posture trends over time</li>
        </ul>
      </div>

      <div class="dash-feature-card">
        <h4 class="card-head text-emerald">2. Manual File Selector Engine</h4>
        <ul>
          <li>Interactive file checklist supporting .py, .java, .js, .ts, .c, .cpp, Docker, manifests</li>
          <li>Dynamic auto-scanner identification based on selected file extensions</li>
          <li>ZIP package drag-and-drop upload for ad-hoc code audits</li>
          <li>Preset buttons: Full Repository, Source Code Only, IaC Only</li>
        </ul>
      </div>

      <div class="dash-feature-card">
        <h4 class="card-head text-amber">3. Scanner Console &amp; Chatbot Feed</h4>
        <ul>
          <li>Real-time Orchestrator Terminal with Fullscreen, Maximize, and Minimize modes</li>
          <li>Live Chatbot Anomaly Telemetry stream showing blocked queries from the website</li>
          <li>Inspect Authorized Predefined Prompts perimeter drawer</li>
          <li>One-click export to PDF, HTML, SARIF, and JSON reports</li>
        </ul>
      </div>
    </div>

    <div class="dash-mockup-ribbon mt-4">
      <div class="mock-metric bg-slate-900 border-slate">
        <div class="mock-val text-cyan">42</div>
        <div class="mock-lbl">Total Scans Executed</div>
      </div>
      <div class="mock-metric bg-red-dim border-red">
        <div class="mock-val text-red">1</div>
        <div class="mock-lbl">Critical Vulnerability</div>
      </div>
      <div class="mock-metric bg-orange-dim border-orange">
        <div class="mock-val text-orange">2</div>
        <div class="mock-lbl">High Severity CVEs</div>
      </div>
      <div class="mock-metric bg-emerald-dim border-emerald">
        <div class="mock-val text-emerald">Online</div>
        <div class="mock-lbl">Semgrep, Trivy, Checkov</div>
      </div>
      <div class="mock-metric bg-purple-dim border-purple">
        <div class="mock-val text-purple">13</div>
        <div class="mock-lbl">Runtime Injections Blocked</div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Audit Dashboard</span>
      <span>Slide 11 / 14</span>
    </div>
  </div>
  `,

  // Slide 12: CI/CD Quality Gate Enforcement
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag text-emerald">POLICY ENFORCEMENT</div>
      <h2 class="slide-title">Automated CI/CD Quality Gate Enforcement</h2>
      <p class="slide-desc">Deterministic deployment gating preventing high-risk code from reaching production environments.</p>
    </div>

    <div class="grid-2-col">
      <div class="policy-card">
        <h3 class="block-title text-cyan mb-2">Quality Gate Policy Matrix</h3>
        <table class="policy-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Threshold</th>
              <th>Action on Breach</th>
              <th>Enforcement Rationale</th>
            </tr>
          </thead>
          <tbody>
            <tr class="row-critical">
              <td><strong>CRITICAL</strong></td>
              <td><strong>Max 0 Allowed</strong></td>
              <td><span class="badge-block">HALT BUILD (Exit 1)</span></td>
              <td>Zero tolerance for RCE, SQLi, root containers, or leaked tokens</td>
            </tr>
            <tr class="row-high">
              <td><strong>HIGH</strong></td>
              <td><strong>Max 3 Allowed</strong></td>
              <td><span class="badge-block">HALT BUILD (Exit 1)</span></td>
              <td>High severity dependency CVEs or missing securityContext</td>
            </tr>
            <tr class="row-medium">
              <td><strong>MEDIUM</strong></td>
              <td>Advisory Limit (10)</td>
              <td><span class="badge-warn">WARN &amp; PROCEED</span></td>
              <td>Code style anomalies, missing resource limits</td>
            </tr>
            <tr class="row-low">
              <td><strong>LOW / INFO</strong></td>
              <td>Unlimited</td>
              <td><span class="badge-pass">PASS</span></td>
              <td>Best practice recommendations, informational notices</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="ci-cd-integration">
        <h3 class="block-title text-emerald mb-2">GitHub Actions Pipeline Integration</h3>
        <div class="ci-code-box">
          <div class="ci-file-header">.github/workflows/devsecops-pipeline.yml</div>
          <pre><code>- name: Run Multi-Scanner Orchestrator
  run: node scripts/run-orchestrator.js

- name: Evaluate Quality Gate Policy
  run: node .github/scripts/evaluate-quality-gate.js
  env:
    MAX_CRITICAL: 0
    MAX_HIGH: 3

# Automated Gate Branching:
# IF exit code == 0 &rarr; Deploy to Staging/Production
# IF exit code != 0 &rarr; Halt workflow &amp; notify Security Team</code></pre>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Quality Gate</span>
      <span>Slide 12 / 14</span>
    </div>
  </div>
  `,

  // Slide 13: Empirical Evaluation & Benchmark Results
  `
  <div class="slide">
    <div class="slide-header">
      <div class="slide-tag">EXPERIMENTAL RESULTS</div>
      <h2 class="slide-title">Empirical Evaluation &amp; Benchmark Findings</h2>
      <p class="slide-desc">Real-world vulnerability discovery across the Blackbucks website, API backend, and Docker infrastructure.</p>
    </div>

    <div class="grid-3-col">
      <div class="case-card border-red">
        <div class="case-header text-red">CASE 1: SEMGREP SAST FINDING</div>
        <div class="case-metric">CWE-78: OS Command Injection</div>
        <div class="case-meta">Target: <code>apps/api/src/routes/chat.routes.ts</code></div>
        <p class="case-desc">Identified unvalidated input string reaching a dangerous shell execution sink.</p>
        <div class="remedy-box">
          <strong>Remediation Applied:</strong> Replaced dynamic shell invocation with whitelisted input parameterization and strict regex tokenization.
        </div>
      </div>

      <div class="case-card border-orange">
        <div class="case-header text-orange">CASE 2: AQUA TRIVY SCA FINDING</div>
        <div class="case-metric">CVE-2024-XXXX: Transitive Dependency</div>
        <div class="case-meta">Target: <code>blackbucks/package-lock.json</code></div>
        <p class="case-desc">Discovered known prototype pollution vulnerability in an outdated parser package.</p>
        <div class="remedy-box">
          <strong>Remediation Applied:</strong> Executed npm override patch to bump transitive dependency version to secure patched release.
        </div>
      </div>

      <div class="case-card border-amber">
        <div class="case-header text-amber">CASE 3: CHECKOV IAC FINDING</div>
        <div class="case-metric">CKV_DOCKER_3: Root Container User</div>
        <div class="case-meta">Target: <code>docker/Dockerfile</code></div>
        <p class="case-desc">Container image configured to run default processes under root UID 0.</p>
        <div class="remedy-box">
          <strong>Remediation Applied:</strong> Added <code>USER node:node</code> directive and restricted filesystem permissions in multi-stage Docker build.
        </div>
      </div>
    </div>

    <div class="callout-box bg-emerald-dim border-emerald mt-4">
      <strong class="text-emerald">Verification Outcome:</strong> 100% of simulated adversarial attacks (SQLi, shell injection, XSS) launched against the chatbot were successfully intercepted by the runtime barrier with zero false positives on authorized customer prompts.
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Experimental Results</span>
      <span>Slide 13 / 14</span>
    </div>
  </div>
  `,

  // Slide 14: Conclusion & Contributions
  `
  <div class="slide slide-conclusion">
    <div class="slide-header">
      <div class="slide-tag">PROJECT CONCLUSION</div>
      <h2 class="slide-title">Key Contributions, Future Work &amp; Q&amp;A</h2>
      <p class="slide-desc">Synthesizing project milestones, academic contributions, and future research directions.</p>
    </div>

    <div class="grid-2-col">
      <div class="info-block">
        <h3 class="block-title text-cyan mb-2">Key Academic Contributions</h3>
        <div class="checklist">
          <div class="check-item">&#9670; <strong>Unified 3-Scanner Architecture:</strong> Successfully orchestrated Semgrep, Trivy, and Checkov into a cohesive, non-duplicative security assessment pipeline.</div>
          <div class="check-item">&#9670; <strong>Runtime Chatbot Input Barrier:</strong> Novel dual-tier protection combining static analysis with conversational input perimeter enforcement and CWE classification.</div>
          <div class="check-item">&#9670; <strong>Section 5 Universal File Matrix:</strong> Broad multi-language file selection supporting source, manifests, IaC, and secure ZIP extraction.</div>
          <div class="check-item">&#9670; <strong>Deterministic Quality Gating:</strong> Automated policy enforcement guaranteeing zero critical vulnerabilities reach production.</div>
        </div>
      </div>

      <div class="info-block">
        <h3 class="block-title text-purple mb-2">Future Research Directions</h3>
        <div class="checklist">
          <div class="check-item">&#9670; <strong>Dynamic DAST Sandboxing:</strong> Incorporating isolated ephemeral container environments for automated fuzz testing.</div>
          <div class="check-item">&#9670; <strong>Automated LLM Code Healing:</strong> Leveraging local models to generate automated pull requests fixing identified Semgrep and Checkov flaws.</div>
          <div class="check-item">&#9670; <strong>Runtime eBPF Behavioral Monitoring:</strong> Kernel-level anomaly detection for containerized AI chatbot workloads.</div>
        </div>
      </div>
    </div>

    <div class="qa-banner mt-4">
      <div class="qa-title text-cyan">THANK YOU FOR YOUR ATTENTION!</div>
      <div class="qa-subtitle">Questions, Comments &amp; Academic Discussion</div>
    </div>

    <div class="slide-footer">
      <span>Secure DevSecOps Pipeline &bull; Conclusion</span>
      <span>Slide 14 / 14</span>
    </div>
  </div>
  `
];

const htmlDocument = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Secure DevSecOps Pipeline with Automated AI Chatbot Vulnerability Assessment</title>
<style>
  @page {
    size: 16in 9in;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    background: #070b14;
    color: #f1f5f9;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .slide {
    width: 16in;
    height: 9in;
    page-break-after: always;
    page-break-inside: avoid;
    position: relative;
    overflow: hidden;
    padding: 0.65in 0.95in;
    background: #070b14;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .slide-title {
    background: radial-gradient(circle at 20% 20%, rgba(6, 182, 212, 0.15), transparent 40%),
                radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15), transparent 40%),
                #070b14;
  }
  .glow-orb {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(120px);
  }
  .glow-1 {
    top: 50px;
    right: 100px;
    width: 450px;
    height: 450px;
    background: rgba(6, 182, 212, 0.12);
  }
  .glow-2 {
    bottom: 50px;
    left: 100px;
    width: 500px;
    height: 500px;
    background: rgba(99, 102, 241, 0.12);
  }
  .title-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tag-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    border-radius: 999px;
    font-size: 13px;
    font-weight: 700;
    color: #38bdf8;
    letter-spacing: 0.05em;
  }
  .badge-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #38bdf8;
  }
  .inst-tag {
    font-size: 14px;
    color: #94a3b8;
    font-weight: 600;
  }
  .title-main {
    margin: auto 0;
  }
  .hero-title {
    font-size: 52px;
    font-weight: 900;
    line-height: 1.15;
    letter-spacing: -0.02em;
    color: #ffffff;
  }
  .gradient-text {
    background: linear-gradient(135deg, #38bdf8, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .hero-subtitle {
    margin-top: 18px;
    font-size: 20px;
    color: #94a3b8;
    max-width: 12.5in;
    line-height: 1.5;
  }
  .title-footer-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 24px;
  }
  .title-card {
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 16px 20px;
    border-radius: 14px;
  }
  .card-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
  }
  .card-val {
    font-size: 15px;
    font-weight: 800;
    margin-top: 6px;
  }
  .slide-header {
    border-bottom: 1px solid rgba(51, 65, 85, 0.6);
    padding-bottom: 16px;
    margin-bottom: 24px;
  }
  .slide-tag {
    font-size: 12px;
    font-weight: 800;
    color: #38bdf8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .slide-title {
    font-size: 34px;
    font-weight: 900;
    color: #ffffff;
    margin-top: 4px;
    letter-spacing: -0.01em;
  }
  .slide-desc {
    font-size: 16px;
    color: #94a3b8;
    margin-top: 4px;
  }
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(51, 65, 85, 0.5);
    padding-top: 14px;
    font-size: 13px;
    color: #64748b;
    font-weight: 600;
  }
  .grid-2-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 28px;
    align-items: stretch;
  }
  .grid-3-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .grid-4-col {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
  }
  .info-block {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 24px;
    border-radius: 16px;
  }
  .block-title {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 12px;
  }
  .text-body {
    font-size: 15px;
    line-height: 1.6;
    color: #cbd5e1;
  }
  .mt-3 { margin-top: 12px; }
  .mt-4 { margin-top: 18px; }
  .mb-2 { margin-bottom: 8px; }
  .feature-stack {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .feature-item {
    display: flex;
    align-items: center;
    gap: 18px;
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-left-width: 5px;
    padding: 16px 20px;
    border-radius: 12px;
    font-size: 15px;
    color: #e2e8f0;
    line-height: 1.4;
  }
  .feature-num {
    font-size: 24px;
    font-weight: 900;
    color: #38bdf8;
    font-family: monospace;
  }
  .border-cyan { border-left-color: #06b6d4 !important; }
  .border-emerald { border-left-color: #10b981 !important; }
  .border-purple { border-left-color: #a855f7 !important; }
  .border-amber { border-left-color: #f59e0b !important; }
  .border-red { border-left-color: #ef4444 !important; }
  .border-orange { border-left-color: #f97316 !important; }
  .border-blue { border-left-color: #3b82f6 !important; }

  .text-cyan { color: #38bdf8 !important; }
  .text-emerald { color: #34d399 !important; }
  .text-purple { color: #c084fc !important; }
  .text-amber { color: #fbbf24 !important; }
  .text-red { color: #f87171 !important; }
  .text-orange { color: #fb923c !important; }
  .text-blue { color: #60a5fa !important; }

  .threat-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 20px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .threat-badge {
    align-self: flex-start;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    font-family: monospace;
    margin-bottom: 12px;
  }
  .bg-red { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); }
  .bg-orange { background: rgba(249, 115, 22, 0.2); color: #fdba74; border: 1px solid rgba(249, 115, 22, 0.4); }
  .bg-yellow { background: rgba(234, 179, 8, 0.2); color: #fde047; border: 1px solid rgba(234, 179, 8, 0.4); }
  .bg-blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; border: 1px solid rgba(59, 130, 246, 0.4); }

  .threat-title {
    font-size: 18px;
    font-weight: 800;
    color: #ffffff;
    margin-bottom: 8px;
  }
  .threat-desc {
    font-size: 13.5px;
    line-height: 1.5;
    color: #94a3b8;
    margin-bottom: 14px;
  }
  .threat-stat {
    font-size: 12px;
    font-weight: 700;
    color: #cbd5e1;
    border-top: 1px solid rgba(51, 65, 85, 0.6);
    padding-top: 10px;
  }
  .callout-box {
    padding: 16px 22px;
    border-radius: 12px;
    font-size: 15px;
    line-height: 1.5;
  }
  .bg-red-dim { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); color: #fecaca; }
  .bg-cyan-dim { background: rgba(6, 182, 212, 0.08); border: 1px solid rgba(6, 182, 212, 0.3); color: #e0f2fe; }
  .bg-emerald-dim { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); color: #d1fae5; }
  .bg-slate-dim { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(51, 65, 85, 0.7); color: #e2e8f0; }

  .comparison-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-top-width: 4px;
    padding: 22px;
    border-radius: 14px;
  }
  .comp-header {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0.05em;
    margin-bottom: 16px;
  }
  .comp-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14.5px;
    color: #cbd5e1;
    line-height: 1.45;
  }
  .comp-list li strong { color: #ffffff; }

  .stats-ribbon {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    background: rgba(15, 23, 42, 0.8);
    border: 1px solid rgba(51, 65, 85, 0.8);
    padding: 16px 24px;
    border-radius: 14px;
  }
  .ribbon-item { text-align: center; }
  .ribbon-val { font-size: 28px; font-weight: 900; }
  .ribbon-lbl { font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 4px; }

  .scanner-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-top-width: 4px;
    padding: 22px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .scanner-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }
  .scanner-title { font-size: 18px; font-weight: 900; }
  .version-tag { font-size: 12px; font-family: monospace; font-weight: 700; background: rgba(51, 65, 85, 0.6); padding: 2px 8px; border-radius: 6px; }
  .scanner-role { font-size: 14px; font-weight: 700; color: #ffffff; margin-bottom: 8px; }
  .scanner-desc { font-size: 13.5px; color: #94a3b8; line-height: 1.4; margin-bottom: 12px; }
  .scanner-section { font-size: 13px; color: #cbd5e1; line-height: 1.5; margin-bottom: 14px; }
  .scanner-section ul { margin-left: 18px; margin-top: 6px; }
  .scanner-badge {
    font-size: 11.5px;
    font-weight: 700;
    color: #94a3b8;
    background: rgba(0, 0, 0, 0.4);
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid rgba(51, 65, 85, 0.5);
    text-align: center;
  }

  /* Flowchart styles */
  .flowchart-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin: auto 0;
  }
  .flow-step {
    flex: 1;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-radius: 14px;
    padding: 18px 12px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 2.8in;
    justify-content: center;
  }
  .highlight-step {
    border-color: rgba(6, 182, 212, 0.5);
    background: rgba(6, 182, 212, 0.08);
  }
  .step-num { font-size: 11px; font-weight: 800; color: #38bdf8; letter-spacing: 0.08em; margin-bottom: 6px; }
  .step-icon { font-size: 26px; margin-bottom: 8px; color: #ffffff; }
  .step-title { font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 8px; }
  .step-sub { font-size: 11.5px; color: #94a3b8; line-height: 1.4; }
  .flow-arrow { font-size: 22px; font-weight: 900; color: #475569; padding: 0 4px; }

  .gate-step { border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.06); }
  .gate-split { display: flex; flex-direction: column; gap: 6px; width: 100%; margin-bottom: 8px; }
  .gate-pass { background: rgba(16, 185, 129, 0.25); color: #6ee7b7; font-weight: 800; font-size: 12px; padding: 4px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.4); }
  .gate-fail { background: rgba(239, 68, 68, 0.25); color: #fca5a5; font-weight: 800; font-size: 12px; padding: 4px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.4); }

  .file-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-top-width: 4px;
    padding: 20px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .file-icon { font-size: 30px; margin-bottom: 8px; }
  .file-cat { font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 4px; }
  .file-scanner { font-size: 12px; font-weight: 700; margin-bottom: 12px; }
  .file-exts { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
  .ext-badge { font-size: 11px; font-family: monospace; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(51, 65, 85, 0.8); padding: 3px 8px; border-radius: 6px; color: #e2e8f0; }
  .file-desc { font-size: 12.5px; color: #94a3b8; line-height: 1.4; }

  .checklist { display: flex; flex-direction: column; gap: 12px; font-size: 14.5px; color: #cbd5e1; }
  .check-item strong { color: #ffffff; }

  .terminal-preview {
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 14px;
    overflow: hidden;
    font-family: Consolas, monospace;
    font-size: 12.5px;
  }
  .term-titlebar {
    background: #0f172a;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    border-bottom: 1px solid #1e293b;
  }
  .term-dot { width: 10px; height: 10px; border-radius: 50%; }
  .term-dot.red { background: #ef4444; }
  .term-dot.yellow { background: #f59e0b; }
  .term-dot.green { background: #10b981; }
  .term-label { margin-left: 8px; font-size: 11px; color: #94a3b8; font-weight: 600; }
  .term-code { padding: 16px; line-height: 1.7; color: #e2e8f0; }

  .schema-table-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 18px;
    border-radius: 14px;
  }
  .schema-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .schema-table th { text-align: left; padding: 6px 10px; border-bottom: 1px solid rgba(51, 65, 85, 0.8); color: #94a3b8; font-weight: 700; text-transform: uppercase; font-size: 10px; }
  .schema-table td { padding: 6px 10px; border-bottom: 1px solid rgba(51, 65, 85, 0.4); color: #cbd5e1; }
  .schema-table code { font-family: monospace; color: #38bdf8; font-weight: bold; }

  .correlation-logic {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 18px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .rule-box {
    background: rgba(0, 0, 0, 0.3);
    border-left: 4px solid #10b981;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
  }
  .rule-box strong { color: #ffffff; display: block; margin-bottom: 3px; }
  .rule-box p { color: #94a3b8; line-height: 1.4; margin: 0; }

  .defense-tier {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-radius: 12px;
    padding: 14px 18px;
  }
  .tier-badge {
    font-size: 11px;
    font-weight: 800;
    color: #c084fc;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
  }
  .defense-tier p { font-size: 13.5px; color: #cbd5e1; line-height: 1.4; }
  .threat-grid-mini {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .mini-threat {
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 11.5px;
    line-height: 1.3;
  }
  .bg-orange-dim { background: rgba(249, 115, 22, 0.08); border: 1px solid rgba(249, 115, 22, 0.3); color: #fed7aa; }
  .bg-yellow-dim { background: rgba(234, 179, 8, 0.08); border: 1px solid rgba(234, 179, 8, 0.3); color: #fef08a; }
  .bg-blue-dim { background: rgba(59, 130, 246, 0.08); border: 1px solid rgba(59, 130, 246, 0.3); color: #bfdbfe; }

  .chat-window-mockup {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 16px;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .mockup-header {
    background: #1e293b;
    padding: 12px 18px;
    font-size: 13px;
    font-weight: 700;
    color: #f1f5f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .live-pill {
    font-size: 10px;
    font-weight: 800;
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid rgba(16, 185, 129, 0.4);
  }
  .mockup-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
    justify-content: center;
  }
  .user-bubble-mock {
    align-self: flex-end;
    background: #0284c7;
    color: #ffffff;
    font-family: monospace;
    font-size: 12.5px;
    padding: 8px 14px;
    border-radius: 12px 12px 2px 12px;
  }
  .bot-barrier-mock {
    align-self: flex-start;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.4);
    border-left: 4px solid #ef4444;
    padding: 12px 16px;
    border-radius: 4px 14px 14px 14px;
    font-size: 12.5px;
    color: #fca5a5;
    line-height: 1.45;
  }
  .barrier-flag { font-size: 11px; font-weight: 800; color: #ef4444; margin-bottom: 4px; }
  .barrier-details { font-family: monospace; font-size: 11px; margin-top: 6px; color: #fecaca; }
  .btn-mock {
    margin-top: 8px;
    display: inline-block;
    background: rgba(2, 132, 199, 0.25);
    border: 1px solid #38bdf8;
    color: #38bdf8;
    font-size: 11px;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 6px;
  }

  .dash-feature-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    padding: 20px;
    border-radius: 14px;
  }
  .card-head { font-size: 17px; font-weight: 800; margin-bottom: 12px; }
  .dash-feature-card ul { margin-left: 18px; font-size: 13.5px; color: #cbd5e1; line-height: 1.6; }

  .dash-mockup-ribbon {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 14px;
  }
  .mock-metric {
    padding: 14px;
    border-radius: 12px;
    text-align: center;
    border: 1px solid;
  }
  .mock-val { font-size: 26px; font-weight: 900; }
  .mock-lbl { font-size: 11px; font-weight: 700; color: #94a3b8; margin-top: 4px; }

  .policy-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .policy-table th { text-align: left; padding: 10px; border-bottom: 1px solid #334155; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700; }
  .policy-table td { padding: 12px 10px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
  .badge-block { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.4); font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
  .badge-warn { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid rgba(245, 158, 11, 0.4); font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }
  .badge-pass { background: rgba(16, 185, 129, 0.2); color: #a7f3d0; border: 1px solid rgba(16, 185, 129, 0.4); font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 4px; }

  .ci-code-box {
    background: #020617;
    border: 1px solid #1e293b;
    border-radius: 14px;
    overflow: hidden;
    font-family: Consolas, monospace;
    font-size: 12.5px;
  }
  .ci-file-header {
    background: #0f172a;
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    border-bottom: 1px solid #1e293b;
  }
  .ci-code-box pre { padding: 16px; margin: 0; color: #cbd5e1; line-height: 1.6; }

  .case-card {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(51, 65, 85, 0.7);
    border-top-width: 4px;
    padding: 20px;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .case-header { font-size: 13px; font-weight: 800; letter-spacing: 0.05em; margin-bottom: 6px; }
  .case-metric { font-size: 17px; font-weight: 900; color: #ffffff; margin-bottom: 4px; }
  .case-meta { font-size: 11.5px; font-family: monospace; color: #94a3b8; margin-bottom: 10px; }
  .case-desc { font-size: 13px; color: #cbd5e1; line-height: 1.45; margin-bottom: 14px; }
  .remedy-box {
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 10px 12px;
    border-radius: 8px;
    font-size: 12px;
    color: #d1fae5;
    line-height: 1.4;
  }

  .slide-conclusion {
    background: radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08), transparent 60%), #070b14;
  }
  .qa-banner {
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid rgba(6, 182, 212, 0.4);
    padding: 20px;
    border-radius: 14px;
    text-align: center;
  }
  .qa-title { font-size: 24px; font-weight: 900; letter-spacing: 0.05em; }
  .qa-subtitle { font-size: 15px; color: #94a3b8; margin-top: 4px; }
</style>
</head>
<body>
${slides.join('\n')}
</body>
</html>`;

const htmlFilePath = path.resolve('Secure_DevSecOps_AI_Chatbot_Presentation.html');
const pdfFilePath = path.resolve('Secure_DevSecOps_AI_Chatbot_Presentation.pdf');
const artifactDir = 'C:\\Users\\Bunny\\.gemini\\antigravity\\brain\\c35e75c1-4908-477b-a3ba-6a27160b740c';
const artifactPdfPath = path.join(artifactDir, 'Secure_DevSecOps_AI_Chatbot_Presentation.pdf');

fs.writeFileSync(htmlFilePath, htmlDocument, 'utf8');
console.log(`Saved HTML slide presentation to: ${htmlFilePath}`);

// Run Microsoft Edge in headless mode to render the 16:9 PDF
const edgeBinary = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const htmlFileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');

console.log('Rendering high-definition 16:9 PDF presentation via headless browser...');
const cmd = `"${edgeBinary}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf-no-header --print-to-pdf="${pdfFilePath}" "${htmlFileUrl}"`;

execSync(cmd, { stdio: 'inherit' });

if (fs.existsSync(pdfFilePath)) {
  const sizeKb = Math.round(fs.statSync(pdfFilePath).size / 1024);
  console.log(`SUCCESS! Generated PDF Presentation: ${pdfFilePath} (${sizeKb} KB)`);
  
  // Also copy to conversation artifact directory
  try {
    fs.copyFileSync(pdfFilePath, artifactPdfPath);
    console.log(`Copied artifact PDF to: ${artifactPdfPath}`);
  } catch (err) {
    console.warn('Could not copy to artifact dir:', err);
  }
} else {
  console.error('PDF file was not created!');
}
