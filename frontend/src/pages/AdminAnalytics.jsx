import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { 
  FaWhatsapp, 
  FaPhone, 
  FaSync, 
  FaUserFriends, 
  FaShoppingCart, 
  FaCreditCard, 
  FaCheckCircle, 
  FaGlobe, 
  FaFacebook, 
  FaMusic, 
  FaMousePointer,
  FaShoppingBag
} from 'react-icons/fa';
import api from '../services/api';

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      if (!loading) setRefreshing(true);
      const { data } = await api.get('/analytics/stats');
      setStats(data);
      setError('');
    } catch (err) {
      console.error('Failed to load real-time analytics:', err);
      setError('Error loading real-time visitor stats.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getSourceIcon = (source) => {
    const s = source.toLowerCase();
    if (s.includes('facebook') || s.includes('fb')) return <FaFacebook style={{ color: '#1877f2' }} />;
    if (s.includes('tiktok') || s.includes('tt')) return <FaMusic style={{ color: '#000000' }} />;
    if (s === 'direct') return <FaMousePointer className="text-secondary" />;
    return <FaGlobe className="text-info" />;
  };

  const formatWhatsAppLink = (phone, name, items, total) => {
    // Clean phone number: remove non-digits
    let cleanedPhone = phone.replace(/\D/g, '');
    // Ensure it starts with 92 for Pakistan if it's local
    if (cleanedPhone.startsWith('0')) {
      cleanedPhone = '92' + cleanedPhone.substring(1);
    } else if (cleanedPhone.startsWith('3')) {
      cleanedPhone = '92' + cleanedPhone;
    }
    
    const customerName = name || 'Customer';
    const itemsList = items.map(i => `- ${i.name} (Qty: ${i.quantity})`).join('%0A');
    
    const message = `Assalam-o-Alaikum ${customerName},%0A%0AGenZ Skin Studio se baat kar rahe hain. 🌟%0A%0AWe noticed that you started a checkout for these items in your cart (Total: PKR ${total.toLocaleString()}) but couldn't place the order:%0A${itemsList}%0A%0AApka order complete karne me help chahiye? We can place it manually from here as well. Let us know!`;
    
    return `https://wa.me/${cleanedPhone}?text=${message}`;
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.08,
        duration: 0.4,
        ease: 'easeOut',
      },
    }),
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '400px' }}>
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-3 text-uppercase tracking-wider small fw-bold">Connecting Live Stream...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm rounded-0 p-4 text-center my-4">
        <h5 className="text-danger fw-bold text-uppercase mb-2">Error Connecting</h5>
        <p className="text-muted small mb-3">{error}</p>
        <Button variant="dark" className="rounded-0 text-uppercase fw-bold mx-auto px-4" onClick={fetchStats} style={{ width: 'fit-content', fontSize: '12px' }}>
          Retry
        </Button>
      </Card>
    );
  }

  // Calculate percentages for conversion funnel
  const totalVisits = stats.totalSessions || 1;
  const cartAddedPct = Math.round((stats.cartAddedCount / totalVisits) * 100);
  const checkoutPct = Math.round((stats.checkoutStartedCount / totalVisits) * 100);
  const purchasePct = Math.round((stats.completedOrdersCount / totalVisits) * 100);
  const checkoutAbandonmentPct = stats.checkoutStartedCount > 0 
    ? Math.round(((stats.checkoutStartedCount - stats.completedOrdersCount) / stats.checkoutStartedCount) * 100) 
    : 0;

  return (
    <div className="analytics-dashboard">
      <style>{`
        /* Pulsating live dot */
        .live-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          padding: 6px 14px;
          border-radius: 100px;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .live-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          animation: pulse-dot 1.8s infinite;
        }
        @keyframes pulse-dot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* Funnel layout */
        .funnel-bar-container {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 24px;
        }
        .funnel-step {
          position: relative;
          padding-bottom: 20px;
        }
        .funnel-step:last-child {
          padding-bottom: 0;
        }
        .funnel-step-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #495057;
          margin-bottom: 6px;
          display: flex;
          justify-content: space-between;
        }
        .funnel-step-bar {
          height: 28px;
          background: #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        .funnel-step-fill {
          height: 100%;
          background: linear-gradient(90deg, #111827 0%, #374151 100%);
          border-radius: 6px 0 0 6px;
          display: flex;
          align-items: center;
          padding-left: 14px;
          color: #fff;
          font-size: 11px;
          font-weight: 700;
          transition: width 0.8s cubic-bezier(0.1, 0.8, 0.2, 1);
        }
        .funnel-step-fill.active {
          background: linear-gradient(90deg, #10b981 0%, #059669 100%);
        }

        /* Table styling */
        .table-premium th {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: #6b7280;
          border-bottom: 2px solid #f3f4f6;
          padding: 14px 16px;
        }
        .table-premium td {
          font-size: 13px;
          vertical-align: middle;
          padding: 14px 16px;
          border-bottom: 1px solid #f3f4f6;
        }
        .table-premium tr:hover {
          background-color: #fafafa;
        }

        /* Recovery buttons */
        .btn-wa {
          background: #25d366;
          color: white !important;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          transition: transform 0.2s, background 0.2s;
        }
        .btn-wa:hover {
          background: #20ba5a;
          transform: translateY(-1px);
        }

        /* KPI font sizing */
        .kpi-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: #6b7280;
        }
        .kpi-value {
          font-size: 32px;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: #111827;
          margin-top: 4px;
        }
      `}</style>

      {/* DASHBOARD HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="live-indicator">
            <span className="live-dot"></span>
            Live Now
          </div>
          <span className="text-muted small">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        <Button 
          variant="outline-dark" 
          size="sm" 
          onClick={fetchStats} 
          disabled={refreshing}
          className="d-flex align-items-center gap-2 px-3 py-2 rounded-3 border-light shadow-sm bg-white"
          style={{ fontSize: '12px', fontWeight: '600' }}
        >
          <FaSync className={refreshing ? 'spin' : ''} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          REFRESH STREAM
        </Button>
      </div>

      {/* KPI METRIC CARDS */}
      <Row className="g-4 mb-4">
        {/* Active Now */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-0 shadow-sm rounded-3 p-4 h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <span className="kpi-title">Active Visitors</span>
                <Badge bg="success" className="px-2 py-1" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>LIVE NOW</Badge>
              </div>
              <h2 className="kpi-value d-flex align-items-center gap-2">
                <FaUserFriends style={{ fontSize: '20px', color: '#10b981' }} />
                {stats.liveVisitors}
              </h2>
              <small className="text-muted small mt-2 d-block">
                Unique browsers active in the last 5 minutes.
              </small>
            </Card>
          </motion.div>
        </Col>

        {/* Total Sessions */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-0 shadow-sm rounded-3 p-4 h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <span className="kpi-title">Total Sessions</span>
                <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>ACCUMULATED</Badge>
              </div>
              <h2 className="kpi-value d-flex align-items-center gap-2">
                <FaGlobe className="text-muted" style={{ fontSize: '20px' }} />
                {stats.totalSessions}
              </h2>
              <small className="text-muted small mt-2 d-block">
                Total web store sessions captured.
              </small>
            </Card>
          </motion.div>
        </Col>

        {/* Checkout Started Rate */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-0 shadow-sm rounded-3 p-4 h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <span className="kpi-title">Checkout Rate</span>
                <Badge bg="info" className="px-2 py-1" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>{checkoutPct}% FUNNEL</Badge>
              </div>
              <h2 className="kpi-value d-flex align-items-center gap-2">
                <FaShoppingCart style={{ fontSize: '20px', color: '#0ea5e9' }} />
                {stats.checkoutStartedCount}
              </h2>
              <small className="text-muted small mt-2 d-block">
                Checkouts initiated from store visits.
              </small>
            </Card>
          </motion.div>
        </Col>

        {/* Conversion / Purchase Rate */}
        <Col xs={12} sm={6} lg={3}>
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants}>
            <Card className="border-0 shadow-sm rounded-3 p-4 h-100 bg-white">
              <div className="d-flex justify-content-between align-items-start">
                <span className="kpi-title">Conversion Rate</span>
                <Badge bg="dark" className="px-2 py-1" style={{ fontSize: '8px', letterSpacing: '0.5px' }}>{purchasePct}% CR</Badge>
              </div>
              <h2 className="kpi-value d-flex align-items-center gap-2">
                <FaCheckCircle style={{ fontSize: '20px', color: '#10b981' }} />
                {stats.completedOrdersCount}
              </h2>
              <small className="text-muted small mt-2 d-block">
                Converted sessions to completed orders.
              </small>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4 mb-5">
        {/* CONVERSION FUNNEL BAR */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-black text-uppercase tracking-tighter mb-4" style={{ fontSize: '13px' }}>
              Traffic Conversion Funnel
            </h5>
            
            <div className="funnel-bar-container">
              {/* Step 1: Sessions */}
              <div className="funnel-step">
                <div className="funnel-step-label">
                  <span>1. Store Visits (Sessions)</span>
                  <span>{stats.totalSessions} (100%)</span>
                </div>
                <div className="funnel-step-bar">
                  <div className="funnel-step-fill" style={{ width: '100%' }}>
                    VISITED STORE
                  </div>
                </div>
              </div>

              {/* Step 2: Added to Cart */}
              <div className="funnel-step">
                <div className="funnel-step-label">
                  <span>2. Added to Cart</span>
                  <span>{stats.cartAddedCount} ({cartAddedPct}%)</span>
                </div>
                <div className="funnel-step-bar">
                  <div className="funnel-step-fill" style={{ width: `${cartAddedPct}%` }}>
                    {cartAddedPct > 15 ? 'ADDED ITEMS' : ''}
                  </div>
                </div>
              </div>

              {/* Step 3: Initiated Checkout */}
              <div className="funnel-step">
                <div className="funnel-step-label">
                  <span>3. Reached Checkout</span>
                  <span>{stats.checkoutStartedCount} ({checkoutPct}%)</span>
                </div>
                <div className="funnel-step-bar">
                  <div className="funnel-step-fill" style={{ width: `${checkoutPct}%` }}>
                    {checkoutPct > 15 ? 'ENTERED CHECKOUT' : ''}
                  </div>
                </div>
              </div>

              {/* Step 4: Placed Order */}
              <div className="funnel-step">
                <div className="funnel-step-label">
                  <span>4. Purchases Completed</span>
                  <span>{stats.completedOrdersCount} ({purchasePct}%)</span>
                </div>
                <div className="funnel-step-bar">
                  <div className="funnel-step-fill active" style={{ width: `${purchasePct}%` }}>
                    {purchasePct > 15 ? 'COMPLETED ORDER ✅' : ''}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '9px' }}>Checkout Abandonment Rate</small>
                <span className="fw-black text-danger h5 m-0">{checkoutAbandonmentPct}%</span>
              </div>
              <small className="text-muted text-end small" style={{ maxWidth: '220px', fontSize: '11px' }}>
                Percentage of customers who started checkout but did not complete the purchase.
              </small>
            </div>
          </Card>
        </Col>

        {/* TRAFFIC SOURCE BREAKDOWN */}
        <Col xs={12} lg={6}>
          <Card className="border-0 shadow-sm rounded-3 p-4 bg-white h-100">
            <h5 className="fw-black text-uppercase tracking-tighter mb-4" style={{ fontSize: '13px' }}>
              Traffic Acquisition & Conversion
            </h5>
            
            <div className="table-responsive">
              <Table borderless className="align-middle table-premium m-0">
                <thead>
                  <tr>
                    <th>Traffic Source</th>
                    <th className="text-center">Sessions</th>
                    <th className="text-center">Checkouts</th>
                    <th className="text-center">Sales</th>
                    <th className="text-end">CVR</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.trafficBreakdown?.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4 small">No traffic data captured yet</td>
                    </tr>
                  ) : (
                    stats.trafficBreakdown?.map((source, index) => {
                      const cvr = source.sessionCount > 0 
                        ? ((source.purchaseCount / source.sessionCount) * 100).toFixed(1) 
                        : '0.0';
                      
                      const pctShare = Math.round((source.sessionCount / totalVisits) * 100);
                      
                      return (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center gap-2 fw-semibold text-uppercase" style={{ fontSize: '12px' }}>
                              {getSourceIcon(source._id)}
                              {source._id === 'facebook' ? 'Facebook CPC' : source._id === 'tiktok' ? 'TikTok CPC' : source._id}
                            </div>
                            <div className="w-100 mt-2">
                              <ProgressBar now={pctShare} style={{ height: '3px' }} variant="dark" />
                              <small className="text-muted" style={{ fontSize: '9px' }}>{pctShare}% of total traffic</small>
                            </div>
                          </td>
                          <td className="text-center fw-bold">{source.sessionCount}</td>
                          <td className="text-center text-muted">{source.checkoutCount}</td>
                          <td className="text-center text-success fw-bold">{source.purchaseCount}</td>
                          <td className="text-end fw-black text-dark">{cvr}%</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ABANDONED CHECKOUTS */}
      <Card className="border-0 shadow-sm rounded-3 p-4 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div>
            <h5 className="fw-black text-uppercase tracking-tighter m-0" style={{ fontSize: '13px' }}>
              Abandoned Checkouts (Shopify-Style Recovery)
            </h5>
            <p className="text-muted small mb-0">Follow up directly with clients who left items in checkout.</p>
          </div>
          <Badge bg="danger" className="px-3 py-2 rounded-pill fw-bold" style={{ fontSize: '10px' }}>
            {stats.abandonedCheckouts?.length || 0} ACTIVE ABANDONMENTS
          </Badge>
        </div>

        <div className="table-responsive">
          <Table borderless className="align-middle table-premium m-0">
            <thead>
              <tr>
                <th>Customer / Contact</th>
                <th>Cart Items</th>
                <th className="text-center">Cart Value</th>
                <th className="text-center">Last Step</th>
                <th>Activity Time</th>
                <th className="text-center">Acquisition</th>
                <th className="text-end">Recovery Actions</th>
              </tr>
            </thead>
            <tbody>
              {stats.abandonedCheckouts?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5 small fw-semibold">
                    🎉 Hooray! No abandoned checkouts currently.
                  </td>
                </tr>
              ) : (
                stats.abandonedCheckouts?.map((session) => {
                  const phone = session.checkoutPhone || '';
                  const email = session.checkoutEmail || '';
                  const hasDetails = session.checkoutName || email || phone;
                  const activeItems = session.cartItems || [];
                  
                  return (
                    <tr key={session._id}>
                      {/* Name & Contact Info */}
                      <td>
                        {hasDetails ? (
                          <>
                            <div className="fw-bold text-dark">{session.checkoutName || 'Guest Session'}</div>
                            {email && <div className="text-muted small" style={{ fontSize: '11px' }}>{email}</div>}
                            {phone && <div className="text-muted small fw-semibold" style={{ fontSize: '11px' }}>{phone}</div>}
                          </>
                        ) : (
                          <div className="text-muted-50 italic" style={{ fontSize: '12px' }}>Browsing visitor (no details entered)</div>
                        )}
                        {session.checkoutCity && (
                          <Badge bg="light" text="dark" className="mt-1 border" style={{ fontSize: '8px' }}>
                            {session.checkoutCity.toUpperCase()}
                          </Badge>
                        )}
                      </td>
                      
                      {/* Cart Items list */}
                      <td style={{ maxWidth: '280px' }}>
                        {activeItems.length === 0 ? (
                          <span className="text-muted-50 small">Empty Cart</span>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            {activeItems.map((item, idx) => (
                              <div key={idx} className="d-flex align-items-center gap-2">
                                {item.image ? (
                                  <img 
                                    src={item.image.startsWith('http') ? item.image : `https://genzskinstudio.vercel.app/${item.image.replace(/^\//, '')}`} 
                                    alt={item.name} 
                                    style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }} 
                                  />
                                ) : (
                                  <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                    <FaShoppingBag className="text-muted-50" style={{ fontSize: '10px' }} />
                                  </div>
                                )}
                                <div style={{ fontSize: '11px', lineHeight: '1.2' }}>
                                  <span className="fw-semibold text-dark">{item.name}</span>
                                  <span className="text-muted d-block" style={{ fontSize: '9px' }}>Qty: {item.quantity} | PKR {item.price.toLocaleString()}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Cart Value */}
                      <td className="text-center fw-bold text-dark">
                        PKR {(session.cartTotal || 0).toLocaleString()}
                      </td>

                      {/* Checkout step badge */}
                      <td className="text-center">
                        <Badge 
                          bg={
                            session.checkoutStep === 'billing' ? 'warning' :
                            session.checkoutStep === 'shipping' ? 'info' :
                            'secondary'
                          }
                          className="text-uppercase px-2 py-1"
                          style={{ fontSize: '9px', letterSpacing: '0.5px' }}
                        >
                          {session.checkoutStep || 'none'}
                        </Badge>
                      </td>

                      {/* Activity Time */}
                      <td className="text-muted small">
                        {new Date(session.updatedAt).toLocaleString()}
                      </td>

                      {/* Source attribution */}
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1 text-uppercase fw-bold" style={{ fontSize: '10px' }}>
                          {getSourceIcon(session.trafficSource?.utm_source || 'direct')}
                          <span>{session.trafficSource?.utm_source || 'direct'}</span>
                        </div>
                      </td>

                      {/* Action buttons (WhatsApp, Phone Call, Email) */}
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          {phone && (
                            <>
                              <a 
                                href={formatWhatsAppLink(phone, session.checkoutName, activeItems, session.cartTotal || 0)} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-wa text-decoration-none"
                              >
                                <FaWhatsapp style={{ fontSize: '14px' }} />
                                WHATSAPP
                              </a>
                              <a 
                                href={`tel:${phone}`} 
                                className="btn btn-outline-dark btn-sm rounded-3 d-flex align-items-center justify-content-center" 
                                style={{ width: '32px', height: '32px', padding: '0' }}
                                title="Call Customer"
                              >
                                <FaPhone style={{ fontSize: '10px' }} />
                              </a>
                            </>
                          )}
                          {email && (
                            <a 
                              href={`mailto:${email}?subject=GenZ%20Skin%20Studio%20-%20Complete%20Your%20Order&body=Hi%20${session.checkoutName || 'there'},%0A%0AWe%20noticed%20you%20left%20some%20items%20in%20your%20cart.%20Complete%20your%20order%20here%3A%20https%3A%2F%2Fgenzskinstudio.com%2Fcheckout`} 
                              className="btn btn-light border btn-sm rounded-3 px-3 d-flex align-items-center justify-content-center"
                              style={{ fontSize: '11px', fontWeight: '600' }}
                            >
                              EMAIL
                            </a>
                          )}
                          {!phone && !email && (
                            <span className="text-muted small italic">No contacts</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default AdminAnalytics;
