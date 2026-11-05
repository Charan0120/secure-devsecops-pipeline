import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  Heart,
  Star,
  Plus,
  Minus,
  Trash2,
  X,
  Truck,
  ShieldCheck,
  RotateCcw,
  Headphones,
  Check,
  ArrowRight,
  Filter,
  Sparkles,
  CreditCard,
  Lock,
  Mail,
  Bot
} from 'lucide-react';
import './App.css';
import ChatbotWidget from './components/ChatbotWidget';

// Curated Minimalist Products with high quality photography
const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: 'Aura Studio Wireless Headphones',
    category: 'Audio',
    price: 249,
    originalPrice: 299,
    rating: 4.9,
    reviews: 142,
    discount: '17% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80',
    description: 'Active Noise Cancellation with 40-hour battery life and custom titanium drivers.'
  },
  {
    id: 2,
    title: 'Precision Mechanical Keyboard',
    category: 'Workspace',
    price: 139,
    originalPrice: 169,
    rating: 4.8,
    reviews: 98,
    discount: '18% OFF',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=80',
    description: 'Gateron optical switches, hot-swappable PBT keycaps, and aircraft-grade aluminum frame.'
  },
  {
    id: 3,
    title: 'Minimalist Aluminum Laptop Stand',
    category: 'Workspace',
    price: 59,
    originalPrice: 79,
    rating: 4.7,
    reviews: 215,
    discount: '25% OFF',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=700&q=80',
    description: 'Ergonomic 15° elevation with non-slip silicone pads and integrated cable management.'
  },
  {
    id: 4,
    title: 'Chronograph Minimalist Wristwatch',
    category: 'Lifestyle',
    price: 189,
    originalPrice: 220,
    rating: 4.9,
    reviews: 84,
    discount: '14% OFF',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=80',
    description: 'Sapphire crystal glass, Japanese quartz movement, and genuine Italian leather strap.'
  },
  {
    id: 5,
    title: 'Ceramic Pour-Over & Travel Tumbler',
    category: 'Lifestyle',
    price: 45,
    originalPrice: 55,
    rating: 4.8,
    reviews: 130,
    discount: '18% OFF',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=700&q=80',
    description: 'Double-wall vacuum insulation keeping drinks piping hot for 12 hours.'
  },
  {
    id: 6,
    title: 'Monitor Screenbar Light & Dial',
    category: 'Workspace',
    price: 89,
    originalPrice: 110,
    rating: 4.9,
    reviews: 167,
    discount: '19% OFF',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=700&q=80',
    description: 'Auto-dimming glare-free ambient light with wireless rotary control dial.'
  },
  {
    id: 7,
    title: 'Magnetic 3-in-1 Fast Wireless Dock',
    category: 'Tech Essentials',
    price: 79,
    originalPrice: 99,
    rating: 4.7,
    reviews: 112,
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?auto=format&fit=crop&w=700&q=80',
    description: 'Simultaneously fast-charge iPhone, Apple Watch, and AirPods on a weighted matte base.'
  },
  {
    id: 8,
    title: 'Compact Hi-Fi Desktop Speaker',
    category: 'Audio',
    price: 199,
    originalPrice: 249,
    rating: 4.9,
    reviews: 95,
    discount: '20% OFF',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80',
    description: 'AptX HD Bluetooth streaming with acoustic wood enclosure and deep dynamic bass.'
  }
];

const CATEGORIES = ['All', 'Audio', 'Workspace', 'Tech Essentials', 'Lifestyle'];

export default function App() {
  const [currentView, setCurrentView] = useState('store'); // 'store' | 'security'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [promoApplied, setPromoApplied] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  // Trigger Toast Notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toggle Wishlist
  const toggleWishlist = (id) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((item) => item !== id));
      showToast('Removed from wishlist');
    } else {
      setWishlist([...wishlist, id]);
      showToast('Saved to your wishlist');
    }
  };

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added "${product.title}" to bag`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removed from bag');
  };

  // Promo code handler
  const applyPromo = (e) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'FIRST10' || promoCode.trim().toUpperCase() === 'AURA10') {
      setDiscountPercent(10);
      setPromoApplied(true);
      showToast('Promo code applied: 10% Discount!');
    } else {
      showToast('Invalid promo code. Try FIRST10');
    }
  };

  // Calculations
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (cartSubtotal * discountPercent) / 100;
  }, [cartSubtotal, discountPercent]);

  const shippingCost = cartSubtotal >= 100 || cartSubtotal === 0 ? 0 : 15;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Filter & Sort Products
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((prod) => {
      const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
      const matchesSearch =
        prod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default featured
    });
  }, [selectedCategory, searchQuery, sortBy]);

  // Handle Checkout Submit
  const handleCheckout = (e) => {
    e.preventDefault();
    setOrderComplete(true);
    setTimeout(() => {
      setCart([]);
      setIsCheckoutOpen(false);
      setIsCartOpen(false);
      setOrderComplete(false);
      showToast('Order confirmed! Check your email.');
    }, 2500);
  };

  return (
    <div className="app">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <Check size={18} color="#38bdf8" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        COMPLIMENTARY EXPRESS SHIPPING ON ORDERS OVER $100 &bull; USE CODE <strong>FIRST10</strong> FOR 10% OFF
      </div>

      {/* Main Navbar */}
      <header className="header">
        <div className="container header-inner">
          <a href="#hero" className="brand-logo">
            <span>AURA</span>
            <span className="brand-dot"></span>
          </a>

          {/* Search Bar */}
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search modern tech, audio, workspace gear..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="header-actions">
            <button
              className="icon-btn"
              title="Wishlist"
              onClick={() => showToast(`You have ${wishlist.length} item(s) in wishlist`)}
            >
              <Heart size={20} color={wishlist.length > 0 ? '#ef4444' : 'currentColor'} fill={wishlist.length > 0 ? '#ef4444' : 'none'} />
            </button>

            <button
              className="icon-btn"
              title="Shopping Bag"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingBag size={20} />
              {totalCartCount > 0 && <span className="cart-badge">{totalCartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="container">
          <div className="hero-banner">
            <div>
              <span className="hero-tag">
                <Sparkles size={14} /> Minimalist Collection 2026
              </span>
              <h1 className="hero-title">
                Intelligent Gear For Focused Minds.
              </h1>
              <p className="hero-desc">
                Thoughtfully crafted audio, ergonomic workspace essentials, and precision accessories built to elevate your daily workflow.
              </p>
              <div className="hero-cta-group">
                <a href="#products" className="btn-black">
                  Shop Collection <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div className="hero-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
                alt="Aura Studio Audio"
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories & Filter Bar */}
      <section id="products" className="filter-section">
        <div className="container">
          <div className="filter-bar">
            {/* Category Pills */}
            <div className="category-tabs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Product Cards Grid */}
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image-box">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="product-img"
                      loading="lazy"
                    />
                    <span className="discount-badge">{product.discount}</span>
                    <button
                      className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
                      onClick={() => toggleWishlist(product.id)}
                      title="Save to Wishlist"
                    >
                      <Heart size={18} fill={isWishlisted ? '#ef4444' : 'none'} />
                    </button>
                  </div>

                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-title">{product.title}</h3>

                    <div className="product-rating">
                      <div className="stars">
                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                      </div>
                      <span>{product.rating}</span>
                      <span className="review-count">({product.reviews})</span>
                    </div>

                    <div className="product-bottom">
                      <div className="product-price-box">
                        <span className="current-price">${product.price}</span>
                        <span className="original-price">${product.originalPrice}</span>
                      </div>

                      <button
                        className="add-cart-btn"
                        onClick={() => addToCart(product)}
                      >
                        <Plus size={16} /> Add to Bag
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: '20px' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>No products match your search</p>
              <p style={{ color: '#64748b', marginTop: '6px' }}>Try searching for "Audio", "Keyboard", or reset categories.</p>
              <button
                className="btn-black"
                style={{ marginTop: '16px' }}
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Brand Value Props Banner */}
      <section className="trust-banner">
        <div className="container">
          <div className="trust-grid">
            <div className="trust-item">
              <div className="trust-icon">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="trust-title">Complimentary Shipping</h4>
                <p className="trust-desc">Worldwide express delivery on all orders over $100.</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <RotateCcw size={22} />
              </div>
              <div>
                <h4 className="trust-title">30-Day Guilt-Free Trial</h4>
                <p className="trust-desc">Love your gear or return it for a 100% full refund.</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="trust-title">2-Year Limited Warranty</h4>
                <p className="trust-desc">Built with precision materials designed for longevity.</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon">
                <Lock size={22} />
              </div>
              <div>
                <h4 className="trust-title">Secure Encrypted Checkout</h4>
                <p className="trust-desc">Protected by 256-bit bank-level encryption.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section id="about" className="reviews-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-title">Endorsed by Professionals</h2>
            <p className="section-desc">
              Discover why over 45,000 creators, engineers, and designers trust Aura.
            </p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="stars" style={{ marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-text">
                "The Aura headphones are pure bliss. The noise cancellation creates an oasis of focus during my deep coding sessions. The minimalist aesthetic is unmatched."
              </p>
              <div className="reviewer">
                <div className="reviewer-avatar">ML</div>
                <div>
                  <div className="reviewer-name">Marcus Lin</div>
                  <div className="reviewer-meta">&bull; Verified Buyer &bull; Software Architect</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars" style={{ marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-text">
                "Clean lines, rock-solid aluminum build, and zero unnecessary visual clutter. The laptop stand and screenbar light have completely transformed my desk setup."
              </p>
              <div className="reviewer">
                <div className="reviewer-avatar">ES</div>
                <div>
                  <div className="reviewer-name">Elena Schmidt</div>
                  <div className="reviewer-meta">&bull; Verified Buyer &bull; Design Lead</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="stars" style={{ marginBottom: '14px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-text">
                "Fast shipping, premium eco-friendly unboxing, and the wireless charging dock keeps all my Apple gear organized on my bedside table without tangled wires."
              </p>
              <div className="reviewer">
                <div className="reviewer-avatar">DV</div>
                <div>
                  <div className="reviewer-name">David Vance</div>
                  <div className="reviewer-meta">&bull; Verified Buyer &bull; Creative Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="container">
        <div className="newsletter-card">
          <span className="pill-badge" style={{ marginBottom: '12px' }}>
            <Mail size={14} /> VIP Access
          </span>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Join the Aura Journal
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
            Receive exclusive product drops, member-only discounts, and minimalist workspace inspiration.
          </p>

          {!newsletterSubscribed ? (
            <form
              className="newsletter-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (newsletterEmail) {
                  setNewsletterSubscribed(true);
                  showToast('Subscribed! Welcome to Aura.');
                }
              }}
            >
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="newsletter-input"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="btn-black">
                Subscribe
              </button>
            </form>
          ) : (
            <div style={{ marginTop: '20px', color: '#059669', fontWeight: 600 }}>
              &check; You're on the VIP list! Check your inbox for your 10% welcome coupon.
            </div>
          )}
        </div>
      </section>

      {/* Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3 className="cart-title">
                <ShoppingBag size={20} /> Your Bag ({totalCartCount})
              </h3>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="shipping-meter">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <span>
                  {cartSubtotal >= 100
                    ? '🎉 You unlocked Complimentary Express Shipping!'
                    : `Add $${(100 - cartSubtotal).toFixed(2)} more for Free Shipping`}
                </span>
                <span>{Math.min(100, Math.round((cartSubtotal / 100) * 100))}%</span>
              </div>
              <div className="meter-track">
                <div
                  className="meter-fill"
                  style={{ width: `${Math.min(100, (cartSubtotal / 100) * 100)}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                  <ShoppingBag size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontWeight: 600, color: '#0f172a' }}>Your shopping bag is empty</p>
                  <p style={{ fontSize: '0.88rem', marginTop: '4px' }}>Discover modern gear in our collection.</p>
                  <button
                    className="btn-black"
                    style={{ marginTop: '16px' }}
                    onClick={() => setIsCartOpen(false)}
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img src={item.image} alt={item.title} className="cart-item-img" />
                    <div className="cart-item-info">
                      <div className="cart-item-title">{item.title}</div>
                      <div className="cart-item-price">${item.price}</div>

                      <div className="cart-qty-row">
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={14} />
                          </button>
                          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={14} />
                          </button>
                        </div>

                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                          <Trash2 size={15} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="cart-footer">
                {/* Promo Code Form */}
                <form className="promo-row" onSubmit={applyPromo}>
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. FIRST10)"
                    className="promo-input"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <button type="submit" className="btn-white" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Apply
                  </button>
                </form>

                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="cart-summary-row" style={{ color: '#059669' }}>
                    <span>Promo Discount (10%)</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="cart-summary-row">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  className="btn-black"
                  style={{ width: '100%', marginTop: '14px', padding: '14px' }}
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Proceed to Checkout <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="checkout-modal" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Express Checkout</h3>
              <button className="close-btn" onClick={() => setIsCheckoutOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {!orderComplete ? (
              <form onSubmit={handleCheckout}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Full Delivery Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Siddhartha G."
                    className="newsletter-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Shipping Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123 Innovation Boulevard, Suite 400"
                    className="newsletter-input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      City
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Hyderabad"
                      className="newsletter-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="500081"
                      className="newsletter-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.92rem', marginBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Total Due:</span>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>${cartTotal.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#059669' }}>
                    <Lock size={13} /> 256-Bit SSL Encrypted Payment Simulation
                  </div>
                </div>

                <button type="submit" className="btn-black" style={{ width: '100%', padding: '14px' }}>
                  Confirm &amp; Place Order (${cartTotal.toFixed(2)})
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Check size={32} color="#059669" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  Order Confirmed!
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  Thank you for shopping with Aura. Your package is being prepared for dispatch.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="#hero" className="brand-logo" style={{ marginBottom: '14px' }}>
                <span>AURA</span>
                <span className="brand-dot"></span>
              </a>
              <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '320px', lineHeight: 1.6 }}>
                A modern studio curating minimal workspace gear, studio audio, and lifestyle tech crafted for everyday excellence.
              </p>
            </div>

            <div>
              <div className="footer-col-title">Shop Collection</div>
              <ul className="footer-links">
                <li><a href="#products" onClick={() => setSelectedCategory('Audio')}>Studio Audio</a></li>
                <li><a href="#products" onClick={() => setSelectedCategory('Workspace')}>Workspace Setup</a></li>
                <li><a href="#products" onClick={() => setSelectedCategory('Tech Essentials')}>Tech Essentials</a></li>
                <li><a href="#products" onClick={() => setSelectedCategory('Lifestyle')}>Lifestyle &amp; Living</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Customer Care</div>
              <ul className="footer-links">
                <li><a href="#about">Track Delivery</a></li>
                <li><a href="#about">Shipping Policy</a></li>
                <li><a href="#about">Returns &amp; Exchanges</a></li>
                <li><a href="#about">Warranty Claims</a></li>
              </ul>
            </div>

            <div>
              <div className="footer-col-title">Company</div>
              <ul className="footer-links">
                <li><a href="#about">Our Story</a></li>
                <li><a href="#about">Sustainability</a></li>
                <li><a href="#about">Press &amp; Inquiries</a></li>
                <li><a href="https://github.com/GudikandulaSiddhartha/blackbucks" target="_blank" rel="noreferrer">GitHub Project</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <div>&copy; {new Date().getFullYear()} AURA Minimal Goods Co. All rights reserved.</div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <a href="#hero" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</a>
              <a href="#hero" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget
        onSelectCategory={setSelectedCategory}
        onSearchProduct={setSearchQuery}
      />
    </div>
  );
}
