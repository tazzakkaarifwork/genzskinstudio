import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import Navbar from './components/Navbar';
import SideCart from './components/SideCart';
import SideWishlist from './components/SideWishlist';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import About from './pages/About';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import MyOrders from './pages/MyOrders';
import TrackOrder from './pages/TrackOrder';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminUsers from './pages/AdminUsers';
import AdminHero from './pages/AdminHero';
import AdminReviews from './pages/AdminReviews';
import AdminRetention from './pages/AdminRetention';
import AdminSubscribers from './pages/AdminSubscribers';
import OrderSuccess from './pages/OrderSuccess';
import AdminInvoice from './pages/AdminInvoice';
import AdminOverview from './pages/AdminOverview';
import FAQ from './pages/FAQ';
import AdminFAQs from './pages/AdminFAQs';
import AdminReturnPolicy from './pages/AdminReturnPolicy';
import ReturnPolicy from './pages/ReturnPolicy';
import AdminContacts from './pages/AdminContacts';
import AdminShipping from './pages/AdminShipping';
import AdminSales from './pages/AdminSales';
import AdminAnalytics from './pages/AdminAnalytics';
import { trackSession } from './services/analytics';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="container mt-5">
          <div className="alert alert-danger">
            <h4>Something went wrong</h4>
            <pre>{this.state.error?.toString()}</pre>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const location = useLocation();
  const hideNavbarRoutes = ['/order-success', '/admin-login'];

  React.useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utm_source = searchParams.get('utm_source');
      const utm_medium = searchParams.get('utm_medium');
      const utm_campaign = searchParams.get('utm_campaign');
      const fbclid = searchParams.get('fbclid');
      const ttclid = searchParams.get('ttclid');
      const referrer = document.referrer;

      let sourceData = null;
      const existing = sessionStorage.getItem('gz_traffic_source');
      if (existing) {
        sourceData = JSON.parse(existing);
      }

      // Store traffic source if none exists yet, or if new UTM parameters are active in current URL
      if (!sourceData || utm_source || fbclid || ttclid) {
        const isExternalReferrer = referrer && !referrer.includes(window.location.hostname);
        let calculatedSource = 'direct';
        let calculatedMedium = 'none';

        if (utm_source) {
          calculatedSource = utm_source;
          calculatedMedium = utm_medium || 'none';
        } else if (fbclid) {
          calculatedSource = 'facebook';
          calculatedMedium = 'cpc';
        } else if (ttclid) {
          calculatedSource = 'tiktok';
          calculatedMedium = 'cpc';
        } else if (isExternalReferrer) {
          try {
            calculatedSource = new URL(referrer).hostname;
            calculatedMedium = 'referral';
          } catch (e) {
            calculatedSource = 'referrer';
          }
        }

        const newSource = {
          utm_source: calculatedSource,
          utm_medium: calculatedMedium,
          utm_campaign: utm_campaign || 'none',
          referrer: referrer || 'none',
          landingPage: window.location.href,
          fbclid: fbclid || '',
          ttclid: ttclid || '',
          timestamp: Date.now()
        };

        sessionStorage.setItem('gz_traffic_source', JSON.stringify(newSource));
      }

      // Track session activity (page view / heartbeat update)
      trackSession();
    } catch (err) {
      console.warn('Traffic tracking error:', err);
    }
  }, [location.pathname]);
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname) || location.pathname.startsWith('/admin');

  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="App">
              {!shouldHideNavbar && <Navbar />}
              {!shouldHideNavbar && <SideCart />}
              {!shouldHideNavbar && <SideWishlist />}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/about" element={<About />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/track" element={<TrackOrder />} />  {/* ✅ matches navbar */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/admin/invoice/:id" element={<AdminRoute><AdminInvoice /></AdminRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>}>
                  <Route index element={<AdminOverview />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="categories" element={<AdminCategories />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="sales" element={<AdminSales />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="retention" element={<AdminRetention />} />
                  <Route path="subscribers" element={<AdminSubscribers />} />
                  <Route path="hero" element={<AdminHero />} />
                  <Route path="faqs" element={<AdminFAQs />} />
                  <Route path="contacts" element={<AdminContacts />} />
                  <Route path="return-policy" element={<AdminReturnPolicy />} />
                  <Route path="shipping" element={<AdminShipping />} />
                </Route>
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
