# 🚀 Blackbucks Platform with AI Chatbot & Automated DevSecOps Pipeline

A modern, interactive React platform with an integrated **AI Chatbot** and continuous **Automated DevSecOps Security Assessment Module**.

---

## 🌟 Key Capabilities

### 1. 🤖 Conversational AI Chatbot (`AuraBot / Aura AI Assistant`)
- **Embedded Floating Widget**: Accessible from anywhere on the platform with sound, expand/collapse toggles, and live status indicator.
- **Dual Expertise**:
  - **E-Commerce & Tech Advisor**: Assists users with products, titanium wireless headphones, mechanical keyboards, ergonomic laptop stands, orders, and shipping policies.
  - **DevSecOps Advisor**: Explains how the underlying backend is protected against SQLi, command injection, and vulnerable dependencies.
- **Backend Integration**: Connects to `POST http://localhost:4000/api/chat` with graceful offline fallback.

### 2. 🛡️ 6-Stage DevSecOps Pipeline Architecture (According to Design Diagram)
Features a dedicated DevSecOps Security Audit view implementing the 6-stage lifecycle specification:

```
┌────────────────────────────────────────────────────────┐
│           1. Developer writes website code             │
│   Website source code, backend, database & AI chatbot  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│          2. Developer pushes code to GitHub            │
│      Push or Pull Request triggers GitHub Actions      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             3. Automated security scanning             │
│  • Semgrep  → Source code (SAST across Python, JS, TS) │
│  • Trivy    → Dependencies & secrets (SCA, CVEs, keys) │
│  • Checkov  → Infrastructure configuration (Docker/IaC)│
│  • OWASP ZAP & AI Agent Scanner runtime layer          │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│       4. Custom Vulnerability Analysis Algorithm       │
│  Analyzes, prioritizes, and correlates findings from   │
│  all scanners into a unified finding schema            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              5. Consolidated security report           │
│   Vulnerabilities, severity, evidence, and recommendations
│   Exports: PDF (16 academic sections), HTML, SARIF, JSON
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                6. Quality Gate Decision                │
│             Max Critical: 0 &bull; Max High: 3         │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
              ▼                            ▼
     ┌─────────────────┐          ┌─────────────────┐
     │     ✅ Pass     │          │     ❌ Fail     │
     │ Continue build  │          │   Block build   │
     │ and deployment  │          │ and deployment  │
     └─────────────────┘          └─────────────────┘
```

- **Interactive Simulations**: Run `Simulate Pass` and `Simulate Fail` directly in the UI.
- **Live Scanner Execution**: One-click assessment triggering Semgrep SAST, Aqua Trivy SCA/Secrets, and Bridgecrew Checkov against the repository.
- **Multi-Format Report Downloads**: Download academic PDF, OASIS SARIF 2.1.0, standalone HTML, and JSON.

---

## 🚀 Running the Platform

1. **Start the Express Security & Chatbot API** (Port 4000):
   ```bash
   npm run dev:api
   ```
2. **Start the Blackbucks Website** (Port 5173):
   ```bash
   cd blackbucks
   npm run dev
   ```

3. Open **[http://localhost:5173](http://localhost:5173)** to explore the Blackbucks website, chat with the AI Assistant, or run the DevSecOps Security Audit!
