import React from 'react';
import { Offcanvas, Image } from 'react-bootstrap';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const SideCart = () => {
  const { cartItems, cartOpen, setCartOpen, removeFromCart, updateQuantity, getCartTotal, getProductPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  const totalItems = cartItems.reduce((a, b) => a + b.quantity, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital@1&display=swap');

        /* ── offcanvas shell ── */
        .sc-offcanvas {
          width: 400px !important;
          max-width: 100vw !important;
          border-left: 1px solid #e8e8e8 !important;
          font-family: 'DM Sans', sans-serif !important;
        }
        .sc-offcanvas .offcanvas-header,
        .sc-offcanvas .offcanvas-body {
          padding: 0 !important;
          background: #ffffff !important;
        }
        .sc-offcanvas .btn-close {
          display: none !important;
        }

        /* ── header ── */
        .sc-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid #e8e8e8;
          background: #f7f7f5;
        }
        .sc-header-left {}
        .sc-header-eyebrow {
          font-size: 0.64rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #aaa;
          font-weight: 600;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sc-header-eyebrow::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: #ddd;
        }
        .sc-header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.06em;
          color: #0f0f0f;
          line-height: 1;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .sc-header-title .stroke {
          -webkit-text-stroke: 1.5px #0f0f0f;
          color: transparent;
        }
        .sc-header-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #aaa;
          margin-left: 2px;
        }
        .sc-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid #e8e8e8;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          color: #555;
          flex-shrink: 0;
        }
        .sc-close-btn:hover {
          background: #0f0f0f;
          border-color: #0f0f0f;
          color: #fff;
        }

        /* ── body / scroll area ── */
        .sc-body {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 97px);
          overflow: hidden;
        }
        .sc-items {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          scrollbar-width: thin;
          scrollbar-color: #e8e8e8 transparent;
        }
        .sc-items::-webkit-scrollbar { width: 3px; }
        .sc-items::-webkit-scrollbar-track { background: transparent; }
        .sc-items::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 2px; }

        /* ── empty state ── */
        .sc-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 24px;
          text-align: center;
        }
        .sc-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #f7f7f5;
          border: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          color: #ccc;
        }
        .sc-empty-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.3rem;
          letter-spacing: 0.08em;
          color: #0f0f0f;
          margin-bottom: 6px;
        }
        .sc-empty-sub {
          font-size: 0.72rem;
          color: #aaa;
          font-weight: 300;
          line-height: 1.6;
        }

        /* ── cart item ── */
        .sc-item {
          display: flex;
          gap: 14px;
          padding: 18px 24px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s;
          align-items: flex-start;
        }
        .sc-item:hover { background: #fafafa; }

        .sc-item-img {
          width: 68px;
          height: 68px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #e8e8e8;
          flex-shrink: 0;
          display: block;
        }

        .sc-item-info { flex: 1; min-width: 0; }

        .sc-item-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #0f0f0f;
          letter-spacing: 0.01em;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sc-item-price {
          font-size: 0.76rem;
          color: #888;
          font-weight: 400;
          margin-bottom: 10px;
          letter-spacing: 0.04em;
        }
        .sc-item-price strong {
          color: #0f0f0f;
          font-weight: 600;
        }

        .sc-item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sc-qty-wrap {
          display: flex;
          align-items: center;
          background: #f7f7f5;
          border: 1px solid #e8e8e8;
          border-radius: 30px;
          overflow: hidden;
        }
        .sc-qty-btn {
          width: 30px;
          height: 30px;
          background: transparent;
          border: none;
          font-size: 1rem;
          color: #888;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }
        .sc-qty-btn:hover { background: #ebebeb; color: #0f0f0f; }
        .sc-qty-num {
          min-width: 28px;
          text-align: center;
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f0f0f;
          border-left: 1px solid #e8e8e8;
          border-right: 1px solid #e8e8e8;
          height: 30px;
          line-height: 30px;
        }
        .sc-remove-btn {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #e8e8e8;
          background: transparent;
          color: #ccc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.18s ease;
          margin-left: 4px;
          flex-shrink: 0;
        }
        .sc-remove-btn:hover {
          background: #fff0f0;
          border-color: #fca5a5;
          color: #dc2626;
        }

        /* ── footer ── */
        .sc-footer {
          border-top: 1px solid #e8e8e8;
          padding: 20px 24px 24px;
          background: #fff;
        }

        .sc-subtotal-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .sc-subtotal-label {
          font-size: 0.65rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #aaa;
          font-weight: 600;
        }
        .sc-subtotal-amt {
          font-size: 0.84rem;
          color: #555;
          font-weight: 400;
        }
        .sc-total-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
          padding-top: 10px;
          border-top: 1px solid #e8e8e8;
        }
        .sc-total-label {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.14em;
          color: #0f0f0f;
        }
        .sc-total-amt {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.04em;
          color: #0f0f0f;
          line-height: 1;
        }
        .sc-total-currency {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          color: #aaa;
          letter-spacing: 0.1em;
          margin-right: 4px;
          font-weight: 400;
        }

        .sc-checkout-btn {
          width: 100%;
          background: #0f0f0f;
          color: #fff;
          border: none;
          border-radius: 30px;
          height: 46px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .sc-checkout-btn:hover {
          background: #333333;
          transform: scale(1.02);
        }
        .sc-checkout-btn:active { transform: scale(1.01); }

        .sc-continue-btn {
          width: 100%;
          background: transparent;
          color: #aaa;
          border: none;
          border-radius: 40px;
          height: 38px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: color 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
        }
        .sc-continue-btn:hover { color: #0f0f0f; }

        /* ── trust row ── */
        .sc-trust {
          display: flex;
          justify-content: center;
          gap: 16px;
          padding: 10px 24px 0;
          flex-wrap: wrap;
        }
        .sc-trust-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.58rem;
          color: #bbb;
          letter-spacing: 0.06em;
          font-weight: 400;
        }
        .sc-trust-item svg { color: #0f0f0f; flex-shrink: 0; }

        @media (max-width: 420px) {
          .sc-offcanvas { width: 100vw !important; }
        }
      `}</style>

      <Offcanvas
        show={cartOpen}
        onHide={() => setCartOpen(false)}
        placement="end"
        className="sc-offcanvas"
      >
        <Offcanvas.Header>
          {/* custom header — replaces Bootstrap's */}
          <div className="sc-header" style={{ width: '100%', alignItems: 'center', padding: '16px 20px' }}>
            <div className="sc-header-left d-flex align-items-center gap-2">
              <img src="/logo.png" alt="GENZSTUDIO" style={{ height: '34px', width: 'auto', display: 'block' }} />
              <div className="sc-header-title m-0">
                MY <span className="stroke">CART</span>
                <span className="sc-header-count">
                  ({totalItems})
                </span>
              </div>
            </div>
            <button className="sc-close-btn" onClick={() => setCartOpen(false)} aria-label="Close cart">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className="sc-body">

            {/* ── ITEMS ── */}
            <div className="sc-items">
              {cartItems.length === 0 ? (
                <div className="sc-empty">
                  <div className="sc-empty-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                  </div>
                  <div className="sc-empty-title">Cart is Empty</div>
                  <p className="sc-empty-sub">
                    You haven't added anything yet.<br />Explore our collection and find something you'll love.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  // ✅ FIX: Handle Cloudinary URLs (http) directly, local paths need base URL
                  const rawImage = item.product?.image || item.product?.images?.[0] || '';
                  let imgSrc = rawImage.startsWith('http') ? rawImage : (rawImage ? `${rawImage.startsWith('/') ? '' : '/'}${rawImage}` : 'https://via.placeholder.com/100x100?text=No+Image');
                  if (imgSrc && !imgSrc.startsWith('http') && typeof window !== 'undefined' && 
                      (window.location.hostname.includes('genzskinstudio.com') || window.location.hostname.includes('www.genzskinstudio.com'))) {
                    imgSrc = `https://genzskinstudio.vercel.app${imgSrc}`;
                  }
                  const itemPrice = getProductPrice(item.product);
                  return (
                  <div className="sc-item" key={item.product?._id || Math.random()}>
                    <img
                      src={imgSrc}
                      className="sc-item-img"
                      alt={item.product?.name || 'Product'}
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                    />
                    <div className="sc-item-info">
                      <div className="sc-item-name">{item.product?.name || 'Product'}</div>
                      <div className="sc-item-price">
                        PKR <strong>{(itemPrice * item.quantity).toLocaleString()}</strong>
                        {item.quantity > 1 && (
                          <span style={{ marginLeft: 6, fontSize: '0.62rem', color: '#bbb' }}>
                            ({itemPrice.toLocaleString()} × {item.quantity})
                          </span>
                        )}
                      </div>
                      <div className="sc-item-controls">
                        <div className="sc-qty-wrap">
                          <button
                            className="sc-qty-btn"
                            onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                            aria-label="Decrease"
                          >−</button>
                          <span className="sc-qty-num">{item.quantity}</span>
                          <button
                            className="sc-qty-btn"
                            onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                            aria-label="Increase"
                          >+</button>
                        </div>
                        <button
                          className="sc-remove-btn"
                          onClick={() => removeFromCart(item.product._id)}
                          aria-label="Remove item"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/>
                            <path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* ── FOOTER ── */}
            {cartItems.length > 0 && (
              <div className="sc-footer">
                <div className="sc-subtotal-row">
                  <span className="sc-subtotal-label">Subtotal</span>
                  <span className="sc-subtotal-amt">PKR {getCartTotal().toLocaleString()}</span>
                </div>
                <div className="sc-subtotal-row" style={{ marginBottom: 0 }}>
                  <span className="sc-subtotal-label">Shipping</span>
                  <span className="sc-subtotal-amt" style={{ color: '#22c55e', fontWeight: 500, fontSize: '0.75rem' }}>Calculated at checkout</span>
                </div>

                <div className="sc-total-row">
                  <span className="sc-total-label">Total</span>
                  <span className="sc-total-amt">
                    <span className="sc-total-currency">PKR</span>
                    {getCartTotal().toLocaleString()}
                  </span>
                </div>

                <button className="sc-checkout-btn" onClick={handleCheckout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 5v3h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                  Proceed to Checkout
                </button>

                <button className="sc-continue-btn" onClick={() => setCartOpen(false)}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  Continue Shopping
                </button>

                <div className="sc-trust">
                  <div className="sc-trust-item">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    Secure Checkout
                  </div>
                  <div className="sc-trust-item">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Free Returns
                  </div>
                  <div className="sc-trust-item">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Fast Delivery
                  </div>
                </div>
              </div>
            )}

          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SideCart;
