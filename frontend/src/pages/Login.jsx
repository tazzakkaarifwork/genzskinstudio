// src/components/Login.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Login = () => {
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
        navigate('/');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - GenZ Skin Studio</title>
        <meta name="description" content="Login to your GenZ Skin Studio account." />
      </Helmet>
      <style>{`
        .gz-auth-container {
          min-height: 80vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: #fff;
        }
        .gz-auth-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 24px;
          padding: 40px 32px;
          max-width: 480px;
          width: 100%;
          transition: box-shadow 0.3s ease;
        }
        .gz-auth-card:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }
        .gz-auth-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.5rem;
          letter-spacing: 0.04em;
          color: #000;
          margin-bottom: 8px;
          text-align: center;
        }
        .gz-auth-sub {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          color: #666;
          text-align: center;
          margin-bottom: 32px;
        }
        .gz-form-label {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #000;
          margin-bottom: 6px;
        }
        .gz-form-control {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          padding: 12px 16px;
          border: 1px solid #e0e0e0;
          border-radius: 12px;
          background: #fff;
          transition: all 0.2s ease;
          width: 100%;
        }
        .gz-form-control:focus {
          border-color: #000;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0,0,0,0.05);
        }
        .gz-auth-btn {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 12px;
          border-radius: 100px;
          background: #000;
          border: none;
          color: #fff;
          width: 100%;
          transition: all 0.2s ease;
          margin-top: 8px;
        }
        .gz-auth-btn:hover:not(:disabled) {
          background: #333;
          transform: translateY(-1px);
        }
        .gz-auth-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .gz-auth-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #000;
          text-decoration: none;
          border-bottom: 1px solid #ccc;
          transition: border-color 0.2s;
        }
        .gz-auth-link:hover {
          border-bottom-color: #000;
        }
        .gz-alert {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          border-radius: 12px;
          background: #fff5f5;
          border: 1px solid #ffcdcd;
          color: #c00;
          padding: 12px 16px;
          margin-bottom: 24px;
        }
      `}</style>

      <div className="gz-auth-container">
        <div className="gz-auth-card">
          <h1 className="gz-auth-title">LOGIN</h1>
          <p className="gz-auth-sub">Welcome back to GenZ Skin Studio</p>
          {error && <div className="gz-alert">{error}</div>}
          <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
              <Form.Label className="gz-form-label">Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="gz-form-label">Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Button type="submit" className="gz-auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </Form>
          <div className="text-center mt-4">
            <Link to="/register" className="gz-auth-link">Don't have an account? Register</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;