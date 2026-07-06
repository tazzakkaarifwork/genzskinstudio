import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import api from '../services/api';

const cleanPhoneForDisplay = (phoneStr) => {
  if (!phoneStr) return '';
  let cleaned = phoneStr.replace(/\s+/g, '');
  if (cleaned.startsWith('+92')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('92')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart, getProductPrice } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [differentBilling, setDifferentBilling] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const [shippingSettings, setShippingSettings] = useState({ freeCities: ['karachi'], standardCharge: 150 });
  const [shippingLoaded, setShippingLoaded] = useState(false);

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const { data } = await api.get('/shipping/settings');
        setShippingSettings(data);
      } catch (err) {
        console.error('Failed to load shipping settings:', err);
      } finally {
        setShippingLoaded(true);
      }
    };
    fetchShipping();
  }, []);


  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    const codes = couponInput.split(',').map(c => c.trim().toUpperCase()).filter(Boolean);
    if (codes.length === 0) return;

    try {
      setIsValidatingCoupon(true);
      const { data } = await api.post('/orders/validate-coupons', { codes });
      if (data.valid) {
        setAppliedCoupons(data.appliedCoupons);
        setDiscountPercent(data.totalDiscountPercent);
        setCouponSuccess(`Successfully applied: ${data.appliedCoupons.map(c => `${c.code} (${c.discountPercent}%)`).join(', ')}. Total Discount: ${data.totalDiscountPercent}%`);
      } else {
        setCouponError('Invalid coupon code(s)');
        setAppliedCoupons([]);
        setDiscountPercent(0);
      }
    } catch (err) {
      console.error(err);
      setCouponError(err.response?.data?.message || 'Failed to validate coupon code');
      setAppliedCoupons([]);
      setDiscountPercent(0);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const subtotal = getCartTotal();
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  // finalTotal is computed below after formData is declared

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

  const [formData, setFormData] = useState({
    email: user?.email || '',
    receiveNews: false,
    country: 'Pakistan',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    apartment: '',
    city: user?.city || '',
    postalCode: '',
    phone: cleanPhoneForDisplay(user?.phone || ''),
    saveInfo: false,
    billingCountry: 'Pakistan',
    billingFirstName: user?.firstName || '',
    billingLastName: user?.lastName || '',
    billingAddress: user?.address || '',
    billingApartment: '',
    billingCity: user?.city || '',
    billingPostalCode: '',
    billingPhone: cleanPhoneForDisplay(user?.phone || ''),
  });

  // Shipping price logic — dynamic from admin settings
  const getShippingCost = (city) => {
    if (!city) return shippingSettings.standardCharge || 150;
    const cityLower = city.trim().toLowerCase();
    const isFree = shippingSettings.freeCities?.some(fc => cityLower.includes(fc.toLowerCase()));
    if (isFree) return 0;
    return shippingSettings.standardCharge || 150;
  };
  const shippingCost = getShippingCost(formData.city);
  const finalTotal = (subtotal - discountAmount) + shippingCost;

  if (cartItems.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:ital@1&display=swap');
          .co-empty-page { min-height: 100vh; background: #fff; display: flex; align-items: center; justify-content: center; font-family: 'DM Sans', sans-serif; }
          .co-empty-box { text-align: center; }
          .co-empty-eyebrow { font-size: 0.66rem; letter-spacing: 0.28em; text-transform: uppercase; color: #aaa; font-weight: 600; margin-bottom: 16px; display: flex; align-items: center; justify-content: center; gap: 10px; }
          .co-empty-eyebrow::before, .co-empty-eyebrow::after { content: ''; display: block; width: 28px; height: 1px; background: #e8e8e8; }
          .co-empty-serif { font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 1.2rem; color: #888; display: block; }
          .co-empty-h { font-family: 'Bebas Neue', sans-serif; font-size: 4rem; letter-spacing: 0.05em; color: #0f0f0f; line-height: 1; margin-bottom: 16px; }
          .co-empty-sub { font-size: 0.88rem; color: #888; font-weight: 300; margin-bottom: 28px; }
          .co-empty-btn { background: #0f0f0f; color: #fff; border: none; border-radius: 100px; padding: 13px 32px; font-family: 'DM Sans', sans-serif; font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: opacity 0.2s; }
          .co-empty-btn:hover { opacity: 0.8; }
        `}</style>
        <div className="co-empty-page">
          <div className="co-empty-box">
            <div className="co-empty-eyebrow">GENZ Skin Studio</div>
            <div className="co-empty-h">
              <span className="co-empty-serif">your cart is</span><br />EMPTY
            </div>
            <p className="co-empty-sub">Add some glow to your cart first.</p>
            <button className="co-empty-btn" onClick={() => navigate('/products')}>Continue Shopping</button>
          </div>
        </div>
      </>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation Regex Rules
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const rawPhone = formData.phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('0') ? rawPhone.substring(1) : rawPhone;
    const phoneRegex = /^3\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      setError('Please enter a valid Pakistan phone number (e.g., 300 1234567)');
      setLoading(false);
      return;
    }
    const formattedPhone = `+92${cleanPhone}`;

    if (!formData.firstName.trim()) {
      setError('First name is required');
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      setLoading(false);
      return;
    }

    if (!formData.address.trim()) {
      setError('Shipping address is required');
      setLoading(false);
      return;
    }

    if (!formData.apartment.trim()) {
      setError('Apartment, suite, unit, etc. is required');
      setLoading(false);
      return;
    }

    if (!formData.city.trim()) {
      setError('City is required');
      setLoading(false);
      return;
    }

    let formattedBillingPhone = '';
    if (differentBilling) {
      if (!formData.billingFirstName.trim()) {
        setError('Billing first name is required');
        setLoading(false);
        return;
      }
      if (!formData.billingLastName.trim()) {
        setError('Billing last name is required');
        setLoading(false);
        return;
      }
      if (!formData.billingAddress.trim()) {
        setError('Billing address is required');
        setLoading(false);
        return;
      }
      if (!formData.billingApartment.trim()) {
        setError('Billing apartment, suite, etc. is required');
        setLoading(false);
        return;
      }
      if (!formData.billingCity.trim()) {
        setError('Billing city is required');
        setLoading(false);
        return;
      }
      const rawBillingPhone = formData.billingPhone.replace(/\D/g, '');
      const cleanBillingPhone = rawBillingPhone.startsWith('0') ? rawBillingPhone.substring(1) : rawBillingPhone;
      if (!phoneRegex.test(cleanBillingPhone)) {
        setError('Please enter a valid Pakistan billing phone number (e.g., 300 1234567)');
        setLoading(false);
        return;
      }
      formattedBillingPhone = `+92${cleanBillingPhone}`;
    }

    try {
      const orderItems = cartItems.map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: getProductPrice(item.product),
        image: item.product.image,
        quantity: item.quantity,
      }));
      const payload = {
        orderItems,
        contact: { email: formData.email, receiveNews: formData.receiveNews },
        shippingDetails: {
          country: formData.country, firstName: formData.firstName, lastName: formData.lastName,
          address: formData.address, apartment: formData.apartment, city: formData.city,
          postalCode: formData.postalCode, phone: formattedPhone,
        },
        billingAddress: differentBilling ? {
          country: formData.billingCountry, firstName: formData.billingFirstName, lastName: formData.billingLastName,
          address: formData.billingAddress, apartment: formData.billingApartment, city: formData.billingCity,
          postalCode: formData.billingPostalCode, phone: formattedBillingPhone,
        } : null,
        paymentMethod: 'cash_on_delivery',
        totalPrice: finalTotal,
        saveInfo: formData.saveInfo,
        couponCode: appliedCoupons.map(c => c.code).join(', '),
        discountAmount: discountAmount,
      };
      const { data } = await api.post('/orders', payload);

      // ✅ Frontend TikTok Pixel — Backup only
      // Server-side event bhi ja raha hai, TikTok event_id se duplicates khud hatata hai
      try {
        if (typeof window !== 'undefined' && window.ttq && data?._id) {
          window.ttq.track('Purchase', {
            event_id: data._id, // ← Duplicate hatane ke liye unique Order ID
            content_type: 'product',
            quantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
            description: orderItems.map(i => i.name).join(', '),
            content_id: orderItems.map(i => i.product).join(','),
            currency: 'PKR',
            value: finalTotal,
          });
        }
      } catch (pixelErr) {
        console.warn('TikTok pixel error:', pixelErr);
      }

      // ✅ Frontend Meta (Facebook) Pixel — Backup only
      // Server-side event (CAPI) bhi ja raha hai, Meta eventID se duplicates handle karta hai
      try {
        if (typeof window !== 'undefined' && window.fbq && data?._id) {
          window.fbq('track', 'Purchase', {
            content_type: 'product',
            content_ids: orderItems.map(i => i.product),
            currency: 'PKR',
            value: finalTotal,
          }, { eventID: data._id });
        }
      } catch (fbPixelErr) {
        console.warn('Facebook pixel error:', fbPixelErr);
      }

      clearCart();
      navigate('/order-success', { state: { order: data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital@1&display=swap');

        :root {
          --ink: #0f0f0f;
          --ink-soft: #555;
          --ink-faint: #aaa;
          --rule: #e8e8e8;
          --surface: #f7f7f5;
          --white: #ffffff;
        }

        *, *::before, *::after { box-sizing: border-box; }

        .co-page {
          background: var(--white);
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: var(--ink);
        }

        /* TOP BAR */
        .co-topbar {
          border-bottom: 1px solid var(--rule);
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--white);
        }
        @media (max-width: 600px) { .co-topbar { padding: 14px 16px; flex-direction: column; gap: 10px; } }
        .co-brand {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.08em;
          color: var(--ink);
          text-decoration: none;
        }
        .co-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.65rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
        }
        .co-breadcrumb .bc-active { color: var(--ink); }
        .co-breadcrumb svg { width: 9px; height: 9px; color: var(--rule); }

        /* LAYOUT */
        .co-layout {
          display: grid;
          grid-template-columns: 1fr 420px;
          min-height: calc(100vh - 61px);
          max-width: 1280px;
          margin: 0 auto;
        }
        @media (max-width: 960px) {
          .co-layout { grid-template-columns: 1fr; }
          .co-right { border-left: none; border-top: 1px solid var(--rule); }
        }

        /* LEFT */
        .co-left {
          padding: 52px 56px 80px;
          border-right: 1px solid var(--rule);
        }
        @media (max-width: 1100px) { .co-left { padding: 40px 32px 60px; } }
        @media (max-width: 768px) { .co-left { padding: 28px 16px 56px; } }

        /* SECTION EYEBROW */
        .co-eyebrow {
          font-size: 0.64rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .co-eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--rule); }

        .co-section-head {
          margin-bottom: 22px;
          margin-top: 6px;
        }
        .co-section-serif {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 0.9rem;
          color: var(--ink-soft);
          display: block;
          margin-bottom: 2px;
        }
        .co-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.9rem;
          letter-spacing: 0.05em;
          color: var(--ink);
          line-height: 1;
        }

        .co-section-gap { margin-top: 40px; }

        /* INPUTS */
        .co-field { margin-bottom: 14px; }
        .co-label {
          display: block;
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #111111;
          margin-bottom: 7px;
        }
        .co-input, .co-select {
          width: 100%;
          background: #fafafa;
          border: 1.5px solid #d1d1cc;
          border-radius: 12px;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.92rem;
          font-weight: 500;
          color: #000000;
          outline: none;
          appearance: none;
          -webkit-appearance: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .co-input:focus, .co-select:focus {
          border-color: var(--ink);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(15,15,15,0.06);
        }
        .co-input::placeholder { color: #888888; }

        .co-select-wrap { position: relative; }
        .co-select-wrap::after {
          content: '';
          position: absolute;
          right: 14px; top: 50%;
          transform: translateY(-50%);
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 5px solid var(--ink-faint);
          pointer-events: none;
        }

        .co-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        @media (max-width: 480px) { .co-row { grid-template-columns: 1fr; } }

        /* CHECKBOX */
        .co-check {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          cursor: pointer;
        }
        .co-check-box {
          width: 18px; height: 18px;
          border: 1.5px solid var(--rule);
          border-radius: 5px;
          background: var(--white);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.15s;
        }
        .co-check-box.on { background: var(--ink); border-color: var(--ink); }
        .co-check-box svg { width: 10px; height: 10px; color: #fff; }
        .co-check-lbl { font-size: 0.83rem; color: var(--ink-soft); font-weight: 400; }

        /* RADIO GROUP */
        .co-radio-group {
          border: 1px solid var(--rule);
          border-radius: 14px;
          overflow: hidden;
          background: var(--surface);
        }
        .co-radio-item {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 14px 18px;
          cursor: pointer;
          transition: background 0.15s;
          border-bottom: 1px solid var(--rule);
        }
        .co-radio-item:last-child { border-bottom: none; }
        .co-radio-item:hover { background: var(--white); }
        .co-radio-dot {
          width: 18px; height: 18px;
          border-radius: 50%;
          border: 1.5px solid var(--rule);
          background: var(--white);
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          transition: border-color 0.15s;
        }
        .co-radio-dot.on { border-color: var(--ink); }
        .co-radio-dot.on::after { content: ''; width: 8px; height: 8px; border-radius: 50%; background: var(--ink); }
        .co-radio-text { font-size: 0.85rem; color: var(--ink); font-weight: 500; flex: 1; }
        .co-radio-sub { font-size: 0.72rem; color: var(--ink-faint); font-weight: 300; }

        /* SHIPPING BOX */
        .co-ship-box {
          border: 1px solid var(--rule);
          border-radius: 14px;
          padding: 16px 20px;
          background: var(--surface);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .co-ship-name { font-size: 0.88rem; font-weight: 600; color: var(--ink); }
        .co-ship-sub { font-size: 0.7rem; color: var(--ink-faint); margin-top: 2px; }
        .co-ship-free {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.1em;
          color: var(--ink);
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 20px;
          padding: 3px 14px;
        }

        /* BILLING EXTRA */
        .co-billing-extra {
          border: 1px solid var(--rule);
          border-radius: 14px;
          padding: 20px;
          margin-top: 12px;
          background: var(--surface);
        }

        /* ERROR */
        .co-error {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #fff5f5;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.82rem;
          color: #b91c1c;
          margin-top: 16px;
        }
        .co-error svg { width: 14px; height: 14px; flex-shrink: 0; }

        /* SUBMIT */
        .co-submit {
          width: 100%;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .co-submit:hover:not(:disabled) {
          background: #d4af37;
          color: #000;
          box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
          transform: translateY(-1px);
        }
        .co-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* FOOTER LINKS */
        .co-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 6px 20px;
          margin-top: 28px;
          padding-top: 20px;
          border-top: 1px solid var(--rule);
        }
        .co-footer-link {
          font-size: 0.68rem;
          color: var(--ink-faint);
          text-decoration: none;
          letter-spacing: 0.06em;
          transition: color 0.2s;
        }
        .co-footer-link:hover { color: var(--ink); }

        /* RIGHT PANEL */
        .co-right {
          background: var(--surface);
          padding: 52px 36px;
        }
        @media (max-width: 960px) { .co-right { padding: 28px 16px; } }

        .co-sum-eyebrow {
          font-size: 0.64rem;
          letter-spacing: 0.26em;
          text-transform: uppercase;
          color: var(--ink-faint);
          font-weight: 600;
          margin-bottom: 4px;
        }
        .co-sum-serif {
          font-family: 'Playfair Display', Georgia, serif;
          font-style: italic;
          font-size: 0.9rem;
          color: var(--ink-soft);
          display: block;
        }
        .co-sum-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          letter-spacing: 0.05em;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 24px;
        }

        /* ORDER ITEMS */
        .co-item {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px 0;
          border-bottom: 1px solid var(--rule);
        }
        .co-item:last-of-type { border-bottom: none; }
        .co-item-img-wrap {
          position: relative;
          width: 58px; height: 58px;
          flex-shrink: 0;
          border-radius: 12px;
          overflow: visible;
        }
        .co-item-img {
          width: 58px; height: 58px;
          border-radius: 12px;
          object-fit: cover;
          background: var(--rule);
          border: 1px solid var(--rule);
          display: block;
        }
        .co-item-qty-badge {
          position: absolute;
          top: -7px; right: -7px;
          width: 20px; height: 20px;
          background: var(--ink);
          color: #fff;
          border-radius: 50%;
          font-size: 0.6rem;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid var(--surface);
        }
        .co-item-name { font-size: 0.82rem; font-weight: 600; color: var(--ink); margin-bottom: 2px; }
        .co-item-qty-txt { font-size: 0.68rem; color: var(--ink-faint); }
        .co-item-price { font-size: 0.85rem; font-weight: 700; color: var(--ink); margin-left: auto; flex-shrink: 0; }

        /* TOTALS */
        .co-totals { margin-top: 18px; padding-top: 18px; border-top: 1px solid var(--rule); }
        .co-tot-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 9px;
        }
        .co-tot-lbl { font-size: 0.88rem; color: #555555; font-weight: 600; }
        .co-tot-val { font-size: 0.92rem; color: #000000; font-weight: 700; }
        .co-grand-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--ink);
        }
        .co-grand-lbl { font-family: 'Bebas Neue', sans-serif; font-size: 1.35rem; letter-spacing: 0.08em; color: var(--ink); }
        .co-grand-val { font-family: 'Bebas Neue', sans-serif; font-size: 1.85rem; letter-spacing: 0.03em; color: var(--ink); }
        .co-grand-cur { font-size: 0.85rem; color: #555555; margin-right: 3px; font-weight: 600; }

        /* SECURE */
        .co-secure {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 12px 16px;
          background: var(--white);
          border: 1px solid var(--rule);
          border-radius: 12px;
          font-size: 0.7rem;
          color: var(--ink-soft);
        }
        .co-secure svg { width: 14px; height: 14px; color: var(--ink); flex-shrink: 0; }

        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <motion.div 
        className="co-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <form onSubmit={handleSubmit}>
          <div className="co-layout">

            {/* ── LEFT FORM ── */}
            <div className="co-left">

              {/* CONTACT */}
              <div className="co-eyebrow">Contact</div>
              <div className="co-section-head">
                <span className="co-section-serif">tell us about</span>
                <div className="co-section-title">YOUR DETAILS</div>
              </div>

              <div className="co-field">
                <label className="co-label">Email or mobile phone</label>
                <input className="co-input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>

              <label className="co-check" style={{ cursor: 'pointer' }}>
                <div className={`co-check-box ${formData.receiveNews ? 'on' : ''}`}>
                  {formData.receiveNews && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <input type="checkbox" name="receiveNews" checked={formData.receiveNews} onChange={handleChange} style={{ display: 'none' }} />
                <span className="co-check-lbl">Email me with news and exclusive offers</span>
              </label>

              {/* DELIVERY */}
              <div className="co-section-gap">
                <div className="co-eyebrow">Delivery</div>
                <div className="co-section-head">
                  <span className="co-section-serif">where to send</span>
                  <div className="co-section-title">SHIPPING ADDRESS</div>
                </div>
              </div>

              <div className="co-field">
                <label className="co-label">Country / Region</label>
                <div className="co-select-wrap">
                  <select className="co-select" name="country" value={formData.country} onChange={handleChange}>
                    <option>Pakistan</option>
                  </select>
                </div>
              </div>

              <div className="co-row">
                <div className="co-field">
                  <label className="co-label">First name</label>
                  <input className="co-input" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Aisha" required />
                </div>
                <div className="co-field">
                  <label className="co-label">Last name</label>
                  <input className="co-input" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Khan" required />
                </div>
              </div>

              <div className="co-field">
                <label className="co-label">Address</label>
                <input className="co-input" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" required />
              </div>

              <div className="co-field">
                <label className="co-label">Apartment, suite, etc.</label>
                <input className="co-input" name="apartment" value={formData.apartment} onChange={handleChange} placeholder="Apt 4B" required />
              </div>

              <div className="co-row">
                <div className="co-field">
                  <label className="co-label">City</label>
                  <input className="co-input" name="city" value={formData.city} onChange={handleChange} placeholder="Karachi" required />
                </div>
                <div className="co-field">
                  <label className="co-label">Postal code <span style={{ fontWeight: 300, textTransform: 'none', letterSpacing: 0 }}>(optional)</span></label>
                  <input className="co-input" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="75000" />
                </div>
              </div>

              <div className="co-field">
                <label className="co-label">Phone</label>
                <div className="co-phone-input-group" style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--surface)',
                  border: '1px solid var(--rule)',
                  borderRadius: '12px',
                  paddingLeft: '16px',
                  overflow: 'hidden',
                  transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s'
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--ink)';
                  e.currentTarget.style.background = 'var(--white)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,15,15,0.06)';
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = 'var(--rule)';
                  e.currentTarget.style.background = 'var(--surface)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingRight: '10px', borderRight: '1px solid var(--rule)', userSelect: 'none' }}>
                    <span style={{ fontSize: '1.1rem' }}>🇵🇰</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>+92</span>
                    <span style={{ fontSize: '0.55rem', color: '#888', marginLeft: '1px' }}>▼</span>
                  </div>
                  <input 
                    className="co-input" 
                    style={{ 
                      flex: 1, 
                      border: 'none', 
                      background: 'transparent', 
                      paddingLeft: '12px',
                      boxShadow: 'none',
                      borderRadius: 0,
                      height: '46px'
                    }} 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange} 
                    placeholder="3XX XXXXXXX" 
                    required 
                  />
                </div>
              </div>

              <label className="co-check" style={{ cursor: 'pointer' }}>
                <div className={`co-check-box ${formData.saveInfo ? 'on' : ''}`}>
                  {formData.saveInfo && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <input type="checkbox" name="saveInfo" checked={formData.saveInfo} onChange={handleChange} style={{ display: 'none' }} />
                <span className="co-check-lbl">Save this information for next time</span>
              </label>

              {/* SHIPPING */}
              <div className="co-section-gap">
                <div className="co-eyebrow">Shipping Method</div>
                <div className="co-section-head">
                  <span className="co-section-serif">how it gets to you</span>
                  <div className="co-section-title">DELIVERY OPTION</div>
                </div>
              </div>
              <div className="co-ship-box">
                <div>
                  <div className="co-ship-name">Standard Delivery</div>
                  <div className="co-ship-sub">3–5 business days nationwide</div>
                </div>
                <div className="co-ship-free">{shippingCost === 0 ? 'FREE' : `PKR ${shippingCost}`}</div>
              </div>

              {/* PAYMENT */}
              <div className="co-section-gap">
                <div className="co-eyebrow">Payment</div>
                <div className="co-section-head">
                  <span className="co-section-serif">how you pay</span>
                  <div className="co-section-title">PAYMENT METHOD</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--ink-faint)', marginBottom: 12 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                All transactions are secure and encrypted.
              </div>
              <div className="co-radio-group">
                <div className="co-radio-item" style={{ cursor: 'default' }}>
                  <div className="co-radio-dot on" />
                  <div>
                    <div className="co-radio-text">Cash on Delivery (COD)</div>
                    <div className="co-radio-sub">Pay when your order arrives</div>
                  </div>
                </div>
              </div>

              {/* BILLING */}
              <div className="co-section-gap">
                <div className="co-eyebrow">Billing Address</div>
                <div className="co-section-head">
                  <span className="co-section-serif">where to bill</span>
                  <div className="co-section-title">BILL TO</div>
                </div>
              </div>
              <div className="co-radio-group">
                <div className={`co-radio-item`} onClick={() => setDifferentBilling(false)}>
                  <div className={`co-radio-dot ${!differentBilling ? 'on' : ''}`} />
                  <span className="co-radio-text">Same as shipping address</span>
                </div>
                <div className={`co-radio-item`} onClick={() => setDifferentBilling(true)}>
                  <div className={`co-radio-dot ${differentBilling ? 'on' : ''}`} />
                  <span className="co-radio-text">Use a different billing address</span>
                </div>
              </div>

              {differentBilling && (
                <div className="co-billing-extra">
                  <div className="co-field">
                    <label className="co-label">Country / Region</label>
                    <div className="co-select-wrap">
                      <select className="co-select" name="billingCountry" value={formData.billingCountry} onChange={handleChange}><option>Pakistan</option></select>
                    </div>
                  </div>
                  <div className="co-row">
                    <div className="co-field"><input className="co-input" name="billingFirstName" placeholder="First name" value={formData.billingFirstName} onChange={handleChange} required /></div>
                    <div className="co-field"><input className="co-input" name="billingLastName" placeholder="Last name" value={formData.billingLastName} onChange={handleChange} required /></div>
                  </div>
                  <div className="co-field"><input className="co-input" name="billingAddress" placeholder="Address" value={formData.billingAddress} onChange={handleChange} required /></div>
                  <div className="co-field"><input className="co-input" name="billingApartment" placeholder="Apartment, suite, etc." value={formData.billingApartment} onChange={handleChange} required /></div>
                  <div className="co-row">
                    <div className="co-field"><input className="co-input" name="billingCity" placeholder="City" value={formData.billingCity} onChange={handleChange} /></div>
                    <div className="co-field"><input className="co-input" name="billingPostalCode" placeholder="Postal code" value={formData.billingPostalCode} onChange={handleChange} /></div>
                  </div>
                  <div className="co-field">
                    <label className="co-label">Phone</label>
                    <div className="co-phone-input-group" style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: 'var(--surface)',
                      border: '1px solid var(--rule)',
                      borderRadius: '12px',
                      paddingLeft: '16px',
                      overflow: 'hidden',
                      transition: 'border-color 0.18s, box-shadow 0.18s, background 0.18s'
                    }}
                    onFocusCapture={(e) => {
                      e.currentTarget.style.borderColor = 'var(--ink)';
                      e.currentTarget.style.background = 'var(--white)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(15,15,15,0.06)';
                    }}
                    onBlurCapture={(e) => {
                      e.currentTarget.style.borderColor = 'var(--rule)';
                      e.currentTarget.style.background = 'var(--surface)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', paddingRight: '10px', borderRight: '1px solid var(--rule)', userSelect: 'none' }}>
                        <span style={{ fontSize: '1.1rem' }}>🇵🇰</span>
                        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' }}>+92</span>
                        <span style={{ fontSize: '0.55rem', color: '#888', marginLeft: '1px' }}>▼</span>
                      </div>
                      <input 
                        className="co-input" 
                        style={{ 
                          flex: 1, 
                          border: 'none', 
                          background: 'transparent', 
                          paddingLeft: '12px',
                          boxShadow: 'none',
                          borderRadius: 0,
                          height: '46px'
                        }} 
                        type="tel" 
                        name="billingPhone" 
                        value={formData.billingPhone} 
                        onChange={handleChange} 
                        placeholder="3XX XXXXXXX" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="co-footer-links">
                <a href="#" className="co-footer-link">Refund policy</a>
                <a href="#" className="co-footer-link">Shipping policy</a>
                <a href="#" className="co-footer-link">Privacy policy</a>
                <a href="#" className="co-footer-link">Terms of service</a>
                <a href="#" className="co-footer-link">Contact</a>
              </div>
            </div>

          {/* ── RIGHT ORDER SUMMARY ── */}
          <div className="co-right">
            <div className="co-sum-eyebrow">Review</div>
            <span className="co-sum-serif">your</span>
            <div className="co-sum-title">ORDER SUMMARY</div>

            {cartItems.map(item => (
              <div key={item.product._id} className="co-item">
                <div className="co-item-img-wrap">
                  <img src={getImageUrl(item.product)} alt={item.product.name} className="co-item-img" onError={e => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
                  <div className="co-item-qty-badge">{item.quantity}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="co-item-name">{item.product.name}</div>
                  <div className="co-item-qty-txt">Qty: {item.quantity}</div>
                </div>
                <div className="co-item-price">PKR {(getProductPrice(item.product) * item.quantity).toLocaleString()}</div>
              </div>
            ))}

            {/* Coupon/Promo Code Input */}
            <div className="co-coupon-section" style={{ marginTop: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--rule)' }}>
              <label className="co-label" style={{ marginBottom: '8px' }}>Have a Promo / Influencer Code?</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  className="co-input"
                  style={{ height: '40px', padding: '0 12px', borderRadius: '8px', marginBottom: 0 }}
                  type="text"
                  placeholder=""
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleApplyCoupon(e);
                    }
                  }}
                />
                <button
                  type="button"
                  className="co-submit"
                  style={{ height: '40px', padding: '0 20px', borderRadius: '8px', fontSize: '0.72rem', whiteSpace: 'nowrap', width: 'auto', marginTop: 0 }}
                  onClick={handleApplyCoupon}
                  disabled={isValidatingCoupon}
                >
                  {isValidatingCoupon ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {couponError && <div style={{ color: '#b91c1c', fontSize: '0.74rem', marginTop: '6px', fontWeight: 500 }}>⚠️ {couponError}</div>}
              {couponSuccess && <div style={{ color: '#155724', fontSize: '0.74rem', marginTop: '6px', fontWeight: 500 }}>✓ {couponSuccess}</div>}
            </div>

            <div className="co-totals">
              <div className="co-tot-row"><span className="co-tot-lbl">Subtotal</span><span className="co-tot-val">PKR {subtotal.toLocaleString()}</span></div>
              {discountPercent > 0 && (
                <div className="co-tot-row" style={{ color: '#155724' }}>
                  <span className="co-tot-lbl" style={{ color: '#155724' }}>Discount ({discountPercent}%)</span>
                  <span className="co-tot-val" style={{ fontWeight: 700 }}>- PKR {discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="co-tot-row">
                <span className="co-tot-lbl">Shipping</span>
                <span className="co-tot-val" style={{ fontWeight: 700 }}>
                  {shippingCost === 0
                    ? 'Free'
                    : `PKR ${shippingCost.toLocaleString()}`}
                </span>
              </div>
              <div className="co-grand-row">
                <span className="co-grand-lbl">Total</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span className="co-grand-cur">PKR</span>
                  <span className="co-grand-val">{finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="co-secure">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure checkout — your data is safe &amp; encrypted
            </div>

            {error && (
              <div className="co-error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button type="submit" className="co-submit" disabled={loading}>
              {loading
                ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Placing Order...</>
                : <>Complete Order <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </div>

        </div>
      </form>
    </motion.div>
    </>
  );
};

export default Checkout;
