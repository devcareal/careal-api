// Home.jsx — with auto-sliding hero and Accordion FAQ
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

// ✅ 1. Correctly named individual image imports
import carGif0 from "../../assets/images/car-b5.gif";
import carGif1 from "../../assets/images/car_1.jpg";
import carGif2 from "../../assets/images/car_2.jpg";
import carGif3 from "../../assets/images/car_3.jpg";
import carGif4 from "../../assets/images/car_4.jpg";
import carGif5 from "../../assets/images/car_5.jpg";
import carGif10 from "../../assets/images/car_10.jpg";

// Map imported assets into an array matching your slides loop length
const CAR_IMAGES = [carGif0, carGif1, carGif2]; 

const SLIDES = [
  {
    overlay: "linear-gradient(135deg, rgba(10,3,30,0.82) 0%, rgba(60,20,120,0.70) 60%, rgba(10,3,30,0.80) 100%)",
    eyebrow: "Nigeria's #1 Vehicle Document Platform",
    heading: "Renew Your Vehicle Documents",
    accent:  "Without Stress",
    sub:     "Licence, road worthiness, insurance — all online. FRSC-verified plates. Zero office visits.",
  },
  {
    overlay: "linear-gradient(135deg, rgba(5,20,50,0.84) 0%, rgba(10,60,100,0.72) 60%, rgba(5,20,50,0.82) 100%)",
    eyebrow: "Fast · Secure · Verified",
    heading: "Skip the Queue,",
    accent:  "Stay Road-Legal",
    sub:     "Renew vehicle papers. Insurance & roadworthiness",
  },
  {
    overlay: "linear-gradient(135deg, rgba(30,5,10,0.84) 0%, rgba(100,20,40,0.68) 60%, rgba(30,5,10,0.82) 100%)",
    eyebrow: "Powered by Flutterwave · FRSC Registry",
    heading: "Secure Payments,",
    accent:  "Instant Processing",
    sub:     "Pay in seconds via Flutterwave. Track every document renewal in real time from your personal dashboard.",
  },
];

const SERVICES = [
  { icon: "📋", name: "Vehicle Licence Renewal", desc: "Renew your vehicle licence online. No office visit, no queues — processed in 1–2 business days.", price: "₦2,500", duration: "1–2 business days" },
  { icon: "🛡️", name: "Road Worthiness Certificate", desc: "Get your road worthiness certificate renewed hassle-free by our certified agents.", price: "₦13,000", duration: "2–3 business days" },
  { icon: "📄", name: "Vehicle Insurance Renewal", desc: "Renew your motor insurance with verified providers — all confirmed online in 1 business day.", price: "₦15,000", duration: "1 business day" },
];

const STEPS = [
  { num: "1", title: "Create Your Account", text: "Sign up in under two minutes with your name, email, vehicle plate and chassis number." },
  { num: "2", title: "Select Your Services", text: "Pick the documents you need renewed — licence, road worthiness, insurance, or all three." },
  { num: "3", title: "Pay & Track", text: "Pay securely via Flutterwave. We handle everything and update you at every step." },
];

const STATS = [
  { num: "10K+",  label: "Vehicles Registered" },
  { num: "₦50M+", label: "Payments Processed" },
  { num: "3",     label: "Services Available" },
  { num: "24/7",  label: "Support Available" },
];

// FAQ Data Setup
const FAQ_DATA = [
  {
    q: "How long does verification take?",
    a: "Standard verifications are processed instantly. Complex official records matching checks are finalized within 10 to 30 minutes max."
  },
  {
    q: "What documents do I need to upload?",
    a: "You only need your valid vehicle registration certificate, proof of ownership documents, or an official identification card."
  },
  {
    q: "Are there any hidden fees?",
    a: "No hidden charges whatsoever. You only pay the transparent flat rate displayed on your selected service tier card."
  },
  {
    q: "Is my data secure?",
    a: "Completely secure. All payloads and vehicle verification logs are fully protected with bank-grade AES-256 encryption standards."
  }
];

export default function Home() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [fading,  setFading]  = useState(false);
  
  // Minimal state to keep track of open accordion index
  const [faqActive, setFaqActive] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent(c => (c + 1) % SLIDES.length);
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (idx) => {
    if (idx === current) return;
    setFading(true);
    setTimeout(() => { setCurrent(idx); setFading(false); }, 400);
  };

  const slide = SLIDES[current];

  return (
    <>
      <section className="home-hero">
        {/* Apply the dynamic sliding asset image & fade hooks directly */}
        <div className={`hero-bg ${fading ? "bg-fade-out" : "bg-fade-in"}`}>
          {/* <img src={CAR_IMAGES[current]} alt="Moving car" className="hero-bg-img" /> */}
          <img src={CAR_IMAGES[current]} alt="Vehicle" className={`hero-bg-img ${fading ? "bg-fade-out" : "bg-fade-in"}`} />
        </div>

        <div className="hero-bg">
          {/* The slider track moves horizontally based on the active image index */}
          <div 
            className="hero-slider-track" 
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {CAR_IMAGES.map((imgSrc, index) => (
              <img 
                key={index} 
                src={imgSrc} 
                alt={`Vehicle ${index}`} 
                className="hero-bg-img" 
              />
            ))}
          </div>
        </div>

        <div
          className={`hero-overlay ${fading ? "overlay-fade-out" : "overlay-fade-in"}`}
          style={{ background: slide.overlay }}
        />

        <div className={`hero-content ${fading ? "content-fade-out" : "content-fade-in"}`}>
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            {slide.eyebrow}
          </div>

          <h1 className="hero-title">
            {slide.heading}<br />
            <span className="hero-title-accent">{slide.accent}</span>
          </h1>

          <p className="hero-subtitle">{slide.sub}</p>

          <div className="hero-cta-group">
            <button className="hero-btn-primary" onClick={() => navigate("/signup")}>
              Get Started — It's Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="hero-btn-secondary" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>
        </div>

        <div className="hero-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === current ? "active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <div className="hero-scroll-arrow" />
        </div>
      </section>

      {/* ── Stats Strip ── */}
      <section className="stats-strip">
        <div className="stats-strip-inner">
          {STATS.map((s) => (
            <div className="strip-stat" key={s.label}>
              <div className="strip-stat-num">{s.num}</div>
              <div className="strip-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services Preview ── */}
      <section className="home-services">
        <div className="section-header-row">
          <div className="section-eyebrow">Our Services</div>
          <h2 className="section-title">Everything Your Vehicle Needs, Online</h2>
          <p className="section-subtitle">
            Fixed prices, no hidden charges. All services processed by certified agents.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map((svc, i) => (
            <div className="svc-preview-card" key={svc.name} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="svc-card-icon-wrap">{svc.icon}</div>
              <div className="svc-card-name">{svc.name}</div>
              <p className="svc-card-text">{svc.desc}</p>
              <div className="svc-card-footer">
                <div className="svc-card-price">
                  <span className="svc-card-price-amount">{svc.price}</span>
                  <span className="svc-card-price-label">Fixed Fee</span>
                </div>
                <span className="svc-card-duration">⏱ {svc.duration}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="services-cta-row">
          <button className="services-cta-btn" onClick={() => navigate("/services")}>
            View All Services →
          </button>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="home-how">
        <div className="section-header-row">
          <div className="section-eyebrow">How It Works</div>
          <h2 className="section-title">Ready in Three Simple Steps</h2>
          <p className="section-subtitle">
            No paperwork, no queues, no confusion — just a clean, fast process from your phone or computer.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <div className="step-item" key={step.num}>
              <div className="step-num">{step.num}</div>
              <div className="step-title">{step.title}</div>
              <p className="step-text">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accordion FAQ Section ── */}
      <section className="home-faq-section">
        <div className="section-header-row">
          <div className="section-eyebrow">FAQ</div>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-accordion-container">
          {FAQ_DATA.map((item, index) => {
            const isOpen = faqActive === index;
            return (
              <div 
                key={index} 
                className={`faq-accordion-item ${isOpen ? "active" : ""}`}
              >
                <button 
                  type="button"
                  className="faq-accordion-trigger" 
                  onClick={() => setFaqActive(isOpen ? null : index)}
                >
                  <span>{item.q}</span>
                  <span className="faq-icon-marker">{isOpen ? "−" : "+"}</span>
                </button>
                <div className="faq-accordion-content">
                  <p>{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA Band ── */}
      <section className="home-cta">
        <h2 className="cta-title">Start Renewing Your Documents Today</h2>
        <p className="cta-subtitle">
          Join thousands of Nigerian vehicle owners who've left the queue behind.
        </p>
        <button className="cta-btn-white" onClick={() => navigate("/signup")}>
          Create a Free Account
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </section>
    </>
  );
}