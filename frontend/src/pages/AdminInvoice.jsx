import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Table, Button, Container, Row, Col, Card } from 'react-bootstrap';
import api from '../services/api';

const AdminInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order details for invoice:', err);
        setError(err.response?.data?.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getOrderItemImageUrl = (item) => {
    const raw = item.image || item.product?.image || item.product?.cardImage;
    if (!raw) return 'https://via.placeholder.com/50x50?text=No+Img';
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-white">
        <div className="text-center">
          <Spinner animation="border" variant="dark" />
          <p className="mt-3 fw-bold text-uppercase tracking-wider">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <Container className="py-5 text-center bg-white">
        <h4 className="text-danger fw-bold text-uppercase mb-3">Error</h4>
        <p className="text-muted mb-4">{error || 'Order not found'}</p>
        <Button variant="dark" onClick={() => navigate('/admin/orders')} className="rounded-0 px-4 py-2 text-uppercase fw-bold">
          Back to Orders
        </Button>
      </Container>
    );
  }

  const customerName = `${order.shippingDetails?.firstName || ''} ${order.shippingDetails?.lastName || ''}`.trim();
  const billingName = order.billingAddress 
    ? `${order.billingAddress.firstName || ''} ${order.billingAddress.lastName || ''}`.trim()
    : customerName;

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <style>{`
        /* Print-specific overrides */
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #fff !important;
            color: #000 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-break {
            page-break-after: always;
          }
        }

        /* Styling for the screen view */
        .invoice-body {
          background-color: #f4f4f4;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          color: #222;
        }
        .invoice-card {
          background: #fff;
          border: 1px solid #eaeaea;
          border-radius: 8px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          max-width: 800px;
          margin: 0 auto;
          padding: 40px;
        }
        .invoice-header {
          border-bottom: 2px solid #000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .brand-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 2px;
          line-height: 1;
        }
        .invoice-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 28px;
          letter-spacing: 1px;
          color: #888;
        }
        .details-box {
          background-color: #fafafa;
          border: 1px dashed #ddd;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 25px;
        }
        .section-heading {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #888;
          font-weight: 700;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 5px;
          margin-bottom: 10px;
        }
        .item-table th {
          background-color: #000 !important;
          color: #fff !important;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 10px 15px;
        }
        .item-table td {
          padding: 12px 15px;
          vertical-align: middle;
        }
        .fw-black {
          font-weight: 900;
        }
        .floating-action-bar {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #eaeaea;
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 15px 0;
          margin-bottom: 30px;
        }
        @media (max-width: 576px) {
          .invoice-body {
            background: #fff;
            overflow-x: hidden;
          }
          .invoice-card {
            width: 100%;
            max-width: 100%;
            border-left: 0;
            border-right: 0;
            border-radius: 0;
            padding: 18px 14px;
            box-shadow: none;
          }
          .floating-action-bar {
            padding: 10px 0;
            margin-bottom: 12px;
          }
          .floating-action-bar .container {
            padding-left: 12px;
            padding-right: 12px;
            gap: 8px;
            flex-wrap: wrap;
          }
          .floating-action-bar .btn {
            flex: 1 1 140px;
            padding: 9px 10px !important;
            font-size: 11px !important;
          }
          .invoice-header {
            align-items: flex-start !important;
            gap: 18px;
            flex-direction: column;
            margin-bottom: 22px;
          }
          .invoice-header .text-end {
            text-align: left !important;
            width: 100%;
            word-break: break-word;
          }
          .brand-title { font-size: 24px; }
          .invoice-title { font-size: 23px; }
          .details-box { padding: 12px; }
          .item-table { font-size: 12px; }
          .item-table th,
          .item-table td {
            padding: 9px 8px;
            white-space: normal;
            word-break: break-word;
          }
          .item-table th:first-child,
          .item-table td:first-child,
          .item-table th:nth-child(4),
          .item-table td:nth-child(4) {
            display: none;
          }
        }
      `}</style>

      <div className="invoice-body py-4 py-print-0">
        
        {/* ACTION BAR (HIDDEN IN PRINT) */}
        <div className="floating-action-bar no-print shadow-sm">
          <Container style={{ maxWidth: '800px' }} className="d-flex justify-content-between">
            <Button 
              variant="outline-dark" 
              onClick={() => navigate('/admin/orders')}
              className="rounded-0 text-uppercase fw-bold px-3 py-2"
              style={{ fontSize: '12px' }}
            >
              Back to Orders
            </Button>
            <Button 
              variant="dark" 
              onClick={handlePrint}
              className="rounded-0 text-uppercase fw-bold px-4 py-2"
              style={{ fontSize: '12px', letterSpacing: '1px' }}
            >
              Print Invoice
            </Button>
          </Container>
        </div>

        {/* PRINTABLE SHEET */}
        <div className="invoice-card" id="printable-invoice">
          
          {/* HEADER */}
          <div className="invoice-header d-flex justify-content-between align-items-end">
            <div>
              <h1 className="brand-title fw-black text-dark m-0">GENZ SKIN STUDIO</h1>
              <p className="text-muted small m-0 mt-1">Premium Skincare Essentials</p>
              <p className="text-muted small m-0">genz.skinstudio@gmail.com | Karachi, Pakistan</p>
            </div>
            <div className="text-end">
              <h2 className="invoice-title m-0">INVOICE</h2>
              <span className="fw-black text-dark">#{order._id.toUpperCase()}</span>
            </div>
          </div>

          {/* METADATA ROW */}
          <div className="details-box">
            <Row className="g-3">
              <Col xs={6} sm={3}>
                <span className="d-block text-muted text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Order Date</span>
                <span className="fw-bold small">{orderDate}</span>
              </Col>
              <Col xs={6} sm={3}>
                <span className="d-block text-muted text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Payment Method</span>
                <span className="fw-bold small text-uppercase">{order.paymentMethod === 'cash_on_delivery' ? 'COD (Cash)' : order.paymentMethod.replace(/_/g, ' ')}</span>
              </Col>
              <Col xs={6} sm={3}>
                <span className="d-block text-muted text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Payment Status</span>
                <span className={`fw-bold small text-uppercase ${order.status === 'delivered' ? 'text-success' : 'text-warning'}`}>
                  {order.status === 'delivered' ? 'Paid / Completed' : 'Pending COD'}
                </span>
              </Col>
              <Col xs={6} sm={3}>
                <span className="d-block text-muted text-uppercase" style={{ fontSize: '9px', letterSpacing: '1px' }}>Fulfillment Status</span>
                <span className="fw-bold small text-uppercase text-dark">{order.status === 'dispatched' ? 'In Transit' : order.status}</span>
              </Col>
            </Row>
          </div>

          {/* BILLING / SHIPPING DETAILS */}
          <Row className="mb-4 g-4">
            <Col md={6}>
              <div className="section-heading">Ship To Address</div>
              <div className="fw-bold">{customerName}</div>
              <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>
                {order.shippingDetails?.address}
                {order.shippingDetails?.apartment && `, Apt/Suite: ${order.shippingDetails.apartment}`}
                <br />
                {order.shippingDetails?.city}, {order.shippingDetails?.country} {order.shippingDetails?.postalCode || ''}
                <br />
                <span className="fw-bold text-dark">Phone: {order.shippingDetails?.phone}</span>
              </div>
            </Col>
            <Col md={6}>
              <div className="section-heading">Billing Address</div>
              {order.billingAddress ? (
                <>
                  <div className="fw-bold">{billingName}</div>
                  <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>
                    {order.billingAddress.address}
                    {order.billingAddress.apartment && `, Apt/Suite: ${order.billingAddress.apartment}`}
                    <br />
                    {order.billingAddress.city}, {order.billingAddress.country} {order.billingAddress.postalCode || ''}
                    <br />
                    <span className="fw-bold text-dark">Phone: {order.billingAddress.phone}</span>
                  </div>
                </>
              ) : (
                <div className="text-muted small mt-1 italic">Same as shipping address</div>
              )}
            </Col>
          </Row>

          {/* ORDER ITEMS TABLE */}
          <div className="mb-4">
            <div className="section-heading">Items Ordered</div>
            <Table hover responsive className="item-table border align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Img</th>
                  <th>Product Details</th>
                  <th className="text-center" style={{ width: '80px' }}>Qty</th>
                  <th className="text-end" style={{ width: '120px' }}>Unit Price</th>
                  <th className="text-end" style={{ width: '140px' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.orderItems?.map((item, index) => (
                  <tr key={index} className="border-bottom">
                    <td className="p-2">
                      <img 
                        src={getOrderItemImageUrl(item)} 
                        alt={item.name} 
                        width="38" 
                        height="38" 
                        className="rounded border" 
                        style={{ objectFit: 'cover' }} 
                      />
                    </td>
                    <td>
                      <span className="fw-bold d-block">{item.name}</span>
                      <small className="text-muted font-monospace" style={{ fontSize: '10px' }}>ID: {item.product?._id || item.product}</small>
                    </td>
                    <td className="text-center fw-bold">{item.quantity}</td>
                    <td className="text-end">PKR {item.price.toLocaleString()}</td>
                    <td className="text-end fw-black">PKR {(item.price * item.quantity).toLocaleString()}</td>
                  </tr>
                ))}
                
                {/* FINANCIAL SUMMARY */}
                <tr className="bg-light border-0">
                  <td colSpan="3" className="border-0"></td>
                  <td className="text-end fw-bold py-2 border-0">Shipping:</td>
                  <td className="text-end py-2 border-0 fw-bold">FREE</td>
                </tr>
                <tr className="bg-light border-0">
                  <td colSpan="3" className="border-0"></td>
                  <td className="text-end fw-bold py-2 border-top border-dark">Grand Total:</td>
                  <td className="text-end py-2 border-top border-dark fw-black text-danger fs-6">PKR {order.totalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </Table>
          </div>



          {/* INVOICE FOOTER NOTE */}
          <div className="text-center mt-5 text-muted small" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>
            Thank you for shopping at GenZ Skin Studio. We appreciate your support for premium skincare!
          </div>

        </div>
      </div>
    </>
  );
};

export default AdminInvoice;
