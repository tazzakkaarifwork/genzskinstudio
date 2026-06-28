// src/pages/About.jsx
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import Footer from '../components/Footer';

const About = () => {
  return (
    <>
      <Helmet>
        <title>About Us - GenZ Skin Studio</title>
        <meta name="description" content="Read the story behind GenZ Skin Studio. We offer clean, cruelty-free, and genderless skincare for the new generation." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@1,500&display=swap');

        .about-page-wrapper {
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0f;
          overflow-x: hidden;
        }

        /* ── HERO ── */
          .ab-hero {
            position: relative;
            background: #ffffff;
            color: #000000;
            padding: 120px 0 80px;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            overflow: hidden;
          }
        .ab-hero-grain {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          pointer-events: none;
        }
        .ab-hero-ghost {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(8rem, 20vw, 18rem);
          letter-spacing: 0.08em;
          color: transparent;
          -webkit-text-stroke: 1.5px rgba(0,0,0,0.06);
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }
        .ab-hero-inner {
          position: relative;
          z-index: 1;
        }
        .ab-eyebrow {
          font-size: 0.72rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #888888;
          font-weight: 700;
          margin-bottom: 18px;
          display: inline-flex;
          align-items: center;
          gap: 12px;
        }
        .ab-eyebrow::before, .ab-eyebrow::after {
          content: '';
          display: block;
          width: 32px; height: 1px;
          background: rgba(0,0,0,0.15);
        }
        .ab-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 7vw, 5rem);
          font-weight: 400;
          color: #0f0f0f;
          line-height: 1.05;
          letter-spacing: 0.04em;
          margin-bottom: 16px;
        }
        .ab-heading .outline-txt {
          -webkit-text-stroke: 2px #0f0f0f;
          color: transparent;
          text-shadow: none;
        }
        .ab-subtitle {
          font-family: 'DM Sans', sans-serif;
          font-size: 1rem;
          font-weight: 400;
          color: #555;
          line-height: 1.6;
          margin-bottom: 16px;
          max-width: 520px;
          margin-left: auto;
          margin-right: auto;
        }

        /* ── SECTION: STORY ── */
        .ab-section-story {
          padding: 90px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .ab-story-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 5vw, 4rem);
          color: #0f0f0f;
          line-height: 1;
          letter-spacing: 0.03em;
          margin-bottom: 24px;
        }
        .ab-story-para {
          font-size: 1rem;
          color: #555555;
          line-height: 1.85;
          font-weight: 300;
          margin-bottom: 20px;
        }
        .ab-story-para strong {
          color: #0f0f0f;
          font-weight: 600;
        }

        /* ── BELIEFS CARD ── */
        .ab-belief-card {
          background: #0a0a0a;
          color: #ffffff;
          border-radius: 24px;
          padding: 44px 38px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          height: 100%;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ab-belief-card:hover {
          transform: translateY(-6px);
          box-shadow: 8px 8px 0px #ffffff, 0 20px 40px rgba(0,0,0,0.3);
        }
        .ab-belief-card h3 {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2rem;
          letter-spacing: 0.05em;
          margin-bottom: 24px;
        }
        .ab-belief-list {
          list-style: none;
          padding: 0;
          margin: 0 0 24px 0;
        }
        .ab-belief-list li {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.95rem;
          color: #cccccc;
          line-height: 1.7;
          margin-bottom: 16px;
        }
        .ab-belief-list li svg {
          color: #ffffff;
          margin-top: 4px;
          flex-shrink: 0;
        }
        .ab-quote {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 0.92rem;
          color: #888888;
          border-top: 1px solid #222;
          padding-top: 20px;
          margin: 0;
        }

        /* ── SECTION: STATS ── */
        .ab-section-stats {
          background: #f7f7f5;
          padding: 80px 0;
        }
        .ab-stat-item {
          text-align: center;
          padding: 20px 10px;
        }
        .ab-stat-number {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(3.5rem, 6vw, 5rem);
          color: #0f0f0f;
          line-height: 1;
          margin-bottom: 6px;
        }
        .ab-stat-label {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #999999;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .ab-hero { padding: 90px 0 60px; }
          .ab-section-story { padding: 60px 0; }
          .ab-belief-card { padding: 32px 24px; }
        }
      `}</style>

      <motion.div
        className="about-page-wrapper"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* HERO SECTION */}
        <section className="ab-hero">
          <div className="ab-hero-grain" />
          <div className="ab-hero-ghost">STUDIO</div>
          <Container className="ab-hero-inner">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="ab-eyebrow">Our Manifesto</span>
              <h1 className="ab-heading">
                BEYOND THE <br />
                <span className="outline-txt">FILTER.</span>
              </h1>
              <p className="ab-subtitle">
                Clean skincare formulated for the new generation — raw, real, and uncompromising.
              </p>
            </motion.div>
          </Container>
        </section>

        {/* STORY & BELIEFS SECTION */}
        <section className="ab-section-story">
          <Container>
            <Row className="g-5 align-items-stretch">
              <Col lg={7}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                  <h2 className="ab-story-heading">WHO WE ARE</h2>
                  <p className="ab-story-para">
                    GenZ Skin Studio was born out of frustration. Frustration with an industry packed with overpriced, over-hyped, and over-complicated 10-step routines that promise perfection but deliver little.
                  </p>
                  <p className="ab-story-para">
                    We believe skincare should be simple, clean, and effective. We stripped away the pinkwashing and the marketing jargon. What's left is a collection of <strong>black & white formulas</strong> that focus strictly on skin health.
                  </p>
                  <p className="ab-story-para">
                    Our products are designed for real skin, textures, and breakouts. We stand for dermatologically tested formulas, carbon-neutral shipping, and absolute transparency. Welcome to skincare rebuilt from the ground up.
                  </p>
                </motion.div>
              </Col>
              <Col lg={5}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                >
                  <div className="ab-belief-card">
                    <h3>OUR CORE BELIEFS</h3>
                    <ul className="ab-belief-list">
                      <li>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span><strong>Full Transparency:</strong> No hidden ingredients, no confusing toxins. Exactly what's on the bottle is inside.</span>
                      </li>
                      <li>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span><strong>Inclusive Skincare:</strong> Skincare has no gender. Formulated for all skin types and all individuals.</span>
                      </li>
                      <li>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span><strong>Eco-Conscious Focus:</strong> Made with recyclable glass and biodegradable boxes. Carbon-neutral shipping nationwide.</span>
                      </li>
                    </ul>
                    <p className="ab-quote">
                      "Skin is not a trend. It's a lifetime relationship."
                    </p>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* STATISTICS SECTION */}
        <section className="ab-section-stats">
          <Container>
            <Row className="gy-4">
              {[
                { num: 'NEW', label: 'Brand Launching 2026' },
                { num: '100%', label: 'Clean Ingredients' },
                { num: '0', label: 'Harmful Toxins' },
                { num: 'EST 2026', label: 'In Pakistan' }
              ].map((stat, i) => (
                <Col md={3} xs={6} key={stat.label}>
                  <motion.div
                    className="ab-stat-item"
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="ab-stat-number">{stat.num}</div>
                    <div className="ab-stat-label">{stat.label}</div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>
      </motion.div>

      <Footer />
    </>
  );
};

export default About;
