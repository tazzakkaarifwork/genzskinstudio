import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  FaBell,
  FaBoxOpen,
  FaChartLine,
  FaEnvelope,
  FaFolderOpen,
  FaHome,
  FaQuestionCircle,
  FaReceipt,
  FaRegCommentDots,
  FaReply,
  FaStar,
  FaTags,
  FaTruck,
  FaUsers,
} from 'react-icons/fa';

const AdminDashboard = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const sidebarVariants = {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: FaChartLine },
    { path: '/admin/products', label: 'Products', icon: FaBoxOpen },
    { path: '/admin/categories', label: 'Categories', icon: FaFolderOpen },
    { path: '/admin/orders', label: 'Orders', icon: FaReceipt },
    { path: '/admin/sales', label: 'Sales Reports', icon: FaChartLine },
    { path: '/admin/users', label: 'Users', icon: FaUsers },
    { path: '/admin/reviews', label: 'Reviews', icon: FaRegCommentDots },
    { path: '/admin/retention', label: 'Retention', icon: FaStar },
    { path: '/admin/subscribers', label: 'Newsletter', icon: FaEnvelope },
    { path: '/admin/hero', label: 'Hero Section', icon: FaHome },
    { path: '/admin/faqs', label: 'FAQs', icon: FaQuestionCircle },
    { path: '/admin/shipping', label: 'Shipping', icon: FaTruck },
    { path: '/admin/contacts', label: 'Contacts', icon: FaTags },
    { path: '/admin/return-policy', label: 'Returns', icon: FaReply },
  ];

  const currentLabel = menuItems.find((item) => isActive(item.path))?.label || 'Dashboard';

  return (
    <div className="bg-light min-vh-100 admin-shell">
      <Helmet>
        <title>Admin Portal | GenZ Studio</title>
      </Helmet>

      <Container fluid className="p-0">
        <Row className="g-0">
          <Col md={3} lg={2} className="bg-white border-end min-vh-100 d-none d-md-block sticky-top admin-sidebar">
            <motion.div
              variants={sidebarVariants}
              initial="initial"
              animate="animate"
              className="p-4"
            >
              <div className="mb-5 mt-2">
                <h6 className="text-uppercase fw-black tracking-widest text-dark mb-0">GenZ Studio</h6>
                <small className="text-muted fw-bold small">ADMIN PANEL</small>
              </div>

              <nav className="nav flex-column gap-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link rounded-0 py-3 px-3 transition-all d-flex align-items-center gap-3 ${
                        isActive(item.path)
                          ? 'bg-dark text-white shadow-sm'
                          : 'text-secondary hover-bg-light'
                      }`}
                      style={{ fontSize: '0.85rem', fontWeight: '600', letterSpacing: '0.5px' }}
                    >
                      <Icon className="admin-nav-icon" />
                      {item.label.toUpperCase()}
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-5 pt-5 border-top">
                <Link to="/" className="text-decoration-none text-muted small fw-bold hover-dark">
                  Back to Store
                </Link>
              </div>
            </motion.div>
          </Col>

          <Col md={9} lg={10} className="p-4 p-md-5 admin-main">
            <header className="mb-5 d-flex justify-content-between align-items-start admin-header flex-column">
              {/* Back to store on mobile top */}
              <div className="d-md-none mb-3">
                <Link to="/" className="text-decoration-none text-muted small fw-bold hover-dark d-inline-flex align-items-center gap-1" style={{ fontSize: '0.8rem', letterSpacing: '0.5px' }}>
                  ← BACK TO STORE
                </Link>
              </div>

              <div className="d-flex justify-content-between align-items-center w-100">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="fw-black text-uppercase m-0 tracking-tighter">{currentLabel}</h2>
                  <p className="text-muted small mb-0">Manage your store operations and data.</p>
                </motion.div>

                <div className="d-flex gap-3">
                  <div className="bg-white p-2 border rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <FaBell />
                  </div>
                </div>
              </div>
            </header>

            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="admin-content-wrapper">
                <Outlet />
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>

      <div className="admin-mobile-nav d-md-none fixed-bottom bg-white border-top">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.path} to={item.path} className={`admin-mobile-link ${isActive(item.path) ? 'active' : ''}`} aria-label={item.label}>
              <Icon />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa; color: #000 !important; }
        .fw-black { font-weight: 900; }
        .tracking-widest { letter-spacing: 0.2em; }
        .tracking-tighter { letter-spacing: -1px; }
        .transition-all { transition: all 0.3s ease; }
        .hover-dark:hover { color: #000 !important; }
        .admin-nav-icon { width: 16px; min-width: 16px; }
        .admin-sidebar { top: 0; max-height: 100vh; overflow-y: auto; }
        .admin-content-wrapper { max-width: 100%; overflow-x: auto; }
        .admin-mobile-nav {
          display: flex;
          gap: 4px;
          overflow-x: auto;
          padding: 8px 10px;
          z-index: 1040;
          -webkit-overflow-scrolling: touch;
        }
        .admin-mobile-link {
          min-width: 72px;
          color: #555;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          font-size: 16px;
          padding: 6px 4px;
          border-radius: 8px;
        }
        .admin-mobile-link span {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          white-space: nowrap;
        }
        .admin-mobile-link.active { background: #111; color: #fff; }
        @media (max-width: 767px) {
          .admin-shell { padding-bottom: 78px; }
          .admin-main { padding: 22px 14px !important; }
          .admin-header {
            margin-bottom: 22px !important;
            align-items: flex-start !important;
            gap: 12px;
          }
          .admin-header h2 { font-size: 1.3rem; }
          .admin-content-wrapper table { min-width: 680px; }
          .admin-content-wrapper .btn {
            min-height: 32px;
            padding: 6px 12px !important;
            border-radius: 0 !important;
            font-size: 11px !important;
            line-height: 1.2;
            letter-spacing: 0.04em;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .admin-content-wrapper .btn.rounded-circle {
            width: auto;
            height: 32px;
            border-radius: 0 !important;
          }
          .admin-content-wrapper,
          .admin-content-wrapper p,
          .admin-content-wrapper td,
          .admin-content-wrapper input,
          .admin-content-wrapper select,
          .admin-content-wrapper textarea {
            font-size: 13px;
          }
          .admin-content-wrapper h2,
          .admin-content-wrapper h4 {
            font-size: 1.2rem;
          }
          .admin-content-wrapper h5,
          .admin-content-wrapper h6 {
            font-size: 0.95rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
