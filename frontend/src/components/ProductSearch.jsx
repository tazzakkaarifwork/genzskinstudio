import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductSearch = ({
  variant = 'navbar',
  defaultValue = '',
  onSearch,
  placeholder = 'Search products...',
  scrolled = false,
}) => {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (onSearch) {
      onSearch(q);
      return;
    }
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
    else navigate('/products');
  };

  const searchIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );

  if (variant === 'hero') {
    return (
      <form className="gz-hero-search" onSubmit={handleSubmit}>
        <input
          type="search"
          className="gz-hero-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button type="submit" className="gz-hero-search-btn" aria-label="Search">
          {searchIcon}
        </button>
      </form>
    );
  }

  if (variant === 'page') {
    return (
      <form className="gz-page-search" onSubmit={handleSubmit}>
        <span className="gz-page-search-icon">{searchIcon}</span>
        <input
          type="search"
          className="gz-page-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            className="gz-page-search-clear"
            onClick={() => {
              setQuery('');
              onSearch?.('');
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
        <button type="submit" className="gz-page-search-btn">Search</button>
      </form>
    );
  }

  if (variant === 'drawer') {
    return (
      <form className="gz-drawer-search" onSubmit={handleSubmit}>
        <span className="gz-drawer-search-icon">{searchIcon}</span>
        <input
          type="search"
          className="gz-drawer-search-input"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search products"
        />
        <button type="submit" className="gz-drawer-search-btn" aria-label="Search">
          {searchIcon}
        </button>
      </form>
    );
  }

  return (
    <form
      className={`gz-nav-search ${scrolled ? 'scrolled' : ''}`}
      onSubmit={handleSubmit}
    >
      <span className="gz-nav-search-icon">{searchIcon}</span>
      <input
        type="search"
        className="gz-nav-search-input"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search products"
      />
      <button type="submit" className="gz-nav-search-btn" aria-label="Search">
        {searchIcon}
      </button>
    </form>
  );
};

export default ProductSearch;
