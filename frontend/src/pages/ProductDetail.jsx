// ProductDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Image } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import SideCart from '../components/SideCart';
import api from '../services/api';
import Footer from "../components/Footer";

// ─────────────────────────────────────────
//  Accordion helper: split newline text into list
// ─────────────────────────────────────────
const TextAsList = ({ text, ordered = false }) => {
  const lines = (text || '').split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length <= 1) return <p>{text}</p>;
  
  if (ordered) {
    return (
      <div className="pd-steps-list">
        {lines.map((line, i) => {
          let clean = line.replace(/^\d+[\.\:\s\-]+/, '').trim();
          const stepRegex = /^(Step\s*\d+)[\s\-\:]*(.*)$/i;
          const match = clean.match(stepRegex);
          
          if (match) {
            const stepTitle = match[1];
            const stepContent = match[2];
            return (
              <div key={i} className="pd-step-item" style={{ marginBottom: '16px' }}>
                <div className="pd-step-title" style={{ fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase', color: '#1a202c', marginBottom: '2px' }}>
                  {stepTitle}
                </div>
                <p className="pd-step-text" style={{ fontSize: '0.82rem', color: '#555', margin: 0, lineHeight: '1.6' }}>
                  {stepContent}
                </p>
              </div>
            );
          } else {
            return (
              <div key={i} className="pd-step-item-extra" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '12px', fontSize: '0.82rem', color: '#555', lineHeight: '1.6' }}>
                <span style={{ color: '#1a202c', fontWeight: 'bold' }}>•</span>
                <p style={{ margin: 0 }}>{clean}</p>
              </div>
            );
          }
        })}
      </div>
    );
  }
  
  return <ul>{lines.map((l, i) => <li key={i}>{l}</li>)}</ul>;
};

const AccordionItem = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`pd-accordion-item${open ? ' open' : ''}`}>
      <button className="pd-accordion-header" onClick={() => setOpen(o => !o)} aria-expanded={open}>
        {title}
        <span className="pd-accordion-icon">{open ? '−' : '+'}</span>
      </button>
      <div className="pd-accordion-body">
        {children}
      </div>
    </div>
  );
};

const AccordionDetails = ({ product }) => {
  const sections = [
    product.dermatologistNotes && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v11m0 0H5m4 0h10m0-11v11m0 0a2 2 0 01-2 2H7a2 2 0 01-2-2"/></svg>
          Dermatologist Notes
        </span>
      ),
      content: <TextAsList text={product.dermatologistNotes} />,
      badge: true,
    },
    product.whyYoullLoveIt && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Why You'll Love It
        </span>
      ),
      content: <TextAsList text={product.whyYoullLoveIt} />,
    },
    product.perfectFor && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
          Perfect For
        </span>
      ),
      content: <TextAsList text={product.perfectFor} />,
    },
    product.ingredients && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a9 9 0 00-9 9c0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11a9 9 0 00-9-9z"/><path d="M12 6v6l4 2"/></svg>
          Ingredients
        </span>
      ),
      content: <TextAsList text={product.ingredients} />,
    },
    product.howToUse && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          How to Use
        </span>
      ),
      content: <TextAsList text={product.howToUse} ordered />,
    },
    product.additionalInfo && {
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Additional Information
        </span>
      ),
      content: <TextAsList text={product.additionalInfo} />,
    },
  ].filter(Boolean);

  return (
    <div className="pd-accordion">
      {sections.map((s, i) => (
        <AccordionItem key={i} title={s.title} defaultOpen={i === 0}>
          {s.badge && (
            <div className="pd-derm-badge">
              <span>✓ Dermatologist Approved</span>
            </div>
          )}
          {s.content}
        </AccordionItem>
      ))}
    </div>
  );
};



const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState('');
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const [timeLeft, setTimeLeft] = useState('');
  const discountPercent = product ? (Number(product.discountPercent) || 0) : 0;
  const hasDiscount = product ? (discountPercent > 0 && (!product.offerExpiresAt || new Date(product.offerExpiresAt) > new Date())) : false;
  const discountedPrice = product ? (hasDiscount ? product.price - (product.price * discountPercent / 100) : product.price) : 0;

  const nameLower = product?.name?.toLowerCase() || '';
  const catNameLower = (typeof product?.category === 'object' ? product?.category?.name || '' : '').toLowerCase();
  const isWomen = nameLower.includes('women') || catNameLower.includes('women');
  const isMen = !isWomen && (nameLower.includes('men') || catNameLower.includes('men'));

  const detailTimerStyle = isMen
    ? {
        background: '#000000',
        border: '1px solid #000000',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        maxWidth: '380px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
        color: '#ffffff'
      }
    : {
        background: '#fdf2f8',
        border: '1px solid #fbcfe8',
        borderRadius: '12px',
        padding: '12px 16px',
        marginBottom: '20px',
        maxWidth: '380px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 2px 6px rgba(219,39,119,0.03)',
        color: '#db2777'
      };

  const timerTextTitleColor = isMen ? '#aaaaaa' : '#db2777';
  const timerTextTimeColor = isMen ? '#ffffff' : '#1a202c';

  useEffect(() => {
    if (!product || !product.timerEnabled || !product.offerExpiresAt || !hasDiscount) return;

    const updateTimer = () => {
      const difference = new Date(product.offerExpiresAt) - new Date();
      if (difference <= 0) {
        setTimeLeft('');
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      timeString += `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      setTimeLeft(timeString);
    };

    updateTimer();
    const intervalId = setInterval(updateTimer, 1000);
    return () => clearInterval(intervalId);
  }, [product, hasDiscount]);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async (retryCount = 0) => {
    try {
      const { data } = await api.get(`/products/${id}`);
      if (data && data._id) {
        setProduct(data);
        // Use cardImage for initial display, fallback to first detail image or legacy
        const firstImg = data.cardImage || data.detailImages?.[0] || data.images?.[0] || data.image || '';
        setSelectedImage(firstImg);
        await fetchReviews(data._id);
      } else {
        throw new Error('Invalid product data structure received');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      if (retryCount < 3) {
        console.warn(`Retrying product details fetch... (${retryCount + 1}/3)`);
        setTimeout(() => fetchProduct(retryCount + 1), 3000);
      }
    }
  };

  const fetchReviews = async (productId, retryCount = 0) => {
    try {
      const { data } = await api.get(`/products/${productId}/reviews`);
      setReviews(data.reviews || []);
      setAvgRating(data.avgRating || 0);
      setReviewsCount(data.reviewsCount || 0);
    } catch (err) {
      console.error('Failed to load reviews:', err);
      if (retryCount < 2) {
        setTimeout(() => fetchReviews(productId, retryCount + 1), 3000);
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!userComment.trim()) {
      setReviewMessage('Please write a review');
      setTimeout(() => setReviewMessage(''), 3000);
      return;
    }

    setReviewSubmitting(true);

    // Prepare review data
    const reviewData = {
      rating: userRating,
      comment: userComment,
    };

    if (user) {
      reviewData.userId = user._id;
    } else {
      if (guestName.trim()) reviewData.name = guestName.trim();
      if (guestEmail.trim()) reviewData.email = guestEmail.trim();
    }

    try {
      const config = user
        ? { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        : {};

      // Log request for debugging
      console.log('Submitting review:', { productId: product._id, reviewData });

      const response = await api.post(`/products/${product._id}/reviews`, reviewData, config);
      
      console.log('Server response:', response.data);
      
      setReviewMessage('Review submitted! Thank you.');
      setUserComment('');
      setUserRating(5);
      setGuestName('');
      setGuestEmail('');
      await fetchReviews(product._id);
      setTimeout(() => setReviewMessage(''), 3000);
    } catch (err) {
      console.error('Review submission error:', err);
      
      // Extract detailed error message from server response
      let errorMsg = 'Error submitting review. Please try again.';
      if (err.response) {
        // Server responded with error status
        errorMsg = err.response.data?.error || err.response.data?.message || `Server error: ${err.response.status}`;
        console.error('Server error response:', err.response.data);
      } else if (err.request) {
        errorMsg = 'No response from server. Please check your network.';
      } else {
        errorMsg = err.message;
      }
      
      setReviewMessage(errorMsg);
      setTimeout(() => setReviewMessage(''), 5000);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getImageUrl = (raw) => {
    if (!raw) return 'https://via.placeholder.com/600x600?text=No+Image';
    if (raw.startsWith('http')) return raw;
    let baseUrl = api.defaults?.baseURL || '';
    if (baseUrl.endsWith('/api')) {
      baseUrl = baseUrl.slice(0, -4);
    } else if (baseUrl.endsWith('/api/')) {
      baseUrl = baseUrl.slice(0, -5);
    }
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (!product) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="genz-loader">
        <span></span><span></span><span></span>
      </div>
    </div>
  );

  // Use detailImages if available, otherwise fallback to legacy images
  const allDetailImages = product.detailImages?.length
    ? product.detailImages
    : (product.images?.length ? product.images : [product.image]).filter(Boolean);
  // Also include cardImage at start if not already in detailImages
  const productImages = (() => {
    const imgs = [...allDetailImages];
    // If cardImage exists and not already first, prepend it
    const cImg = product.cardImage;
    if (cImg && imgs[0] !== cImg) imgs.unshift(cImg);
    return imgs;
  })();

  return (
    <>
      <Helmet>
        <title>{product.name} | GenZ Skin Studio</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');

        .pd-page {
          background: #ffffff;
          min-height: 100vh;
          padding: 60px 0 80px;
          font-family: 'DM Sans', sans-serif;
        }

        .pd-breadcrumb {
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #aaa;
          margin-bottom: 40px;
        }
        .pd-breadcrumb span { color: #555; }
        .pd-breadcrumb a { color: #aaa; text-decoration: none; }
        .pd-breadcrumb a:hover { color: #1a202c; }

        .pd-img-col {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          gap: 14px;
        }
        .pd-img-frame {
          position: relative;
          width: 340px;
          max-width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e8e8e8;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-img-frame img {
          width: 100%;
          height: auto;
          max-height: 450px;
          object-fit: contain;
          display: block;
          transition: transform 0.4s ease;
        }
        .pd-img-frame:hover img { transform: scale(1.03); }

        .pd-thumbs {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pd-thumb-btn {
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          border: 2px solid #e8e8e8;
          padding: 2px;
          background: #fff;
          cursor: pointer;
          overflow: hidden;
          transition: border-color 0.2s, transform 0.2s;
        }
        .pd-thumb-btn.active { border-color: #1a202c; }
        .pd-thumb-btn:hover { transform: translateY(-1px); border-color: #1a202c; }
        .pd-thumb-btn img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .pd-badge {
          position: absolute;
          top: 14px;
          left: 14px;
          background: #1a202c;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 4px;
        }

        .pd-info-col { padding-left: 20px; }

        .pd-tag {
          display: inline-block;
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #999;
          margin-bottom: 12px;
        }

        .pd-name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.2rem, 4vw, 3.2rem);
          color: #1a202c;
          letter-spacing: 0.04em;
          line-height: 1.05;
          margin: 0 0 16px;
        }

        .pd-price-row {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 20px;
        }
        .pd-price {
          font-size: 1.6rem;
          font-weight: 600;
          color: #1a202c;
          letter-spacing: 0.01em;
        }
        .pd-currency {
          font-size: 0.9rem;
          color: #999;
          font-weight: 400;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .pd-divider {
          height: 1px;
          background: #ebebeb;
          margin: 20px 0;
        }

        .pd-desc {
          font-size: 0.92rem;
          color: #666;
          line-height: 1.75;
          margin-bottom: 24px;
          font-weight: 300;
        }

        /* ── ACCORDION ── */
        .pd-accordion { margin-bottom: 28px; border-top: 1px solid #ebebeb; }
        .pd-accordion-item { border-bottom: 1px solid #ebebeb; }
        .pd-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          cursor: pointer;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          font-weight: 700;
          color: #1a202c;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: color 0.2s ease;
          user-select: none;
        }
        .pd-accordion-header:hover { color: #555; }
        .pd-accordion-icon {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: 1.5px solid #1a202c;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          font-size: 1rem; font-weight: 300; line-height: 1;
          color: #1a202c;
          transition: transform 0.3s ease, background 0.2s ease;
        }
        .pd-accordion-item.open .pd-accordion-icon {
          transform: rotate(45deg);
          background: #1a202c;
          color: #fff;
        }
        .pd-accordion-body {
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.35s ease, padding 0.25s ease;
          padding: 0 0 0;
        }
        .pd-accordion-item.open .pd-accordion-body {
          max-height: 800px;
          padding-bottom: 18px;
        }
        .pd-accordion-body ul, .pd-accordion-body ol {
          padding-left: 20px;
          margin: 0;
        }
        .pd-accordion-body li {
          font-size: 0.88rem;
          color: #555;
          line-height: 1.8;
          font-weight: 300;
        }
        .pd-accordion-body p {
          font-size: 0.88rem;
          color: #555;
          line-height: 1.8;
          margin: 0;
          font-weight: 300;
        }
        .pd-derm-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0faf4;
          border: 1px solid #86efac;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.78rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 14px;
        }

        .pd-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 28px;
          max-width: 450px;
        }
        .pd-actions-row {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }

        .pd-qty-wrap {
          display: flex;
          align-items: center;
          background: #fff;
          border: 1px solid #dcdcdc;
          border-radius: 40px;
          overflow: hidden;
          height: 48px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .pd-qty-btn {
          width: 44px;
          height: 100%;
          background: transparent;
          border: none;
          color: #666;
          font-size: 1.2rem;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pd-qty-btn:hover:not(:disabled) { background: #f7f7f7; color: #1a202c; }
        .pd-qty-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .pd-qty-num {
          min-width: 40px;
          text-align: center;
          font-size: 0.95rem;
          font-weight: 600;
          color: #1a202c;
          border-left: 1px solid #e0e0e0;
          border-right: 1px solid #e0e0e0;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pd-cart-btn {
          flex: 1;
          background: #1a202c;
          color: #ffffff;
          border: none;
          border-radius: 40px;
          padding: 0 28px;
          height: 48px !important;
          min-height: 48px !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 12px rgba(26, 32, 44, 0.12);
        }
        .pd-cart-btn:hover:not(:disabled) { 
          background: #000000; 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(26, 32, 44, 0.22);
        }
        .pd-cart-btn:active:not(:disabled) { 
          transform: translateY(0); 
          box-shadow: 0 4px 12px rgba(26, 32, 44, 0.12);
        }
        .pd-cart-btn:disabled { 
          background: #cccccc; 
          color: #888888; 
          cursor: not-allowed; 
          box-shadow: none; 
          transform: none;
        }
        .pd-cart-btn svg { width: 16px; height: 16px; }

        .pd-buy-btn {
          width: 100%;
          background: #ffffff;
          color: #1a202c;
          border: 2px solid #1a202c;
          border-radius: 40px;
          padding: 0 28px;
          height: 48px !important;
          min-height: 48px !important;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .pd-buy-btn:hover:not(:disabled) { 
          background: #f7f7f7; 
          transform: translateY(-2px); 
        }
        .pd-buy-btn:active:not(:disabled) { 
          transform: translateY(0); 
        }
        .pd-buy-btn:disabled { 
          border-color: #cccccc; 
          color: #888888; 
          cursor: not-allowed; 
          transform: none;
          background: #ffffff;
        }
        .pd-buy-btn svg { width: 16px; height: 16px; }

        .pd-trust {
          display: flex;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .pd-trust-item {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.75rem;
          color: #999;
          font-weight: 400;
        }
        .pd-trust-item svg { color: #1a202c; flex-shrink: 0; }

        .review-section {
          margin-top: 48px;
          border-top: 1px solid #ebebeb;
          padding-top: 48px;
        }
        .review-summary {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .review-form {
          background: #fafafa;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 32px;
        }
        .guest-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .guest-fields input {
          padding: 10px 14px;
          border: 1px solid #e0e0e0;
          border-radius: 40px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
        }
        .review-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .review-item {
          border-bottom: 1px solid #f0f0f0;
          padding-bottom: 20px;
        }
        .review-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .review-stars {
          display: flex;
          gap: 2px;
        }
        .review-stars span {
          font-size: 14px;
          color: #f5a623;
        }
        .review-date {
          font-size: 0.7rem;
          color: #aaa;
          margin-left: auto;
        }
        .review-comment {
          font-size: 0.88rem;
          color: #555;
          line-height: 1.6;
          margin-top: 8px;
        }
        .review-user {
          font-weight: 600;
          font-size: 0.8rem;
          color: #1a202c;
        }
        .star-input {
          display: inline-flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .star-input span {
          cursor: pointer;
          font-size: 24px;
          color: #ddd;
          transition: color 0.1s;
        }
        .star-input span.selected {
          color: #f5a623;
        }
        .rating-input-label {
          font-size: 0.8rem;
          font-weight: 600;
          margin-right: 12px;
        }

        .genz-loader { display: flex; gap: 6px; }
        .genz-loader span {
          width: 8px; height: 8px;
          background: #1a202c;
          border-radius: 50%;
          animation: ldot 0.8s infinite ease-in-out;
        }
        .genz-loader span:nth-child(2) { animation-delay: 0.15s; }
        .genz-loader span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes ldot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1); opacity: 1; }
        }

        @media (max-width: 768px) {
          .pd-page { padding: 34px 0 58px; overflow-x: hidden; }
          .pd-page .container { padding-left: 18px; padding-right: 18px; max-width: 100%; }
          .pd-breadcrumb { margin-bottom: 24px; word-break: break-word; line-height: 1.8; }
          .pd-info-col { padding-left: 12px; padding-right: 12px; margin-top: 28px; }
          .pd-img-col { flex-direction: column-reverse; align-items: stretch; }
          .pd-thumbs { flex-direction: row; justify-content: center; flex-wrap: wrap; padding: 4px 10px; gap: 12px; }
          .pd-img-frame { width: 100%; display: flex; align-items: center; justify-content: center; background: #ffffff; }
          .pd-img-frame img { height: auto; max-height: 380px; object-fit: contain; }
          .pd-name { font-size: 2rem; word-break: break-word; }
          .pd-desc { word-break: break-word; }
          .pd-info-grid { grid-template-columns: 1fr; }
          .pd-info-card { padding: 14px; }
          .pd-actions { gap: 12px; }
          .pd-actions-row { flex-wrap: wrap; gap: 12px; }
          .pd-qty-wrap { width: 100%; flex-basis: 100%; }
          .pd-cart-btn { width: 100%; flex-basis: auto; }
          .pd-buy-btn { width: 100%; flex-basis: auto; }
          .guest-fields { grid-template-columns: 1fr; }
        }
      `}</style>

      <motion.div
        className="pd-page"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <Container>
          <div className="pd-breadcrumb">
            <a href="/">Home</a> &nbsp;/&nbsp; <a href="/shop">Shop</a> &nbsp;/&nbsp; <span>{product.name}</span>
          </div>

          <Row className="g-4 align-items-start">
            <Col md={5} className="pd-img-col">
              {productImages.length > 1 && (
                <div className="pd-thumbs">
                  {productImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`pd-thumb-btn ${selectedImage === image ? 'active' : ''}`}
                      onClick={() => setSelectedImage(image)}
                      aria-label={`View product image ${index + 1}`}
                    >
                      <img src={getImageUrl(image)} alt={`${product.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
              <div className="pd-img-frame">
                <Image src={getImageUrl(selectedImage || productImages[0])} fluid alt={product.name} />
                <div className="pd-badge">New</div>
              </div>
            </Col>

            <Col md={7} className="pd-info-col">
              <div className="pd-tag">GENZ Skin Studio</div>
              <h1 className="pd-name">{product.name}</h1>
              <div className="pd-price-row" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                {hasDiscount ? (
                  <>
                    <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '1.2rem', fontWeight: 400 }}>
                      PKR {product.price.toLocaleString()}
                    </span>
                    <span className="pd-price" style={{ color: '#ff3f6c', fontSize: '1.8rem', fontWeight: 700 }}>
                      <span className="pd-currency" style={{ fontSize: '1rem', marginRight: '4px' }}>PKR</span>
                      {discountedPrice.toLocaleString()}
                    </span>
                    <span style={{ background: '#ff3f6c', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : (
                  <>
                    <span className="pd-currency">PKR</span>
                    <span className="pd-price">{product.price.toLocaleString()}</span>
                  </>
                )}
              </div>

              {product.timerEnabled && hasDiscount && timeLeft && (
                <div style={detailTimerStyle}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: timerTextTitleColor, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Limited Time Offer
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: timerTextTimeColor, fontFamily: 'monospace' }}>
                      Ends in: <span style={{ color: isMen ? '#ffffff' : '#db2777', fontWeight: 700 }}>{timeLeft}</span>
                    </span>
                  </div>
                </div>
              )}
              <div className="pd-divider" />
              <p className="pd-desc">{product.description}</p>

              {/* Accordion Info Sections */}
              {(product.dermatologistNotes || product.ingredients || product.whyYoullLoveIt || product.howToUse || product.additionalInfo) && (
                <AccordionDetails product={product} />
              )}

              {/* Stock status - only show if out of stock */}
              {product.stock === 0 && (
                <div style={{ marginTop: '20px', fontSize: '0.88rem', fontWeight: 600 }}>
                  <span style={{ color: '#dc3545', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ width: '8px', height: '8px', backgroundColor: '#dc3545', borderRadius: '50%', display: 'inline-block' }} /> Out of Stock
                  </span>
                </div>
              )}

              <div className="pd-actions">
                <div className="pd-actions-row">
                  <div className="pd-qty-wrap">
                    <button className="pd-qty-btn" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={product.stock === 0}>−</button>
                    <span className="pd-qty-num">{product.stock === 0 ? 0 : quantity}</span>
                    <button className="pd-qty-btn" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} disabled={product.stock === 0 || quantity >= product.stock}>+</button>
                  </div>
                  <button 
                    className="pd-cart-btn" 
                    onClick={() => addToCart(product, quantity)}
                    disabled={product.stock === 0}
                    style={product.stock === 0 ? { backgroundColor: '#cccccc', color: '#888888', cursor: 'not-allowed', opacity: 0.6 } : {}}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
                <button 
                  className="pd-buy-btn" 
                  onClick={() => { addToCart(product, quantity); navigate('/checkout'); }}
                  disabled={product.stock === 0}
                  style={product.stock === 0 ? { borderColor: '#cccccc', color: '#888888', cursor: 'not-allowed', opacity: 0.6 } : {}}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                  {product.stock === 0 ? 'Unavailable' : 'Buy Now'}
                </button>
              </div>

              <div className="pd-trust">
                <div className="pd-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Clean Ingredients</div>
                <div className="pd-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg> Dermatologist Tested</div>
                <div className="pd-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> Fast Delivery</div>
                <div className="pd-trust-item"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Made in Pakistan</div>
              </div>

              {/* REVIEWS SECTION (guest-friendly) */}
              <div className="review-section">
                <div className="review-summary">
                  <h3 style={{ fontFamily: 'Bebas Neue', fontSize: '1.8rem', letterSpacing: '0.03em', margin: 0 }}>CUSTOMER REVIEWS</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ fontSize: '20px', color: star <= avgRating ? '#f5a623' : '#ddd' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontWeight: 500 }}>{avgRating.toFixed(1)} out of 5</span>
                    <span style={{ color: '#888' }}>({reviewsCount} reviews)</span>
                  </div>
                </div>

                <div className="review-form">
                  <form onSubmit={handleSubmitReview}>
                    <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                      <span className="rating-input-label">Your Rating:</span>
                      <div className="star-input">
                        {[1,2,3,4,5].map(star => (
                          <span
                            key={star}
                            onClick={() => setUserRating(star)}
                            className={star <= userRating ? 'selected' : ''}
                          >★</span>
                        ))}
                      </div>
                    </div>

                    {!user && (
                      <div className="guest-fields">
                        <input
                          type="text"
                          placeholder="Your name (optional, default: Guest)"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                        <input
                          type="email"
                          placeholder="Your email (optional)"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                    )}

                    <textarea
                      rows="3"
                      placeholder="Write your review..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #e0e0e0', fontFamily: 'DM Sans, sans-serif', marginBottom: '16px' }}
                    />

                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      style={{ background: '#1a202c', color: '#fff', border: 'none', borderRadius: '40px', padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>

                    {reviewMessage && (
                      <p style={{ marginTop: '12px', fontSize: '0.8rem', color: reviewMessage.includes('Thank') ? '#2e7d32' : '#d32f2f' }}>
                        {reviewMessage}
                      </p>
                    )}
                  </form>
                </div>

                <div className="review-list">
                  {reviews.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#888', padding: '20px' }}>No reviews yet. Be the first to review!</p>
                  ) : (
                    reviews.map((review, idx) => (
                      <div key={idx} className="review-item">
                        <div className="review-header">
                          <div className="review-stars">
                            {[1,2,3,4,5].map(star => (
                              <span key={star} style={{ color: star <= review.rating ? '#f5a623' : '#ddd' }}>★</span>
                            ))}
                          </div>
                          <span className="review-user">{review.name || review.user?.name || 'Guest'}</span>
                          <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="review-comment">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </motion.div>

      <SideCart />
      <Footer />
    </>
  );
};

export default ProductDetail;
