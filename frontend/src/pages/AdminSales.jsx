import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Form, Button, Spinner, Alert, Badge, Modal } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';
import { FaFileDownload, FaSearch, FaPrint } from 'react-icons/fa';

const AdminSales = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-indexed

  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(String(currentMonth));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Summary Metrics
  const [summary, setSummary] = useState({
    orders: 0,
    gross: 0,
    delivered: 0,
    dispatched: 0,
    pending: 0,
  });

  // Modal and Daily Transactions states
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyOrders, setDailyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('all');

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [
    { value: '2025', label: '2025' },
    { value: '2026', label: '2026' },
    { value: '2027', label: '2027' },
  ];

  useEffect(() => {
    fetchDailySales();
  }, [selectedMonth, selectedYear]);

  const fetchDailySales = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/orders/daily-sales', {
        params: {
          month: selectedMonth,
          year: selectedYear,
        }
      });
      
      const list = Array.isArray(data) ? data : [];
      setSalesData(list);

      // Compute summary
      let totalOrders = 0;
      let totalGross = 0;
      let totalDelivered = 0;
      let totalDispatched = 0;
      let totalPending = 0;

      list.forEach(day => {
        totalOrders += day.totalOrders || 0;
        totalGross += day.grossSales || 0;
        totalDelivered += day.deliveredSales || 0;
        totalDispatched += day.dispatchedSales || 0;
        totalPending += day.pendingSales || 0;
      });

      setSummary({
        orders: totalOrders,
        gross: totalGross,
        delivered: totalDelivered,
        dispatched: totalDispatched,
        pending: totalPending,
      });

    } catch (err) {
      console.error(err);
      setError('Failed to fetch sales report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (dateStr) => {
    setSelectedDate(dateStr);
    setShowModal(true);
    setLoadingOrders(true);
    setOrdersError('');
    setModalSearch('');
    setModalStatusFilter('all');
    try {
      const { data } = await api.get('/orders/by-date', {
        params: { date: dateStr }
      });
      setDailyOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setOrdersError('Failed to fetch detailed orders for this day.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredOrders = dailyOrders.filter(order => {
    // Status filter
    if (modalStatusFilter !== 'all' && order.status !== modalStatusFilter) {
      return false;
    }
    // Text search
    if (modalSearch.trim()) {
      const term = modalSearch.toLowerCase().trim();
      const fullName = `${order.shippingDetails?.firstName || ''} ${order.shippingDetails?.lastName || ''}`.toLowerCase();
      const email = (order.contact?.email || '').toLowerCase();
      const phone = (order.shippingDetails?.phone || '').toLowerCase();
      const id = (order._id || '').toLowerCase();
      
      const matchItems = order.orderItems?.some(item => (item.name || '').toLowerCase().includes(term));

      return fullName.includes(term) || email.includes(term) || phone.includes(term) || id.includes(term) || matchItems;
    }
    return true;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const exportCSV = () => {
    if (salesData.length === 0) return;
    
    const headers = ['Date', 'Total Orders', 'Gross Sales (PKR)', 'Net Profit/Delivered (PKR)', 'Transit/Dispatched (PKR)', 'Pending (PKR)'];
    const rows = salesData.map(d => [
      d.date,
      d.totalOrders,
      d.grossSales,
      d.deliveredSales,
      d.dispatchedSales,
      d.pendingSales
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${selectedMonth}_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        .sales-card { border-radius: 12px; border: 1px solid #eee; background: #fff; }
        .sales-metric-title { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin-bottom: 6px; }
        .sales-metric-value { font-size: 1.5rem; font-weight: 900; color: #111; margin: 0; }
        .sales-metric-sub { font-size: 0.65rem; color: #555; font-weight: 600; margin-top: 4px; }
        .filter-select { font-size: 0.85rem; font-weight: 600; border-color: #ddd; border-radius: 6px; }
        .filter-select:focus { border-color: #111; box-shadow: none; }
        .hover-pointer:hover { background-color: #f7f8fa !important; cursor: pointer; }

        @media print {
          body { background: #fff !important; color: #000 !important; }
          .admin-sidebar, .admin-header, .admin-mobile-nav, .no-print, .modal-footer, .btn, button, form, .modal-header .btn-close {
            display: none !important;
          }
          .admin-main {
            flex: 0 0 100% !important;
            max-width: 100% !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .sales-card {
            border: 1px solid #ddd !important;
            box-shadow: none !important;
            background: #fff !important;
            page-break-inside: avoid;
          }
          .modal-dialog {
            max-width: 100% !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .modal-content {
            border: none !important;
            box-shadow: none !important;
            background: #fff !important;
          }
          .modal-body {
            padding: 0 !important;
          }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { border: 1px solid #ddd !important; padding: 8px !important; }
          .badge { border: 1px solid #000 !important; color: #000 !important; background: transparent !important; }
        }
      `}</style>

      {/* Print Only Header */}
      <div className="d-none d-print-block text-center mb-4">
        <h2 className="fw-black text-uppercase m-0">GENZ SKIN STUDIO</h2>
        <h5 className="text-uppercase tracking-widest text-muted mt-2" style={{ fontSize: '12px' }}>
          Daily Sales Journal &amp; Ledger — {months.find(m => m.value === selectedMonth)?.label} {selectedYear} Report
        </h5>
        <hr />
      </div>

      <div className="d-flex justify-content-between align-items-end mb-4 no-print">
        <div>
          <h4 className="fw-black text-uppercase tracking-tighter m-0">Daily Sales Journal</h4>
          <p className="text-muted small mb-0 uppercase tracking-widest">
            {months.find(m => m.value === selectedMonth)?.label} {selectedYear} Report
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-dark" 
            className="rounded-pill px-4 fw-bold small text-uppercase d-flex align-items-center gap-2"
            onClick={handlePrint}
            style={{ fontSize: '0.75rem', height: '38px' }}
          >
            <FaPrint /> Print Report
          </Button>
          <Button 
            variant="outline-dark" 
            className="rounded-pill px-4 fw-bold small text-uppercase d-flex align-items-center gap-2"
            onClick={exportCSV}
            disabled={salesData.length === 0}
            style={{ fontSize: '0.75rem', height: '38px' }}
          >
            <FaFileDownload /> Export CSV
          </Button>
        </div>
      </div>

      {/* FILTER CONTROL CARD */}
      <Card className="border-0 shadow-sm rounded-3 p-4 mb-4 no-print">
        <Form>
          <Row className="g-3 align-items-end">
            <Col xs={12} sm={4} md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold uppercase text-muted" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Filter Month</Form.Label>
                <Form.Select 
                  className="filter-select rounded-3 py-2"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4} md={3}>
              <Form.Group>
                <Form.Label className="small fw-bold uppercase text-muted" style={{ fontSize: '9px', letterSpacing: '0.5px' }}>Filter Year</Form.Label>
                <Form.Select 
                  className="filter-select rounded-3 py-2"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {years.map(y => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} sm={4} md={3} className="ms-auto d-flex justify-content-sm-end">
              <Button 
                variant="dark" 
                className="w-100 rounded-3 py-2 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2"
                onClick={fetchDailySales}
                style={{ fontSize: '0.8rem', height: '40px' }}
              >
                <FaSearch size={12} /> Refilter
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {error && <Alert variant="danger" className="rounded-3 small">{error}</Alert>}

      {/* KPI STATS ROW */}
      <Row className="g-3 mb-4">
        {/* Net Profit Card */}
        <Col xs={12} sm={6} md={3}>
          <Card className="sales-card shadow-sm p-4">
            <div className="sales-metric-title">Net Profit (Delivered)</div>
            <h3 className="sales-metric-value text-success">PKR {summary.delivered.toLocaleString()}</h3>
            <div className="sales-metric-sub">Earned from completed sales</div>
          </Card>
        </Col>

        {/* Gross Revenue Card */}
        <Col xs={12} sm={6} md={3}>
          <Card className="sales-card shadow-sm p-4">
            <div className="sales-metric-title">Gross Revenue</div>
            <h3 className="sales-metric-value text-dark">PKR {summary.gross.toLocaleString()}</h3>
            <div className="sales-metric-sub">Total sales volume (all statuses)</div>
          </Card>
        </Col>

        {/* Dispatched Card */}
        <Col xs={12} sm={6} md={3}>
          <Card className="sales-card shadow-sm p-4" style={{ background: '#f0f7ff' }}>
            <div className="sales-metric-title text-primary">In Transit (Dispatched)</div>
            <h3 className="sales-metric-value text-primary">PKR {summary.dispatched.toLocaleString()}</h3>
            <div className="sales-metric-sub">Shipped but not delivered yet</div>
          </Card>
        </Col>

        {/* Pending Card */}
        <Col xs={12} sm={6} md={3}>
          <Card className="sales-card shadow-sm p-4" style={{ background: '#fffbeb' }}>
            <div className="sales-metric-title text-warning">Pending Billing</div>
            <h3 className="sales-metric-value text-warning">PKR {summary.pending.toLocaleString()}</h3>
            <div className="sales-metric-sub">Awaiting confirmation/dispatch</div>
          </Card>
        </Col>
      </Row>

      {/* SALES JOURNAL TABLE */}
      <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
        <Card.Header className="bg-white border-0 py-3 ps-4 d-flex justify-content-between align-items-center">
          <h5 className="fw-black text-uppercase tracking-tighter mb-0" style={{ fontSize: '13px' }}>
            Daily Sales Transactions Ledger
          </h5>
          <Badge bg="dark" className="rounded-pill px-3 py-2 fw-bold" style={{ fontSize: '9px' }}>
            {salesData.length} DAYS RECORDED
          </Badge>
        </Card.Header>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="dark" />
            <p className="mt-3 text-uppercase tracking-wider small fw-bold" style={{ fontSize: '10px' }}>Analyzing Ledger Books...</p>
          </div>
        ) : salesData.length === 0 ? (
          <div className="text-center py-5 bg-light m-3 rounded-3 border">
            <p className="text-muted text-uppercase tracking-wider small fw-bold m-0" style={{ fontSize: '10px' }}>No sales logs found for this period</p>
          </div>
        ) : (
          <Table hover responsive className="mb-0 align-middle border-0" style={{ fontSize: '13px' }}>
            <thead className="bg-light border-bottom">
              <tr className="text-uppercase small fw-bold tracking-wider text-muted" style={{ fontSize: '10px' }}>
                <th className="py-3 ps-4">Date</th>
                <th className="py-3">Gross Sales</th>
                <th className="py-3 text-success">Net Profit (Delivered)</th>
                <th className="py-3 text-primary">Transit (Dispatched)</th>
                <th className="py-3 text-warning">Pending Amount</th>
                <th className="py-3 text-center">Transactions</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((day, idx) => (
                <tr key={idx} className="border-bottom hover-pointer" onClick={() => handleRowClick(day.date)}>
                  <td className="py-3 ps-4 fw-bold text-dark">{formatDate(day.date)}</td>
                  <td className="py-3 fw-bold text-dark">PKR {day.grossSales.toLocaleString()}</td>
                  <td className="py-3 fw-bold text-success">
                    PKR {day.deliveredSales.toLocaleString()}
                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 'normal' }}>
                      {day.deliveredCount} orders completed
                    </div>
                  </td>
                  <td className="py-3 fw-bold text-primary">
                    PKR {day.dispatchedSales.toLocaleString()}
                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 'normal' }}>
                      {day.dispatchedCount} orders in transit
                    </div>
                  </td>
                  <td className="py-3 fw-bold text-warning">
                    PKR {day.pendingSales.toLocaleString()}
                    <div style={{ fontSize: '9px', color: '#888', fontWeight: 'normal' }}>
                      {day.pendingCount} orders pending
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge bg="dark" className="rounded-0 px-3 py-1 fw-bold" style={{ fontSize: '10px' }}>
                      {day.totalOrders} Orders
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Daily Transaction Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light py-3 border-bottom no-print">
          <Modal.Title className="fw-black text-uppercase tracking-tighter" style={{ fontSize: '1.1rem' }}>
            Daily Order Ledger – {selectedDate ? formatDate(selectedDate) : ''}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {loadingOrders ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="dark" />
              <p className="mt-3 text-uppercase tracking-wider small fw-bold" style={{ fontSize: '10px' }}>Loading detailed orders...</p>
            </div>
          ) : ordersError ? (
            <Alert variant="danger">{ordersError}</Alert>
          ) : dailyOrders.length === 0 ? (
            <div className="text-center py-4 bg-light rounded border">
              <p className="text-muted text-uppercase tracking-wider small fw-bold m-0" style={{ fontSize: '10px' }}>No orders found for this day</p>
            </div>
          ) : (
            <>
              {/* Inner Modal Filter controls */}
              <div className="mb-3 d-flex gap-3 align-items-center flex-wrap no-print">
                <div className="flex-grow-1" style={{ minWidth: '200px' }}>
                  <Form.Control
                    type="text"
                    placeholder="Search customer, ID, phone, email, or items..."
                    value={modalSearch}
                    onChange={(e) => setModalSearch(e.target.value)}
                    style={{ fontSize: '0.85rem', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ width: '150px' }}>
                  <Form.Select
                    value={modalStatusFilter}
                    onChange={(e) => setModalStatusFilter(e.target.value)}
                    style={{ fontSize: '0.85rem', borderRadius: '8px' }}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                  </Form.Select>
                </div>
                <div>
                  <Button
                    variant="dark"
                    size="sm"
                    className="rounded-3 px-3 fw-bold text-uppercase d-flex align-items-center gap-2"
                    onClick={handlePrint}
                    style={{ fontSize: '0.75rem', height: '35px' }}
                  >
                    <FaPrint /> Print List
                  </Button>
                </div>
              </div>

              {/* Printable Header inside modal */}
              <div className="d-none d-print-block text-center mb-4">
                <h4 className="fw-black text-uppercase m-0">GENZ SKIN STUDIO</h4>
                <h6 className="text-uppercase tracking-widest text-muted mt-2" style={{ fontSize: '10px' }}>
                  Daily Order Ledger – {selectedDate ? formatDate(selectedDate) : ''}
                </h6>
                <hr />
              </div>

              <Table responsive hover className="align-middle border rounded overflow-hidden" style={{ fontSize: '12.5px' }}>
                <thead className="bg-light border-bottom">
                  <tr className="text-uppercase small fw-bold tracking-wider text-muted" style={{ fontSize: '9px' }}>
                    <th className="py-3 ps-3">Order ID</th>
                    <th className="py-3">Customer</th>
                    <th className="py-3">Items Ordered</th>
                    <th className="py-3">Payment</th>
                    <th className="py-3">Status</th>
                    <th className="py-3 text-end pe-3">Total Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No orders match the filters.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order._id} className="border-bottom">
                        <td className="py-3 ps-3 fw-bold text-secondary">
                          <a href={`/admin/invoice/${order._id}`} target="_blank" rel="noreferrer" className="text-decoration-none text-dark hover-underline">
                            #{order._id ? order._id.substring(order._id.length - 8).toUpperCase() : ''}
                          </a>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold">{order.shippingDetails?.firstName} {order.shippingDetails?.lastName}</div>
                          <div style={{ fontSize: '10px', color: '#666' }}>{order.contact?.email}</div>
                          <div style={{ fontSize: '10px', color: '#666' }}>{order.shippingDetails?.phone}</div>
                        </td>
                        <td className="py-3">
                          {order.orderItems?.map((item, idx) => (
                            <div key={idx} style={{ lineHeight: '1.3' }}>
                              <span className="fw-bold text-dark">{item.name}</span> <span className="text-muted">x{item.quantity}</span>
                            </div>
                          ))}
                        </td>
                        <td className="py-3 text-uppercase font-monospace" style={{ fontSize: '10px' }}>
                          {order.paymentMethod ? order.paymentMethod.replace(/_/g, ' ') : 'COD'}
                        </td>
                        <td className="py-3">
                          <Badge
                            bg={
                              order.status === 'delivered'
                                ? 'success'
                                : order.status === 'dispatched'
                                ? 'primary'
                                : 'warning'
                            }
                            className="rounded-pill px-2 py-1"
                            style={{ fontSize: '9px' }}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-3 text-end fw-bold pe-3 text-dark">
                          PKR {order.totalPrice?.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default AdminSales;
