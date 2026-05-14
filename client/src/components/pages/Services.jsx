// Services.jsx  — src/components/pages/Services.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";


const SERVICE_PRICES = {
  license: {
    key:      "license",
    label:    "Vehicle Licence Renewal",
    desc:     "Renew your vehicle licence quickly and easily without visiting the office.",
    price:    2500,
    duration: "1–2 business days",
    docs:     "Vehicle licence copy, valid ID",
    icon:     "📋",
  },
  roadworthiness: {
    key:      "roadworthiness",
    label:    "Road Worthiness Renewal",
    desc:     "Get your road worthiness certificate renewed hassle-free.",
    price:    13000,
    duration: "2–3 business days",
    docs:     "Vehicle inspection report, ID",
    icon:     "🛡️",
  },
  insurance: {
    key:      "insurance",
    label:    "Vehicle Insurance Renewal",
    desc:     "Renew your vehicle insurance with verified providers online.",
    price:    15000,
    duration: "1 business day",
    docs:     "Previous insurance document",
    icon:     "📄",
  },
};

// ✅ Two-fold deployment strategy:
//    Single host (now):     falls back to "/api" — Vite proxy (dev) / Express (prod)
//    Separate host (later): set VITE_API_BASE in Render env — no code changes needed
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export default function Services() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [user, setUser]               = useState(null);
  const [vehicles, setVehicles]       = useState([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [selected, setSelected]       = useState({
    license: false, roadworthiness: false, insurance: false,
  });
  const [plateNumber, setPlateNumber] = useState("");
  const [showModal, setShowModal]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");

  useEffect(() => {
    const token = localStorage.getItem("careal_token");
    if (!token) { navigate("/login", { replace: true }); return; }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API_BASE}/profile`,  { headers }),
      fetch(`${API_BASE}/vehicles`, { headers }),
    ])
      .then(async ([profRes, vehRes]) => {
        if (profRes.status === 401 || vehRes.status === 401) {
          localStorage.removeItem("careal_token");
          navigate("/login", { replace: true });
          return;
        }
        const profData = await profRes.json();
        const vehData  = await vehRes.json();
        setUser(profData.user || null);
        const vlist = vehData.vehicles || [];
        setVehicles(vlist);

        const urlPlate = params.get("plate");
        if (urlPlate && vlist.some((v) => v.plate_number === urlPlate)) {
          setPlateNumber(urlPlate);
        } else if (vlist.length > 0) {
          setPlateNumber(vlist[0].plate_number);
        }
      })
      .catch(() => navigate("/login", { replace: true }))
      .finally(() => setAuthLoading(false));
  }, [navigate]);

  const selectedServices = Object.entries(SERVICE_PRICES).filter(([k]) => selected[k]);
  const total            = selectedServices.reduce((sum, [, s]) => sum + s.price, 0);
  const hasSelection     = selectedServices.length > 0;
  const canProceed       = hasSelection && !!plateNumber;

  const disabledReason = !hasSelection && !plateNumber
    ? "Select a service and a vehicle to continue"
    : !hasSelection
    ? "Select at least one service to continue"
    : !plateNumber
    ? "Select a vehicle plate to continue"
    : "";

  const toggle = (key) => setSelected((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleProceed = () => {
    setError("");
    if (!canProceed) { setError(disabledReason); return; }
    setShowModal(true);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("careal_token");
    try {
      const res = await fetch(`${API_BASE}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plate_number:   plateNumber,
          license:        selected.license,
          roadworthiness: selected.roadworthiness,
          insurance:      selected.insurance,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to initiate payment. Try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.payment_link;
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div style={S.loadingScreen}>
        <div style={S.spinner} />
        <span style={{ fontFamily:"'Syne',sans-serif", fontWeight:600, color:"#7C3AED" }}>
          Loading services…
        </span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8F6FF; font-family: 'DM Sans', sans-serif; color: #1E1040; }
        .svc-root { min-height: 100vh; display: flex; flex-direction: column; }
        .svc-scroll { flex: 1; overflow-y: auto; }
        .svc-card {
          background: #fff; border: 2px solid #EDE9FE; border-radius: 18px;
          padding: 22px 24px; cursor: pointer;
          transition: border-color 0.18s, box-shadow 0.18s, transform 0.15s;
          display: flex; align-items: flex-start; gap: 18px; user-select: none;
        }
        .svc-card:hover { border-color: #A78BFA; box-shadow: 0 4px 20px rgba(124,58,237,0.10); transform: translateY(-2px); }
        .svc-card.selected {
          border-color: #7C3AED;
          background: linear-gradient(135deg,#FAF5FF 0%,#fff 100%);
          box-shadow: 0 6px 24px rgba(124,58,237,0.14);
        }
        .svc-check {
          width: 22px; height: 22px; border-radius: 6px;
          border: 2px solid #C4B5FD; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, border-color 0.15s;
          margin-top: 2px; font-size: 13px; font-weight: 700; color: #fff;
        }
        .svc-check.on { background: #7C3AED; border-color: #7C3AED; }
        .proceed-wrap { position: relative; display: inline-block; }
        .proceed-tooltip {
          position: absolute; bottom: calc(100% + 10px); right: 0;
          background: #1E1040; color: #fff; font-size: 12px; font-weight: 500;
          padding: 7px 13px; border-radius: 8px; white-space: nowrap;
          pointer-events: none; opacity: 0; transform: translateY(6px);
          transition: opacity 0.18s, transform 0.18s; z-index: 200;
        }
        .proceed-tooltip::after {
          content: ''; position: absolute; top: 100%; right: 22px;
          border: 6px solid transparent; border-top-color: #1E1040;
        }
        .proceed-wrap:hover .proceed-tooltip { opacity: 1; transform: translateY(0); }
        .plate-select {
          width: 100%; padding: 12px 16px; border: 2px solid #EDE9FE;
          border-radius: 12px; font-size: 15px; font-family: 'DM Sans',sans-serif;
          color: #1E1040; background: #fff; outline: none; cursor: pointer;
          transition: border-color 0.15s; appearance: auto;
        }
        .plate-select:focus { border-color: #7C3AED; }
        @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .overlay-fade  { animation: fadeIn  0.2s ease; }
        .modal-animate { animation: slideUp 0.25s ease; }
        .spin-icon     { display:inline-block; animation:spin 0.8s linear infinite; }
        @media (max-width: 600px) {
          .svc-summary-bar { padding: 12px 16px !important; }
          .svc-proceed-btn { padding: 11px 18px !important; font-size: 13px !important; }
        }
      `}</style>

      <div className="svc-root">
        <nav style={S.nav}>
          <div style={S.navLogo}>CAR<span style={{ color:"#1E1040" }}>EAL</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <button style={S.dashLink} onClick={() => navigate("/dashboard")}>← Dashboard</button>
            <div style={S.avatar}>
              {user ? `${user.first_name?.[0]||""}${user.last_name?.[0]||""}` : "?"}
            </div>
          </div>
        </nav>

        <div className="svc-scroll">
          <div style={S.page}>
            <div style={S.header}>
              <h1 style={S.title}>Renew Your Vehicle Documents</h1>
              <p style={S.subtitle}>Select one or more services below. Prices are fixed — no hidden charges.</p>
            </div>

            <div style={S.plateRow}>
              <label style={S.plateLabel}>Vehicle Plate Number</label>
              {vehicles.length > 0 ? (
                <select
                  className="plate-select"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.plate_number}>
                      {v.plate_number}{v.make ? ` · ${v.make}` : ""}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <div style={{
                    background:"#FFF7ED", border:"1.5px solid #FED7AA",
                    borderRadius:10, padding:"10px 14px", marginBottom:12,
                    fontSize:13, color:"#C2570A",
                  }}>
                    ⚠️ No registered vehicles.{" "}
                    <button onClick={() => navigate("/add-vehicle")} style={S.linkBtn}>
                      Add a vehicle →
                    </button>{" "}
                    or type your plate number below.
                  </div>
                  <input
                    placeholder="Enter plate number e.g. ABC-123-DE"
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                    style={{
                      width:"100%", padding:"12px 16px",
                      border:"2px solid #EDE9FE", borderRadius:12,
                      fontSize:15, fontFamily:"'DM Sans',sans-serif",
                      color:"#1E1040", background:"#fff", outline:"none",
                      textTransform:"uppercase", cursor:"text",
                    }}
                  />
                </div>
              )}
            </div>

            <div style={S.grid}>
              {Object.values(SERVICE_PRICES).map((svc) => {
                const on = selected[svc.key];
                return (
                  <div
                    key={svc.key}
                    className={`svc-card${on ? " selected" : ""}`}
                    onClick={() => toggle(svc.key)}
                    role="checkbox"
                    aria-checked={on}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === " " && toggle(svc.key)}
                  >
                    <div className={`svc-check${on ? " on" : ""}`}>{on ? "✓" : ""}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <span style={{ fontSize:24 }}>{svc.icon}</span>
                        <span style={S.cardTitle}>{svc.label}</span>
                      </div>
                      <p style={S.cardDesc}>{svc.desc}</p>
                      <div style={S.cardMeta}>
                        <span>⏱ {svc.duration}</span>
                        <span>📁 {svc.docs}</span>
                      </div>
                    </div>
                    <div style={{ ...S.priceTag, color: on ? "#7C3AED" : "#A78BFA" }}>
                      ₦{svc.price.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && !showModal && (
              <div style={S.errorBanner}>⚠️ {error}</div>
            )}
          </div>
        </div>

        <div className="svc-summary-bar" style={S.summaryBar}>
          <div>
            {hasSelection ? (
              <>
                <div style={S.summaryLabel}>
                  {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} selected
                </div>
                <div style={S.summaryTotal}>Total: ₦{total.toLocaleString()}</div>
              </>
            ) : (
              <div style={{ ...S.summaryLabel, color:"#C4B5FD", fontStyle:"italic" }}>
                Tick a service above to get started
              </div>
            )}
          </div>

          <div className="proceed-wrap">
            {!canProceed && <div className="proceed-tooltip">{disabledReason}</div>}
            <button
              className="svc-proceed-btn"
              style={{
                ...S.proceedBtn,
                opacity: canProceed ? 1 : 0.45,
                cursor:  canProceed ? "pointer" : "not-allowed",
              }}
              onClick={handleProceed}
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="overlay-fade" style={S.overlay}>
          <div className="modal-animate" style={S.modal}>
            <h2 style={S.modalTitle}>Confirm Payment</h2>
            <p style={S.modalSub}>Vehicle: <strong>{plateNumber}</strong></p>
            <div style={S.divider} />
            {selectedServices.map(([, svc]) => (
              <div key={svc.key} style={S.modalRow}>
                <span>{svc.icon} {svc.label}</span>
                <span style={{ fontWeight:700 }}>₦{svc.price.toLocaleString()}</span>
              </div>
            ))}
            <div style={S.divider} />
            <div style={{ ...S.modalRow, fontWeight:800, fontSize:17, color:"#7C3AED" }}>
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
            <p style={S.modalNote}>
              🔒 You'll be securely redirected to Flutterwave to complete your payment.
              Document processing begins immediately after confirmation.
            </p>
            {error && <div style={{ ...S.errorBanner, marginTop:12 }}>⚠️ {error}</div>}
            <div style={S.modalActions}>
              <button
                style={S.cancelBtn}
                onClick={() => { setShowModal(false); setError(""); }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                style={{ ...S.confirmBtn, opacity: loading ? 0.7 : 1 }}
                onClick={handleConfirmPayment}
                disabled={loading}
              >
                {loading
                  ? <span><span className="spin-icon">⟳</span> Redirecting…</span>
                  : "Pay Now →"
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  loadingScreen: { display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", gap:16 },
  spinner: { width:40, height:40, borderRadius:"50%", border:"3px solid #EDE9FE", borderTopColor:"#7C3AED", animation:"spin 0.8s linear infinite" },
  nav: { background:"#fff", borderBottom:"1.5px solid #EDE9FE", padding:"0 32px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, flexShrink:0 },
  navLogo: { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:22, color:"#7C3AED", letterSpacing:-0.5 },
  dashLink: { fontSize:13, fontWeight:600, color:"#7C3AED", background:"#F5F3FF", border:"none", padding:"6px 14px", borderRadius:8, cursor:"pointer" },
  avatar: { width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#7C3AED,#C4B5FD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, color:"#fff", fontSize:15 },
  page: { maxWidth:760, margin:"0 auto", padding:"36px 24px 32px" },
  header: { marginBottom:32 },
  title: { fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, color:"#1E1040", marginBottom:8 },
  subtitle: { fontSize:14, color:"#7C7CA0", lineHeight:1.6 },
  plateRow: { marginBottom:28 },
  plateLabel: { display:"block", fontSize:12, fontWeight:700, color:"#A78BFA", textTransform:"uppercase", letterSpacing:1, marginBottom:8 },
  linkBtn: { background:"none", border:"none", color:"#7C3AED", fontWeight:700, cursor:"pointer", fontSize:14 },
  grid: { display:"flex", flexDirection:"column", gap:16, marginBottom:16 },
  cardTitle: { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#1E1040" },
  cardDesc: { fontSize:13, color:"#7C7CA0", lineHeight:1.55, marginBottom:10 },
  cardMeta: { display:"flex", gap:16, fontSize:12, color:"#A78BFA", flexWrap:"wrap" },
  priceTag: { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:18, whiteSpace:"nowrap", paddingTop:4, transition:"color 0.18s" },
  errorBanner: { background:"#FEF2F2", border:"1.5px solid #FECACA", color:"#B91C1C", borderRadius:10, padding:"12px 16px", fontSize:13, fontWeight:500, marginBottom:16 },
  summaryBar: { marginTop:"auto", background:"#fff", borderTop:"1.5px solid #EDE9FE", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 -4px 20px rgba(124,58,237,0.08)", gap:16, flexShrink:0 },
  summaryLabel: { fontSize:13, color:"#7C7CA0", fontWeight:500 },
  summaryTotal: { fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#7C3AED" },
  proceedBtn: { background:"linear-gradient(135deg,#7C3AED,#A78BFA)", color:"#fff", border:"none", borderRadius:12, padding:"13px 28px", fontSize:15, fontWeight:700, whiteSpace:"nowrap", transition:"opacity 0.15s, transform 0.15s" },
  overlay: { position:"fixed", inset:0, background:"rgba(14,7,41,0.55)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:"0 16px" },
  modal: { background:"#fff", borderRadius:22, padding:"32px 28px", width:"100%", maxWidth:420, boxShadow:"0 24px 60px rgba(124,58,237,0.22)" },
  modalTitle: { fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#1E1040", marginBottom:6 },
  modalSub: { fontSize:14, color:"#7C7CA0", marginBottom:16 },
  divider: { borderTop:"1.5px solid #F3F0FF", margin:"14px 0" },
  modalRow: { display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:14, color:"#1E1040", padding:"6px 0" },
  modalNote: { fontSize:12, color:"#7C7CA0", lineHeight:1.6, background:"#FAF5FF", borderRadius:10, padding:"12px 14px", marginTop:16, marginBottom:8 },
  modalActions: { display:"flex", gap:12, marginTop:20 },
  cancelBtn: { flex:1, padding:"12px", border:"2px solid #EDE9FE", borderRadius:12, background:"#fff", color:"#7C7CA0", fontWeight:600, fontSize:14, cursor:"pointer" },
  confirmBtn: { flex:2, padding:"12px", background:"linear-gradient(135deg,#7C3AED,#A78BFA)", border:"none", borderRadius:12, color:"#fff", fontWeight:700, fontSize:15, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.28)", transition:"opacity 0.15s" },
};