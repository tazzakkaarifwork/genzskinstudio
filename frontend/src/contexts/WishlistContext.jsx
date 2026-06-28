import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Load wishlist items on mount or when user changes
  useEffect(() => {
    const loadWishlist = async () => {
      const token = localStorage.getItem('token');
      if (token && user) {
        try {
          const res = await api.get('/wishlist?populate=true', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlistItems(res.data);
        } catch (err) {
          console.error('Error fetching backend wishlist:', err);
        }
      } else {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
          try {
            setWishlistItems(JSON.parse(savedWishlist));
          } catch (err) {
            console.error('Error parsing wishlist from localStorage:', err);
            setWishlistItems([]);
          }
        } else {
          setWishlistItems([]);
        }
      }
    };
    loadWishlist();
  }, [user]);

  // Sync to localStorage only when user is NOT logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, user]);

  const toggleWishlist = async (product) => {
    const token = localStorage.getItem('token');
    const exists = wishlistItems.some(item => item._id === product._id);

    if (token) {
      try {
        if (exists) {
          // Remove from backend
          await api.delete(`/wishlist/${product._id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlistItems(prev => prev.filter(item => item._id !== product._id));
        } else {
          // Add to backend
          await api.post('/wishlist', { productId: product._id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlistItems(prev => [...prev, product]);
        }
      } catch (err) {
        console.error('Error updating wishlist on backend:', err);
      }
    } else {
      // Local storage toggle
      setWishlistItems(prev => {
        if (exists) {
          return prev.filter(item => item._id !== product._id);
        }
        return [...prev, product];
      });
    }
  };

  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.delete(`/wishlist/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlistItems(prev => prev.filter(item => item._id !== productId));
      } catch (err) {
        console.error('Error removing from wishlist backend:', err);
      }
    } else {
      setWishlistItems(prev => prev.filter(item => item._id !== productId));
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlistItems,
      wishlistOpen,
      setWishlistOpen,
      toggleWishlist,
      removeFromWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
