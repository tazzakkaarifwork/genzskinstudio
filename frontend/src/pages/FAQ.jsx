import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';
import api from '../services/api';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const { data } = await api.get('/faqs');
        if (Array.isArray(data)) {
          setFaqs(data);
        } else {
          console.error('Expected FAQs array, but got:', data);
          setFaqs([]);
        }
      } catch (err) {
        console.error('Failed to load FAQs:', err);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <>
      <Helmet>
        <title>FAQ – GenZ Skin Studio</title>
        <meta name="description" content="Frequently asked questions about GenZ Skin Studio products, shipping, returns, and more." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .faq-wrapper {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0f;
        }
        .faq-hero {
          background: #ffffff;
          padding: 70px 0 44px;
          text-align: center;
          border-bottom: 1px solid #ebebeb;
        }
        .faq-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 12px;
          display: block;
          font-weight: 600;
        }
        .faq-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4rem);
          letter-spacing: 0.04em;
          color: #0f0f0f;
          line-height: 1;
          margin-bottom: 12px;
        }
        .faq-subtitle {
          font-size: 0.95rem;
          color: #666;
          font-weight: 300;
          max-width: 500px;
          margin: 0 auto;
        }

        .faq-content {
          padding: 46px 0 80px;
          background: #ffffff;
        }
        .faq-item {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .faq-item:hover {
          border-color: #ccc;
        }
        .faq-item.active {
          border-color: #0f0f0f;
          box-shadow: 0 8px 24px rgba(0,0,0,0.04);
        }
        .faq-question {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f0f0f;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.2s ease;
        }
        .faq-question:hover {
          background: #fafafa;
        }
        .faq-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f5f5f5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
          font-size: 1.1rem;
          color: #555;
        }
        .faq-item.active .faq-icon {
          background: #0f0f0f;
          color: #fff;
          transform: rotate(45deg);
        }
        .faq-answer {
          padding: 0 24px 20px;
          font-size: 0.9rem;
          color: #666;
          line-height: 1.8;
          font-weight: 300;
        }
      `}</style>

      <div className="faq-wrapper">
        <div className="faq-hero">
          <Container>
            <span className="faq-eyebrow">Support</span>
            <h1 className="faq-title">FREQUENTLY ASKED QUESTIONS</h1>
            <p className="faq-subtitle">Everything you need to know about our products, shipping, and policies.</p>
          </Container>
        </div>

        <div className="faq-content">
          <Container style={{ maxWidth: '760px' }}>
            {loading ? (
              <p className="text-center text-muted py-4">Loading FAQs...</p>
            ) : faqs.length === 0 ? (
              <div className="text-center py-5">
                <p className="text-muted mb-2" style={{ fontSize: '1.2rem' }}>FAQs coming soon</p>
                <p className="text-muted small">Check back later for frequently asked questions.</p>
              </div>
            ) : (
              faqs.map((faq, i) => (
                <motion.div
                  key={faq._id || i}
                  className={`faq-item ${openIndex === i ? 'active' : ''}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <button className="faq-question" onClick={() => toggle(i)}>
                    <span>{faq.question}</span>
                    <div className="faq-icon">+</div>
                  </button>
                  <AnimatePresence>
                    {openIndex === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="faq-answer">{faq.answer}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </Container>
        </div>

        <div style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default FAQ;
