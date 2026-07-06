import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductSearch from '../components/ProductSearch';
import api from '../services/api';
import Footer from "../components/Footer";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, searchQuery]);

  const fetchData = async (retryCount = 0) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      const queryString = params.toString() ? `?${params.toString()}` : '';
      const { data } = await api.get(`/products${queryString}`);
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected products array, but got:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      // ✅ Retry up to 3 times for cold start
      if (retryCount < 3) {
        console.warn(`Retrying products fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchData(retryCount + 1), 3000);
        return;
      }
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (q) => {
    const next = {};
    if (selectedCategory) next.category = selectedCategory;
    if (q.trim()) next.search = q.trim();
    setSearchParams(next);
  };

  // Removed full-page loader

  return (
    <>
      <Helmet>
        <title>Shop Skincare Products | GenZ Skin Studio</title>
        <meta name="description" content="Explore GenZ Skin Studio's premium collection of organic skincare products. Shop clean, dermatologist-tested serums, facial kits, and organic creams." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Playfair+Display:ital@1&display=swap');

        :root {
          --ink: #0f0f0f;
          --ink-soft: #555;
          --ink-faint: #aaa;
          --rule: #e8e8e8;
          --surface: #f7f7f5;
          --white: #ffffff;
          --pink-accent: #d4608a;
          --pink-border: #f8d5e3;
          --pink-soft: #fdf5f7;
        }

        .pp-page {
          background: var(--white);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
          overflow-x: hidden;
        }

        /* ── HERO ── */
        .pp-hero {
          position: relative;
          padding: 32px 0 24px;
          text-align: center;
          border-bottom: 1px solid var(--rule);
          overflow: hidden;
        }
        .pp-ghost {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(7rem, 18vw, 16rem);
          letter-spacing: 0.08em;
          color: transparent;
          -webkit-text-stroke: 1px rgba(0,0,0,0.05);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          z-index: 0;
          animation: fadeIn 0.8s ease both;
        }
        .pp-hero-inner { position: relative; z-index: 1; }

        .pp-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.68rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--pink-accent);
          font-weight: 600;
          margin-bottom: 12px;
          animation: fadeUp 0.5s ease both;
        }
        .pp-eyebrow::before, .pp-eyebrow::after {
          content: '';
          display: block;
          width: 28px; height: 1px;
          background: var(--rule);
        }

        .pp-heading { margin: 0 0 12px; line-height: 0.95; animation: fadeUp 0.5s 0.07s ease both; }
        .pp-heading-serif {
          display: block;
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: clamp(1.4rem, 3.5vw, 2.4rem);
          color: var(--ink-soft);
          letter-spacing: 0.01em;
          margin-bottom: 4px;
        }
        .pp-heading-block {
          display: block;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.8rem, 9vw, 8.5rem);
          letter-spacing: 0.03em;
          color: var(--ink);
          line-height: 1;
        }
        .pp-heading-block .stroke {
          -webkit-text-stroke: 2px var(--pink-accent);
          color: transparent;
        }

        .pp-rule-group {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 12px;
          animation: fadeUp 0.5s 0.12s ease both;
        }
        .pp-rule-group span { width: 40px; height: 1px; background: var(--ink); display: block; }
        .pp-rule-group em {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.75rem;
          color: var(--ink-faint);
          letter-spacing: 0.1em;
        }

        .pp-subtitle {
          font-size: 0.88rem;
          color: var(--ink-soft);
          max-width: 380px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 300;
          animation: fadeUp 0.5s 0.17s ease both;
        }

        /* ── STATS BAR ── */
        .pp-stats-wrapper {
          border-bottom: 1px solid var(--rule);
          background: var(--surface);
          animation: fadeUp 0.5s 0.22s ease both;
        }
        .pp-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }
        .pp-stat {
          text-align: center;
          padding: 20px 16px;
          border-right: 1px solid var(--rule);
          border-bottom: none;
          transition: background 0.2s;
        }
        .pp-stat:last-child { border-right: none; }
        .pp-stat:hover { background: var(--white); }
        .pp-stat-num {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.04em;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 4px;
        }
        .pp-stat-lbl {
          font-size: 0.64rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .pp-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .pp-stat {
            border-bottom: 1px solid var(--rule);
          }
          .pp-stat:nth-child(2n) {
            border-right: none;
          }
          .pp-stat:nth-child(2n+1) {
            border-right: 1px solid var(--rule);
          }
          .pp-stat:nth-child(3),
          .pp-stat:nth-child(4) {
            border-bottom: none;
          }
        }

        /* ── FILTER ── */
        .pp-filter-section {
          padding: 16px 0 12px;
          border-bottom: 1px solid var(--rule);
          animation: fadeUp 0.5s 0.27s ease both;
        }
        .pp-filter-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pp-filter-meta {
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
          flex-shrink: 0;
        }
        .pp-pills {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 6px;
          scrollbar-width: none;
        }
        .pp-pills::-webkit-scrollbar {
          display: none;
        }
        .pp-pill {
          flex: 0 0 auto;
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 100px;
          padding: 7px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem;
          font-weight: 500;
          color: var(--ink-soft);
          cursor: pointer;
          transition: all 0.18s ease;
          letter-spacing: 0.03em;
        }
        .pp-pill:hover { border-color: var(--pink-accent); color: var(--pink-accent); }
        .pp-pill.active { background: var(--pink-accent); border-color: var(--pink-accent); color: #fff; }
        .pp-filter-right {
          margin-left: auto;
          font-size: 0.76rem;
          color: var(--ink-faint);
          font-weight: 300;
          flex-shrink: 0;
        }
        .pp-filter-right strong { color: var(--ink); font-weight: 600; }

        /* ── GRID SECTION ── */
        .pp-grid-section { padding: 16px 0 48px; }

        .pp-feature-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1px;
          background: var(--rule);
          border: 1px solid var(--rule);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 40px;
          margin-bottom: 24px;
        }
        @media (max-width: 768px) { .pp-feature-strip { grid-template-columns: repeat(2, 1fr); } }
        .pp-feature {
          background: var(--white);
          padding: 18px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: background 0.2s;
        }
        .pp-feature:hover { background: var(--pink-soft); }
        .pp-feature-icon {
          width: 32px; height: 32px;
          background: var(--pink-accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #fff;
        }
        .pp-feature-title { font-size: 0.75rem; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .pp-feature-desc { font-size: 0.68rem; color: var(--ink-faint); line-height: 1.4; font-weight: 300; }

        .pp-grid-label {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .pp-grid-label-text {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.05rem;
          letter-spacing: 0.12em;
          color: var(--ink);
          white-space: nowrap;
        }
        .pp-grid-label-line { flex: 1; height: 1px; background: var(--rule); }
        .pp-grid-label-count {
          font-size: 0.7rem;
          color: var(--ink-faint);
          letter-spacing: 0.1em;
          font-weight: 600;
          white-space: nowrap;
        }

        .pp-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1200px) { .pp-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px)  { .pp-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (max-width: 480px)  { .pp-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }

        .pp-card-wrap {
          animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both;
          transition: transform 0.28s ease;
        }
        .pp-card-wrap:hover { transform: translateY(-5px); }

        .pp-empty {
          grid-column: 1/-1;
          text-align: center;
          padding: 80px 20px;
          background: var(--surface);
          border: 1px dashed var(--rule);
          border-radius: 16px;
        }
        .pp-empty-icon { font-size: 2.5rem; display: block; margin-bottom: 14px; }
        .pp-empty-text { font-size: 0.88rem; color: var(--ink-soft); font-weight: 300; }

        /* ── NEWSLETTER ── */
        .pp-newsletter {
          background: linear-gradient(135deg, #ffffff 0%, var(--pink-soft) 100%);
          border-radius: 20px;
          padding: 52px 36px;
          text-align: center;
          position: relative;
          overflow: hidden;
          margin-bottom: 50px;
          border: 1px solid var(--pink-border);
        }
        .pp-newsletter::before {
          content: 'GENZ';
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: 14rem;
          color: rgba(212, 96, 138, 0.03);
          pointer-events: none;
          white-space: nowrap;
        }
        .pp-newsletter-eyebrow {
          font-size: 0.66rem;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--pink-accent);
          margin-bottom: 12px;
          font-weight: 600;
        }
        .pp-newsletter-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2rem, 4vw, 3.2rem);
          letter-spacing: 0.06em;
          color: var(--ink);
          margin-bottom: 8px;
          line-height: 1;
        }
        .pp-newsletter-sub {
          font-size: 0.83rem;
          color: var(--ink-soft);
          font-weight: 300;
          margin: 0 auto 24px;
          max-width: 340px;
          line-height: 1.65;
        }
        .pp-newsletter-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
          position: relative;
          z-index: 1;
        }
        .pp-newsletter-input {
          background: var(--surface);
          border: 1px solid var(--rule);
          border-radius: 40px;
          padding: 0 22px;
          height: 46px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.83rem;
          color: var(--ink);
          outline: none;
          width: 260px;
          transition: border-color 0.2s;
        }
        .pp-newsletter-input::placeholder { color: rgba(0,0,0,0.3); }
        .pp-newsletter-input:focus { border-color: var(--pink-accent); }
        .pp-newsletter-btn {
          background: var(--pink-accent);
          color: #ffffff;
          border: none;
          border-radius: 40px;
          padding: 0 26px;
          height: 46px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pp-newsletter-btn:hover { background: #c34f77; }

        /* ── ANIMATIONS ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(18px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity:0; } to { opacity:1; }
        }
        @keyframes scaleIn {
          from { opacity:0; transform:scale(0.96); }
          to   { opacity:1; transform:scale(1); }
        }

        /* ── LOADER ── */
        .genz-loader { display: flex; gap: 6px; }
        .genz-loader span {
          width: 8px; height: 8px;
          background: var(--pink-accent);
          border-radius: 50%;
          animation: ldot 0.8s infinite ease-in-out;
        }
        .genz-loader span:nth-child(2) { animation-delay: 0.15s; }
        .genz-loader span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes ldot {
          0%,80%,100% { transform:scale(0.6); opacity:0.3; }
          40% { transform:scale(1); opacity:1; }
        }

        .gz-page-search {
          display: flex;
          align-items: center;
          gap: 0;
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 100px;
          padding: 4px 4px 4px 16px;
          flex: 1;
          min-width: 200px;
          max-width: 420px;
        }
        .gz-page-search:focus-within { border-color: var(--pink-accent); }
        .gz-page-search-icon {
          display: flex;
          color: var(--ink-faint);
          flex-shrink: 0;
        }
        .gz-page-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: var(--ink);
          min-width: 0;
          padding: 8px 10px;
        }
        .gz-page-search-clear {
          border: none;
          background: none;
          color: var(--ink-faint);
          font-size: 1.2rem;
          line-height: 1;
          cursor: pointer;
          padding: 0 6px;
        }
        .gz-page-search-btn {
          border: none;
          background: var(--pink-accent);
          color: #fff;
          border-radius: 100px;
          padding: 8px 18px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .gz-page-search-btn:hover { background: #c34f77; }
        .pp-search-row {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--rule);
        }
        .pp-search-label {
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .pp-filter-right { display: none; }
          .pp-newsletter { padding: 36px 20px; }
          .pp-newsletter-input { width: 100%; }
          .pp-newsletter-btn { width: 100%; }
          .gz-page-search { max-width: 100%; }
          .pp-search-row { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <motion.div
        className="pp-page"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >

        {/* HERO */}
        <div className="pp-hero">
          <div className="pp-ghost">SKIN</div>
          <div className="pp-hero-inner">
            <div className="pp-eyebrow">GENZ Skin Studio</div>
            <h1 className="pp-heading">
              <span className="pp-heading-serif">discover our</span>
              <span className="pp-heading-block">ALL <span className="stroke">PRODUCTS</span></span>
            </h1>
            <div className="pp-rule-group">
              <span /><em>clean · effective · new generation</em><span />
            </div>
            <p className="pp-subtitle">
              {searchQuery
                ? `Showing results for "${searchQuery}"`
                : 'Every formula is dermatologist-tested and crafted without compromise — because your skin deserves better.'}
            </p>
          </div>
        </div>

        <Container>

          {/* SEARCH + FILTER - at top */}
          <div className="pp-filter-section">
            <div className="pp-search-row">
              <span className="pp-search-label">Search</span>
              <ProductSearch
                variant="page"
                defaultValue={searchQuery}
                onSearch={handleSearch}
                placeholder="Search by product name..."
              />
            </div>
          </div>

          <div className="pp-grid-section">

            {/* GRID LABEL */}
            <div className="pp-grid-label">
              <span className="pp-grid-label-text">
                {searchQuery ? `SEARCH: ${searchQuery.toUpperCase()}` : 'ALL PRODUCTS'}
              </span>
              <span className="pp-grid-label-line" />
              <span className="pp-grid-label-count">{products.length} ITEMS</span>
            </div>

            {/* PRODUCT GRID */}
            <div className="pp-grid">
              {loading ? (
                <div className="text-center py-5 w-100" style={{ gridColumn: '1/-1' }}>
                  <div className="genz-loader m-auto"><span /><span /><span /></div>
                  <p className="mt-2 text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>Loading Products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="pp-empty">
                  <span className="pp-empty-icon" style={{ display: 'block', marginBottom: '8px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  </span>
                  <p className="pp-empty-text">
                    {searchQuery
                      ? `No products found for "${searchQuery}"`
                      : 'No products found'}
                  </p>
                </div>
              ) : (
                products.map((product, i) => (
                  <div
                    key={product._id}
                    className="pp-card-wrap"
                    style={{ animationDelay: `${0.04 + i * 0.04}s` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))
              )}
            </div>

            {/* FEATURES STRIP - Moved below products grid */}
            <div className="pp-feature-strip">
              {[
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, title: 'Clean Formula', desc: 'Free from parabens & sulfates' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>, title: 'Derm Tested', desc: 'Safe for all skin types' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, title: 'Fast Delivery', desc: 'Nationwide in 2–4 days' },
                { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, title: 'Made in Pakistan', desc: 'Locally sourced & crafted' },
              ].map((f, i) => (
                <div className="pp-feature" key={i}>
                  <div className="pp-feature-icon">{f.icon}</div>
                  <div>
                    <div className="pp-feature-title">{f.title}</div>
                    <div className="pp-feature-desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* STATS BAR - after cards */}
          <div className="pp-stats-wrapper" style={{ borderBottom: 'none', marginBottom: '20px' }}>
            <div className="pp-stats">
              {[
                { num: '100%', lbl: 'Clean Ingredients' },
                { num: '48H',  lbl: 'Hydration Tested'  },
                { num: '0',    lbl: 'Harmful Chemicals'  },
                { num: 'PKR',  lbl: 'Local Pricing'      },
              ].map((s, i) => (
                <div className="pp-stat" key={i}>
                  <div className="pp-stat-num">{s.num}</div>
                  <div className="pp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>

          {/* NEWSLETTER - at the bottom */}
          <div className="pp-newsletter">
            <div className="pp-newsletter-eyebrow">Stay in the loop</div>
            <div className="pp-newsletter-heading">NEW DROPS. FIRST.</div>
            <p className="pp-newsletter-sub">
              Get early access to launches, exclusive offers, and skin tips — straight to your inbox.
            </p>
            <div className="pp-newsletter-row">
              <input className="pp-newsletter-input" type="email" placeholder="your@email.com" />
              <button className="pp-newsletter-btn">Subscribe</button>
            </div>
          </div>

        </Container>
      </motion.div>

      <Footer />
    </>
  );
};

export default Products;
