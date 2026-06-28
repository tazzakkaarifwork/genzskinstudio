// src/pages/TrackOrder.jsx
import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Footer from "../components/Footer";

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const queryId = searchParams.get('orderId');

  // Auto-fetch if orderId query param exists
  useEffect(() => {
    if (queryId && queryId.trim()) {
      setOrderId(queryId.trim());
      fetchOrder(queryId.trim());
    }
  }, [queryId]);

  const fetchOrder = async (id) => {
    if (!id) return;
    setError('');
    setLoading(true);
    setOrder(null);
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error('Track error:', err);
      const message = err.response?.data?.message || err.message;
      setError(`Order not found: ${message}. Please check your Order ID.`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    await fetchOrder(orderId.trim());
  };

  const getStatusInfo = (status) => {
    const steps = {
      pending:    { label: 'Order Placed', progress: 25, step: 1 },
      dispatched: { label: 'Dispatched',   progress: 75, step: 2 },
      delivered:  { label: 'Delivered',    progress: 100, step: 3 },
    };
    return steps[status] || steps.pending;
  };

  const statusStep = order ? getStatusInfo(order.status).step : 0;

  return (
    <>
      <Helmet><title>Track Order | GenZ Skin Studio</title></Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital@1&display=swap');

        :root {
          --ink: #0f0f0f;
          --ink-soft: #555;
          --ink-faint: #aaa;
          --rule: #e8e8e8;
          --surface: #f7f7f5;
          --white: #ffffff;
        }

        .to-page {
          background: var(--white);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .to-hero {
          position: relative;
          padding: 72px 0 56px;
          text-align: center;
          border-bottom: 1px solid var(--rule);
          overflow: hidden;
        }
        .to-ghost {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(6rem, 16vw, 14rem);
          letter-spacing: 0.08em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,0,0,0.05);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          z-index: 0;
          animation: fadeIn 0.8s ease both;
        }
        .to-hero-inner { position: relative; z-index: 1; }

        .to-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
          margin-bottom: 22px;
          animation: fadeUp 0.5s ease both;
        }
        .to-eyebrow::before, .to-eyebrow::after {
          content: '';
          display: block;
          width: 28px; height: 1px;
          background: var(--rule);
        }

        .to-heading { margin: 0 0 20px; line-height: 0.95; animation: fadeUp 0.5s 0.07s ease both; }
        .to-heading-serif {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(1.4rem, 3.5vw, 2.4rem);
          color: var(--ink-soft);
          letter-spacing: 0.01em;
          margin-bottom: 4px;
        }
        .to-heading-block {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          letter-spacing: 0.03em;
          color: var(--ink);
          line-height: 1;
        }
        .to-heading-block .stroke {
          -webkit-text-stroke: 2px var(--ink);
          color: transparent;
        }

        .to-rule-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 18px;
          animation: fadeUp 0.5s 0.12s ease both;
        }
        .to-rule-group span { width: 40px; height: 1px; background: var(--ink); display: block; }
        .to-rule-group em {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: var(--ink-faint);
          letter-spacing: 0.1em;
        }

        .to-subtitle {
          font-size: 0.88rem;
          color: var(--ink-soft);
          max-width: 360px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 300;
          animation: fadeUp 0.5s 0.17s ease both;
        }

        /* ── HOW IT WORKS STRIP ── */
        .to-how {
          display: flex;
          justify-content: center;
          border-bottom: 1px solid var(--rule);
          background: var(--surface);
        }
        .to-how-step {
          flex: 1;
          max-width: 220px;
          min-width: 120px;
          text-align: center;
          padding: 20px 16px;
          border-right: 1px solid var(--rule);
          transition: background 0.2s;
        }
        .to-how-step:last-child { border-right: none; }
        .to-how-step:hover { background: var(--white); }
        .to-how-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.04em;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 4px;
        }
        .to-how-lbl {
          font-size: 0.64rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
        }

        /* ── BODY ── */
        .to-body { padding: 52px 0 72px; }

        /* form card */
        .to-form-card {
          background: var(--surface);
          border: 1px solid var(--rule);
          border-radius: 20px;
          padding: 36px 32px;
          max-width: 560px;
          margin: 0 auto 24px;
          transition: box-shadow 0.2s;
          animation: fadeUp 0.5s 0.1s ease both;
        }
        .to-form-card:focus-within {
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
          background: var(--white);
        }

        .to-input-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 10px;
        }

        .to-input {
          width: 100%;
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 40px;
          padding: 0 20px;
          height: 48px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
        .to-input::placeholder { color: #ccc; }
        .to-input:focus {
          border-color: var(--ink);
          box-shadow: 0 0 0 2px rgba(15,15,15,0.07);
        }

        .to-submit-btn {
          width: 100%;
          margin-top: 14px;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 40px;
          height: 48px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }
        .to-submit-btn:hover:not(:disabled) { background: #2d3748; transform: translateY(-1px); }
        .to-submit-btn:active { transform: translateY(0); }
        .to-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* error */
        .to-error {
          max-width: 560px;
          margin: 0 auto 20px;
          background: #fff5f5;
          border: 1px solid #fed7d7;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 0.84rem;
          color: #c53030;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: fadeUp 0.3s ease both;
        }

        /* result card */
        .to-result {
          max-width: 560px;
          margin: 0 auto;
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 20px;
          overflow: hidden;
          animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        }

        .to-result-header {
          background: var(--ink);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .to-result-header-label {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 4px;
        }
        .to-result-id {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.08em;
          color: #fff;
        }
        .to-status-badge {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
        }

        /* stepper */
        .to-tracker {
          padding: 28px 28px 24px;
          border-bottom: 1px solid var(--rule);
        }
        .to-tracker-lbl {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 700;
          margin-bottom: 20px;
        }
        .to-steps {
          display: flex;
          align-items: flex-start;
          position: relative;
        }
        .to-steps-track {
          position: absolute;
          top: 17px; left: 18px; right: 18px;
          height: 2px;
          background: var(--rule);
          z-index: 0;
        }
        .to-steps-fill {
          height: 100%;
          background: var(--ink);
          transition: width 0.6s ease;
        }
        .to-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .to-step-dot {
          width: 34px; height: 34px;
          border-radius: 50%;
          border: 2px solid var(--rule);
          background: var(--white);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          transition: all 0.3s ease;
        }
        .to-step-dot.done { background: var(--ink); border-color: var(--ink); }
        .to-step-dot svg { color: #fff; }
        .to-step-dot:not(.done) svg { color: #ccc; }
        .to-step-lbl {
          font-size: 0.66rem;
          font-weight: 600;
          color: #bbb;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          text-align: center;
          line-height: 1.3;
        }
        .to-step-lbl.done { color: var(--ink); }

        /* info cards */
        .to-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 24px 28px 28px;
        }
        .to-info-card {
          background: var(--surface);
          border: 1px solid var(--rule);
          border-radius: 12px;
          padding: 14px 16px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .to-info-card:hover { border-color: #d0d0d0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .to-info-card.span-full { grid-column: 1/-1; }
        .to-info-card-lbl {
          font-size: 9px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink);
          font-weight: 700;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .to-info-card p {
          font-size: 0.82rem;
          color: var(--ink-soft);
          margin: 0;
          line-height: 1.5;
          font-weight: 400;
        }

        /* continue shopping button */
        .to-continue-btn {
          display: block;
          width: fit-content;
          margin: 32px auto 0;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 40px;
          padding: 10px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          cursor: pointer;
        }
        .to-continue-btn:hover {
          background: #2d3748;
          transform: translateY(-1px);
          color: #fff;
        }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }

        /* ── LOADER ── */
        .genz-loader { display: flex; gap: 5px; }
        .genz-loader span {
          width: 5px; height: 5px;
          background: #fff;
          border-radius: 50%;
          animation: ldot 0.8s infinite ease-in-out;
        }
        .genz-loader span:nth-child(2) { animation-delay: 0.15s; }
        .genz-loader span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes ldot {
          0%,80%,100% { transform:scale(0.6); opacity:0.4; }
          40% { transform:scale(1); opacity:1; }
        }

        @media (max-width: 480px) {
          .to-form-card { padding: 24px 18px; }
          .to-info-grid { grid-template-columns: 1fr; padding: 20px; }
          .to-result-header { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>

      <div className="to-page">
        {/* HERO */}
        <div className="to-hero">
          <div className="to-ghost">TRACK</div>
          <div className="to-hero-inner">
            <div className="to-eyebrow">Order Management</div>
            <h1 className="to-heading">
              <span className="to-heading-serif">follow your</span>
              <span className="to-heading-block">TRACK <span className="stroke">ORDER</span></span>
            </h1>
            <div className="to-rule-group">
              <span /><em>real-time · accurate · instant</em><span />
            </div>
            <p className="to-subtitle">
              Enter your order ID below to get real‑time updates on your package's journey to you.
            </p>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div className="to-how">
          {[
            { num: '01', lbl: 'Enter Order ID' },
            { num: '02', lbl: 'View Status'    },
            { num: '03', lbl: 'Track Delivery' },
          ].map((s, i) => (
            <div className="to-how-step" key={i}>
              <div className="to-how-num">{s.num}</div>
              <div className="to-how-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        <div className="to-body">
          <Container>
            {/* FORM */}
            <div className="to-form-card">
              <div className="to-input-label">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                Order ID
              </div>
              <input
                className="to-input"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="e.g. 664abc123def456789"
                onKeyDown={(e) => e.key === 'Enter' && !loading && orderId.trim() && handleSubmit(e)}
              />
              <button
                className="to-submit-btn"
                onClick={handleSubmit}
                disabled={loading || !orderId.trim()}
              >
                {loading ? (
                  <div className="genz-loader"><span /><span /><span /></div>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Track My Order
                  </>
                )}
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="to-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* RESULT */}
            {order && (
              <>
                <div className="to-result">
                  <div className="to-result-header">
                    <div>
                      <div className="to-result-header-label">Order ID</div>
                      <div className="to-result-id">#{order._id.slice(-10).toUpperCase()}</div>
                    </div>
                    <div className="to-status-badge">{order.status}</div>
                  </div>

                  <div className="to-tracker">
                    <div className="to-tracker-lbl">Delivery Progress</div>
                    <div className="to-steps">
                      <div className="to-steps-track">
                        <div className="to-steps-fill" style={{ width: statusStep === 1 ? '0%' : statusStep === 2 ? '50%' : '100%' }} />
                      </div>

                      {/* Step 1 */}
                      <div className="to-step">
                        <div className={`to-step-dot ${statusStep >= 1 ? 'done' : ''}`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </div>
                        <span className={`to-step-lbl ${statusStep >= 1 ? 'done' : ''}`}>Order{'\n'}Placed</span>
                      </div>

                      {/* Step 2 */}
                      <div className="to-step">
                        <div className={`to-step-dot ${statusStep >= 2 ? 'done' : ''}`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="1" y="3" width="15" height="13" rx="1"/>
                            <path d="M16 8h4l3 5v3h-7V8z"/>
                            <circle cx="5.5" cy="18.5" r="2.5"/>
                            <circle cx="18.5" cy="18.5" r="2.5"/>
                          </svg>
                        </div>
                        <span className={`to-step-lbl ${statusStep >= 2 ? 'done' : ''}`}>Dispatched</span>
                      </div>

                      {/* Step 3 */}
                      <div className="to-step">
                        <div className={`to-step-dot ${statusStep >= 3 ? 'done' : ''}`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            <polyline points="9 22 9 12 15 12 15 22"/>
                          </svg>
                        </div>
                        <span className={`to-step-lbl ${statusStep >= 3 ? 'done' : ''}`}>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <div className="to-info-grid">
                    <div className="to-info-card">
                      <div className="to-info-card-lbl">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        Total Amount
                      </div>
                      <p>PKR {order.totalPrice.toLocaleString()}</p>
                    </div>
                    <div className="to-info-card">
                      <div className="to-info-card-lbl">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13.18a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 2.98 2.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/>
                        </svg>
                        Phone
                      </div>
                      <p>{order.shippingDetails?.phone}</p>
                    </div>
                    <div className="to-info-card span-full">
                      <div className="to-info-card-lbl">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                        Shipping Address
                      </div>
                      <p>{order.shippingDetails?.address}, {order.shippingDetails?.city}</p>
                    </div>
                  </div>
                </div>

                {/* ✅ Continue Shopping Button */}
                <div className="text-center mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/')}
                    className="px-5 py-2 rounded-pill"
                  >
                    ← Continue Shopping
                  </Button>
                </div>
              </>
            )}

            {/* If no order and no error, still show a continue button? Optional but nice */}
            {!order && !error && !loading && (
              <div className="text-center mt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => navigate('/')}
                  className="px-5 py-2 rounded-pill"
                >
                  ← Back to Home
                </Button>
              </div>
            )}
          </Container>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default TrackOrder;