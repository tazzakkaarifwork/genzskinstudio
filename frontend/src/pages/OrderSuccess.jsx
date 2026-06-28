import React, { useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { motion } from 'framer-motion';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const order = location.state?.order;
  const printRef = useRef();
  const handledOrderRef = useRef(false);

  useEffect(() => {
    if (handledOrderRef.current) return;
    handledOrderRef.current = true;
    window.scrollTo(0, 0);
    if (order) clearCart();
  }, []);

  // Invoice Printing Handler
  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=430,height=760,scrollbars=yes,resizable=yes');

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice #${order?._id || 'Order'}</title>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');
            body { 
              padding: 16px; 
              font-family: 'DM Sans', sans-serif; 
              color: #0f0f0f; 
              background: #fff;
            }
            .container {
              max-width: 430px;
              margin: 0 auto;
            }
            .os-invoice-card {
              border: 1px dashed #bbb;
              border-radius: 18px;
              padding: 18px;
              max-width: 430px;
              margin: 0 auto;
              background: #fcfcfb;
            }
            .os-inv-header {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              flex-wrap: wrap;
              border-bottom: 2px solid #0f0f0f;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .os-inv-brand {
              font-family: 'Bebas Neue', sans-serif;
              font-size: 1.8rem;
              letter-spacing: 0.05em;
            }
            .os-inv-num {
              font-size: 0.85rem;
              color: #666;
              font-weight: 500;
              align-self: center;
            }
            .os-details-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 16px;
              margin-bottom: 30px;
              font-size: 0.9rem;
            }
            .os-details-col p { margin: 0 0 8px 0; line-height: 1.5; color: #444; }
            .os-details-col b { color: #0f0f0f; font-weight: 600; }
            .os-details-title {
              font-size: 0.75rem;
              text-transform: uppercase;
              letter-spacing: 0.12em;
              color: #888;
              font-weight: 700;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 4px;
            }
            .os-table {
              width: 100%;
              table-layout: fixed;
              border-collapse: collapse;
              font-size: 0.9rem;
              margin-top: 14px;
              margin-bottom: 24px;
            }
            .os-table th {
              border-bottom: 2px solid #0f0f0f;
              padding-bottom: 10px;
              color: #0f0f0f;
              font-weight: 700;
              text-transform: uppercase;
              font-size: 0.75rem;
              letter-spacing: 0.08em;
            }
            .os-table td {
              padding: 12px 0;
              border-bottom: 1px solid #eee;
              color: #333;
              word-break: break-word;
            }
            .os-total-wrap {
              border-top: 2px solid #0f0f0f;
              padding-top: 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 20px;
            }
            .os-total-lbl {
              font-family: 'Bebas Neue', sans-serif;
              font-size: 1.3rem;
              letter-spacing: 0.08em;
            }
            .os-total-val {
              font-family: 'Bebas Neue', sans-serif;
              font-size: 1.6rem;
              letter-spacing: 0.02em;
              color: #0f0f0f;
            }
            @media print { 
              body { padding: 0; }
              .os-invoice-card { border: none; padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="container">${printContent}</div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          <\/script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleTrackOrder = () => {
    if (order?._id) {
      window.scrollTo(0, 0);
      navigate(`/track?orderId=${order._id}`);
    }
  };

  const hasOrderDetails = !!order;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,400;1,600&display=swap');

        .os-wrapper {
          min-height: 100dvh;
          background: #f7f7f5;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0f;
          padding: 60px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          overflow-x: hidden;
        }
        .os-wrapper * { box-sizing: border-box; }

        .os-container {
          background: #ffffff;
          border: 1px solid #e8e8e8;
          border-radius: 28px;
          padding: 50px 40px;
          max-width: 680px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.03);
          text-align: center;
        }

        /* SVG Checkmark Animation */
        .checkmark {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #d4af37;
          stroke-miterlimit: 10;
          margin: 0 auto 24px;
          box-shadow: inset 0px 0px 0px rgba(212, 175, 55, 0.1);
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s forwards;
        }
        .checkmark__circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #d4af37;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark__check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
        }

        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 40px rgba(212, 175, 55, 0.05); } }

        .os-eyebrow {
          font-size: 0.75rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #aaa;
          font-weight: 700;
          margin-bottom: 12px;
        }
        .os-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 6vw, 3.8rem);
          letter-spacing: 0.04em;
          line-height: 1;
          color: #0f0f0f;
          margin-bottom: 8px;
        }
        .os-heading span.serif {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          text-transform: lowercase;
          font-size: 0.8em;
          letter-spacing: 0;
          color: #d4af37;
          font-weight: 400;
        }
        .os-sub {
          font-size: 0.95rem;
          color: #666;
          margin-bottom: 36px;
          font-weight: 300;
        }

        /* Invoice styling */
        .os-invoice-card {
          background: #fcfcfb;
          border: 1px dashed #ddd;
          border-radius: 18px;
          padding: 24px;
          text-align: left;
          margin-bottom: 36px;
        }
        .os-inv-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          border-bottom: 1px solid #eee;
          padding-bottom: 14px;
          margin-bottom: 18px;
        }
        .os-inv-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.25rem;
          letter-spacing: 0.05em;
        }
        .os-inv-num {
          font-size: 0.75rem;
          color: #aaa;
          font-weight: 500;
        }
        .os-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
          font-size: 0.82rem;
        }
        @media (max-width: 480px) { .os-details-grid { grid-template-columns: 1fr; } }
        .os-details-col p { margin: 0 0 6px 0; line-height: 1.4; color: #555; }
        .os-details-col b { color: #0f0f0f; font-weight: 600; }
        .os-details-title {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #aaa;
          font-weight: 700;
          margin-bottom: 8px;
        }

        /* Order Summary Table */
        .os-table {
          width: 100%;
          table-layout: fixed;
          border-collapse: collapse;
          font-size: 0.82rem;
          margin-top: 14px;
        }
        .os-table th {
          border-bottom: 1.5px solid #eee;
          padding-bottom: 8px;
          color: #aaa;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
        }
        .os-table td {
          padding: 10px 0;
          border-bottom: 1px solid #f5f5f5;
          color: #444;
          word-break: break-word;
        }
        .os-table tr:last-child td { border-bottom: none; }
        .os-total-wrap {
          border-top: 1.5px solid #0f0f0f;
          padding-top: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 14px;
        }
        .os-total-lbl {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.08em;
        }
        .os-total-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.02em;
          color: #0f0f0f;
        }

        /* Buttons Tray */
        .os-btn-tray {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-width: 320px;
          margin: 0 auto;
        }
        .os-btn-primary {
          background: #0f0f0f;
          color: #ffffff;
          border: none;
          border-radius: 100px;
          padding: 14px 28px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .os-btn-primary:hover {
          background: #d4af37;
          color: #000;
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.25);
        }
        .os-btn-sec {
          background: #ffffff;
          color: #0f0f0f;
          border: 1.5px solid #0f0f0f;
          border-radius: 100px;
          padding: 13px 28px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .os-btn-sec:hover {
          background: #f7f7f5;
          transform: translateY(-1px);
        }

        @media (max-width: 576px) {
          .os-container { padding: 36px 20px; }
          .os-invoice-card { padding: 16px; }
        }
      `}</style>

      <div className="os-wrapper">
        <motion.div 
          className="os-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Celebrating Animated Checkmark */}
          <div className="success-checkmark">
            <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>

          <span className="os-eyebrow">Thank You</span>
          <h1 className="os-heading">
            ORDER PLACED <span className="serif">successfully!</span>
          </h1>
          
          <p className="os-sub">
            {hasOrderDetails 
              ? `Your order #${order._id.slice(-6).toUpperCase()} has been confirmed. We're on it!`
              : "Your order has been confirmed. Get ready to glow!"
            }
          </p>

          {/* Invoice Summary Details Box */}
          {hasOrderDetails && (
            <div className="os-invoice-card" ref={printRef}>
              <div className="os-inv-header">
                <span className="os-inv-brand">GENZ SKIN STUDIO</span>
                <span className="os-inv-num">Order ID: #{order._id}</span>
              </div>
              
              <div className="os-details-grid">
                <div className="os-details-col">
                  <div className="os-details-title">Shipping To</div>
                  <p><b>Name:</b> {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</p>
                  <p><b>Phone:</b> {order.shippingDetails?.phone}</p>
                  <p><b>Address:</b> {order.shippingDetails?.address}, {order.shippingDetails?.city}</p>
                </div>
                <div className="os-details-col">
                  <div className="os-details-title">Order Status</div>
                  <p><b>Payment:</b> Cash on Delivery</p>
                  <p><b>Status:</b> {order.status || 'Processing'}</p>
                  <p><b>Date:</b> {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="os-details-title">Items Ordered</div>
              <table className="os-table">
                <thead>
                  <tr>
                    <th align="left">Product</th>
                    <th align="center">Qty</th>
                    <th align="right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {order.orderItems.map((item, idx) => (
                    <tr key={idx}>
                      <td align="left">{item.name}</td>
                      <td align="center">{item.quantity}</td>
                      <td align="right">PKR {item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="os-total-wrap">
                <span className="os-total-lbl">Total Paid</span>
                <span className="os-total-val">PKR {order.totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Fallback Display if no order state exists */}
          {!hasOrderDetails && (
            <div className="os-invoice-card" style={{ textAlign: 'center', padding: '30px 20px' }}>
              <span style={{ display: 'block', marginBottom: '16px' }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.9 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <div className="os-total-lbl" style={{ marginBottom: '6px' }}>Your Glow is on its Way!</div>
              <p style={{ fontSize: '0.82rem', color: '#666', margin: 0 }}>Check your email inbox for order confirmations and tracking information.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="os-btn-tray">
            <button 
              className="os-btn-primary" 
              onClick={() => {
                window.scrollTo(0, 0);
                navigate('/');
              }}
            >
              Continue Shopping
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            
            {hasOrderDetails && (
              <>
                <button className="os-btn-sec" onClick={handleTrackOrder}>
                  Track Order Location
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </button>
                
                
              </>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default OrderSuccess;
