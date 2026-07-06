import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import SideCart from '../components/SideCart';
import Footer from "../components/Footer";
import ProductSearch from '../components/ProductSearch';
import { motion, useInView } from 'framer-motion';

/* ─── Scroll-reveal wrapper (replaces plain CSS anim-fade-up) ─── */
const Reveal = ({ children, delay = 0, y = 30, style = {}, className = '' }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HomeProductCard = ({ product, getProductImageUrl, isInWishlist, toggleWishlist, handleQuickView, addToCart, navigate, imgWrapHeight, nameFontSize }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  const nameLower = product.name?.toLowerCase() || '';
  const catNameLower = (typeof product.category === 'object' ? product.category?.name || '' : '').toLowerCase();
  
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && (!product.offerExpiresAt || new Date(product.offerExpiresAt) > new Date());
  const discountedPrice = hasDiscount ? product.price - (product.price * discountPercent / 100) : product.price;

  useEffect(() => {
    if (!product.timerEnabled || !product.offerExpiresAt || !hasDiscount) return;

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
  }, [product.offerExpiresAt, hasDiscount]);

  const rating = product.avgRating || 0;
  const reviewsCount = product.reviewsCount || 0;

  return (
    <div className="ref-card">
      <button 
        className={`ref-wishlist-btn ${isInWishlist(product._id) ? 'active' : ''}`} 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
        title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
        aria-label={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={isInWishlist(product._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div className={`ref-card-img-wrap ${product.images?.[1] ? 'has-hover-image' : ''}`} onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer' }}>
        <img src={getProductImageUrl(product, 0)} alt={product.name} className="ref-card-img-primary" loading="lazy" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
        {product.images?.[1] && (
          <img src={getProductImageUrl(product, 1)} alt={product.name} className="ref-card-img-hover" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
        )}
        {product.stock === 0 ? (
          <span className="stock-badge">Out of Stock</span>
        ) : (
          hasDiscount && <span className="ref-card-tag">{discountPercent}% OFF</span>
        )}
        <button className="ref-quick-view-btn" onClick={(e) => { e.stopPropagation(); handleQuickView(product); }}>Quick View</button>
      </div>

      <div className="ref-card-body">
        <div className="ref-card-details-row">
          <div className="ref-card-details-left">
            <div className="ref-card-name" onClick={() => navigate(`/product/${product._id}`)} style={{ cursor: 'pointer', fontSize: nameFontSize || undefined }}>{product.name}</div>
            <div className="ref-card-meta">
              <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                <span style={{ display:'flex', gap:'1px' }}>
                  {[1,2,3,4,5].map(star => <span key={star} style={{ color: star <= rating ? '#f5a623' : '#ddd', fontSize:'10px' }}>★</span>)}
                </span>
                <span style={{ fontSize:'11px', color:'#888' }}>({reviewsCount})</span>
              </div>
            </div>
          </div>
          
          <div className="ref-card-details-right">
            {product.timerEnabled && hasDiscount && timeLeft && (
              <div className="ref-timer-badge">
                {timeLeft}
              </div>
            )}
            <div className="ref-card-price">
              {hasDiscount ? (
                <>
                  <span className="ref-card-price-original">
                    PKR {product.price?.toLocaleString() || '0'}
                  </span>
                  <span className="ref-card-price-sale">
                    PKR {discountedPrice.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="ref-card-price-regular">
                  PKR {product.price?.toLocaleString() || '0'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="ref-card-actions">
          <button className="ref-btn-cart" disabled={product.stock === 0} onClick={() => addToCart(product)}>
            {product.stock === 0 ? 'Sold' : 'Add'}
          </button>
          <button className="ref-btn-buy" onClick={() => navigate(`/product/${product._id}`)}>View</button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [allProducts, setAllProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [marqueeTexts, setMarqueeTexts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [heroData, setHeroData] = useState(null);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);

  /* ─── Quick View State ─── */
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [quickViewReviews, setQuickViewReviews] = useState([]);
  const [quickViewAvgRating, setQuickViewAvgRating] = useState(0);
  const [quickViewReviewsCount, setQuickViewReviewsCount] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  const [qvLoading, setQvLoading] = useState(false);

  /* ─── Homepage Newsletter Subscription State ─── */
  const [homeSubscribeEmail, setHomeSubscribeEmail] = useState('');
  const [homeSubscribeStatus, setHomeSubscribeStatus] = useState({ type: '', message: '' });
  const [homeSubscribeLoading, setHomeSubscribeLoading] = useState(false);

  const handleHomeSubscribe = async (e) => {
    e.preventDefault();
    if (!homeSubscribeEmail) return;
    try {
      setHomeSubscribeLoading(true);
      setHomeSubscribeStatus({ type: '', message: '' });
      const { data } = await api.post('/newsletter/subscribe', { email: homeSubscribeEmail });
      setHomeSubscribeStatus({ type: 'success', message: data.message || 'Thank you for subscribing!' });
      setHomeSubscribeEmail('');
    } catch (err) {
      console.error(err);
      setHomeSubscribeStatus({
        type: 'danger',
        message: err.response?.data?.error || 'Subscription failed. Please try again.',
      });
    } finally {
      setHomeSubscribeLoading(false);
    }
  };

  const handleQuickView = async (product) => {
    try {
      setQuickViewProduct(product);
      setShowQuickView(true);
      setQvLoading(true);
      const { data } = await api.get(`/products/${product._id}/reviews`);
      setQuickViewReviews(data.reviews || []);
      setQuickViewAvgRating(data.avgRating || 0);
      setQuickViewReviewsCount(data.reviewsCount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setQvLoading(false);
    }
  };

  /* ─── Auto-slider refs & state ─── */
  const testiSliderRef = useRef(null);
  const autoSlideTimer = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  /* ─── Contact form ─── */
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState('');

  /* ─── Community reviews ─── */
  const [communityReviews, setCommunityReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const getImageUrl = (product) => {
    const raw = product.image || product.images?.[0];
    if (!raw) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (raw.startsWith('http')) return raw;
    let baseUrl = api.defaults?.baseURL || '';
    if (baseUrl.endsWith('/api')) baseUrl = baseUrl.slice(0, -4);
    else if (baseUrl.endsWith('/api/')) baseUrl = baseUrl.slice(0, -5);
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getProductImageUrl = (product, index = 0) => {
    const raw = product.images?.[index] || product.image || product.images?.[0];
    return getImageUrl({ image: raw });
  };

  useEffect(() => {
    fetchData();
    fetchCommunityReviews();
  }, []);

  useEffect(() => {
    const banners = heroData?.bannerImages?.length
      ? heroData.bannerImages
      : heroData?.bgImage
        ? [heroData.bgImage]
        : ['/final.png'];

    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroData]);

  const fetchData = async (retryCount = 0) => {
    try {
      // ✅ FIX: Use allSettled so if hero/categories fail, products still show
      const [allProductsRes, featuredRes, newArrivalsRes, categoriesRes, heroRes, recommendedRes, marqueeRes] = await Promise.allSettled([
        api.get('/products'),
        api.get('/products?featured=true'),
        api.get('/products?newArrival=true'),
        api.get('/categories'),
        api.get('/hero'),
        api.get('/products?recommended=true'),
        api.get('/marquee'),
      ]);

      // Only set data if that specific call succeeded
      if (allProductsRes.status === 'fulfilled' && Array.isArray(allProductsRes.value.data)) setAllProducts(allProductsRes.value.data);
      if (featuredRes.status === 'fulfilled' && Array.isArray(featuredRes.value.data)) setFeaturedProducts(featuredRes.value.data);
      if (newArrivalsRes.status === 'fulfilled' && Array.isArray(newArrivalsRes.value.data)) setNewArrivals(newArrivalsRes.value.data);
      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value.data)) setCategories(categoriesRes.value.data);
      if (heroRes.status === 'fulfilled') setHeroData(heroRes.value.data);
      if (recommendedRes.status === 'fulfilled' && Array.isArray(recommendedRes.value.data)) setRecommendedProducts(recommendedRes.value.data);
      if (marqueeRes.status === 'fulfilled' && Array.isArray(marqueeRes.value.data)) setMarqueeTexts(marqueeRes.value.data);

      // ✅ If products failed (cold start), retry up to 3 times
      if (allProductsRes.status === 'rejected' && retryCount < 3) {
        console.warn(`Products fetch failed, retrying... (${retryCount + 1}/3)`);
        setTimeout(() => fetchData(retryCount + 1), 3000);
        return;
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityReviews = async () => {
    try {
      const { data } = await api.get('/products/reviews/recent?limit=8');
      setCommunityReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load community reviews:', err);
      setCommunityReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  /* ─── Auto-slide logic ─── */
  const SLIDE_WIDTH = 400; // px per slide (including gap)
  const goToSlide = useCallback((index) => {
    if (!testiSliderRef.current || communityReviews.length === 0) return;
    const clamped = ((index % communityReviews.length) + communityReviews.length) % communityReviews.length;
    testiSliderRef.current.scrollTo({ left: clamped * SLIDE_WIDTH, behavior: 'smooth' });
    setActiveSlide(clamped);
  }, [communityReviews.length]);

  const startAutoSlide = useCallback(() => {
    clearInterval(autoSlideTimer.current);
    autoSlideTimer.current = setInterval(() => {
      setActiveSlide(prev => {
        const next = (prev + 1) % (communityReviews.length || 1);
        if (testiSliderRef.current) {
          testiSliderRef.current.scrollTo({ left: next * SLIDE_WIDTH, behavior: 'smooth' });
        }
        return next;
      });
    }, 3200);
  }, [communityReviews.length]);

  useEffect(() => {
    if (!reviewsLoading && communityReviews.length > 0) {
      startAutoSlide();
    }
    return () => clearInterval(autoSlideTimer.current);
  }, [reviewsLoading, communityReviews.length, startAutoSlide]);

  const handleSliderHover = () => clearInterval(autoSlideTimer.current);
  const handleSliderLeave = () => startAutoSlide();

  const scrollPrev = () => {
    clearInterval(autoSlideTimer.current);
    goToSlide(activeSlide - 1);
    startAutoSlide();
  };
  const scrollNext = () => {
    clearInterval(autoSlideTimer.current);
    goToSlide(activeSlide + 1);
    startAutoSlide();
  };



  const currentProducts = useMemo(() => {
    if (viewMode === 'newArrivals') {
      return allProducts.filter(p => p.newArrival === true);
    }
    if (viewMode === 'bestSellers') {
      return [...allProducts].sort((a, b) => {
        const salesA = Number(a.salesCount) || 0;
        const salesB = Number(b.salesCount) || 0;
        if (salesB !== salesA) {
          return salesB - salesA;
        }
        const featA = a.featured ? 1 : 0;
        const featB = b.featured ? 1 : 0;
        return featB - featA;
      });
    }
    if (viewMode === 'onDiscount') {
      return allProducts.filter(p => {
        const discountPercent = Number(p.discountPercent) || 0;
        return discountPercent > 0 && (!p.offerExpiresAt || new Date(p.offerExpiresAt) > new Date());
      });
    }
    return allProducts;
  }, [viewMode, allProducts]);

  const filteredByCategory = useMemo(() => {
    if (activeCategory === 'all') return currentProducts;
    return currentProducts.filter(product => {
      const catId = typeof product.category === 'object' ? product.category?._id : product.category;
      return catId === activeCategory;
    });
  }, [currentProducts, activeCategory]);

  const sortedProducts = useMemo(() => {
    if (priceSort === 'low-high') return [...filteredByCategory].sort((a, b) => a.price - b.price);
    if (priceSort === 'high-low') return [...filteredByCategory].sort((a, b) => b.price - a.price);
    return filteredByCategory;
  }, [filteredByCategory, priceSort]);

  const handleFilterClick = (mode) => {
    setViewMode(mode);
    setActiveCategory('all');
    setPriceSort('none');
  };

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    setViewMode('all');
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/contact', contactForm);
      setContactStatus('Message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
      setTimeout(() => setContactStatus(''), 5000);
    } catch (err) {
      setContactStatus('Error sending message. Try again.');
      setTimeout(() => setContactStatus(''), 5000);
    }
  };

  // Removed full-page loader

  return (
    <>
      <Helmet>
        <title>GenZ Skin Studio – Skincare for the New Generation</title>
        <meta name="description" content="Clean, cruelty-free skincare for the new generation. Shop our curated range of dermatologist-tested products. Standard shipping PKR 150 Nationwide." />
        <meta name="keywords" content="skincare, clean beauty, cruelty-free, vegan skincare, GenZ Skin Studio, Pakistan" />
        <meta property="og:title" content="GenZ Skin Studio – Skincare for the New Generation" />
        <meta property="og:description" content="Clean, cruelty-free skincare for the new generation. Shop now." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/favicon.png" />
        <link rel="canonical" href="https://genzskinstudio.com" />
        <html lang="en" />
      </Helmet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f5f5f5; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #999; }
        * { scrollbar-width: thin; scrollbar-color: #ccc #f5f5f5; }

        .loader-ring {
          width: 44px; height: 44px;
          border: 2px solid #eee; border-top-color: #000;
          border-radius: 50%; animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.94) translateY(14px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .anim-scale-in { animation: scaleIn 0.55s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-fade-up  { animation: fadeUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }

        /* ── CARD ENTRANCE STAGGER ── */
        .ref-card-wrap { animation: scaleIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .ref-card-wrap:nth-child(1)  { animation-delay: 0.04s; }
        .ref-card-wrap:nth-child(2)  { animation-delay: 0.10s; }
        .ref-card-wrap:nth-child(3)  { animation-delay: 0.16s; }
        .ref-card-wrap:nth-child(4)  { animation-delay: 0.22s; }
        .ref-card-wrap:nth-child(5)  { animation-delay: 0.28s; }
        .ref-card-wrap:nth-child(6)  { animation-delay: 0.34s; }
        .ref-card-wrap:nth-child(7)  { animation-delay: 0.40s; }
        .ref-card-wrap:nth-child(8)  { animation-delay: 0.46s; }
        .ref-card-wrap:nth-child(9)  { animation-delay: 0.52s; }
        .ref-card-wrap:nth-child(n+10){ animation-delay: 0.56s; }

        /* ── SIDEBAR ── */
        .ref-sidebar { background: #fff; padding: 0; }
        .ref-sidebar-title { font-size: 1.1rem; font-weight: 700; color: #111; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .ref-sidebar-title svg { width: 18px; height: 18px; color: #111; }
        .ref-cat-list { list-style: none; padding: 0; margin: 0 0 24px 0; }
        .ref-cat-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.85rem; color: #555; font-weight: 500; margin-bottom: 2px; }
        .ref-cat-item:hover { background: #f5f5f5; color: #111; }
        .ref-cat-item.active { background: #f5f5f5; color: #111; font-weight: 600; }
        .ref-cat-item .cat-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: #888; }
        .ref-cat-item.active .cat-icon { color: #111; }
        .ref-cat-item .cat-badge { margin-left: auto; background: #0f0f0f; color: #fff; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; min-width: 24px; text-align: center; }
        .ref-cat-item .cat-arrow { margin-left: auto; color: #aaa; font-size: 0.7rem; transition: transform 0.2s ease; }
        .ref-cat-item:hover .cat-arrow { color: #666; }
        .ref-filter-list { list-style: none; padding: 0; margin: 0; }
        .ref-filter-item { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-size: 0.85rem; color: #555; font-weight: 500; margin-bottom: 2px; }
        .ref-filter-item:hover { background: #f5f5f5; color: #111; }
        .ref-filter-item.active { background: #f5f5f5; color: #111; font-weight: 600; }
        .ref-filter-item .filter-icon { width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; color: #888; }
        .ref-filter-item.active .filter-icon { color: #111; }
        .ref-filter-item .filter-arrow { margin-left: auto; color: #aaa; font-size: 0.7rem; }

        /* ── PRODUCT CARDS ── */
        .ref-card-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        @media (max-width:1200px) { .ref-card-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width:768px)  { .ref-card-grid { grid-template-columns: repeat(2,1fr); gap: 12px; } }
        @media (max-width:480px)  { .ref-card-grid { grid-template-columns: 1fr; } }

        .ref-card { background:#fff; border-radius:14px; border:1px solid #e8e8e8; overflow:hidden; transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.25s ease; position:relative; height:100%; display:flex; flex-direction:column; box-shadow: 0 2px 10px rgba(0,0,0,0.03); max-width: 270px; width: 100%; margin: 0 auto; }
        .ref-card:hover { border-color:#0f0f0f; box-shadow: 0 16px 36px rgba(0,0,0,0.10); transform:translateY(-6px); }
        .ref-card-tag { position:absolute; top:10px; right:10px; background:#0f0f0f; color:#fff; font-size:0.62rem; font-weight:700; padding:4px 8px; border-radius:4px; letter-spacing:0.06em; text-transform:uppercase; z-index:3; pointer-events:none; animation: fadeIn 0.4s ease both; }
        
        .ref-card-img-wrap { width:100% !important; height:220px; background:#ffffff; position:relative; display:block; overflow:hidden; }
        .ref-card-img-wrap img { width:100% !important; height:100% !important; object-fit:contain !important; padding: 4px; transition:transform 0.65s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease; }
        .ref-card-img-hover { position:absolute; top:0; left:0; width:100% !important; height:100% !important; object-fit:contain !important; padding: 4px; opacity:0; transition:opacity 0.3s ease; }
        .ref-card:hover .ref-card-img-wrap img { transform:scale(1.08); }
        .ref-card:hover .has-hover-image .ref-card-img-primary { opacity:0; }
        .ref-card:hover .ref-card-img-hover { opacity:1; }
        
        .ref-card-body { padding:12px; flex-grow:1; display:flex; flex-direction:column; }
        
        .ref-card-details-row { display:flex; justify-content:space-between; align-items:flex-start; gap:8px; margin-bottom:10px; }
        .ref-card-details-left { flex:1; min-width:0; }
        .ref-card-details-right { display:flex; flex-direction:column; align-items:flex-end; text-align:right; flex-shrink:0; }
        
        .ref-card-name { font-size:0.85rem; font-weight:700; color:#0f0f0f; margin:0 0 4px 0; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; height:2.6em; transition:color 0.2s ease; }
        .ref-card-name:hover { color:#444; }
        
        .ref-timer-badge { background:#0f0f0f; border-radius:4px; padding:2px 6px; font-size:0.62rem; font-weight:700; color:#ffffff; font-family:monospace; margin-bottom:4px; display:inline-block; white-space:nowrap; letter-spacing:0.02em; }
        
        .ref-card-meta { display:flex; align-items:center; gap:4px; margin-bottom:0; }
        .ref-card-price { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
        .ref-card-price-original { font-size:0.72rem; text-decoration:line-through; color:#999; font-weight:400; }
        .ref-card-price-sale { font-size:0.95rem; font-weight:800; color:#0f0f0f; margin:0; }
        .ref-card-price-regular { font-size:0.95rem; font-weight:800; color:#0f0f0f; margin:0; }
        
        .ref-card-actions { margin-top:auto; display:flex; gap:6px; align-items:center; width:100%; }
        
        .ref-btn-cart {
          flex:1; padding:7px 12px; border-radius:20px;
          border:1.5px solid #0f0f0f; background:#fff; color:#0f0f0f;
          font-size:0.72rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase;
          cursor:pointer; text-align:center; position: relative; overflow: hidden;
          transition: all 0.28s cubic-bezier(0.16,1,0.3,1);
        }
        .ref-btn-cart::after {
          content: ''; position:absolute; inset:0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%);
          background-size: 200% 100%; background-position: -200% center;
          transition: background-position 0.5s ease;
        }
        .ref-btn-cart:hover { background:#0f0f0f; color:#fff; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); }
        .ref-btn-cart:hover::after { background-position: 200% center; }
        .ref-btn-cart:disabled { border-color:#ccc; color:#ccc; background:#fff; cursor:not-allowed; box-shadow:none; }
        .ref-btn-buy  { flex:1; padding:7px 12px; border-radius:20px; border:1.5px solid #0f0f0f; background:#0f0f0f; color:#fff; font-size:0.72rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; cursor:pointer; transition:all 0.28s ease; text-align:center; text-decoration:none; }
        .ref-btn-buy:hover { background:#333; transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.15); color:#fff; }
 
        .stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #dc3545;
          color: #fff;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.62rem;
          font-weight: 700;
          z-index: 3;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
 
        .ref-wishlist-btn { position:absolute; top:10px; left:10px; width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.9); border:1px solid #e0e0e0; display:flex; align-items:center; justify-content:center; cursor:pointer; z-index:4; font-size:1rem; transition:all 0.2s ease; color:#888; padding:0; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .ref-wishlist-btn:hover { transform:scale(1.12); background:#0f0f0f; color:#fff; border-color:#0f0f0f; }
        .ref-wishlist-btn.active { color:#fff; background:#0f0f0f; border-color:#0f0f0f; }
        .ref-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .ref-section-header > button.btn-dark { display:none; }
        .ref-section-title { font-size:1.3rem; font-weight:600; color:#111; }
        .ref-section-count { font-size:0.8rem; color:#888; font-weight:500; }
        .ref-empty { text-align:center; padding:60px 20px; background:#fafafa; border:1px dashed #ddd; border-radius:16px; grid-column:1/-1; }
        .ref-empty-icon { font-size:2rem; margin-bottom:12px; }
        .ref-empty p { color:#888; margin-bottom:12px; font-size:0.9rem; }
        .ref-empty-btn { padding:10px 24px; border-radius:24px; border:1px solid #111; background:#111; color:#fff; font-size:0.8rem; font-weight:600; cursor:pointer; }
        .ref-sort-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 100px;
          padding: 5px 5px 5px 14px;
        }
        .ref-sort-label {
          font-size: 0.72rem;
          font-weight: 600;
          color: #666;
          white-space: nowrap;
          letter-spacing: 0.02em;
        }
        .ref-sort-select {
          border: none;
          background: transparent;
          font-size: 0.78rem;
          color: #333;
          cursor: pointer;
          outline: none;
          padding: 4px 28px 4px 6px;
          -webkit-appearance: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 6px center;
          font-weight: 500;
        }
        .ref-sort-select:focus { outline: none; }
        @media (max-width: 576px) {
          .ref-sort-wrap { padding: 4px 4px 4px 10px; }
          .ref-sort-label { display: none; }
          .ref-sort-select { font-size: 0.75rem; }
        }

        /* ── QUICK VIEW / HOME NEWSLETTER STYLES ── */
        .ref-quick-view-btn {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translate(-50%, 10px);
          background: rgba(255,255,255,0.95);
          border: 1px solid #e8e8e8;
          color: var(--ink);
          font-size: 0.72rem;
          font-weight: 600;
          padding: 6px 16px;
          border-radius: 20px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 3;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .ref-card:hover .ref-quick-view-btn {
          opacity: 1;
          transform: translate(-50%, 0);
        }
        .ref-quick-view-btn:hover {
          background: var(--ink);
          color: #fff;
          border-color: var(--ink);
        }

        .premium-newsletter-section {
          background: #fff;
          padding: 90px 0;
          border-top: 1px solid var(--pink-border);
          position: relative;
        }
        .newsletter-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 10px;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: var(--pink-accent);
          margin-bottom: 12px;
          display: block;
          font-weight: 600;
        }
        .newsletter-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          letter-spacing: 0.04em;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 14px;
        }
        .newsletter-sub {
          font-size: 0.95rem;
          color: var(--ink-light);
          max-width: 500px;
          margin: 0 auto 36px;
          line-height: 1.8;
          font-weight: 300;
        }
        .home-newsletter-form {
          display: flex;
          max-width: 500px;
          margin: 0 auto;
          background: #fff;
          border: 1.5px solid var(--pink-border);
          border-radius: 40px;
          padding: 6px 6px 6px 20px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(212, 96, 138, 0.05);
        }
        .home-newsletter-form:focus-within {
          border-color: var(--pink-accent);
          box-shadow: 0 10px 30px rgba(212, 96, 138, 0.12);
        }
        .home-newsletter-form input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.9rem;
          color: var(--ink);
          font-family: 'DM Sans', sans-serif;
          background: transparent;
        }
        .home-newsletter-form input::placeholder {
          color: #aaa;
        }
        .home-newsletter-form button {
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 30px;
          padding: 10px 26px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .home-newsletter-form button:hover {
          background: var(--pink-accent);
          transform: scale(1.02);
        }

        .premium-quick-view-modal .modal-content {
          border-radius: 20px !important;
          border: none;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }
        .qv-close-btn {
          position: absolute;
          top: 15px;
          right: 20px;
          background: rgba(255,255,255,0.9);
          border: 1px solid #eee;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1.25rem;
          color: var(--ink);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .qv-close-btn:hover {
          background: var(--ink);
          color: #fff;
          transform: scale(1.05);
        }
        .qv-tag {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--pink-accent);
          font-weight: 700;
        }
        .qv-title {
          font-size: 2.2rem;
          letter-spacing: 0.02em;
          color: var(--ink);
          line-height: 1;
        }
        .qv-price-row {
          display: flex;
          align-items: baseline;
          color: var(--ink);
        }
        .qv-currency {
          font-size: 0.72rem;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .qv-price {
          font-weight: 800;
        }
        .qv-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .qv-detail-item {
          background: var(--pink-soft);
          border: 1px solid var(--pink-border);
          border-radius: 12px;
          padding: 10px 14px;
        }
        .qv-detail-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink);
          display: block;
          margin-bottom: 4px;
        }
        .qv-detail-text {
          font-size: 0.76rem;
          color: #555;
          margin: 0;
          line-height: 1.5;
        }
        .qv-action-btn-cart {
          flex: 1;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 30px;
          height: 44px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .qv-action-btn-cart:hover {
          background: var(--pink-accent);
          transform: translateY(-1px);
        }
        .qv-action-btn-view {
          flex: 1.2;
          background: #fff;
          color: var(--ink);
          border: 1px solid var(--pink-border);
          border-radius: 30px;
          height: 44px;
          font-size: 0.78rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .qv-action-btn-view:hover {
          border-color: var(--ink);
          background: var(--pink-soft);
        }
        .qv-img-zoom:hover {
          transform: scale(1.05);
        }

        /* ── HERO ── */
        .hero-section { 
          position:relative; 
          width: 100%; 
          overflow:hidden; 
          background:#000; 
          padding: 0; 
          margin-top: 12px; 
        }
        .hero-bg { 
          width: 100%; 
          display: block;
          transform:scale(1); 
        }
        .hero-grain { position:absolute; inset:0; opacity:0.04; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); pointer-events:none; }
        .hero-gradient { position:absolute; inset:0; background:linear-gradient(180deg,rgba(0,0,0,0.3) 0%,rgba(0,0,0,0.1) 40%,rgba(0,0,0,0.8) 100%); }
        .hero-dots {
          position: absolute;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 10px;
          z-index: 10;
        }
        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .hero-dot.active {
          background: #ffffff;
          transform: scale(1.3);
          box-shadow: 0 0 8px rgba(255,255,255,0.6);
        }
        .hero-line { height:1px; background:linear-gradient(90deg,#fff,transparent); animation:lineGrow 1.5s cubic-bezier(0.16,1,0.3,1) 0.6s both; }
        .hero-tag { display:inline-block; border:1px solid rgba(255,255,255,0.2); padding:6px 16px; border-radius:100px; font-size:0.7rem; letter-spacing:0.2em; text-transform:uppercase; color:rgba(255,255,255,0.6); backdrop-filter:blur(4px); background:rgba(255,255,255,0.05); }
        .hero-title {
          font-family: 'Bebas Neue', 'Arial Narrow', Arial, sans-serif;
          font-size: clamp(2.8rem, 7vw, 5.5rem);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: 0.06em;
          color: #fff;
          text-transform: uppercase;
          margin: 0;
        }
        .hero-title .outline-text {
          -webkit-text-stroke: 2px #fff;
          color: transparent;
          display: block;
        }
        .hero-content-col { padding-right: 16px; }
        .hero-btn { display:inline-flex; align-items:center; gap:10px; padding:14px 32px; background:#fff; color:#000; border:none; border-radius:100px; font-weight:600; font-size:0.9rem; letter-spacing:0.02em; cursor:pointer; transition:all 0.4s cubic-bezier(0.16,1,0.3,1); position:relative; overflow:hidden; }
        .hero-btn::before { content:''; position:absolute; inset:0; background:#000; transform:translateX(-101%); transition:transform 0.4s cubic-bezier(0.16,1,0.3,1); }
        .hero-btn:hover::before { transform:translateX(0); }
        .hero-btn:hover { color:#fff; }
        .hero-btn span { position:relative; z-index:1; }
        .hero-btn svg { position:relative; z-index:1; transition:transform 0.3s ease; }
        .hero-btn:hover svg { transform:translateX(4px); }
        .hero-scroll-hint { position:absolute; bottom:40px; left:50%; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; color:rgba(255,255,255,0.3); font-size:0.65rem; letter-spacing:0.2em; text-transform:uppercase; animation:float 2.5s ease-in-out infinite; }
        .hero-scroll-hint .line { width:1px; height:40px; background:linear-gradient(to bottom,rgba(255,255,255,0.4),transparent); }
        .hero-side-text { position:absolute; right:40px; top:50%; transform:translateY(-50%) rotate(90deg); font-size:0.6rem; letter-spacing:0.3em; text-transform:uppercase; color:rgba(255,255,255,0.2); white-space:nowrap; }
        .gz-hero-search {
          display: flex;
          align-items: center;
          gap: 0;
          width: 100%;
          max-width: 420px;
          margin-top: 20px;
          margin-bottom: 30px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 100px;
          padding: 5px 5px 5px 18px;
          backdrop-filter: blur(8px);
        }
        .gz-hero-search:focus-within {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.15);
        }
        .gz-hero-search-input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #fff;
          min-width: 0;
          padding: 10px 12px;
        }
        .gz-hero-search-input::placeholder { color: rgba(255,255,255,0.45); }
        .gz-hero-search-btn {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: #fff;
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.2s, background 0.2s;
        }
        .gz-hero-search-btn:hover { transform: scale(1.05); background: #f0f0f0; }
        @keyframes lineGrow { from { width:0; } to { width:100%; } }
        @keyframes float { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }

        /* ── MARQUEE ── */
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .marquee-strip { overflow:hidden; background:#fff; padding:14px 0; border-top:1px solid #eee; border-bottom:1px solid #eee; }
        .marquee-inner { display:flex; width:max-content; animation:marquee 25s linear infinite; }
        .marquee-inner span { display:inline-flex; align-items:center; gap:24px; padding:0 24px; font-size:0.75rem; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; color:#111; white-space:nowrap; }
        .marquee-inner span::before { content:'✦'; font-size:0.5rem; opacity:0.4; }

        /* ── TESTIMONIALS (AUTO-SLIDER) ── */
        .testimonials-section { background:#ffffff !important; padding:100px 0; position:relative; }
        .testimonials-section::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:#ebebeb; }
        .testi-eyebrow { font-family:'DM Sans',sans-serif; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:#999; margin-bottom:12px; display:block; }
        .testi-heading { font-family:'Bebas Neue',sans-serif; font-size:clamp(2.4rem,5vw,3.8rem); letter-spacing:0.04em; color:#0f0f0f; line-height:1; margin-bottom:8px; }
        .testi-heading .testi-outline { -webkit-text-stroke:2px #0f0f0f; color:transparent; }
        .testi-sub { font-size:0.9rem; color:#777; font-weight:300; margin-bottom:56px; }

        .testi-card { background:#ffffff; border:1px solid #e8e8e8; border-radius:20px; padding:32px 28px; transition:all 0.3s cubic-bezier(0.16,1,0.3,1); position:relative; height:100%; box-shadow:0 4px 16px rgba(0,0,0,0.04); }
        .testi-card:hover { border-color:#0f0f0f; transform:translateY(-5px); box-shadow:0 20px 48px rgba(0,0,0,0.08); }
        .testi-card-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .testi-stars { display:flex; gap:3px; }
        .testi-stars svg { width:14px; height:14px; fill:#ffd700; color:#ffd700; }
        .testi-quote-mark { font-family:Georgia,serif; font-size:3.5rem; color:rgba(0,0,0,0.06); line-height:1; margin-top:-8px; }
        .testi-text { font-size:0.9rem; color:#111; line-height:1.8; font-weight:700; margin-bottom:24px; font-style:italic; }
        .testi-divider { height:1px; background:rgba(0,0,0,0.08); margin-bottom:20px; }
        .testi-author { display:flex; align-items:center; gap:12px; }
        .testi-name { font-size:0.88rem; font-weight:700; color:#111; margin:0 0 2px; }
        .testi-role { font-size:0.72rem; color:#888; margin:0; letter-spacing:0.08em; text-transform:uppercase; }
        .testi-verified { margin-left:auto; display:flex; align-items:center; gap:4px; font-size:0.7rem; color:#111; font-weight:600; }
        .testi-verified svg { width:13px; height:13px; }

        /* Auto slider */
        .testi-slider-wrap { position:relative; }
        .testi-slider {
          display:flex; overflow-x:auto; gap:24px; padding:20px 4px 32px;
          scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;
          scroll-behavior:smooth;
        }
        .testi-slider::-webkit-scrollbar { height:4px; }
        .testi-slider::-webkit-scrollbar-track { background:rgba(0, 0, 0, 0.05); border-radius:10px; }
        .testi-slider::-webkit-scrollbar-thumb { background:#0f0f0f; border-radius:10px; }
        .testi-slide { flex:0 0 376px; scroll-snap-align:start; }
        @media (max-width:768px) { .testi-slide { flex:0 0 300px; } }
        @media (max-width:480px) { .testi-slide { flex:0 0 260px; } }

        /* Dot indicators */
        .testi-dots { display:flex; justify-content:center; gap:6px; margin-top:4px; }
        .testi-dot { width:6px; height:6px; border-radius:50%; background:rgba(0, 0, 0, 0.15); transition:all 0.3s ease; border:none; padding:0; cursor:pointer; }
        .testi-dot.active { width:20px; border-radius:4px; background:#0f0f0f; }

        .testi-nav-btn { background:transparent; border:1.5px solid #0f0f0f; color:#0f0f0f; width:40px; height:40px; border-radius:50%; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; transition:all 0.25s ease; }
        .testi-nav-btn:hover { background:#0f0f0f; color:#fff; box-shadow:0 4px 12px rgba(0,0,0,0.1); }

        /* ── ABOUT ── */
        .about-section { background:#f8f8f8; padding:100px 0; position:relative; overflow:hidden; }
        .about-section::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:#ebebeb; }
        .about-inner { display:grid; grid-template-columns:1fr 1fr; gap:80px; align-items:center; }
        @media (max-width:768px) { .about-inner { grid-template-columns:1fr; gap:40px; } }
        .about-left-label { font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:#999; margin-bottom:16px; display:flex; align-items:center; gap:10px; }
        .about-left-label::after { content:''; flex:1; height:1px; background:#e0e0e0; }
        .about-left-heading { font-family:'Bebas Neue',sans-serif; font-size:clamp(2.8rem,5vw,4.5rem); color:#1a202c; letter-spacing:0.03em; line-height:1; margin-bottom:24px; }
        .about-left-heading .about-outline { -webkit-text-stroke:2px #1a202c; color:transparent; }
        .about-left-text { font-size:0.95rem; color:#666; line-height:1.9; font-weight:300; margin-bottom:36px; }
        .about-cta-link { display:inline-flex; align-items:center; gap:10px; font-size:0.82rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:#1a202c; text-decoration:none; border-bottom:2px solid #1a202c; padding-bottom:4px; transition:gap 0.2s ease; }
        .about-cta-link:hover { gap:16px; color:#1a202c; }
        .about-cta-link svg { width:16px; height:16px; }
        .about-stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px; }
        .about-stat-box { background:#fff; padding:32px 28px; transition:background 0.2s ease; }
        .about-stat-box:hover { background:#f5f5f5; }
        .about-stat-box:first-child { border-radius:16px 0 0 0; }
        .about-stat-box:nth-child(2) { border-radius:0 16px 0 0; }
        .about-stat-box:nth-child(3) { border-radius:0 0 0 16px; }
        .about-stat-box:last-child  { border-radius:0 0 16px 0; }
        .about-stat-num { font-family:'Bebas Neue',sans-serif; font-size:3rem; color:#1a202c; letter-spacing:0.02em; line-height:1; margin-bottom:6px; }
        .about-stat-lbl { font-size:0.72rem; letter-spacing:0.14em; text-transform:uppercase; color:#aaa; font-weight:600; }

        /* ── CTA / GLOW SQUAD (BLACK & WHITE, NO BORDERS) ── */
        .cta-section {
          background: #000;
          padding: 100px 0;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.03) 0%, transparent 70%);
          pointer-events: none;
        }
        .cta-card {
          background: #fff;
          border-radius: 32px;
          padding: 70px 50px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.2);
          max-width: 800px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .cta-inner { text-align:center; }
        .cta-eyebrow {
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #666;
          display: block;
          margin-bottom: 16px;
        }
        .cta-heading {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 6vw, 4.8rem);
          color: #000;
          letter-spacing: 0.04em;
          line-height: 1;
          margin-bottom: 4px;
        }
        .cta-heading .cta-accent {
          color: #000;
          font-weight: 700;
        }
        .cta-divider {
          width: 60px; height: 2px;
          background: #000;
          margin: 20px auto;
          border-radius: 2px;
        }
        .cta-desc {
          font-size: 0.95rem;
          color: #555;
          max-width: 500px;
          margin: 0 auto 40px;
          line-height: 1.8;
          font-weight: 400;
        }
        .cta-form {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 500px;
          margin: 0 auto;
          background: #f5f5f5;
          border-radius: 100px;
          padding: 6px;
          transition: all 0.3s ease;
        }
        .cta-form:focus-within {
          background: #fff;
          box-shadow: 0 0 0 2px #000;
        }
        .cta-input-new {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: #000;
          font-weight: 400;
          padding: 6px 14px;
        }
        .cta-input-new::placeholder {
          color: #aaa;
        }
        .cta-submit {
          background: #000;
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 12px 28px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .cta-submit:hover {
          background: #333;
          transform: translateY(-1px);
        }
        .cta-perks {
          display: flex;
          justify-content: center;
          gap: 28px;
          margin-top: 36px;
          flex-wrap: wrap;
        }
        .cta-perk {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: #666;
        }
        .cta-perk-icon {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cta-perk-icon svg {
          width: 13px;
          height: 13px;
          color: #000;
        }

        /* ── RECOMMENDATIONS ── */
        .pin-scroll { display:flex; overflow-x:auto; gap:18px; padding-bottom:12px; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch; }
        .pin-scroll::-webkit-scrollbar { height:4px; }
        .pin-scroll::-webkit-scrollbar-track { background:#eee; border-radius:2px; }
        .pin-scroll::-webkit-scrollbar-thumb { background:#ccc; border-radius:2px; }
        .pin-scroll-item { scroll-snap-align:start; flex:0 0 260px; animation:scaleIn 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @media (max-width:768px) {
          .pin-scroll {
            padding: 0 10px 12px 10px;
            margin-left: -10px;
            margin-right: -10px;
          }
        }

        body { background:#ffffff !important; color:#000; }

        @media (max-width:768px) {
          .hero-section {
            height: auto !important;
            min-height: auto !important;
            padding: 0 !important;
            margin-top: 10px !important;
          }
          .hero-bg {
            background-position: center center !important;
            background-size: 100% 100% !important;
          }
          .hero-content-col { padding-left: 20px; padding-right: 20px; }
          .hero-tag {
            font-size: 0.6rem !important;
            padding: 4px 10px !important;
            letter-spacing: 0.14em !important;
            margin-bottom: 0px;
          }
          .hero-line { display: none !important; }
          .hero-title {
            font-size: clamp(1.6rem, 8vw, 2.2rem) !important;
            line-height: 1.15 !important;
            letter-spacing: 0.06em !important;
            margin-top: 10px !important;
            margin-bottom: 8px !important;
          }
          .hero-title .outline-text {
            -webkit-text-stroke: 1px #fff;
            margin: 0.04em 0;
          }
          .hero-subtitle {
            font-size: 0.8rem !important;
            line-height: 1.45 !important;
            margin-top: 0 !important;
            margin-bottom: 12px !important;
            padding-right: 8px;
            max-width: 280px !important;
          }
          .gz-hero-search {
            max-width: 100%;
            margin-top: 14px;
            margin-bottom: 24px;
            padding: 4px 4px 4px 14px;
          }
          .gz-hero-search-input {
            font-size: 0.82rem !important;
            padding: 8px 8px !important;
          }
          .gz-hero-search-btn {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }
          .hero-cta-wrap { margin-top: 28px !important; }
          .hero-btn { padding: 10px 20px !important; font-size: 0.78rem !important; }
          .hero-scroll-hint { display: none !important; }
          .ref-card-grid { grid-template-columns:repeat(2,1fr); gap:12px; }
          .ref-card-img-wrap { height:160px; }
          .ref-card-img-hover { inset:0; }
          .ref-card-body { padding:8px; }
          .ref-card-details-row { gap:4px; margin-bottom:6px; }
          .ref-card-name { font-size:0.78rem; height:2.6em; }
          .ref-timer-badge { font-size:0.58rem; padding:1px 4px; }
          .ref-card-price { gap:1px; }
          .ref-card-price-original { font-size:0.65rem; }
          .ref-card-price-sale, .ref-card-price-regular { font-size:0.85rem; }
          .ref-sidebar { margin-bottom:20px; }
          .ref-card-actions { flex-direction:row !important; gap:4px; }
          .ref-btn-cart, .ref-btn-buy { padding:5px 8px; font-size:0.65rem; }
          .pin-scroll-item { flex: 0 0 calc(50vw - 21px) !important; max-width: calc(50vw - 21px) !important; }
          .testi-card { padding: 20px 16px !important; }
          .testi-text { font-size: 0.8rem !important; margin-bottom: 14px !important; }
          .testi-name { font-size: 0.78rem !important; }
          .testi-slide { flex: 0 0 260px; }
          .testi-sub { margin-bottom: 24px !important; font-size: 0.8rem !important; }
          .cta-card { padding:40px 20px; }
          .cta-form { flex-direction:column; border-radius:20px; padding:12px; gap:10px; }
          .cta-input-new { width:100%; text-align:center; }
          .cta-submit { width:100%; text-align:center; }
          .testimonials-section, .about-section { padding:64px 0; }
 
          .ref-cat-list { display:flex !important; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding: 0 10px 8px 10px; margin-left: -10px; margin-right: -10px; margin-bottom:16px; scrollbar-width:none; }
          .ref-cat-list::-webkit-scrollbar { display:none; }
          .ref-cat-item { flex:0 0 auto; margin-bottom:0 !important; padding:6px 14px !important; background:#f5f5f5; border-radius:20px !important; font-size:0.95rem; font-weight:600; }
          .ref-cat-item .cat-arrow { display:none !important; }
          .ref-filter-list { display:flex !important; gap:8px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding: 0 10px 8px 10px; margin-left: -10px; margin-right: -10px; margin-bottom:16px; scrollbar-width:none; }
          .ref-filter-list::-webkit-scrollbar { display:none; }
          .ref-filter-item { flex:0 0 auto; margin-bottom:0 !important; padding:6px 14px !important; background:#f5f5f5; border-radius:20px !important; font-size:0.8rem; }
          .ref-filter-item .filter-arrow { display:none !important; }
          .ref-sort-wrap { margin-top: 12px; width: 100%; max-width: 100%; }
          .ref-sort-select { max-width: 280px; }
        }
        @media (max-width:480px) {
          .hero-title {
            font-size: clamp(1.7rem, 10vw, 2.2rem) !important;
            line-height: 1.22 !important;
            letter-spacing: 0.06em !important;
          }
          .hero-tag { font-size: 0.58rem !important; }
          .ref-card-grid { grid-template-columns:repeat(2,1fr); gap:10px; }
          .ref-card-img-wrap { height:160px; }
          .ref-card-img-hover { inset:0; }
          .ref-card-name { font-size:0.75rem !important; height:2.6em; }
          .ref-timer-badge { font-size:0.55rem; padding:1px 3px; }
          .ref-card-price-original { font-size:0.6rem; }
          .ref-card-price-sale, .ref-card-price-regular { font-size:0.8rem !important; }
          .ref-btn-cart, .ref-btn-buy { font-size:0.62rem !important; padding:5px 6px !important; }
          .pin-scroll-item { flex: 0 0 calc(50vw - 20px) !important; max-width: calc(50vw - 20px) !important; }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* ── HERO ── */}
      <section className="hero-section">
        {/* Banner Slider Background */}
        {(() => {
          const banners = heroData?.bannerImages?.length
            ? heroData.bannerImages
            : heroData?.bgImage
              ? [heroData.bgImage]
              : ['/final.png'];
          return (
            <>
              {banners.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Banner ${i + 1}`}
                  className="hero-bg"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "low"}
                  style={{
                    opacity: i === heroSlideIndex ? 1 : 0,
                    transition: 'opacity 1.2s ease',
                    position: i === 0 ? 'relative' : 'absolute',
                    top: 0,
                    left: 0,
                    height: i === 0 ? 'auto' : '100%',
                    objectFit: 'contain'
                  }}
                />
              ))}
              {/* Navigation Dots */}
              {banners.length > 1 && (
                <div className="hero-dots">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      className={`hero-dot ${idx === heroSlideIndex ? 'active' : ''}`}
                      onClick={() => setHeroSlideIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          );
        })()}
        <div className="hero-grain" />
        <div className="hero-gradient" />
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {(marqueeTexts.length > 0 ? marqueeTexts.map(m => m.text) : ['Standard Shipping PKR 150 Nationwide','Clean Ingredients','Cruelty Free','Vegan Formulas','Dermatologist Tested','Sustainable Packaging','New Drops Weekly','Join The Movement']).map((t,i) => <span key={i}>{t}</span>)}
          {(marqueeTexts.length > 0 ? marqueeTexts.map(m => m.text) : ['Standard Shipping PKR 150 Nationwide','Clean Ingredients','Cruelty Free','Vegan Formulas','Dermatologist Tested','Sustainable Packaging','New Drops Weekly','Join The Movement']).map((t,i) => <span key={`d${i}`}>{t}</span>)}
        </div>
      </div>

      {/* ── SIDEBAR + PRODUCT GRID ── */}
      <section id="products-section" style={{ background: '#ffffff', padding: '12px 0 64px' }}>
        <Container>
          <Row className="g-4">
            <Col lg={3} md={4}>
              <div className="ref-sidebar">
                <div className="ref-sidebar-title">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Category
                </div>
                <ul className="ref-cat-list">
                  <li className={`ref-cat-item ${activeCategory === 'all' && viewMode === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick('all')}>
                    <span className="cat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg></span>
                    <span>All Product</span>
                    <span className="cat-badge">{currentProducts.length}</span>
                  </li>
                  {categories.map((cat) => {
                    const count = currentProducts.filter(p => { const cId = typeof p.category === 'object' ? p.category?._id : p.category; return cId === cat._id; }).length;
                    return (
                      <li key={cat._id} className={`ref-cat-item ${activeCategory === cat._id && viewMode === 'all' ? 'active' : ''}`} onClick={() => handleCategoryClick(cat._id)}>
                        <span className="cat-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
                        <span>{cat.name}</span>
                        <span className="cat-arrow">›</span>
                      </li>
                    );
                  })}
                </ul>
                <ul className="ref-filter-list">
                  <li className={`ref-filter-item ${viewMode === 'newArrivals' ? 'active' : ''}`} onClick={() => handleFilterClick('newArrivals')}>
                    <span className="filter-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></span>
                    <span>New Arrival</span>
                    <span className="filter-arrow">›</span>
                  </li>
                  <li className={`ref-filter-item ${viewMode === 'bestSellers' ? 'active' : ''}`} onClick={() => handleFilterClick('bestSellers')}>
                    <span className="filter-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span>
                    <span>Best Seller</span>
                    <span className="filter-arrow">›</span>
                  </li>
                  <li className={`ref-filter-item ${viewMode === 'onDiscount' ? 'active' : ''}`} onClick={() => handleFilterClick('onDiscount')}>
                    <span className="filter-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></span>
                    <span>On Discount</span>
                    <span className="filter-arrow">›</span>
                  </li>
                </ul>
              </div>
            </Col>

            <Col lg={9} md={8}>
              <div className="ref-section-header">
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <h5 className="ref-section-title" style={{ margin: 0 }}>
                    {viewMode === 'newArrivals' ? 'New Arrivals' : (viewMode === 'bestSellers' ? 'Best Sellers' : (viewMode === 'onDiscount' ? 'On Discount' : (activeCategory === 'all' ? 'All Products' : categories.find(c => c._id === activeCategory)?.name || 'Products')))}
                  </h5>
                  <span className="ref-section-count" style={{ fontSize: '0.8rem', color: '#888', fontWeight: 500 }}>({sortedProducts.length} items)</span>
                </div>
                <div className="ref-sort-wrap">
                  <span className="ref-sort-label">Sort by Price</span>
                  <select className="ref-sort-select" value={priceSort} onChange={(e) => setPriceSort(e.target.value)}>
                    <option value="none">Default</option>
                    <option value="low-high">Low to High</option>
                    <option value="high-low">High to Low</option>
                  </select>
                </div>
              </div>
              {loading ? (
                <div className="text-center py-5 w-100">
                  <div className="loader-ring m-auto" />
                  <p className="mt-2 text-muted" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>Loading Products...</p>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="ref-empty">
                  <div className="ref-empty-icon" style={{ display: 'block', marginBottom: '8px' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
                      <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
                      <polygon points="12 22.08 12 12 21 6.92 21 17.08 12 22.08" />
                      <polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                  </div>
                  <p>No products in this category yet</p>
                  <button className="ref-empty-btn" onClick={() => { setActiveCategory('all'); setViewMode('all'); }}>Browse all products</button>
                </div>
              ) : (
                <div className="ref-card-grid">
                  {sortedProducts.map((product, i) => (
                    <Reveal key={product._id} delay={0.04 + i * 0.05} y={20}>
                      <HomeProductCard
                        product={product}
                        getProductImageUrl={getProductImageUrl}
                        isInWishlist={isInWishlist}
                        toggleWishlist={toggleWishlist}
                        handleQuickView={handleQuickView}
                        addToCart={addToCart}
                        navigate={navigate}
                      />
                    </Reveal>
                  ))}
                </div>
              )}
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── RECOMMENDATIONS ── */}
      <section style={{ background: '#f8f8f8', padding: '48px 0 64px' }}>
        <Container>
          <Reveal>
            <div className="ref-section-header">
              <h5 className="ref-section-title">Explore Our Recommendations</h5>
              <Link to="/products" className="btn btn-dark text-white text-decoration-none" style={{ width:'100px', padding:'3px 5px' }}>View all</Link>
              <button className="btn btn-dark text-white" style={{ width:'100px', padding:'3px 5px' }}>View all ›</button>
            </div>
          </Reveal>
          <div className="pin-scroll">
            {(recommendedProducts.length > 0 ? recommendedProducts : newArrivals).slice(0, 8).map((product, i) => (
              <div key={product._id} className="pin-scroll-item" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                <HomeProductCard
                  product={product}
                  getProductImageUrl={getProductImageUrl}
                  isInWishlist={isInWishlist}
                  toggleWishlist={toggleWishlist}
                  handleQuickView={handleQuickView}
                  addToCart={addToCart}
                  navigate={navigate}
                  imgWrapHeight="160px"
                  nameFontSize="0.85rem"
                />
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── TESTIMONIALS — AUTO-SLIDING ── */}
      <section className="testimonials-section">
        <Container>
          <Reveal>
            <div className="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-3">
              <div>
                <span className="testi-eyebrow">Real Reviews</span>
                <h2 className="testi-heading" style={{ margin: 0 }}>WHAT OUR <span className="testi-outline">COMMUNITY</span> SAYS</h2>
              </div>
              {!reviewsLoading && communityReviews.length > 0 && (
                <div className="d-flex gap-2">
                  <button onClick={scrollPrev} className="testi-nav-btn" aria-label="Previous">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  </button>
                  <button onClick={scrollNext} className="testi-nav-btn" aria-label="Next">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              )}
            </div>
            <p className="testi-sub" style={{ marginBottom: '24px' }}>Trusted by thousands of skincare lovers across Pakistan</p>
          </Reveal>

          <div className="testi-slider-wrap">
            {reviewsLoading ? (
              <div className="text-center py-5">Loading reviews...</div>
            ) : communityReviews.length === 0 ? (
              <div className="text-center py-5">No reviews yet. Be the first to share your experience!</div>
            ) : (
              <>
                <div
                  className="testi-slider"
                  ref={testiSliderRef}
                  onMouseEnter={handleSliderHover}
                  onMouseLeave={handleSliderLeave}
                  onTouchStart={handleSliderHover}
                  onTouchEnd={handleSliderLeave}
                >
                  {communityReviews.map((review, i) => (
                    <div className="testi-slide" key={review._id || i}>
                      <motion.div
                        className="testi-card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.07 }}
                      >
                        <div className="testi-card-top">
                          <div className="testi-stars">
                            {[...Array(5)].map((_, s) => (
                              <svg key={s} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={s < review.rating ? '#ffd700' : 'none'} stroke={s < review.rating ? '#ffd700' : '#ddd'} />
                              </svg>
                            ))}
                          </div>
                          <div className="testi-quote-mark">"</div>
                        </div>
                        <p className="testi-text">{review.comment}</p>
                        <div className="testi-divider" />
                        <div className="testi-author">
                          <div>
                            <p className="testi-name">{review.userName}</p>
                            <p className="testi-role">reviewed {review.productName}</p>
                          </div>
                          <div className="testi-verified">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            Verified
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>

                {/* Dot indicators */}
                <div className="testi-dots">
                  {communityReviews.map((_, i) => (
                    <button key={i} className={`testi-dot ${i === activeSlide ? 'active' : ''}`} onClick={() => { clearInterval(autoSlideTimer.current); goToSlide(i); startAutoSlide(); }} />
                  ))}
                </div>
              </>
            )}
          </div>
        </Container>
      </section>
      {/* ── COMMUNITY MEDIA BANNER ── */}
      {heroData?.mediaBannerUrl && (
        <section style={{ background: '#fff', padding: '0 0 48px' }}>
          <Container>
            <div style={{
              overflow: 'hidden',
              background: '#000',
            }}>
              {heroData.mediaBannerType === 'video' ? (
                <video
                  src={heroData.mediaBannerUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: '100%', height: 'auto', maxHeight: '420px', display: 'block', objectFit: 'cover' }}
                />
              ) : (
                <img
                  src={heroData.mediaBannerUrl}
                  alt="Community Feature"
                  style={{ width: '100%', height: 'auto', maxHeight: '420px', display: 'block', objectFit: 'cover' }}
                />
              )}
            </div>
          </Container>
        </section>
      )}

      {/* ── ABOUT ── */}
      <section className="about-section">
        <Container>
          <div className="about-inner">
            <div>
              <Reveal>
                <div className="about-left-label">Our Story</div>
              </Reveal>
              <Reveal delay={0.1}>
                <h2 className="about-left-heading">BORN FOR<br />THE <span className="about-outline">NEW GEN</span></h2>
              </Reveal>
              <Reveal delay={0.2}>
                <p className="about-left-text">
                  We believe skincare should be simple, clean, and effective. No harsh chemicals, no false promises — just products that actually work for your skin. Every formula is dermatologist-tested, cruelty-free, and made with love for the planet.
                </p>
                <Link to="/about" className="about-cta-link">
                  Learn Our Story
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </Reveal>
            </div>
            <Reveal delay={0.15} y={15}>
              <div className="about-stats-grid">
                {[['New','Brand Launching 2026'],['100%','Clean Ingredients'],['0','Harmful Toxins'],['EST 2026','Made in Pakistan']].map(([num, lbl]) => (
                  <div key={lbl} className="about-stat-box">
                    <div className="about-stat-num">{num}</div>
                    <div className="about-stat-lbl">{lbl}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </Container>
      </section>



      {/* ── CONTACT ── */}
      <section id="contact-section" style={{ background: '#fff', padding: '64px 0', borderTop: '1px solid #ebebeb' }}>
        <Container>
          <Row className="justify-content-center">
            <Col md={6} className="text-center">
              <Reveal>
                <span className="testi-eyebrow" style={{ fontSize:'10px', letterSpacing:'0.25em' }}>Get in touch</span>
                <h2 className="testi-heading" style={{ fontSize:'clamp(2rem,4vw,2.6rem)' }}>CONTACT US</h2>
                <p className="testi-sub" style={{ marginBottom:'32px' }}>We'd love to hear from you. Ask us anything.</p>
              </Reveal>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <Reveal delay={0.1}>
                <form onSubmit={handleContactSubmit} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  <input type="text" placeholder="Your Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required style={{ padding:'12px 16px', border:'1px solid #e0e0e0', borderRadius:'40px', fontFamily:'DM Sans, sans-serif', outline:'none' }} />
                  <input type="email" placeholder="Your Email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} required style={{ padding:'12px 16px', border:'1px solid #e0e0e0', borderRadius:'40px', fontFamily:'DM Sans, sans-serif', outline:'none' }} />
                  <textarea rows="4" placeholder="Your Message" value={contactForm.message} onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })} required style={{ padding:'12px 16px', border:'1px solid #e0e0e0', borderRadius:'20px', fontFamily:'DM Sans, sans-serif', resize:'vertical', outline:'none' }} />
                  <button type="submit" className="hero-btn" style={{ background:'#1a202c', color:'#fff', alignSelf:'center', padding:'12px 32px' }}>
                    <span>Send Message</span>
                  </button>
                  {contactStatus && <p className="text-center mt-2" style={{ fontSize:'0.8rem', color: contactStatus.includes('success') ? '#2e7d32' : '#d32f2f' }}>{contactStatus}</p>}
                </form>
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── PRODUCT QUICK VIEW MODAL (PREMIUM) ── */}
      <Modal show={showQuickView} onHide={() => setShowQuickView(false)} size="lg" centered className="premium-quick-view-modal">
        <Modal.Body className="p-0 border-0 overflow-hidden" style={{ borderRadius: '20px', background: '#fff' }}>
          <button className="qv-close-btn" onClick={() => setShowQuickView(false)}>×</button>
          
          {qvLoading ? (
            <div className="text-center py-5" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <div className="loader-ring" />
              <p className="mt-3 text-muted small uppercase letter-spacing">Loading Product Details</p>
            </div>
          ) : quickViewProduct && (
            <Row className="g-0">
              <Col md={5} className="bg-light d-flex align-items-center justify-content-center p-4 position-relative" style={{ minHeight: '340px', background: 'var(--pink-soft) !important' }}>
                <img
                  src={getImageUrl(quickViewProduct)}
                  alt={quickViewProduct.name}
                  style={{ maxWidth: '100%', maxHeight: '280px', objectFit: 'contain', transition: 'transform 0.3s ease' }}
                  className="qv-img-zoom"
                />
              </Col>
              <Col md={7} className="p-4 p-md-5 d-flex flex-column justify-content-between">
                <div>
                  <span className="qv-tag text-uppercase">{quickViewProduct.category?.name || 'Skincare'}</span>
                  <h3 className="qv-title font-bebas mt-1 mb-2">{quickViewProduct.name}</h3>
                  
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div style={{ display: 'flex', gap: '2px', color: '#f5a623' }}>
                      {[1,2,3,4,5].map(star => (
                        <span key={star} style={{ color: star <= quickViewAvgRating ? '#d4608a' : '#ddd', fontSize: '16px' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink)' }}>{quickViewAvgRating.toFixed(1)} / 5</span>
                    <span className="text-muted small">({quickViewReviewsCount} reviews)</span>
                  </div>

                  <div className="qv-price-row mb-3">
                    <span className="qv-currency text-secondary uppercase font-size-xs mr-1">PKR</span>
                    <span className="qv-price font-weight-bold fs-4">{quickViewProduct.price.toLocaleString()}</span>
                  </div>

                  <p className="qv-desc text-muted small mb-4" style={{ lineHeight: 1.7 }}>
                    {quickViewProduct.description}
                  </p>
                  
                  {/* Detailed features if available */}
                  {(quickViewProduct.whyYoullLoveIt || quickViewProduct.perfectFor) && (
                    <div className="qv-details-grid mb-4">
                      {quickViewProduct.whyYoullLoveIt && (
                        <div className="qv-detail-item">
                          <span className="qv-detail-label d-flex align-items-center gap-1 mb-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc3545" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                            Why You'll Love It
                          </span>
                          <p className="qv-detail-text">{quickViewProduct.whyYoullLoveIt}</p>
                        </div>
                      )}
                      {quickViewProduct.perfectFor && (
                        <div className="qv-detail-item">
                          <span className="qv-detail-label d-flex align-items-center gap-1 mb-1">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffc107" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            Perfect For
                          </span>
                          <p className="qv-detail-text">{quickViewProduct.perfectFor}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="d-flex gap-3 mt-3">
                  <button
                    className="qv-action-btn-cart uppercase"
                    onClick={() => { addToCart(quickViewProduct); setShowQuickView(false); }}
                  >
                    Add To Cart
                  </button>
                  <button
                    className="qv-action-btn-view uppercase"
                    onClick={() => { navigate(`/product/${quickViewProduct._id}`); setShowQuickView(false); }}
                  >
                    View Reviews & Ingredients →
                  </button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <SideCart />

      {/* ── FOOTER — full width ── */}
      <div style={{ width: '100vw', position: 'relative', left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw' }}>
        <Footer />
      </div>
      </motion.div>
    </>
  );
};

export default Home;
