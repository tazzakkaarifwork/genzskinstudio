import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        setError('You are not authorized as admin');
      }
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Admin Portal | GenZ Skin Studio</title>
        <meta name="description" content="Secure admin login for GenZ Skin Studio management portal." />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;900&display=swap');

        .admin-login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          font-family: 'DM Sans', sans-serif;
          padding: 24px 16px;
        }
        .admin-login-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 0;
          padding: 48px 40px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
        .admin-login-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.6rem;
          letter-spacing: 0.12em;
          color: #0f0f0f;
          margin-bottom: 4px;
        }
        .admin-login-badge {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #888;
          margin-bottom: 32px;
          display: block;
        }
        .admin-login-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.2rem;
          letter-spacing: 0.06em;
          color: #0f0f0f;
          line-height: 1;
          margin-bottom: 8px;
        }
        .admin-login-sub {
          font-size: 0.85rem;
          color: #666;
          margin-bottom: 32px;
          font-weight: 400;
        }
        .admin-login-label {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: #0f0f0f;
          margin-bottom: 8px;
        }
        .admin-login-input {
          font-size: 0.9rem;
          padding: 12px 14px;
          border: 1px solid #0f0f0f;
          border-radius: 0;
          background: #fff;
          transition: box-shadow 0.2s ease;
        }
        .admin-login-input:focus {
          border-color: #0f0f0f;
          box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.08);
          outline: none;
        }
        .admin-login-btn {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px;
          border-radius: 0;
          background: #0f0f0f;
          border: 1px solid #0f0f0f;
          color: #fff;
          width: 100%;
          transition: background 0.2s ease;
          margin-top: 8px;
        }
        .admin-login-btn:hover:not(:disabled),
        .admin-login-btn:focus:not(:disabled) {
          background: #333;
          border-color: #333;
          color: #fff;
        }
        .admin-login-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .admin-login-error {
          font-size: 0.8rem;
          background: #fff;
          border: 1px solid #0f0f0f;
          border-left: 4px solid #dc3545;
          color: #0f0f0f;
          padding: 12px 14px;
          margin-bottom: 24px;
        }
        .admin-login-back {
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #666;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .admin-login-back:hover {
          color: #0f0f0f;
        }
        @media (max-width: 480px) {
          .admin-login-card {
            padding: 36px 24px;
          }
          .admin-login-title {
            font-size: 1.8rem;
          }
        }
      `}</style>

      <div className="admin-login-page">
        <motion.div
          className="admin-login-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="admin-login-brand">GENZ SKIN STUDIO</div>
          <span className="admin-login-badge">Admin Panel</span>

          <h1 className="admin-login-title">SIGN IN</h1>
          <p className="admin-login-sub">Authorized personnel only. Manage store operations securely.</p>

          {error && <div className="admin-login-error">{error}</div>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="admin-login-label">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="admin-login-input"
                placeholder="admin@genzskin.com"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="admin-login-label">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="admin-login-input"
                placeholder="••••••••"
              />
            </Form.Group>
            <Button type="submit" className="admin-login-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Enter Portal'}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <Link to="/" className="admin-login-back">← Back to Store</Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default AdminLogin;
