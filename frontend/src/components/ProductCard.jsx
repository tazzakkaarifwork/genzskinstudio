import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [timeLeft, setTimeLeft] = React.useState('');
  
  if (!product) return null;

  const nameLower = product.name?.toLowerCase() || '';
  const catNameLower = (typeof product.category === 'object' ? product.category?.name || '' : '').toLowerCase();
  
  const isWomen = nameLower.includes('women') || catNameLower.includes('women');
  const isMen = !isWomen && (nameLower.includes('men') || catNameLower.includes('men'));

  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && (!product.offerExpiresAt || new Date(product.offerExpiresAt) > new Date());
  const discountedPrice = hasDiscount ? product.price - (product.price * discountPercent / 100) : product.price;

  React.useEffect(() => {
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

  const getImageUrl = (raw) => {
    if (!raw) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (raw.startsWith('http')) return raw;
    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;
    if (typeof window !== 'undefined' && 
        (window.location.hostname.includes('genzskinstudio.com') || window.location.hostname.includes('www.genzskinstudio.com'))) {
      return `https://genzskinstudio.vercel.app${cleanPath}`;
    }
    return cleanPath;
  };

  // Use new dedicated card images, fallback to legacy images array
  const primaryImage = product.cardImage || product.images?.[0] || product.image;
  const hoverImage = product.cardHoverImage || product.images?.[1] || primaryImage;
  const imageUrl = getImageUrl(primaryImage);
  const hoverImageUrl = getImageUrl(hoverImage);
  const rating = product.avgRating || 0;
  const reviewsCount = product.reviewsCount || 0;
  const isFavorite = isInWishlist(product._id);

  return (
    <>
      <style>{`
         .gz-card {background:#fff;border:1px solid #e8e8e8;border-radius:12px;overflow:hidden;transition:all 0.4s cubic-bezier(0.16, 1, 0.3, 1);height:100%;display:flex;flex-direction:column;position:relative;box-shadow: 0 4px 12px rgba(0,0,0,0.02);max-width: 270px;width: 100%;margin: 0 auto;}
         .gz-card:hover{border-color: #b8860b; transform:translateY(-5px);box-shadow: 0 12px 30px rgba(184, 134, 11, 0.12);}
         
         .gz-wishlist-btn{position:absolute;top:10px;left:10px;background:rgba(255,255,255,0.9);border:1px solid #e0e0e0;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:4;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.2s ease;color:#888;padding:0;}
         .gz-wishlist-btn:hover{transform:scale(1.1);background:#fffbf0;color:#b8860b;border-color:#b8860b;}
         .gz-wishlist-btn.active{color:#b8860b;background:#fffbf0;border-color:#b8860b;}
        
         .offer-badge{position:absolute;top:10px;right:10px;background:linear-gradient(135deg,#b8860b 0%,#c9a84c 100%);color:#fff;font-size:0.62rem;font-weight:700;padding:4px 8px;border-radius:4px;letter-spacing:0.05em;text-transform:uppercase;z-index:3;pointer-events:none;}
         .out-of-stock-badge{position:absolute;top:10px;right:10px;background:#dc3545;color:#fff;font-size:0.62rem;font-weight:700;padding:4px 8px;border-radius:4px;letter-spacing:0.05em;text-transform:uppercase;z-index:3;pointer-events:none;}
        
        .gz-card-img-wrap{width:100% !important;height:220px;overflow:hidden;background:#ffffff;position:relative;display:block;}
        .gz-card-img{width:100% !important;height:100% !important;object-fit:contain !important;padding: 4px;display:block;transition:transform 0.6s cubic-bezier(0.16,1,0.3,1),opacity 0.25s ease;}
        .gz-card-img-hover{position:absolute;top:0;left:0;width:100% !important;height:100% !important;object-fit:contain !important;padding: 4px;opacity:0;transition:opacity 0.25s ease;}
        .gz-card:hover .gz-card-img{transform:scale(1.06);}
        .gz-card:hover .has-hover-image .gz-card-img{opacity:0;}
        .gz-card:hover .gz-card-img-hover{opacity:1;}
        
        .gz-card-body{padding:12px;display:flex;flex-direction:column;flex-grow:1;}
        
        .gz-card-details-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px;}
        .gz-card-details-left{flex:1;min-width:0;}
        .gz-card-details-right{display:flex;flex-direction:column;align-items:flex-end;text-align:right;flex-shrink:0;}
        
        .gz-card-name{font-size:0.85rem;font-weight:700;color:#0f0f0f;line-height:1.3;margin:0 0 4px 0;text-decoration:none;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;height:2.6em;transition:color 0.2s ease;}
        .gz-card-name:hover{color:#555;}
        
        .gz-timer-badge{background:#000000;border-radius:4px;padding:2px 6px;font-size:0.62rem;font-weight:700;color:#ffffff;font-family:monospace;margin-bottom:4px;display:inline-block;white-space:nowrap;letter-spacing:0.02em;}
        
        .gz-card-rating{display:flex;align-items:center;gap:4px;margin-bottom:0;}
        .gz-stars{display:flex;gap:1px;}
        .gz-star{font-size:10px;}
        .gz-star.filled{color:#ffb800;}
        .gz-star.empty{color:#e0e0e0;}
        .gz-reviews-count{font-size:0.68rem;color:#888;}
        
        .gz-card-price-container{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
        .gz-card-price-original{font-size:0.72rem;text-decoration:line-through;color:#999;font-weight:400;}
         .gz-card-price-sale{font-size:0.95rem;font-weight:800;color:#b8860b;margin:0;}
         .gz-card-price-regular{font-size:0.95rem;font-weight:800;color:#0f0f0f;margin:0;}
        
        .gz-card-actions{display:flex;gap:6px;align-items:center;margin-top:auto;width:100%;}
         .gz-btn-add-new {
           flex:1;
           padding:7px 12px;
           border-radius:20px;
           border:1.5px solid #b8860b;
           background: linear-gradient(135deg, #b8860b 0%, #c9a84c 100%);
           color: #fff;
           font-size:0.72rem;
           font-weight:700;
           letter-spacing:0.02em;
           text-transform:uppercase;
           cursor:pointer;
           transition:all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
           text-align:center;
           box-shadow: 0 4px 10px rgba(184, 134, 11, 0.15);
         }
         .gz-btn-add-new:hover {
           background: linear-gradient(135deg, #9a7009 0%, #b8921e 100%);
           border-color: #9a7009;
           transform: translateY(-1px);
           box-shadow: 0 6px 14px rgba(184, 134, 11, 0.25);
         }
         .gz-btn-add-new:disabled {
           border-color:#ccc;
           color:#ccc;
           background:#fff;
           cursor:not-allowed;
           box-shadow: none;
         }
         .gz-btn-view-new{flex:1;padding:6px 12px;border-radius:20px;border:1.5px solid #0f0f0f;background:#0f0f0f;color:#fff;font-size:0.72rem;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;cursor:pointer;transition:all 0.2s ease;text-align:center;text-decoration:none;}
         .gz-btn-view-new:hover{background:#333;color:#fff;}
        
        @media (max-width:768px){
          .gz-card-img-wrap{height:160px;}
          .gz-card-img-hover{inset:0;}
          .gz-card-body{padding:8px;}
          .gz-card-details-row{gap:4px;margin-bottom:6px;}
          .gz-card-name{font-size:0.78rem;height:2.6em;}
          .gz-timer-badge{font-size:0.58rem;padding:1px 4px;}
          .gz-card-price-container{gap:1px;}
          .gz-card-price-original{font-size:0.65rem;}
          .gz-card-price-sale, .gz-card-price-regular{font-size:0.85rem;}
          .gz-card-actions{flex-direction:row !important;gap:4px;}
          .gz-btn-add-new, .gz-btn-view-new{padding:5px 8px;font-size:0.65rem;}
        }
        @media (max-width:480px){
          .gz-card-name{font-size:0.75rem !important;height:2.6em;}
          .gz-timer-badge{font-size:0.55rem;padding:1px 3px;}
          .gz-card-price-original{font-size:0.6rem;}
          .gz-card-price-sale, .gz-card-price-regular{font-size:0.8rem !important;}
          .gz-btn-add-new, .gz-btn-view-new{font-size:0.62rem !important;padding:5px 6px !important;}
        }
      `}</style>

      <motion.div className="gz-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <button 
          className={`gz-wishlist-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWishlist(product); }}
          title={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isFavorite ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>

        <Link to={`/product/${product._id}`} className={`gz-card-img-wrap ${hoverImageUrl !== imageUrl ? 'has-hover-image' : ''}`}>
          <img src={imageUrl} alt={product.name} className="gz-card-img" onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }} />
          {hoverImageUrl !== imageUrl && (
            <img src={hoverImageUrl} alt={product.name} className="gz-card-img gz-card-img-hover" onError={(e) => { e.target.style.display = 'none'; }} />
          )}
          {product.stock === 0 ? (
            <span className="out-of-stock-badge">Out of Stock</span>
          ) : (
            hasDiscount && <span className="offer-badge">{discountPercent}% OFF</span>
          )}
        </Link>
        <div className="gz-card-body">
          <div className="gz-card-details-row">
            <div className="gz-card-details-left">
              <Link to={`/product/${product._id}`} className="gz-card-name">{product.name}</Link>
              <div className="gz-card-rating">
                <div className="gz-stars">
                  {[1,2,3,4,5].map(star => (
                    <span key={star} className={`gz-star ${star <= rating ? 'filled' : 'empty'}`}>★</span>
                  ))}
                </div>
                <span className="gz-reviews-count">({reviewsCount})</span>
              </div>
            </div>
            
            <div className="gz-card-details-right">
              {product.timerEnabled && hasDiscount && timeLeft && (
                <div className="gz-timer-badge">
                  {timeLeft}
                </div>
              )}
              <div className="gz-card-price-container">
                {hasDiscount ? (
                  <>
                    <span className="gz-card-price-original">
                      PKR {product.price.toLocaleString()}
                    </span>
                    <span className="gz-card-price-sale">
                      PKR {discountedPrice.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <span className="gz-card-price-regular">
                    PKR {product.price.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="gz-card-actions">
            <button 
              className="gz-btn-add-new" 
              disabled={product.stock === 0} 
              onClick={(e) => { e.preventDefault(); addToCart(product); }}
            >
              {product.stock === 0 ? 'Sold' : 'Add'}
            </button>
            <Link 
              to={`/product/${product._id}`} 
              className="gz-btn-view-new"
            >
              View
            </Link>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ProductCard;
