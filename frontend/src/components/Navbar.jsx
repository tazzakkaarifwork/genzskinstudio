// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BsNavbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import ProductSearch from './ProductSearch';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount, setCartOpen } = useCart();
  const { wishlistItems, setWishlistOpen } = useWishlist();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get('/categories');
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error('Expected categories array, but got:', data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Navbar error fetching categories:', err);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    logout();
    setDrawerOpen(false);
    navigate('/');
  };

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  const closeDrawer = () => setDrawerOpen(false);

  const cartItemCount = getCartCount();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

        .gz-header {
          position: fixed !important;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 1000;
          transition: all 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        .gz-nav {
          position: relative !important;
          width: 100%;
          padding: 5px 0 !important;
          transition: background 0.45s cubic-bezier(0.16,1,0.3,1),
                      backdrop-filter 0.45s ease,
                      border-color 0.45s ease,
                      box-shadow 0.45s ease,
                      padding 0.35s ease;
        }
        .gz-nav.scrolled {
          background: #000000 !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(255,255,255,0.07) !important;
          box-shadow: 0 4px 30px rgba(0,0,0,0.25) !important;
          padding: 3px 0 !important;
        }
        .gz-nav.top {
          background: #fff !important;
          backdrop-filter: blur(0px) !important;
          border-bottom: 1px solid rgba(0,0,0,0.08) !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.02) !important;
          padding: 5px 0 !important;
        }

        /* Top Bar */
        .gz-top-bar {
          background: #0a0a0a;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 7px 0;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
          height: 32px;
          display: flex;
          align-items: center;
        }
        .gz-top-bar-link {
          color: #ffffff;
          text-decoration: none;
          transition: opacity 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .gz-top-bar-link:hover { opacity: 0.75; }
        .gz-top-bar-link svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          vertical-align: middle;
          transition: transform 0.2s ease;
        }
        .gz-top-bar-link:hover svg { transform: scale(1.12); }
        @media (max-width: 576px) {
          .gz-top-bar { height: 36px; padding: 8px 0; }
          .gz-top-bar-link svg { width: 22px; height: 22px; }
        }
        .gz-header.scrolled .gz-top-bar {
          height: 0px;
          padding: 0;
          opacity: 0;
          overflow: hidden;
          border-bottom: none;
        }

        /* Brand */
        .gz-brand {
          text-decoration: none !important;
          display: flex;
          align-items: center;
        }
        .gz-logo-wrapper {
          display: block;
          overflow: hidden;
          position: relative;
          height: 48px;
          width: 90px;
        }
        .gz-logo {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(1.7);
          height: 100%;
          width: auto;
          object-fit: contain;
          transition: transform 0.3s ease, filter 0.3s ease;
        }
        .gz-nav.scrolled .gz-logo-wrapper {
          height: 42px;
          width: 80px;
        }
        .gz-nav.scrolled .gz-logo {
          filter: invert(1);
          transform: translate(-50%, -50%) scale(1.7);
        }
        @media (min-width: 992px) {
          .gz-logo-wrapper {
            height: 56px;
            width: 105px;
          }
          .gz-logo {
            transform: translate(-50%, -50%) scale(1.9);
          }
          .gz-nav.scrolled .gz-logo-wrapper {
            height: 48px;
            width: 90px;
          }
          .gz-nav.scrolled .gz-logo {
            transform: translate(-50%, -50%) scale(1.9);
          }
        }
        .gz-logo-drawer {
          height: 52px;
          width: auto;
          object-fit: contain;
        }

        /* Nav links - base dark */
        .gz-nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          padding: 8px 14px !important;
          position: relative;
          transition: color 0.4s ease;
          color: rgba(0, 0, 0, 0.75) !important;
        }
@media (max-width: 992px) {
          .gz-drawer-link {
            font-size: 0.92rem;
            letter-spacing: 0.07em;
            padding: 8px 0;
          }
          .gz-drawer-links {
            gap: 12px;
            margin-bottom: 20px;
          }
          .gz-drawer-section-title {
            font-size: 0.72rem;
            margin-bottom: 12px;
          }
          .gz-drawer-cat-item {
            font-size: 0.92rem;
            font-weight: 600;
            padding: 8px 0;
            color: #333;
          }
          .gz-drawer-categories {
            gap: 10px;
          }
        }
        .gz-nav.top .gz-nav-link {
          color: rgba(0, 0, 0, 0.85) !important;
        }
        .gz-nav.scrolled .gz-nav-link {
          color: rgba(255,255,255,0.8) !important;
        }
        /* hover states */
        .gz-nav.top .gz-nav-link:hover {
          color: #6c757d !important;
        }
        .gz-nav.scrolled .gz-nav-link:hover {
          color: #fff !important;
        }
        /* underline effect */
        .gz-nav-link::after {
          content: '';
          position: absolute;
          bottom: 2px;
          left: 14px;
          right: 14px;
          height: 1.5px;
          background: #fff;
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
        }
        .gz-nav.top .gz-nav-link::after {
          background: #6c757d;
        }
        .gz-nav.scrolled .gz-nav-link::after {
          background: #fff;
        }
        .gz-nav-link:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        /* Login button */
        .gz-login-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 7px 20px;
          border-radius: 100px;
          border: 1.5px solid rgba(0,0,0,0.3);
          background: transparent;
          color: #1a1919;
          cursor: pointer;
          text-decoration: none !important;
          transition: all 0.3s ease;
          display: inline-block;
        }
        .gz-nav.top .gz-login-btn {
          border-color: rgba(0,0,0,0.35);
          color: #111;
        }
        .gz-nav.top .gz-login-btn:hover {
          background: #f5f5f5;
          border-color: #6c757d;
          color: #111;
        }
        .gz-nav.scrolled .gz-login-btn {
          border-color: rgba(255,255,255,0.4);
          color: #fff;
        }
        .gz-nav.scrolled .gz-login-btn:hover {
          background: #fff;
          color: #000;
          border-color: #fff;
        }

        /* Account link */
        .gz-account-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(0, 0, 0, 0.7);
          text-decoration: none !important;
          transition: color 0.3s ease;
          padding: 0 4px;
        }
        .gz-nav.top .gz-account-link {
          color: #000;
        }
        .gz-nav.top .gz-account-link:hover {
          color: #6c757d;
        }
        .gz-nav.scrolled .gz-account-link {
          color: rgba(255,255,255,0.7);
        }
        .gz-nav.scrolled .gz-account-link:hover {
          color: #fff;
        }

        /* Cart button */
        .gz-cart-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: 1.5px solid rgba(0,0,0,0.2);
          background: #fff;
          color: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }
        .gz-nav.top .gz-cart-btn {
          border-color: rgba(0,0,0,0.25);
          background: #fff;
          color: #111;
        }
        .gz-nav.top .gz-cart-btn:hover {
          background: #f5f5f5;
          border-color: #6c757d;
          transform: scale(1.06);
        }
        .gz-nav.scrolled .gz-cart-btn {
          border-color: rgba(255,255,255,0.25);
          background: rgba(255,255,255,0.1);
          color: #fff;
        }
        .gz-nav.scrolled .gz-cart-btn:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(120, 113, 113, 0.6);
          transform: scale(1.06);
        }

        /* Logout button */
        .gz-logout-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 7px 20px;
          border-radius: 100px;
          border: none;
          background: #f0f0f0;
          color: #111;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .gz-nav.top .gz-logout-btn {
          background: #f0f0f0;
          color: #111;
        }
        .gz-nav.top .gz-logout-btn:hover {
          background: #e0e0e0;
          color: #111;
        }
        .gz-nav.scrolled .gz-logout-btn {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }
        .gz-nav.scrolled .gz-logout-btn:hover {
          background: rgba(255,255,255,0.25);
        }

        /* Hamburger */
        .gz-hamburger {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 5px;
          z-index: 1010;
        }
        .gz-hamburger span {
          display: block;
          width: 22px;
          height: 1.8px;
          background: #111;
          transition: all 0.35s cubic-bezier(0.16,1,0.3,1);
          border-radius: 2px;
        }
        .gz-nav.scrolled .gz-hamburger span {
          background: #fff;
        }
        .gz-hamburger.open span:nth-child(1) {
          transform: translateY(6.8px) rotate(45deg);
        }
        .gz-hamburger.open span:nth-child(2) {
          opacity: 0;
          transform: translateX(-8px);
        }
        .gz-hamburger.open span:nth-child(3) {
          transform: translateY(-6.8px) rotate(-45deg);
        }

        /* Drawer */
        .gz-drawer-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(6px);
          z-index: 2000;
        }
        .gz-drawer {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 320px;
          max-width: 85vw;
          background: #fff;
          box-shadow: -12px 0 50px rgba(0,0,0,0.15);
          z-index: 2001;
          display: flex;
          flex-direction: column;
          padding: 30px 24px;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .gz-drawer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .gz-drawer-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.05em;
          color: #0f0f0f;
          text-decoration: none !important;
        }
        .gz-drawer-close {
          background: none;
          border: none;
          color: #0f0f0f;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.25s ease;
        }
        .gz-drawer-close:hover { transform: rotate(90deg); }
        .gz-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 28px;
        }
        .gz-drawer-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #0f0f0f;
          text-decoration: none !important;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #f5f5f5;
          transition: color 0.2s ease, padding-left 0.2s ease;
        }
        .gz-drawer-link:hover { color: #555; padding-left: 4px; }
        .gz-drawer-section-title {
          font-size: 0.63rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: #bbb;
          margin-bottom: 14px;
        }
        .gz-drawer-categories {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: auto;
          overflow-y: auto;
          padding-right: 4px;
        }
        .gz-drawer-cat-item {
          font-size: 1rem;
          font-weight: 500;
          color: #555;
          text-decoration: none !important;
          padding: 8px 0;
          transition: color 0.2s ease, padding-left 0.2s ease;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #f5f5f5;
        }
        .gz-drawer-cat-item:hover { color: #0f0f0f; padding-left: 4px; }
        .gz-drawer-footer {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        /* Product search */
        .gz-nav-search {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.12);
          border-radius: 100px;
          padding: 4px 4px 4px 14px;
          min-width: 180px;
          max-width: 240px;
          transition: border-color 0.3s, background 0.3s;
        }
        .gz-nav-search:focus-within {
          border-color: rgba(0,0,0,0.35);
          background: #fff;
        }
        .gz-nav.scrolled .gz-nav-search {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .gz-nav.scrolled .gz-nav-search:focus-within {
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.12);
        }
        .gz-nav-search-icon {
          display: flex;
          color: rgba(0,0,0,0.45);
          flex-shrink: 0;
        }
        .gz-nav.scrolled .gz-nav-search-icon { color: rgba(255,255,255,0.5); }
        .gz-nav-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.78rem;
          color: #111;
          min-width: 0;
          padding: 6px 8px;
        }
        .gz-nav.scrolled .gz-nav-search-input {
          color: #fff;
        }
        .gz-nav.scrolled .gz-nav-search-input::placeholder {
          color: rgba(255,255,255,0.45);
        }
        .gz-nav-search-input::placeholder { color: rgba(0,0,0,0.4); }
        .gz-nav-search-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s, transform 0.2s;
        }
        .gz-nav-search-btn:hover { transform: scale(1.05); }
        .gz-nav.scrolled .gz-nav-search-btn {
          background: #fff;
          color: #111;
        }
        .gz-drawer-search {
          display: flex;
          align-items: center;
          gap: 0;
          background: #f5f5f5;
          border: 1px solid #e8e8e8;
          border-radius: 100px;
          padding: 4px 4px 4px 14px;
          margin-bottom: 24px;
        }
        .gz-drawer-search-icon {
          display: flex;
          color: #888;
          flex-shrink: 0;
        }
        .gz-drawer-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: #111;
          min-width: 0;
          padding: 8px;
        }
        .gz-drawer-search-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* Push body down so content not hidden behind fixed navbar */
        body { padding-top: 98px; }
        @media (max-width: 992px) { body { padding-top: 86px; } }
      `}</style>

      <header className={`gz-header ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="gz-top-bar">
          <Container className="d-flex justify-content-between align-items-center">
            <div className="d-none d-md-flex align-items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span style={{ fontSize: '0.6rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', fontWeight: '700', textTransform: 'uppercase' }}>Premium Skincare · New Generation</span>
            </div>
            <div className="d-flex align-items-center gap-4 gap-sm-3 ms-auto ms-md-0">
              {/* Gmail */}
              <a href="mailto:genz.skinstudio@gmail.com" className="gz-top-bar-link" title="Email us">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                <span className="d-none d-sm-inline">genz.skinstudio@gmail.com</span>
              </a>
              <span className="d-none d-sm-inline" style={{ color: 'rgba(255,255,255,0.12)', fontSize: '1rem' }}>|</span>
              {/* Facebook */}
              <a href="https://www.facebook.com/GenZskinstudioofficial?mibextid=ZbWKwL" target="_blank" rel="noopener noreferrer" className="gz-top-bar-link" title="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="d-none d-sm-inline">Facebook</span>
              </a>
              <span className="d-none d-sm-inline" style={{ color: 'rgba(255,255,255,0.12)', fontSize: '1rem' }}>|</span>
              {/* Instagram */}
              <a href="https://www.instagram.com/genz.skinstudio?igsh=MXg1MnliYWNvY3c0cw==" target="_blank" rel="noopener noreferrer" className="gz-top-bar-link" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                <span className="d-none d-sm-inline">Instagram</span>
              </a>
              <span className="d-none d-sm-inline" style={{ color: 'rgba(255,255,255,0.12)', fontSize: '1rem' }}>|</span>
              {/* TikTok */}
              <a href="https://www.tiktok.com/@genz.skin.studio8?_r=1&_t=ZS-97Yse142Cii" target="_blank" rel="noopener noreferrer" className="gz-top-bar-link" title="TikTok">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
                </svg>
                <span className="d-none d-sm-inline">TikTok</span>
              </a>
            </div>
          </Container>
        </div>
        <BsNavbar className={`gz-nav ${scrolled ? 'scrolled' : 'top'}`}>
          <Container>
            <BsNavbar.Brand as={Link} to="/" className="gz-brand">
              <div className="gz-logo-wrapper">
                <img src="/logo.png" alt="GenZ Studio" className="gz-logo" />
              </div>
            </BsNavbar.Brand>

            {/* Desktop Nav */}
            <Nav className="ms-auto align-items-center gap-1 d-none d-lg-flex">
              <ProductSearch variant="navbar" scrolled={scrolled} placeholder="Search products..." />
              <Nav.Link as={Link} to="/" className="gz-nav-link">Home</Nav.Link>
              <Nav.Link as={Link} to="/products" className="gz-nav-link">Shop All</Nav.Link>
              <Nav.Link as={Link} to="/about" className="gz-nav-link">About Us</Nav.Link>
              <Nav.Link as={Link} to="/faq" className="gz-nav-link">FAQ</Nav.Link>
              <Nav.Link as={Link} to="/track" className="gz-nav-link">Track</Nav.Link>

              <div className="d-flex align-items-center ms-3 gap-3">
                {user ? (
                  <>
                    <Link to={user.role === 'admin' ? '/admin' : '/my-orders'} className="gz-account-link">
                      Account
                    </Link>
                    <button className="gz-logout-btn" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <Link to="/login" className="gz-login-btn">Login</Link>
                )}

                <button onClick={() => setWishlistOpen(true)} className="gz-cart-btn me-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  {wishlistItems.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.58rem' }}>
                      {wishlistItems.length}
                    </span>
                  )}
                </button>

                <button onClick={() => setCartOpen(true)} className="gz-cart-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  {cartItemCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.58rem' }}>
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </Nav>

            {/* Mobile Right Bar */}
            <div className="d-flex align-items-center gap-2 d-lg-none ms-auto">
              <button onClick={() => setWishlistOpen(true)} className="gz-cart-btn" style={{ width: '36px', height: '36px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {wishlistItems.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem', padding: '0.25em 0.4em' }}>
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button onClick={() => setCartOpen(true)} className="gz-cart-btn" style={{ width: '36px', height: '36px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {cartItemCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.55rem', padding: '0.25em 0.4em' }}>
                    {cartItemCount}
                  </span>
                )}
              </button>
              <button className={`gz-hamburger ${drawerOpen ? 'open' : ''}`} onClick={toggleDrawer} aria-label="Toggle navigation">
                <span /><span /><span />
              </button>
            </div>
          </Container>
        </BsNavbar>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              className="gz-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.div
              className="gz-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            >
              <div className="gz-drawer-header">
                <Link to="/" className="gz-drawer-brand d-flex align-items-center" onClick={closeDrawer}>
                  <img src="/logo.png" alt="GenZ Studio" className="gz-logo-drawer" />
                </Link>
                <button className="gz-drawer-close" onClick={closeDrawer}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <ProductSearch
                variant="drawer"
                placeholder="Search products..."
                onSearch={(q) => {
                  closeDrawer();
                  if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
                  else navigate('/products');
                }}
              />

              <div className="gz-drawer-links">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/products', label: 'Shop All' },
                  { to: '/about', label: 'About Us' },
                  { to: '/faq', label: 'FAQ' },
                  { to: '/track', label: 'Track Order' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className="gz-drawer-link" onClick={closeDrawer}>
                    {label}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </Link>
                ))}
                <a href="#" className="gz-drawer-link" onClick={(e) => { e.preventDefault(); closeDrawer(); setCartOpen(true); }}>
                  Cart ({cartItemCount})
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </a>
              </div>

              <div className="gz-drawer-section-title">Categories</div>
              <div className="gz-drawer-categories">
                <Link to="/products" className="gz-drawer-cat-item" onClick={closeDrawer}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px', opacity: 0.6 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  All Products
                </Link>
                {categories.map((cat) => (
                  <Link key={cat._id} to={`/products?category=${cat._id}`} className="gz-drawer-cat-item" onClick={closeDrawer}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '10px', opacity: 0.6 }}><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                    {cat.name}
                  </Link>
                ))}
              </div>

              <div className="gz-drawer-footer">
                {user ? (
                  <>
                    <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: '2px' }}>
                      Logged in as <strong>{user.firstName || user.email}</strong>
                    </div>
                    <Link to={user.role === 'admin' ? '/admin' : '/my-orders'} className="btn btn-outline-dark btn-sm rounded-pill py-2 w-100 text-uppercase fw-bold" style={{ fontSize: '0.73rem', letterSpacing: '0.1em' }} onClick={closeDrawer}>
                      Account Panel
                    </Link>
                    <button className="btn btn-dark btn-sm rounded-pill py-2 w-100 text-uppercase fw-bold" style={{ fontSize: '0.73rem', letterSpacing: '0.1em' }} onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="btn btn-dark btn-sm rounded-pill py-2 w-100 text-uppercase fw-bold" style={{ fontSize: '0.73rem', letterSpacing: '0.1em' }} onClick={closeDrawer}>
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;