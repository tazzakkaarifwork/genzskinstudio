import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { returnPolicies as fallbackPolicies } from '../data/returnPolicies';
import Footer from '../components/Footer';
import api from '../services/api';

const ReturnPolicy = () => {
  const [policies, setPolicies] = useState(fallbackPolicies);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const { data } = await api.get('/return-policies');
        if (Array.isArray(data) && data.length) {
          setPolicies(data);
        }
      } catch (err) {
        console.error('Failed to load return policies:', err);
      }
    };
    fetchPolicies();
  }, []);

  return (
    <>
      <Helmet>
        <title>Return Policy – GenZ Skin Studio</title>
        <meta name="description" content="Return and refund policy for GenZ Skin Studio orders." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        .returns-wrapper {
          min-height: 100vh;
          background: #ffffff;
          font-family: 'DM Sans', sans-serif;
          color: #0f0f0f;
        }
        .returns-hero {
          background: #ffffff;
          padding: 70px 0 44px;
          text-align: center;
          border-bottom: 1px solid #ebebeb;
        }
        .returns-eyebrow {
          font-size: 0.7rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 12px;
          display: block;
          font-weight: 600;
        }
        .returns-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 6vw, 4rem);
          letter-spacing: 0.04em;
          color: #0f0f0f;
          line-height: 1;
          margin-bottom: 12px;
        }
        .returns-subtitle {
          font-size: 0.95rem;
          color: #666;
          font-weight: 300;
          max-width: 520px;
          margin: 0 auto;
        }
        .returns-content {
          padding: 46px 0 80px;
        }
        .returns-item {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 0;
          margin-bottom: 16px;
          padding: 24px 28px;
          transition: border-color 0.3s ease;
        }
        .returns-item:hover {
          border-color: #0f0f0f;
        }
        .returns-item-title {
          font-size: 1rem;
          font-weight: 700;
          color: #0f0f0f;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .returns-item-desc {
          font-size: 0.9rem;
          color: #666;
          line-height: 1.8;
          font-weight: 300;
          margin: 0;
        }
      `}</style>

      <div className="returns-wrapper">
        <div className="returns-hero">
          <Container>
            <span className="returns-eyebrow">Policies</span>
            <h1 className="returns-title">RETURN POLICY</h1>
            <p className="returns-subtitle">
              Everything you need to know about returns, refunds, and exchanges.
            </p>
          </Container>
        </div>

        <div className="returns-content">
          <Container style={{ maxWidth: '760px' }}>
            {policies.map((policy, i) => (
              <motion.div
                key={policy._id || i}
                className="returns-item"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                <h2 className="returns-item-title">{policy.title}</h2>
                <p className="returns-item-desc">{policy.description}</p>
              </motion.div>
            ))}
          </Container>
        </div>

        <div style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ReturnPolicy;
