import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  RotateCcw,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const PREDEFINED_PROMPTS = [
  // 1-8: Products
  {
    id: 1,
    category: 'Products',
    shortLabel: 'Aura Studio Headphones',
    prompt: 'Tell me about the Aura Studio Wireless Headphones',
    tag: 'Audio'
  },
  {
    id: 2,
    category: 'Products',
    shortLabel: 'Mechanical Keyboard',
    prompt: 'What switches and features does the Precision Mechanical Keyboard have?',
    tag: 'Workspace'
  },
  {
    id: 3,
    category: 'Products',
    shortLabel: 'Aluminum Laptop Stand',
    prompt: 'How does the Minimalist Aluminum Laptop Stand improve ergonomics?',
    tag: 'Workspace'
  },
  {
    id: 4,
    category: 'Products',
    shortLabel: 'Chronograph Wristwatch',
    prompt: 'What materials and movement are used in the Chronograph Wristwatch?',
    tag: 'Lifestyle'
  },
  {
    id: 5,
    category: 'Products',
    shortLabel: 'Ceramic Tumbler',
    prompt: 'Tell me about the Ceramic Pour-Over & Travel Tumbler',
    tag: 'Lifestyle'
  },
  {
    id: 6,
    category: 'Products',
    shortLabel: 'Monitor Screenbar Light',
    prompt: 'How does the Monitor Screenbar Light reduce eye strain?',
    tag: 'Workspace'
  },
  {
    id: 7,
    category: 'Products',
    shortLabel: '3-in-1 Fast Wireless Dock',
    prompt: 'What devices can charge on the Magnetic 3-in-1 Fast Wireless Dock?',
    tag: 'Workspace'
  },
  {
    id: 8,
    category: 'Products',
    shortLabel: 'Hi-Fi Desktop Speaker',
    prompt: 'What audio quality does the Compact Hi-Fi Desktop Speaker deliver?',
    tag: 'Audio'
  },

  // 9-11: Store Policies
  {
    id: 9,
    category: 'Policies',
    shortLabel: 'Shipping & Delivery',
    prompt: 'What is your shipping policy and delivery timeframe?',
    tag: 'Policy'
  },
  {
    id: 10,
    category: 'Policies',
    shortLabel: 'Returns & Warranty',
    prompt: 'What is your return, refund and warranty policy?',
    tag: 'Policy'
  },
  {
    id: 11,
    category: 'Policies',
    shortLabel: 'Discounts & Promo Codes',
    prompt: 'What promo codes or discounts are currently active?',
    tag: 'Policy'
  },
  {
    id: 12,
    category: 'Policies',
    shortLabel: 'Order Tracking & Status',
    prompt: 'How can I track my existing order status?',
    tag: 'Policy'
  },
  {
    id: 13,
    category: 'Policies',
    shortLabel: 'Payment Methods & Security',
    prompt: 'What payment methods do you accept and is checkout secure?',
    tag: 'Policy'
  },
  {
    id: 14,
    category: 'Policies',
    shortLabel: 'Customer Support & Contact',
    prompt: 'How can I contact customer support or speak to a representative?',
    tag: 'Policy'
  },
  {
    id: 15,
    category: 'Policies',
    shortLabel: 'Gift Cards & Packaging',
    prompt: 'Do you offer digital gift cards or gift packaging?',
    tag: 'Policy'
  }
];

export default function ChatbotWidget({ onSelectCategory, onSearchProduct }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am Aura, your AI shopping assistant. Feel free to ask me anything about our products, technical specs, shipping, returns, order tracking, or store policies!",
      isPredefined: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  

const handleSend = async (textToSend) => {
  const query = (textToSend || input).trim();
  if (!query || loading) return;

  const userMsg = {
    id: Date.now(),
    sender: 'user',
    text: query,
    time: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })
  };

  setMessages((prev) => [...prev, userMsg]);
  setInput('');
  setLoading(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const res = await fetch('http://localhost:5000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: query, mode: 'general' }),
      signal: controller.signal
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Server error: ${res.status}`);
    }

    const botMsg = {
      id: Date.now() + 1,
      sender: 'bot',
      text: data.answer || 'I could not generate a response.',
      isPredefined: data.isPredefined,
      isSecurityAnomaly: data.isSecurityAnomaly,
      securityEvent: data.securityEvent,
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setMessages((prev) => [...prev, botMsg]);

  } catch (error) {
    console.error('Chatbot error:', error);

    const errorMessage = error.name === 'AbortError'
      ? 'The request timed out. Please try again.'
      : 'Sorry, the AI service is temporarily unavailable. Please try again.';

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        sender: 'bot',
        text: errorMessage,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })
      }
    ]);

  } finally {
    clearTimeout(timeoutId);
    setLoading(false);
  }
};



  const handleClear = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'bot',
        text: "Conversation refreshed. How can I assist you with our catalog products, tech specs, or store policies today?",
        isPredefined: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="chatbot-fab"
          title="Open Aura AI Assistant"
          aria-label="Open AI Chatbot"
        >
          <div className="chatbot-fab-pulse"></div>
          <Bot size={24} className="chatbot-fab-icon" />
          <span className="chatbot-fab-badge">AI</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className={`chatbot-window ${isExpanded ? 'expanded' : ''}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <Bot size={20} color="#38bdf8" />
              </div>
              <div>
                <div className="chatbot-title-row">
                  <h3 className="chatbot-title">Aura AI Assistant</h3>
                  <span className="chatbot-status-pill">
                    <span className="chatbot-status-dot"></span> GUARD ACTIVE
                  </span>
                </div>
                <p className="chatbot-subtitle">Audited with Semgrep, Trivy &amp; Checkov</p>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                onClick={handleClear}
                className="chatbot-action-btn"
                title="Restart chat"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="chatbot-action-btn"
                title={isExpanded ? "Collapse" : "Expand"}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="chatbot-action-btn"
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chatbot-message-row ${m.sender === 'user' ? 'user-row' : 'bot-row'}`}
              >
                {m.sender === 'bot' && (
                  <div className="chatbot-msg-avatar">
                    <Bot size={15} color="#38bdf8" />
                  </div>
                )}
                <div
                  className={`chatbot-bubble ${
                    m.sender === 'user' ? 'user-bubble' : 'bot-bubble'
                  }`}
                >
                  <p className="chatbot-bubble-text" style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
                  <span className="chatbot-bubble-time">{m.time}</span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chatbot-message-row bot-row">
                <div className="chatbot-msg-avatar">
                  <Bot size={15} color="#38bdf8" />
                </div>
                <div className="chatbot-bubble bot-bubble typing-bubble">
                  <Loader2 size={16} className="animate-spin" color="#38bdf8" />
                  <span>Aura AI is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="chatbot-input-bar"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products, specs, shipping, order tracking..."
              className="chatbot-input"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="chatbot-send-btn"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </form>

          {/* Footer Security Badge */}
          <div className="chatbot-footer-bar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={12} color="#10b981" />
              <span>Aura AI • Safe &amp; Verified Store Assistant</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
