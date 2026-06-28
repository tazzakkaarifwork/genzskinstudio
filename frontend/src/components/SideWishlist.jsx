import React from 'react';
import { Offcanvas, Image } from 'react-bootstrap';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

const SideWishlist = () => {
  const { wishlistItems, wishlistOpen, setWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart, setCartOpen } = useCart();

  const getImageUrl = (product) => {
    const raw = product.image || product.images?.[0];
    if (!raw) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (raw.startsWith('http')) return raw;
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    if (typeof window !== 'undefined' && 
        (window.location.hostname.includes('genzskinstudio.com') || window.location.hostname.includes('www.genzskinstudio.com'))) {
      return `https://genzskinstudio.vercel.app${cleanPath}`;
    }
    return cleanPath;
  };

  const handleMoveToCart = (product) => {
    addToCart(product);
    removeFromWishlist(product._id);
    setWishlistOpen(false);
    setCartOpen(true);
  };

  return (
    <>
      <style>{`
        /* ── offcanvas shell ── */
        .sw-offcanvas {
          width: 400px !important;
          max-width: 100vw !important;
          border-left: 1px solid #e8e8e8 !important;
          font-family: 'DM Sans', sans-serif !important;
        }
        .sw-offcanvas .offcanvas-header,
        .sw-offcanvas .offcanvas-body {
          padding: 0 !important;
          background: #ffffff !important;
        }
        .sw-offcanvas .btn-close {
          display: none !important;
        }

        /* ── header ── */
        .sw-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 24px 24px 20px;
          border-bottom: 1px solid #e8e8e8;
          background: #f7f7f5;
        }
        .sw-header-eyebrow {
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
        .sw-header-eyebrow::before {
          content: '';
          display: block;
          width: 20px;
          height: 1px;
          background: #ddd;
        }
        .sw-header-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.06em;
          color: #0f0f0f;
          line-height: 1;
          display: flex;
          align-items: baseline;
          gap: 10px;
        }
        .sw-header-title .stroke {
          -webkit-text-stroke: 1.5px #0f0f0f;
          color: transparent;
        }
        .sw-header-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: #aaa;
          margin-left: 2px;
        }
        .sw-close-btn {
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
        .sw-close-btn:hover {
          background: #0f0f0f;
          border-color: #0f0f0f;
          color: #fff;
        }

        /* ── body ── */
        .sw-body {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 97px);
          overflow: hidden;
        }
        .sw-items {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          scrollbar-width: thin;
          scrollbar-color: #e8e8e8 transparent;
        }
        .sw-items::-webkit-scrollbar { width: 3px; }
        .sw-items::-webkit-scrollbar-thumb { background: #e8e8e8; border-radius: 2px; }

        /* ── empty state ── */
        .sw-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px 24px;
          text-align: center;
        }
        .sw-empty-icon {
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
        .sw-empty-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.08em;
          color: #0f0f0f;
          margin-bottom: 6px;
        }
        .sw-empty-sub {
          font-size: 0.8rem;
          color: #aaa;
          font-weight: 300;
          line-height: 1.6;
        }

        /* ── wishlist item ── */
        .sw-item {
          display: flex;
          gap: 14px;
          padding: 18px 24px;
          border-bottom: 1px solid #f0f0f0;
          transition: background 0.15s;
          align-items: center;
        }
        .sw-item:hover { background: #fafafa; }

        .sw-item-img {
          width: 68px;
          height: 68px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid #e8e8e8;
          flex-shrink: 0;
          display: block;
        }

        .sw-item-info { flex: 1; min-width: 0; }

        .sw-item-name {
          font-size: 0.84rem;
          font-weight: 600;
          color: #0f0f0f;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .sw-item-price {
          font-size: 0.76rem;
          color: #888;
          font-weight: 400;
          margin-bottom: 8px;
        }
        .sw-item-price strong {
          color: #0f0f0f;
          font-weight: 600;
        }

        .sw-item-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .sw-add-btn {
          background: #0f0f0f;
          color: #fff;
          border: none;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .sw-add-btn:hover {
          background: #333;
        }
        .sw-remove-btn {
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
        }
        .sw-remove-btn:hover {
          background: #fff0f0;
          border-color: #fca5a5;
          color: #dc2626;
        }
      `}</style>

      <Offcanvas
        show={wishlistOpen}
        onHide={() => setWishlistOpen(false)}
        placement="end"
        className="sw-offcanvas"
      >
        <Offcanvas.Header>
          <div className="sw-header" style={{ width: '100%' }}>
            <div>
              <div className="sw-header-eyebrow">GENZ Skin Studio</div>
              <div className="sw-header-title">
                MY <span className="stroke">WISHLIST</span>
                <span className="sw-header-count">
                  ({wishlistItems.length})
                </span>
              </div>
            </div>
            <button className="sw-close-btn" onClick={() => setWishlistOpen(false)} aria-label="Close wishlist">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <div className="sw-body">
            <div className="sw-items">
              {wishlistItems.length === 0 ? (
                <div className="sw-empty">
                  <div className="sw-empty-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </div>
                  <div className="sw-empty-title">Wishlist is Empty</div>
                  <p className="sw-empty-sub">
                    You haven't saved any items yet.<br />Tap the heart icon on your favorite items to save them here.
                  </p>
                </div>
              ) : (
                wishlistItems.map((product) => (
                  <div className="sw-item" key={product._id}>
                    <Image
                      src={getImageUrl(product)}
                      className="sw-item-img"
                      alt={product.name}
                    />
                    <div className="sw-item-info">
                      <div className="sw-item-name">{product.name}</div>
                      <div className="sw-item-price">
                        PKR <strong>{product.price.toLocaleString()}</strong>
                      </div>
                      <div className="sw-item-actions">
                        <button
                          className="sw-add-btn"
                          onClick={() => handleMoveToCart(product)}
                        >
                          Add to Cart
                        </button>
                        <button
                          className="sw-remove-btn"
                          onClick={() => removeFromWishlist(product._id)}
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
                ))
              )}
            </div>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default SideWishlist;
