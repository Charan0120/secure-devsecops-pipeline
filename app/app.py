import re
from flask import Flask, request, jsonify

app = Flask(__name__)

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


def classify_prompt(prompt: str):
    """Classifies prompt against security threats and authorized knowledge boundaries."""
    norm = prompt.strip().lower()

    # 1. Attack Signatures Detection
    is_command_inj = bool(re.search(r'(;|\||`|\$\(|\bsh\b|\bbash\b|\bcat\s+/etc/|\bwhoami\b)', norm))
    is_sqli = bool(re.search(r"('|\bOR\b|\bAND\b|--|;\s*DROP|UNION\s+SELECT)", norm, re.IGNORECASE))
    is_xss = bool(re.search(r'(<script|javascript:|onerror=|<img)', norm, re.IGNORECASE))
    is_path_traversal = bool(re.search(r'(\.\./|\.\.\\|/etc/passwd|/etc/shadow|c:\\windows)', norm, re.IGNORECASE))
    is_prompt_inj = bool(re.search(r'(ignore\s+all\s+previous|system\s+prompt|you\s+are\s+now\s+dan|disregard\s+all|override\s+rules)', norm, re.IGNORECASE))

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

    # 2. Check Authorized Knowledge Base
    for item in AUTHORIZED_KNOWLEDGE:
        if any(k in norm for k in item["keywords"]):
            return {"blocked": False, "response": item["response"], "title": item["title"]}

    # 3. Out-of-Scope / Unauthorized Query
    return {"blocked": True, "cwe": "CWE-20: Improper Input Validation", "category": "UNAUTHORIZED_INPUT", "severity": "MEDIUM"}


@app.route('/')
def home():
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

    if not prompt:
        return jsonify({"ok": False, "error": "Prompt required"}), 400

    classification = classify_prompt(prompt)

    if classification["blocked"]:
        return jsonify({
            "ok": True,
            "answer": "Try again...",
            "isPredefined": False,
            "isSecurityAnomaly": True,
            "securityEvent": {
                "riskCategory": classification["category"],
                "severity": classification["severity"],
                "cwe": classification["cwe"],
                "actionTaken": "BLOCKED & RECORDED IN AUDIT DASHBOARD"
            }
        })
    else:
        return jsonify({
            "ok": True,
            "answer": classification["response"],
            "isPredefined": True,
            "isSecurityAnomaly": False
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
