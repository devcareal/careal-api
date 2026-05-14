// Dashboard.jsx — src/components/pages/Dashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// ✅ Two-fold deployment strategy:
//    Single host (now):     falls back to "/api" — Vite proxy (dev) / Express (prod)
//    Separate host (later): set VITE_API_BASE in Render env — no code changes needed
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

const statusConfig = {
  Pending:    { bg: "#FFF7ED", text: "#C2570A", dot: "#F97316" },
  Processing: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#3B82F6" },
  Delivered:  { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  Done:       { bg: "#F0FDF4", text: "#15803D", dot: "#22C55E" },
  "N/A":      { bg: "#F9FAFB", text: "#9CA3AF", dot: "#D1D5DB" },
};

function StatusBadge({ label }) {
  const cfg = statusConfig[label];
  if (!cfg) return <span style={{ fontSize: 12, color: "#9CA3AF" }}>{label || "Pending"}</span>;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
      background: cfg.bg, color: cfg.text,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: cfg.dot, display: "inline-block" }} />
      {label}
    </span>
  );
}

function expandServices(pmt) {
  const rows = [];
  if (pmt.license && pmt.license_status !== "N/A") {
    rows.push({ id: `${pmt.id}-license`, name: "Vehicle License",
      amount: pmt.license_amount, status: pmt.license_status || "Pending", ref: pmt.payment_ref });
  }
  if (pmt.roadworthiness && pmt.roadworthiness_status !== "N/A") {
    rows.push({ id: `${pmt.id}-roadworthiness`, name: "Road Worthiness",
      amount: pmt.roadworthiness_amount, status: pmt.roadworthiness_status || "Pending", ref: pmt.payment_ref });
  }
  if (pmt.insurance && pmt.insurance_status !== "N/A") {
    rows.push({ id: `${pmt.id}-insurance`, name: "Motor Insurance",
      amount: pmt.insurance_amount, status: pmt.insurance_status || "Pending", ref: pmt.payment_ref });
  }
  return rows;
}

// Supabase schema uses reg_number — normalise so the rest of the component
// can use plate_number uniformly
function normalisePmt(pmt) {
  return { ...pmt, plate_number: pmt.plate_number || pmt.reg_number || "" };
}

function VehicleCard({ vehicle, payments, onPayService }) {
  const [expanded, setExpanded] = useState(true);
  const vehiclePayments = payments.filter(p =>
    (p.plate_number || p.reg_number || "") === vehicle.plate_number
  );
  const serviceRows = vehiclePayments.flatMap(expandServices);
  const grandTotal  = vehiclePayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <div style={{
      background: "#fff", border: "1.5px solid #EDE9FE",
      borderRadius: 18, marginBottom: 20, overflow: "hidden",
      boxShadow: "0 2px 16px rgba(109,40,217,0.06)",
    }}>
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "18px 24px", cursor: "pointer",
          background: expanded ? "linear-gradient(90deg,#7C3AED0A,#fff)" : "#fff",
          borderBottom: expanded ? "1.5px solid #F3F0FF" : "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14,
            background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
          }}>🚗</div>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 17, color: "#1E1040" }}>
              {vehicle.plate_number}
            </div>
            <div style={{ fontSize: 13, color: "#7C7CA0", marginTop: 2 }}>
              {vehicle.make || "—"} &bull; {vehicle.color || "—"}
            </div>
            <div style={{ fontSize: 11, color: "#C4B5FD", marginTop: 3 }}>
              Added {new Date(vehicle.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              &nbsp;&middot;&nbsp;
              Verified {vehicle.verified_at
                ? new Date(vehicle.verified_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })
                : "—"}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={e => { e.stopPropagation(); onPayService(vehicle); }}
            style={{
              background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
              color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer",
              boxShadow: "0 2px 10px rgba(124,58,237,0.22)", whiteSpace: "nowrap",
            }}
          >
            Pay for this →
          </button>
          <span style={{
            color: "#A78BFA", fontSize: 20, display: "inline-block",
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
          }}>▾</span>
        </div>
      </div>

      {expanded && (
        <div style={{ padding: "0 24px 20px" }}>
          {serviceRows.length === 0 ? (
            <div style={{ padding: "20px 0", textAlign: "center" }}>
              <p style={{ color: "#A78BFA", fontSize: 13, marginBottom: 12 }}>
                No services recorded for this vehicle yet.
              </p>
              <button onClick={() => onPayService(vehicle)} style={{
                background: "linear-gradient(135deg,#7C3AED,#A78BFA)",
                color: "#fff", border: "none", borderRadius: 10,
                padding: "9px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}>
                + Request a Service
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: "grid", gridTemplateColumns: "1fr 130px 110px",
                gap: 8, padding: "12px 0 8px",
                borderBottom: "1px solid #F3F0FF",
                fontSize: 11, fontWeight: 700, color: "#A78BFA",
                letterSpacing: 1, textTransform: "uppercase",
              }}>
                <span>Service</span><span>Status</span><span>Amount (₦)</span>
              </div>

              {serviceRows.map((row, i) => (
                <div key={row.id} style={{
                  display: "grid", gridTemplateColumns: "1fr 130px 110px",
                  gap: 8, alignItems: "center", padding: "13px 0",
                  borderBottom: i < serviceRows.length - 1 ? "1px solid #F9F7FF" : "none",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#2D1B6B", fontSize: 14 }}>{row.name}</div>
                    {row.ref && <div style={{ fontSize: 11, color: "#C4B5FD", marginTop: 2 }}>Ref: {row.ref}</div>}
                  </div>
                  <StatusBadge label={row.status} />
                  <span style={{ fontWeight: 700, color: "#1E1040", fontSize: 14 }}>
                    {row.amount != null && Number(row.amount) > 0
                      ? `₦${Number(row.amount).toLocaleString()}` : "—"}
                  </span>
                </div>
              ))}

              <div style={{
                display: "flex", justifyContent: "flex-end", alignItems: "center",
                gap: 12, paddingTop: 14, borderTop: "1.5px solid #F3F0FF", marginTop: 4,
              }}>
                <span style={{ fontSize: 13, color: "#7C7CA0", fontWeight: 600 }}>Grand Total</span>
                <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18, color: "#7C3AED" }}>
                  ₦{grandTotal.toLocaleString()}
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [user,     setUser]     = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [toast,    setToast]    = useState("");
  const [time]                  = useState(new Date());

  useEffect(() => {
    if (params.get("payment") === "success") {
      setToast("🎉 Payment confirmed! Your services are now being processed.");
      window.history.replaceState({}, "", "/dashboard");
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("careal_token") || "";
        if (!token) throw new Error("No token found. Please log in again.");

        const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

        const [profileRes, vehiclesRes, paymentsRes] = await Promise.all([
          fetch(`${API_BASE}/profile`,  { headers }),
          fetch(`${API_BASE}/vehicles`, { headers }),
          fetch(`${API_BASE}/payments`, { headers }),
        ]);

        if (!profileRes.ok)  throw new Error(`Could not load your profile (${profileRes.status})`);
        if (!vehiclesRes.ok) throw new Error(`Could not load your vehicles (${vehiclesRes.status})`);
        if (!paymentsRes.ok) throw new Error(`Could not load your payments (${paymentsRes.status})`);

        const profileData  = await profileRes.json();
        const vehiclesData = await vehiclesRes.json();
        const paymentsData = await paymentsRes.json();

        setUser(profileData.user || null);
        setVehicles(vehiclesData.vehicles || []);
        const rawPayments = Array.isArray(paymentsData) ? paymentsData : paymentsData.payments || [];
        setPayments(rawPayments.map(normalisePmt));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const greeting = () => {
    const h = time.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handlePayService  = (vehicle) => navigate(`/services?plate=${encodeURIComponent(vehicle.plate_number)}`);
  const handleAddVehicle  = ()        => navigate("/add-vehicle");
  const handleLogout      = ()        => { localStorage.removeItem("careal_token"); navigate("/login"); };
  const handleCtaServices = ()        => {
    if (vehicles.length > 0) navigate(`/services?plate=${encodeURIComponent(vehicles[0].plate_number)}`);
    else navigate("/services");
  };

  const pendingCount = payments.filter(p =>
    p.license_status === "Pending" || p.roadworthiness_status === "Pending" || p.insurance_status === "Pending"
  ).length;

  const deliveredCount = payments.filter(p =>
    ["Delivered","Done"].includes(p.license_status) ||
    ["Delivered","Done"].includes(p.roadworthiness_status) ||
    ["Delivered","Done"].includes(p.insurance_status)
  ).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F8F6FF; font-family: 'DM Sans', sans-serif; color: #1E1040; }
        .dash-root { min-height: 100vh; display: flex; flex-direction: column; }
        .nav { background: #fff; border-bottom: 1.5px solid #EDE9FE; padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
        .nav-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 22px; color: #7C3AED; letter-spacing: -0.5px; }
        .nav-logo span { color: #1E1040; }
        .nav-right { display: flex; align-items: center; gap: 14px; }
        .avatar { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg,#7C3AED,#C4B5FD); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 15px; }
        .logout-btn { font-size: 13px; font-weight: 600; color: #7C3AED; background: #F5F3FF; border: none; padding: 6px 14px; border-radius: 8px; cursor: pointer; }
        .logout-btn:hover { background: #EDE9FE; }
        .content { max-width: 900px; margin: 0 auto; padding: 36px 24px 60px; width: 100%; }
        .welcome-banner { background: linear-gradient(120deg,#7C3AED 0%,#9D5CF6 60%,#C4B5FD 100%); border-radius: 22px; padding: 32px 36px; color: #fff; margin-bottom: 32px; position: relative; overflow: hidden; }
        .welcome-banner::after { content: '🚗'; position: absolute; right: 32px; top: 50%; transform: translateY(-50%); font-size: 80px; opacity: 0.15; pointer-events: none; }
        .welcome-greeting { font-size: 14px; font-weight: 500; opacity: 0.82; margin-bottom: 4px; }
        .welcome-name { font-family: 'Syne', sans-serif; font-size: 30px; font-weight: 800; margin-bottom: 6px; }
        .welcome-meta { font-size: 13px; opacity: 0.72; }
        .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 32px; }
        .stat-card { background: #fff; border: 1.5px solid #EDE9FE; border-radius: 16px; padding: 20px 22px; box-shadow: 0 2px 12px rgba(109,40,217,0.05); }
        .stat-label { font-size: 11px; color: #A78BFA; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .stat-value { font-family: 'Syne', sans-serif; font-size: 34px; font-weight: 800; color: #1E1040; line-height: 1; }
        .stat-sub { font-size: 12px; color: #9CA3AF; margin-top: 5px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
        .section-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #1E1040; }
        .add-car-btn { display: inline-flex; align-items: center; gap: 7px; background: #fff; border: 2px dashed #C4B5FD; color: #7C3AED; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: 12px; cursor: pointer; transition: background 0.15s; }
        .add-car-btn:hover { background: #F5F3FF; border-color: #7C3AED; }
        .cta-row { margin-top: 32px; background: #fff; border: 1.5px solid #EDE9FE; border-radius: 18px; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 12px rgba(109,40,217,0.05); gap: 16px; }
        .cta-text h3 { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; color: #1E1040; margin-bottom: 4px; }
        .cta-text p { font-size: 13px; color: #7C7CA0; }
        .cta-btn { background: linear-gradient(135deg,#7C3AED,#A78BFA); color: #fff; border: none; border-radius: 12px; padding: 12px 26px; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; box-shadow: 0 4px 14px rgba(124,58,237,0.25); transition: opacity 0.15s, transform 0.1s; flex-shrink: 0; }
        .cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        .loading-screen { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: #7C3AED; }
        .spinner { width: 40px; height: 40px; border-radius: 50%; border: 3px solid #EDE9FE; border-top-color: #7C3AED; animation: spin 0.8s linear infinite; }
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        .error-box { background: #FEF2F2; border: 1.5px solid #FECACA; border-radius: 14px; padding: 28px; text-align: center; color: #B91C1C; }
        .empty { text-align: center; padding: 48px 24px; background: #fff; border: 1.5px dashed #EDE9FE; border-radius: 18px; }
        .empty-icon { font-size: 48px; margin-bottom: 12px; }
        .empty h3 { font-family: 'Syne', sans-serif; font-size: 17px; color: #1E1040; margin-bottom: 6px; }
        .empty p { font-size: 13px; color: #7C7CA0; margin-bottom: 16px; }
        .toast { position: fixed; top: 80px; left: 50%; transform: translateX(-50%); background: #1E1040; color: #fff; padding: 12px 24px; border-radius: 40px; font-size: 14px; font-weight: 600; box-shadow: 0 8px 32px rgba(124,58,237,0.30); animation: toastIn 0.3s ease; z-index: 999; white-space: nowrap; }
        @media (max-width: 600px) {
          .stats { grid-template-columns: 1fr 1fr; }
          .stats .stat-card:last-child { grid-column: span 2; }
          .welcome-name { font-size: 22px; }
          .cta-row { flex-direction: column; }
          .nav { padding: 0 16px; }
          .content { padding: 20px 14px 48px; }
          .welcome-banner { padding: 22px; }
          .toast { font-size: 12px; padding: 10px 18px; white-space: normal; text-align: center; max-width: 90vw; }
        }
      `}</style>

      {toast && <div className="toast">{toast}</div>}

      <div className="dash-root">
        <nav className="nav">
          <div className="nav-logo">CAR<span>EAL</span></div>
          <div className="nav-right">
            <button className="logout-btn" onClick={handleLogout}>Log out</button>
            <div className="avatar">
              {user ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}` : "?"}
            </div>
          </div>
        </nav>

        <div className="content">
          {loading && (
            <div className="loading-screen">
              <div className="spinner" />
              <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600 }}>Loading your dashboard…</span>
            </div>
          )}

          {!loading && error && (
            <div className="error-box">
              <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
              <strong style={{ fontSize: 16 }}>Could not load dashboard</strong>
              <p style={{ marginTop: 8, fontSize: 14 }}>{error}</p>
              <button onClick={() => navigate("/login")} style={{ marginTop: 16, background: "#7C3AED", color: "#fff", border: "none", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Go to Login
              </button>
            </div>
          )}

          {!loading && !error && user && (
            <>
              <div className="welcome-banner">
                <div className="welcome-greeting">{greeting()},</div>
                <div className="welcome-name">{user.first_name} {user.last_name} 👋</div>
                <div className="welcome-meta">
                  {user.email}
                  {vehicles.length > 0 && (
                    <> &nbsp;&middot;&nbsp; Primary plate: <strong>{vehicles[0].plate_number}</strong></>
                  )}
                </div>
              </div>

              <div className="stats">
                <div className="stat-card">
                  <div className="stat-label">Vehicles</div>
                  <div className="stat-value">{vehicles.length}</div>
                  <div className="stat-sub">Registered</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">In Progress</div>
                  <div className="stat-value" style={{ color: "#F97316" }}>{pendingCount}</div>
                  <div className="stat-sub">Active services</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Completed</div>
                  <div className="stat-value" style={{ color: "#16A34A" }}>{deliveredCount}</div>
                  <div className="stat-sub">Delivered</div>
                </div>
              </div>

              <div className="section-header">
                <div className="section-title">My Vehicles</div>
                <button className="add-car-btn" onClick={handleAddVehicle}>
                  <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Add Vehicle
                </button>
              </div>

              {vehicles.length === 0 ? (
                <div className="empty">
                  <div className="empty-icon">🚗</div>
                  <h3>No vehicles yet</h3>
                  <p>Add your first vehicle to start renewing your documents.</p>
                  <button className="add-car-btn" onClick={handleAddVehicle} style={{ margin: "0 auto" }}>
                    <span style={{ fontSize: 18, lineHeight: 1 }}>＋</span> Add Vehicle
                  </button>
                </div>
              ) : (
                vehicles.map(v => (
                  <VehicleCard key={v.id} vehicle={v} payments={payments} onPayService={handlePayService} />
                ))
              )}

              <div className="cta-row">
                <div className="cta-text">
                  <h3>Ready to renew a document?</h3>
                  <p>Vehicle License · Road Worthiness · Motor Insurance — all in one place.</p>
                </div>
                <button className="cta-btn" onClick={handleCtaServices}>Pay for Service →</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}