import os
import re
import urllib.parse
from dotenv import load_dotenv
from flask_cors import CORS
from rag import generate_rag_answer

# Werkzeug 3.x / Flask backward-compatibility shim
try:
    import werkzeug.urls
    if not hasattr(werkzeug.urls, "url_quote"):
        werkzeug.urls.url_quote = urllib.parse.quote
    if not hasattr(werkzeug.urls, "url_unquote"):
        werkzeug.urls.url_unquote = urllib.parse.unquote
except (ImportError, AttributeError):
    pass

from flask import Flask, request, jsonify, render_template

app = Flask(__name__)
load_dotenv()


CORS(app, resources={
    r"/api/*": {
        "origins": [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://localhost:5000",
            "http://127.0.0.1:5000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})




# 15 Authorized Predefined Topics & Responses
AUTHORIZED_KNOWLEDGE = [
    {
        "id": 1,
        "title": "Aura Studio Wireless Headphones",
        "keywords": ["headphone", "headphones", "aura studio", "anc", "noise cancellation", "titanium"],
        "response": "The Aura Studio Wireless Headphones ($249, 17% OFF) feature Active Noise Cancellation (ANC), custom 40mm titanium acoustic drivers, and an ultra-long 40-hour battery life. They support Bluetooth 5.3 with AptX HD streaming."
    },
    {
        "id": 2,
        "title": "Precision Mechanical Keyboard",
        "keywords": ["keyboard", "mechanical keyboard", "gateron", "optical switch", "pbt keycaps", "switches"],
        "response": "The Precision Mechanical Keyboard ($139, 18% OFF) is engineered with hot-swappable Gateron optical switches, durable double-shot PBT keycaps, and an aircraft-grade CNC aluminum top frame."
    },
    {
        "id": 3,
        "title": "Minimalist Aluminum Laptop Stand",
        "keywords": ["laptop stand", "aluminum stand", "ergonomic", "laptop elevation", "cooling stand"],
        "response": "The Minimalist Aluminum Laptop Stand ($59, 25% OFF) provides an optimal 15° ergonomic elevation to align your screen with eye level, reducing neck fatigue."
    },
    {
        "id": 4,
        "title": "Chronograph Minimalist Wristwatch",
        "keywords": ["wristwatch", "chronograph", "watch", "sapphire", "italian leather", "quartz"],
        "response": "The Chronograph Minimalist Wristwatch ($189, 14% OFF) features anti-reflective scratch-resistant sapphire crystal glass, Japanese quartz movement, and genuine Italian calfskin leather straps."
    },
    {
        "id": 5,
        "title": "Ceramic Pour-Over & Travel Tumbler",
        "keywords": ["tumbler", "pour-over", "travel tumbler", "ceramic", "vacuum insulation", "coffee"],
        "response": "The Ceramic Pour-Over & Travel Tumbler ($45) combines an insulated double-wall stainless steel exterior with an internal ceramic coating to preserve pure coffee taste for up to 12 hours."
    },
    {
        "id": 6,
        "title": "Monitor Screenbar Light & Dial",
        "keywords": ["screenbar", "monitor light", "light dial", "eye strain", "glare", "asymmetric"],
        "response": "The Monitor Screenbar Light & Dial ($89) uses asymmetric optical technology to illuminate your desktop without screen glare, reducing eye strain during focused work sessions."
    },
    {
        "id": 7,
        "title": "Magnetic 3-in-1 Fast Wireless Dock",
        "keywords": ["wireless dock", "3-in-1", "magsafe", "wireless charger", "charging dock", "qi2"],
        "response": "The Magnetic 3-in-1 Fast Wireless Dock ($109) features MagSafe-compatible 15W Qi2 fast charging for smartphone, smartwatch, and wireless earbuds simultaneously."
    },
    {
        "id": 8,
        "title": "Compact Hi-Fi Desktop Speaker",
        "keywords": ["desktop speaker", "hi-fi speaker", "bluetooth speaker", "speakers", "aptx hd"],
        "response": "The Compact Hi-Fi Desktop Speaker ($179) delivers studio-grade acoustics via dual passive radiators, custom digital signal processing, and low-latency Bluetooth AptX HD streaming."
    },
    {
        "id": 9,
        "title": "Shipping Policy & Delivery Times",
        "keywords": ["shipping", "delivery", "shipping policy", "how long does shipping take", "express delivery"],
        "response": "We offer complimentary express shipping on all domestic orders over $100 (standard $15 under $100). Domestic deliveries arrive within 2–4 business days."
    },
    {
        "id": 10,
        "title": "Returns, Refunds & Warranty",
        "keywords": ["return", "returns", "returning", "refund", "warranty", "return policy", "money back", "exchange"],
        "response": "Every purchase is backed by our 30-Day Hassle-Free Return Guarantee for unused products in their original packaging, plus a 2-Year Comprehensive Manufacturer Warranty."
    },
    {
        "id": 11,
        "title": "Discounts & Promo Codes",
        "keywords": ["promo code", "discount", "discounts", "coupon", "first10", "aura10", "promotion", "voucher"],
        "response": "You can use promo code FIRST10 or AURA10 at checkout to receive an instant 10% discount on your entire order."
    },
    {
        "id": 12,
        "title": "Order Tracking & Status",
        "keywords": ["track", "tracking", "order", "orders", "ordering", "status", "nstatus", "order status", "where is my order"],
        "response": "Once your order is processed, a tracking number and live carrier tracking link are sent directly to your confirmation email."
    },
    {
        "id": 13,
        "title": "Payment Methods & Security",
        "keywords": ["payment", "payment methods", "credit card", "apple pay", "google pay", "paypal", "checkout"],
        "response": "We accept Visa, Mastercard, American Express, Apple Pay, Google Pay, and PayPal. All transactions are encrypted with 256-bit TLS/SSL."
    },
    {
        "id": 14,
        "title": "Customer Support & Contact",
        "keywords": ["support", "contact", "customer service", "help", "email support", "representative", "contact us"],
        "response": "Our dedicated support team is available 24/7. You can reach us via email at concierge@auragoods.co or through our website contact portal."
    },
    {
        "id": 15,
        "title": "Gift Cards & Premium Packaging",
        "keywords": ["gift", "gift card", "gift wrapping", "packaging", "voucher", "present"],
        "response": "We offer digital gift cards in denominations from $25 to $500, delivered instantly via email, plus complimentary gift box packaging."
    }
]


# Sensitive-data request patterns. These block requests to disclose secrets or
# private records; they do not block ordinary questions about security policies.
SENSITIVE_REQUEST_PATTERNS = [
    r"\b(?:show|reveal|tell|give|print|display|dump|extract|retrieve|fetch|provide|list|export)\b.{0,100}\b(?:passwords?|passcodes?|credentials?|api[\s_-]?keys?|access[\s_-]?tokens?|refresh[\s_-]?tokens?|jwt|private[\s_-]?keys?|secrets?|database[\s_-]?(?:url|credentials?|password))\b",
    r"\b(?:passwords?|passcodes?|credentials?|api[\s_-]?keys?|access[\s_-]?tokens?|private[\s_-]?keys?|secrets?)\b.{0,100}\b(?:show|reveal|tell|give|print|display|dump|extract|retrieve|fetch|provide|list|export)\b",
    r"\b(?:admin(?:istrator)?(?:_demo)?|admin_demo|another user|other users?|customer account)\b.{0,100}\b(?:login details?|log[\s_-]?in details?|credentials?|username|password|account details?|access details?)\b",
    r"\b(?:login details?|log[\s_-]?in details?|credentials?|username|password|account details?|access details?)\b.{0,100}\b(?:admin(?:istrator)?(?:_demo)?|admin_demo|another user|other users?|customer account)\b",
    r"\b(?:sensitive_data|user_credentials|credentials_data|secret_store|auth(?:entication)?_data)\b",
    r"\b(?:show|reveal|dump|read|query|extract|access|retrieve|list|export|what is stored|what does .{0,30} contain)\b.{0,100}\b(?:database|db|table|records?|rows?|schema|contents?|data)\b",
    r"\b(?:database|db|table|records?|rows?|schema|contents?|data)\b.{0,100}\b(?:show|reveal|dump|read|query|extract|access|retrieve|list|export|what is stored|contents?)\b",
    r"\b(?:confidential|private|sensitive|secret)\b.{0,80}\b(?:database|db|table|records?|rows?|contents?|data)\b",
    r"\b(?:database|db|table|records?|rows?|contents?|data)\b.{0,80}\b(?:confidential|private|sensitive|secret)\b",
    r"\b(?:encode|decode|base64|encrypt|decrypt|convert|obfuscate)\b.{0,100}\b(?:passwords?|credentials?|api[\s_-]?keys?|tokens?|secrets?|admin)\b",
    r"\b(?:passwords?|credentials?|api[\s_-]?keys?|tokens?|secrets?|admin)\b.{0,100}\b(?:encode|decode|base64|encrypt|decrypt|convert|obfuscate)\b",
    r"\b(?:other users?|another user|someone else's|all users?|customers?)\b.{0,100}\b(?:personal data|private data|email addresses|phone numbers|payment details|passwords?|credentials?)\b",
    r"\b(?:reveal|show|print|repeat|disclose|tell me)\b.{0,80}\b(?:system prompt|hidden instructions|developer instructions)\b",
    r"\b(?:system prompt|hidden instructions|developer instructions)\b.{0,80}\b(?:reveal|show|print|repeat|disclose)\b",
]

SECRET_VALUE_PATTERNS = [
    # Common private-key block
    r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----",
    # Common cloud/API token formats (conservative pattern checks)
    r"\bAKIA[0-9A-Z]{16}\b",
    r"\bgh[pousr]_[A-Za-z0-9]{20,}\b",
    r"\bsk-[A-Za-z0-9_-]{20,}\b",
    # Credential assignments and database connection strings
    r"(?i)\b(?:password|passwd|api[_-]?key|access[_-]?token|client[_-]?secret)\s*[:=]\s*['\"]?[^\s'\"]{8,}",
    r"(?i)\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?):\/\/[^:\s]+:[^@\s]+@",
]

SAFE_REFUSAL = (
    "I can't provide passwords, API keys, access tokens, private credentials, "
    "hidden instructions, or another user's private information. "
    "I can help with general product and store-related questions."
)

def classify_prompt(prompt: str):
    """Block common attack payloads and requests for secrets/private information."""
    norm = prompt.strip().lower()

    is_command_inj = bool(re.search(
        r'(;|\||`|\$\(|\bsh\b|\bbash\b|\bcat\s+/etc/|\bwhoami\b)', norm
    ))
    is_sqli = bool(re.search(
        r"('|\"|--|/\*|\*/|union\s+select|select\s+.*from|insert\s+into|drop\s+table|'\s*or\s+'|'\s*or\s+1=1|\bor\s+\d+=\d+)",
        norm, re.IGNORECASE
    ))
    is_xss = bool(re.search(r'(<script|javascript:|onerror=|<img)', norm, re.IGNORECASE))
    is_path_traversal = bool(re.search(
        r'(\.\./|\.\.\\|/etc/passwd|/etc/shadow|c:\\windows)', norm, re.IGNORECASE
    ))
    is_prompt_inj = bool(re.search(
        r'(ignore\s+all\s+previous|system\s+prompt|you\s+are\s+now\s+dan|disregard\s+all|override\s+rules)',
        norm, re.IGNORECASE
    ))

    if is_command_inj:
        return {"blocked": True, "cwe": "CWE-78: OS Command Injection", "category": "COMMAND_INJECTION", "severity": "CRITICAL"}
    if is_sqli:
        return {"blocked": True, "cwe": "CWE-89: SQL Injection", "category": "SQL_INJECTION", "severity": "CRITICAL"}
    if is_xss:
        return {"blocked": True, "cwe": "CWE-79: Cross-Site Scripting", "category": "XSS_INJECTION", "severity": "HIGH"}
    if is_path_traversal:
        return {"blocked": True, "cwe": "CWE-22: Path Traversal", "category": "PATH_TRAVERSAL", "severity": "HIGH"}
    if is_prompt_inj:
        return {"blocked": True, "cwe": "CWE-20: Improper Input Validation (Prompt Injection)", "category": "PROMPT_INJECTION", "severity": "HIGH"}

    # Block disclosure/access attempts, while allowing harmless discussion
    # such as password-reset help or advice on creating a strong password.
    has_sensitive_request = any(
        re.search(pattern, norm, re.IGNORECASE | re.DOTALL)
        for pattern in SENSITIVE_REQUEST_PATTERNS
    )

    if has_sensitive_request:
        return {
            "blocked": True,
            "category": "SENSITIVE_DATA_REQUEST",
            "severity": "HIGH"
        }

    # Check all 15 predefined topics. The normal-input fallback must be OUTSIDE this loop.
    for item in AUTHORIZED_KNOWLEDGE:
        if any(keyword in norm for keyword in item["keywords"]):
            return {"blocked": False, "response": item["response"], "title": item["title"]}

    return {"blocked": False, "category": "NORMAL_INPUT", "severity": "INFO"}


def contains_sensitive_output(answer: str) -> bool:
    """Detect likely secret material before it is returned to the client."""
    if not isinstance(answer, str):
        return True
    return any(
        re.search(pattern, answer, re.IGNORECASE | re.DOTALL)
        for pattern in SECRET_VALUE_PATTERNS
    )


@app.route('/')
def home():
    template_path = os.path.join(os.path.dirname(__file__), 'templates', 'ecommerce.html')
    if os.path.exists(template_path):
        return render_template('ecommerce.html')
    return """
    <h1>Secure DevSecOps Pipeline</h1>
    <p>Application and Aura AI Chatbot are running successfully!</p>
    """


@app.route('/health')
def health():
    return jsonify({"status": "healthy", "service": "aura-chatbot-api"})




@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json(silent=True) or {}
    prompt = data.get("prompt", "")
    if not isinstance(prompt, str):
        return jsonify({"ok": False, "error": "Prompt must be text"}), 400
    prompt = prompt.strip()

    if not prompt:
        return jsonify({"ok": False, "error": "Prompt required"}), 400
    if len(prompt) > 2000:
        return jsonify({"ok": False, "error": "Message is too long"}), 400

    security_check = classify_prompt(prompt)

    if security_check["blocked"]:
        return jsonify({
            "ok": True,
            "answer": SAFE_REFUSAL,
            "isPredefined": False,
            "isSecurityAnomaly": True,
            "securityCategory": security_check.get("category"),
            "severity": security_check.get("severity"),
            "cwe": security_check.get("cwe")
        }), 200

    if "response" in security_check:
        answer = security_check["response"]
        if contains_sensitive_output(answer):
            app.logger.error("Sensitive-output guard blocked a predefined response.")
            return jsonify({
                "ok": True,
                "answer": SAFE_REFUSAL,
                "isPredefined": False,
                "isSecurityAnomaly": True,
                "securityCategory": "SENSITIVE_OUTPUT_BLOCKED",
                "severity": "CRITICAL"
            }), 200
        return jsonify({
            "ok": True,
            "answer": answer,
            "isPredefined": True,
            "isSecurityAnomaly": False
        }), 200

    try:
        answer = generate_rag_answer(prompt)
        if contains_sensitive_output(answer):
            app.logger.warning("Sensitive-output guard blocked a generated response.")
            return jsonify({
                "ok": True,
                "answer": SAFE_REFUSAL,
                "isPredefined": False,
                "isSecurityAnomaly": True,
                "securityCategory": "SENSITIVE_OUTPUT_BLOCKED",
                "severity": "CRITICAL"
            }), 200

        return jsonify({
            "ok": True,
            "answer": answer,
            "isPredefined": False,
            "isSecurityAnomaly": False
        }), 200

    except Exception:
        app.logger.exception("Aura RAG request failed")
        return jsonify({
            "ok": False,
            "error": "Aura AI is temporarily unavailable."
        }), 503


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
