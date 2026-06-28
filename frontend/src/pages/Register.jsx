// src/components/Register.jsx
import React, { useState } from 'react';
import { Container, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    // Strong password validation
    // Requires: min 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character (e.g., @$!%*?&#).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Register - GenZ Skin Studio</title>
        <meta name="description" content="Create your GenZ Skin Studio account." />
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
          max-width: 560px;
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
        .row-cols-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 576px) {
          .row-cols-2 {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .gz-auth-card {
            padding: 32px 20px;
          }
        }
      `}</style>

      <div className="gz-auth-container">
        <div className="gz-auth-card">
          <h1 className="gz-auth-title">REGISTER</h1>
          <p className="gz-auth-sub">Join the GenZ Skin Studio community</p>
          {error && <div className="gz-alert">{error}</div>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Phone (Pakistan +92)</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="gz-form-label">Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="gz-form-label">City</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="gz-form-control"
                placeholder=" "
              />
            </Form.Group>
            <Button type="submit" className="gz-auth-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </Form>
          <div className="text-center mt-4">
            <Link to="/login" className="gz-auth-link">Already have an account? Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;