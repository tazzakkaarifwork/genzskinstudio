import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      setStatus({ type: '', message: '' });
      const { data } = await api.post('/newsletter/subscribe', { email });
      setStatus({ type: 'success', message: data.message || 'Subscribed successfully!' });
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'danger',
        message: err.response?.data?.error || 'Failed to subscribe. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .site-footer {
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
        }

        /* ── Subscribe Banner ── */
        .footer-subscribe-banner {
          background: #111111;
          border-radius: 16px;
          padding: 52px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
          flex-wrap: wrap;
        }
        .subscribe-text h2 {
          font-family: 'DM Sans', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          margin-bottom: 12px;
        }
        .subscribe-text p {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.55);
          max-width: 340px;
          line-height: 1.7;
          margin: 0;
        }
        .subscribe-form-wrap {
          flex: 1 1 280px;
          min-width: 0;
          max-width: 100%;
          width: 100%;
        }
        .subscribe-form {
          display: flex;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          width: 100%;
          max-width: 100%;
        }
        .subscribe-form input {
          border: none;
          outline: none;
          padding: 14px 16px;
          font-size: 0.85rem;
          color: #111;
          flex: 1;
          min-width: 0;
          width: 100%;
          font-family: 'DM Sans', sans-serif;
        }
        .subscribe-form input::placeholder { color: rgba(0,0,0,0.4); }
        .subscribe-form button {
          background: #111111;
          color: #ffffff;
          border: none;
          padding: 14px 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: 0.03em;
          transition: background 0.2s;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .subscribe-form button:hover { background: #333; }
        .subscribe-status {
          font-size: 0.8rem;
          font-weight: 500;
          margin: 8px 0 0;
          padding: 0;
          text-align: left;
        }

        /* ── Footer Body ── */
        .footer-body-wrapper {
          padding: 56px 0 0;
        }
        .footer-brand-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: #080808;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }
        .footer-brand-desc {
          font-size: 0.82rem;
          color: rgba(0,0,0,0.6);
          line-height: 1.8;
          max-width: 220px;
          font-weight: 400;
          margin-bottom: 24px;
        }
        .footer-social {
          display: flex;
          gap: 14px;
        }
        .footer-social-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid #111;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #111;
          font-size: 15px;
        }
        .footer-social-btn:hover {
          background: #111;
          color: #fff;
        }
        .footer-social-btn i { font-size: 15px; }

        .footer-col-heading {
          font-size: 11px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #111;
          margin-bottom: 20px;
          font-weight: 700;
        }
        .footer-link-list { list-style: none; padding: 0; margin: 0; }
        .footer-link-list li { margin-bottom: 10px; }
        .footer-link-list a {
          color: rgba(0,0,0,0.55);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 400;
          transition: color 0.2s;
        }
        .footer-link-list a:hover { color: #111; }

        .footer-cta-btn {
          display: inline-block;
          background: #111111;
          color: #ffffff;
          border: none;
          padding: 16px 32px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          border-radius: 8px;
          letter-spacing: 0.02em;
          transition: background 0.2s;
        }
        .footer-cta-btn:hover { background: #333; }

        /* ── Bottom Bar ── */
        .footer-bottom {
          background: #111111;
          margin-top: 56px;
          padding: 22px 0;
          text-align: center;
        }
        .footer-bottom-text {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.7);
          letter-spacing: 0.04em;
        }

        @media (max-width: 768px) {
          .footer-subscribe-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 28px 20px;
            gap: 20px;
            overflow: hidden;
          }
          .subscribe-text h2 {
            font-size: clamp(1.35rem, 6vw, 1.75rem);
            line-height: 1.35;
            letter-spacing: 0.01em;
          }
          .subscribe-text p { font-size: 0.82rem; max-width: 100%; }
          .subscribe-form-wrap { flex: 1 1 auto; width: 100%; }
          .subscribe-form {
            flex-direction: column;
            border-radius: 12px;
          }
          .subscribe-form input {
            padding: 14px 16px;
            text-align: left;
          }
          .subscribe-form button {
            width: 100%;
            padding: 14px 16px;
          }
        }
      `}</style>

      <footer className="site-footer">
        <Container>
          {/* Subscribe Banner */}
          <div className="footer-subscribe-banner">
            <div className="subscribe-text">
              <h2>Subscribe for the daily<br />Updates</h2>
              <p>Stay ahead of the curve with the latest in clean skincare, drops, and tips curated for the new generation.</p>
            </div>
            <form onSubmit={handleSubscribe} className="subscribe-form-wrap">
              <div className="subscribe-form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={loading}>
                  {loading ? '...' : 'Subscribe'}
                </button>
              </div>
              {status.message && (
                <p
                  className="subscribe-status"
                  style={{ color: status.type === 'success' ? '#81c784' : '#e57373' }}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>

          {/* Footer Body */}
          <div className="footer-body-wrapper">
            <Row className="gy-4">
              <Col lg={4} md={6}>
                <div className="footer-brand-name">GENZ SKIN STUDIO</div>
                <p className="footer-brand-desc">
                  Clean skincare curated for the new generation. No compromises on quality, ever.
                </p>
                <div className="footer-social">
                  <a href="https://www.facebook.com/GenZskinstudioofficial?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Facebook"><i className="bi bi-facebook"></i></a>
                  <a href="https://www.instagram.com/genz.skinstudio?igsh=MXg1MnliYWNvY3c0cw==" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href="https://www.tiktok.com/@genz.skin.studio8?_r=1&_t=ZS-97Yse142Cii" target="_blank" rel="noopener noreferrer" className="footer-social-btn" title="TikTok"><i className="bi bi-tiktok"></i></a>
                  <a href="mailto:genz.skinstudio@gmail.com" className="footer-social-btn" title="Email"><i className="bi bi-envelope"></i></a>
                </div>
              </Col>

              <Col md={2} xs={6}>
                <div className="footer-col-heading">About</div>
                <ul className="footer-link-list">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/track">Track Order</Link></li>
                  <li><a href="/#contact-section">Contact</a></li>
                  <li><Link to="/products">Shop All</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                </ul>
              </Col>

              <Col md={2} xs={6}>
                <div className="footer-col-heading">Community</div>
                <ul className="footer-link-list">
                  <li><Link to="/about">Manifesto</Link></li>
                  <li><Link to="/track">Shipping</Link></li>
                  <li><Link to="/return-policy">Returns</Link></li>
                  <li><Link to="/about">Beliefs</Link></li>
                </ul>
              </Col>

              <Col md={2} xs={6}>
                <div className="footer-col-heading">Discover</div>
                <ul className="footer-link-list">
                  <li><Link to="/products">New Drops</Link></li>
                  <li><Link to="/products">Best Sellers</Link></li>
                  <li><Link to="/products">Offers</Link></li>
                  <li><Link to="/track">Order Tracking</Link></li>
                </ul>
              </Col>

              <Col md={2} xs={6}>
                <div className="footer-col-heading">Contact US</div>
                <a href="/#contact-section" className="footer-cta-btn text-decoration-none d-inline-block text-center">Get in touch</a>
              </Col>
            </Row>
          </div>
        </Container>

        {/* Bottom Bar — full width black */}
        <div className="footer-bottom">
          <span className="footer-bottom-text">© Copyright GenZ Skin Studio. All right reserved</span>
        </div>
      </footer>
    </>
  );
};

export default Footer;