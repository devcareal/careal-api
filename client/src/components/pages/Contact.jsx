// Contact.jsx — Redesigned
import React from "react";

const CHANNELS = [
  {
    icon: "📧",
    label: "Email Support",
    value: "support@careal.com",
    hint: "We typically reply within 24 hours",
    href: "mailto:support@careal.com",
  },
  {
    icon: "📱",
    label: "Phone / WhatsApp",
    value: "+234 800 000 0000",
    hint: "Monday – Friday, 9am – 6pm WAT",
    href: "tel:+2348000000000",
  },
  {
    icon: "🐦",
    label: "Twitter / X",
    value: "@devcareal",
    hint: "Fastest for quick questions",
    href: "https://x.com/devcareal",
  },
];

export default function Contact() {
  return (
    <div style={{ paddingTop: 68 }}>
      <style>{CSS}</style>

      <div className="contact-hero">
        <div className="contact-eyebrow">Contact Us</div>
        <h1 className="contact-title">We're Here to Help</h1>
        <p className="contact-sub">
          Questions about your vehicle documents, payment issues, or anything else?
          Reach us through any of the channels below.
        </p>
      </div>

      <div className="contact-cards-section">
        <div className="contact-cards-grid">
          {CHANNELS.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target={ch.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="contact-card"
            >
              <div className="contact-card-icon">{ch.icon}</div>
              <div className="contact-card-label">{ch.label}</div>
              <div className="contact-card-value">{ch.value}</div>
              <div className="contact-card-hint">{ch.hint}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="contact-note">
        <div className="contact-note-inner">
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <span>
            For payment-related issues, please have your transaction reference
            number (tx_ref) ready when contacting support. It helps us resolve
            your case much faster.
          </span>
        </div>
      </div>
    </div>
  );
}

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

  .contact-hero { text-align:center; padding:72px 24px 60px; background:#F8F6FF;
    border-bottom:1.5px solid #EDE9FE; }
  .contact-eyebrow { font-size:12px; font-weight:700; color:#7C3AED;
    text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; }
  .contact-title { font-family:'Syne',sans-serif; font-size:clamp(28px,4vw,44px);
    font-weight:800; color:#1E1040; margin-bottom:14px; letter-spacing:-0.5px; }
  .contact-sub { font-size:16px; color:#7C7CA0; line-height:1.65;
    max-width:520px; margin:0 auto; }

  .contact-cards-section { padding:64px 40px; background:#fff; }
  .contact-cards-grid { display:grid; grid-template-columns:repeat(3,1fr);
    gap:20px; max-width:900px; margin:0 auto; }
  .contact-card { display:flex; flex-direction:column; gap:6px;
    background:#F8F6FF; border:1.5px solid #EDE9FE; border-radius:20px;
    padding:30px 26px; text-decoration:none; cursor:pointer;
    transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s; }
  .contact-card:hover { transform:translateY(-4px);
    box-shadow:0 10px 32px rgba(124,58,237,0.12); border-color:#C4B5FD; }
  .contact-card-icon { font-size:32px; margin-bottom:8px; }
  .contact-card-label { font-size:11px; font-weight:700; color:#A78BFA;
    text-transform:uppercase; letter-spacing:1px; }
  .contact-card-value { font-family:'Syne',sans-serif; font-size:16px;
    font-weight:700; color:#1E1040; }
  .contact-card-hint { font-size:13px; color:#7C7CA0; line-height:1.4; }

  .contact-note { background:#FAF5FF; border-top:1.5px solid #EDE9FE; padding:28px 40px; }
  .contact-note-inner { max-width:900px; margin:0 auto; display:flex;
    align-items:flex-start; gap:12px; font-size:14px; color:#7C7CA0; line-height:1.6; }

  @media (max-width:700px) {
    .contact-cards-grid { grid-template-columns:1fr; max-width:420px; }
    .contact-cards-section,.contact-note { padding:48px 20px; }
    .contact-hero { padding:60px 20px; }
  }
`;
