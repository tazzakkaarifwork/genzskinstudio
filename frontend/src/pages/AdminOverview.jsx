import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Table, Button, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const MonthlyRevenueChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="border-0 shadow-sm rounded-3 p-4 mb-4">
        <h5 className="fw-black text-uppercase tracking-tighter mb-4" style={{ fontSize: '14px' }}>
          Monthly Sales Breakdown (Profit vs Revenue)
        </h5>
        <div className="d-flex align-items-center justify-content-center border rounded-3 bg-light" style={{ height: '200px' }}>
          <p className="text-muted text-uppercase tracking-wider small fw-bold" style={{ fontSize: '10px' }}>No revenue data available yet</p>
        </div>
      </Card>
    );
  }

  const maxRevenue = Math.max(...data.map(d => Math.max(d.profit || 0, d.revenue || 0)), 1000);
  const chartHeight = 200;

  return (
    <Card className="border-0 shadow-sm rounded-3 p-4 mb-4">
      <h5 className="fw-black text-uppercase tracking-tighter mb-4" style={{ fontSize: '14px' }}>
        Monthly Sales Breakdown (Profit vs Revenue)
      </h5>
      <div className="position-relative" style={{ height: `${chartHeight + 40}px` }}>
        <div className="d-flex h-100 align-items-end justify-content-between gap-2 px-2">
          {data.map((item, idx) => {
            const percentage = ((item.profit || 0) / maxRevenue) * 100;
            return (
              <div key={idx} className="flex-grow-1 d-flex flex-column align-items-center position-relative" style={{ minWidth: '40px' }}>
                {/* Tooltip */}
                <div 
                  id={`tooltip-${idx}`}
                  style={{
                    position: 'absolute',
                    bottom: `${percentage}%`,
                    left: '50%',
                    transform: 'translate(-50%, -10px)',
                    backgroundColor: '#1a202c',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '9px',
                    pointerEvents: 'none',
                    opacity: 0,
                    transition: 'opacity 0.2s, transform 0.2s',
                    zIndex: 10,
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    lineHeight: '1.4'
                  }}
                >
                  <div style={{ fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '3px', marginBottom: '3px' }}>{item.month}</div>
                  <div><span style={{ color: '#86efac', fontWeight: 'bold' }}>Profit (Delivered):</span> PKR {(item.profit || 0).toLocaleString()}</div>
                  <div><span style={{ color: '#93c5fd', fontWeight: 'bold' }}>Revenue (Gross):</span> PKR {(item.revenue || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '8px', color: '#a0aec0', marginTop: '2px' }}>{item.count || 0} Delivered / {item.totalOrders || 0} Total Orders</div>
                </div>

                {/* Bar Container */}
                <div className="w-100 position-relative" style={{ height: `${chartHeight}px`, display: 'flex', alignItems: 'end' }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: 'easeOut' }}
                    className="w-100 rounded-top"
                    style={{
                      background: 'linear-gradient(180deg, #10b981 0%, #059669 100%)', // premium green gradient for profit
                      cursor: 'pointer',
                      minHeight: (item.profit || 0) > 0 ? '4px' : '0px'
                    }}
                    onMouseEnter={() => {
                      const el = document.getElementById(`tooltip-${idx}`);
                      if (el) { el.style.opacity = '1'; el.style.transform = 'translate(-50%, -5px)'; }
                    }}
                    onMouseLeave={() => {
                      const el = document.getElementById(`tooltip-${idx}`);
                      if (el) { el.style.opacity = '0'; el.style.transform = 'translate(-50%, -10px)'; }
                    }}
                  />
                </div>

                {/* Label */}
                <span className="text-muted fw-bold mt-2" style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.month.split(' ')[0]}
                </span>
                <span className="text-muted-50" style={{ fontSize: '8px' }}>
                  {item.month.split(' ')[1]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders/stats');
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.response?.data?.message || 'Error connecting to analytics database.');
    } finally {
      setLoading(false);
    }
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

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fff3cd', color: '#856404', text: 'PENDING' },
      dispatched: { bg: '#cce5ff', color: '#004085', text: 'IN TRANSIT' },
      delivered: { bg: '#d4edda', color: '#155724', text: 'COMPLETED' },
    };
    const current = styles[status] || styles.pending;
    return (
      <span className="px-3 py-1 rounded-pill fw-bold text-uppercase" style={{ backgroundColor: current.bg, color: current.color, fontSize: '9px', letterSpacing: '0.5px' }}>
        {current.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="dark" />
          <p className="mt-3 text-uppercase tracking-wider small fw-bold">Loading Business Metrics...</p>
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

  return (
    <div>
      {/* FINANCIAL KPIS */}
      <Row className="g-4 mb-4">
        <Col xs={12} md={6}>
          <motion.div custom={0} initial="hidden" animate="visible" variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
            <Card className="h-100 rounded-3 border-0 overflow-hidden shadow-sm text-white" style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)' }}>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="text-uppercase fw-bold tracking-wider" style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>Net Profit</span>
                  <Badge bg="success" className="text-uppercase" style={{ fontSize: '8px' }}>Delivered Only</Badge>
                </div>
                <h3 className="fw-black mb-1 m-0 tracking-tight" style={{ fontSize: '30px' }}>PKR {(stats.netProfit || 0).toLocaleString()}</h3>
                <small className="small fw-semibold mt-1 d-block text-white-50" style={{ fontSize: '10px' }}>
                  {stats.revenueBreakdown?.delivered?.count || 0} completed orders
                </small>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} md={6}>
          <motion.div custom={1} initial="hidden" animate="visible" variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
            <Card className="h-100 rounded-3 border border-light overflow-hidden shadow-sm bg-white text-dark">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <span className="text-uppercase fw-bold tracking-wider text-muted" style={{ fontSize: '10px' }}>Gross Revenue</span>
                  <Badge bg="secondary" className="text-uppercase" style={{ fontSize: '8px' }}>All Orders</Badge>
                </div>
                <h3 className="fw-black mb-1 m-0 tracking-tight text-dark" style={{ fontSize: '30px' }}>PKR {(stats.grossRevenue || 0).toLocaleString()}</h3>
                <small className="small fw-semibold mt-1 d-block text-muted" style={{ fontSize: '10px' }}>
                  Total billing from {stats.totalOrders} total orders
                </small>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      {/* OPERATIONAL KPIS */}
      <Row className="g-4 mb-5">
        <Col xs={12} sm={4}>
          <motion.div custom={2} initial="hidden" animate="visible" variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
            <Card className="h-100 rounded-3 border border-light overflow-hidden shadow-sm bg-white text-dark">
              <Card.Body className="p-4">
                <span className="d-block text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>Total Transactions</span>
                <h3 className="fw-black mb-1 m-0 text-dark" style={{ fontSize: '22px' }}>{stats.totalOrders.toLocaleString()}</h3>
                <small className="text-muted" style={{ fontSize: '10px' }}>Pending: {stats.statusCounts?.pending || 0} | Transit: {stats.statusCounts?.dispatched || 0}</small>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={4}>
          <motion.div custom={3} initial="hidden" animate="visible" variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
            <Card className="h-100 rounded-3 border border-light overflow-hidden shadow-sm bg-white text-dark">
              <Card.Body className="p-4">
                <span className="d-block text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>Avg Order Value (AOV)</span>
                <h3 className="fw-black mb-1 m-0 text-dark" style={{ fontSize: '22px' }}>PKR {Math.round(stats.aov || 0).toLocaleString()}</h3>
                <small className="text-muted" style={{ fontSize: '10px' }}>Calculated from delivered orders</small>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
        <Col xs={12} sm={4}>
          <motion.div custom={4} initial="hidden" animate="visible" variants={cardVariants} whileHover={{ y: -3, transition: { duration: 0.15 } }}>
            <Card className="h-100 rounded-3 border border-light overflow-hidden shadow-sm bg-white text-dark">
              <Card.Body className="p-4">
                <span className="d-block text-uppercase fw-bold text-muted mb-2" style={{ fontSize: '10px' }}>Newsletter Squad</span>
                <h3 className="fw-black mb-1 m-0 text-dark" style={{ fontSize: '22px' }}>{(stats.subscribersCount || 0).toLocaleString()}</h3>
                <small className="text-muted" style={{ fontSize: '10px' }}>Active email subscriptions</small>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Row className="g-4">
        {/* RECENT ORDERS TABLE & CHART */}
        <Col lg={8}>
          <MonthlyRevenueChart data={stats.monthlyRevenue} />
          <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
            <Card.Header className="bg-white border-0 py-3 ps-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-black text-uppercase tracking-tighter mb-0" style={{ fontSize: '14px' }}>
                Recent E-Commerce Drops
              </h5>
              <span className="badge bg-dark rounded-pill fw-bold" style={{ fontSize: '10px' }}>NEW ORDERS</span>
            </Card.Header>
            <Table hover responsive className="mb-0 align-middle border-0" style={{ fontSize: '13px' }}>
              <thead className="bg-light">
                <tr className="small text-uppercase fw-bold tracking-wider text-muted">
                  <th className="py-3 ps-4">Order ID</th>
                  <th className="py-3">Client</th>
                  <th className="py-3">Amount</th>
                  <th className="py-3">Status</th>
                  <th className="py-3 text-end pe-4">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      No orders registered yet. Set up checkout to test!
                    </td>
                  </tr>
                ) : (
                  stats.recentOrders.map(order => (
                    <tr key={order._id} className="border-bottom">
                      <td className="ps-4 fw-bold font-monospace text-muted" style={{ fontSize: '11px' }}>
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="fw-bold">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName || ''}</td>
                      <td className="fw-black">PKR {order.totalPrice.toLocaleString()}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-end pe-4">
                        <Button
                          variant="outline-secondary"
                          className="rounded-0 px-2 py-1 align-items-center"
                          style={{ fontSize: '11px', borderColor: '#eaeaea' }}
                          onClick={() => window.open(`/admin/invoice/${order._id}`, '_blank')}
                          title="Print Packing Slip"
                        >
                          Print
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </Col>

        {/* FULFILLMENT BREAKDOWN & STOCK STATUS */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-3 mb-4 p-4 h-100">
            <h5 className="fw-black text-uppercase tracking-tighter mb-4" style={{ fontSize: '14px' }}>
              Order Fulfillment Ratios
            </h5>
            
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1 small fw-bold">
                <span className="text-uppercase text-muted">Pending Verification</span>
                <span className="text-warning">{stats.statusCounts.pending} Orders</span>
              </div>
              <div className="progress rounded-pill" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-warning rounded-pill" 
                  role="progressbar" 
                  style={{ width: `${stats.totalOrders > 0 ? (stats.statusCounts.pending / stats.totalOrders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1 small fw-bold">
                <span className="text-uppercase text-muted">Dispatched (In Transit)</span>
                <span className="text-primary">{stats.statusCounts.dispatched} Orders</span>
              </div>
              <div className="progress rounded-pill" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-primary rounded-pill" 
                  role="progressbar" 
                  style={{ width: `${stats.totalOrders > 0 ? (stats.statusCounts.dispatched / stats.totalOrders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="mb-4">
              <div className="d-flex justify-content-between mb-1 small fw-bold">
                <span className="text-uppercase text-muted">Delivered (Completed)</span>
                <span className="text-success">{stats.statusCounts.delivered} Orders</span>
              </div>
              <div className="progress rounded-pill" style={{ height: '7px' }}>
                <div 
                  className="progress-bar bg-success rounded-pill" 
                  role="progressbar" 
                  style={{ width: `${stats.totalOrders > 0 ? (stats.statusCounts.delivered / stats.totalOrders) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-light p-3 border rounded-3 mt-auto text-center">
              <span className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                Product SKU Inventory
              </span>
              <h4 className="fw-black m-0 text-dark">{stats.productsCount} Unique Items</h4>
              <small className="text-muted small">Registered in database</small>
            </div>
            <div className="mt-3 p-3 border rounded-3" style={{ background: '#f0fdf4' }}>
              <span className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                Profit (Delivered)
              </span>
              <h4 className="fw-black m-0 text-success">PKR {stats.revenueBreakdown?.delivered?.total?.toLocaleString() || '0'}</h4>
              <small className="text-muted small">{stats.revenueBreakdown?.delivered?.count || 0} orders completed</small>
            </div>
            <div className="mt-3 p-3 border rounded-3" style={{ background: '#fffbea' }}>
              <span className="d-block text-uppercase fw-bold text-muted mb-1" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>
                Pending Amount
              </span>
              <h4 className="fw-black m-0 text-warning">PKR {stats.revenueBreakdown?.pending?.total?.toLocaleString() || '0'}</h4>
              <small className="text-muted small">{stats.revenueBreakdown?.pending?.count || 0} orders pending</small>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminOverview;
