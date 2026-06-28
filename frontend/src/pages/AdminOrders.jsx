import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Card,
  Row,
  Col,
  Image,
} from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  // Search & Bulk selection states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
      setOrders([]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredOrders.map((o) => o._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id, checked) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to permanently delete the ${selectedIds.length} selected orders?`
      )
    ) {
      try {
        const { data } = await api.post('/orders/bulk-delete', {
          ids: selectedIds,
        });

        alert(data.message || 'Orders deleted successfully');
        fetchOrders();
      } catch (err) {
        alert(
          err.response?.data?.message ||
            'Failed to delete selected orders'
        );
      }
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase().trim();

    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;

    if (!searchLower) return matchesStatus;

    const matchesSearch =
      order._id.toLowerCase().includes(searchLower) ||
      (order.user?.name || '')
        .toLowerCase()
        .includes(searchLower) ||
      (order.contact?.email || '')
        .toLowerCase()
        .includes(searchLower) ||
      (order.shippingDetails?.firstName || '')
        .toLowerCase()
        .includes(searchLower) ||
      (order.shippingDetails?.lastName || '')
        .toLowerCase()
        .includes(searchLower) ||
      (order.shippingDetails?.phone || '')
        .toLowerCase()
        .includes(searchLower) ||
      (order.shippingDetails?.city || '')
        .toLowerCase()
        .includes(searchLower);

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      pending: {
        bg: '#fff3cd',
        color: '#856404',
        text: 'PENDING',
      },
      dispatched: {
        bg: '#cce5ff',
        color: '#004085',
        text: 'IN TRANSIT',
      },
      delivered: {
        bg: '#d4edda',
        color: '#155724',
        text: 'COMPLETED',
      },
    };

    const current = styles[status] || styles.pending;

    return (
      <span
        className="px-3 py-1 rounded-pill fw-black"
        style={{
          backgroundColor: current.bg,
          color: current.color,
          fontSize: '10px',
          letterSpacing: '1px',
        }}
      >
        {current.text}
      </span>
    );
  };

  const handleStatusUpdate = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, {
        status: newStatus,
      });

      fetchOrders();
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (
      window.confirm(
        'Are you sure you want to permanently delete/cancel this order?'
      )
    ) {
      try {
        await api.delete(`/orders/${id}`);
        fetchOrders();
        setShowModal(false);
      } catch (err) {
        alert(
          err.response?.data?.message || 'Failed to delete order'
        );
      }
    }
  };

  const getOrderItemImageUrl = (item) => {
    const raw = item.image || item.product?.image;

    if (!raw) {
      return 'https://via.placeholder.com/60x60?text=No+Img';
    }

    if (raw.startsWith('http')) return raw;

    const cleanPath = raw.startsWith('/') ? raw : `/${raw}`;

    return cleanPath;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <h4 className="fw-black text-uppercase tracking-tighter m-0">
          Order Fulfillment
        </h4>

        {selectedIds.length > 0 && (
          <Button
            variant="danger"
            className="rounded-0 fw-bold text-uppercase px-3 py-2"
            style={{ fontSize: '11px', letterSpacing: '0.5px' }}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <Card className="border-0 shadow-sm rounded-0 p-3 mb-3 bg-white">
        <Row className="g-3">
          <Col md={12}>
            <Form.Control
              type="text"
              placeholder="Search by Order ID, Client Name, Email, Phone, City..."
              className="rounded-0 border-dark py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '13px' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm rounded-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle border-0">
          <thead className="bg-dark text-white">
            <tr className="text-uppercase small tracking-widest">
              <th className="py-3 ps-4" style={{ width: '40px' }}>
                <Form.Check
                  type="checkbox"
                  checked={
                    filteredOrders.length > 0 &&
                    selectedIds.length === filteredOrders.length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="py-3">ID</th>
              <th className="py-3">Client</th>
              <th className="py-3">Date</th>
              <th className="py-3">Total</th>
              <th className="py-3">Status</th>
              <th className="py-3">Method</th>
              <th className="py-3 text-end pe-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-4 text-muted small"
                >
                  No orders match your search criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order._id} className="border-bottom">
                  <td className="ps-4">
                    <Form.Check
                      type="checkbox"
                      checked={selectedIds.includes(order._id)}
                      onChange={(e) =>
                        handleSelectOne(
                          order._id,
                          e.target.checked
                        )
                      }
                    />
                  </td>

                  <td className="fw-bold text-muted small">
                    #{order._id.slice(-6).toUpperCase()}
                  </td>

                  <td className="fw-bold">
                    {order.user?.name ||
                      `${order.shippingDetails?.firstName || ''} ${
                        order.shippingDetails?.lastName || ''
                      }`.trim() ||
                      'Guest'}
                  </td>

                  <td className="small text-muted">
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="fw-black">
                    PKR {order.totalPrice.toLocaleString()}
                  </td>

                  <td>{getStatusBadge(order.status)}</td>

                  <td className="small fw-bold text-uppercase">
                    {order.paymentMethod ===
                    'cash_on_delivery'
                      ? 'COD'
                      : 'Prepaid'}
                  </td>

                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Button
                        variant="outline-dark"
                        className="rounded-0 fw-black px-3 py-1 text-uppercase"
                        style={{ fontSize: '10px' }}
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                          setShowModal(true);
                        }}
                      >
                        Manage
                      </Button>

                      <Button
                        variant="outline-secondary"
                        className="rounded-0 px-2 py-1"
                        style={{
                          fontSize: '10px',
                          borderColor: '#ccc',
                        }}
                        onClick={() =>
                          window.open(
                            `/admin/invoice/${order._id}`,
                            '_blank'
                          )
                        }
                        title="Print Invoice"
                      >
                        Print
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-black text-uppercase tracking-tighter">
            Order Details & Fulfillment
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="py-4">
          {selectedOrder && (
            <>
              <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="small text-muted fw-bold text-uppercase">
                    Order ID:
                  </span>

                  <span className="ms-2 fw-black text-dark">
                    #{selectedOrder._id.toUpperCase()}
                  </span>
                </div>

                <Button
                  variant="dark"
                  className="rounded-0 fw-bold px-3 py-2 text-uppercase"
                  style={{
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                  }}
                  onClick={() =>
                    window.open(
                      `/admin/invoice/${selectedOrder._id}`,
                      '_blank'
                    )
                  }
                >
                  Print Invoice
                </Button>
              </div>

              <Row className="g-4 mb-4">
                <Col md={6}>
                  <div className="p-3 bg-light border rounded-3 h-100">
                    <h6 className="fw-black text-uppercase mb-3">
                      Customer Contact
                    </h6>

                    <div className="small mb-1">
                      <strong>Email:</strong>{' '}
                      {selectedOrder.contact?.email}
                    </div>

                    <div className="small">
                      <strong>Phone:</strong>{' '}
                      {selectedOrder.shippingDetails?.phone}
                    </div>
                  </div>
                </Col>

                <Col md={6}>
                  <div className="p-3 bg-light border rounded-3 h-100">
                    <h6 className="fw-black text-uppercase mb-3">
                      Shipping Address
                    </h6>

                    <div className="small fw-bold">
                      {
                        selectedOrder.shippingDetails
                          ?.firstName
                      }{' '}
                      {
                        selectedOrder.shippingDetails
                          ?.lastName
                      }
                    </div>

                    <div className="small text-muted mt-1">
                      {
                        selectedOrder.shippingDetails
                          ?.address
                      }
                      <br />
                      {
                        selectedOrder.shippingDetails?.city
                      }
                      ,{' '}
                      {
                        selectedOrder.shippingDetails
                          ?.country
                      }
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Items */}
              <div className="mb-4">
                <h6 className="fw-black text-uppercase mb-3">
                  Items Ordered
                </h6>

                <div className="table-responsive border rounded-3">
                  <Table
                    hover
                    className="align-middle mb-0"
                  >
                    <thead className="bg-light">
                      <tr>
                        <th className="py-2 ps-3">
                          Product
                        </th>

                        <th className="py-2 text-center">
                          Qty
                        </th>

                        <th className="py-2 text-end">
                          Price
                        </th>

                        <th className="py-2 text-end pe-3">
                          Subtotal
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedOrder.orderItems?.map(
                        (item, idx) => (
                          <tr key={idx}>
                            <td className="ps-3 d-flex align-items-center gap-3">
                              <Image
                                src={getOrderItemImageUrl(
                                  item
                                )}
                                width="40"
                                height="40"
                                className="rounded border"
                                style={{
                                  objectFit: 'cover',
                                }}
                              />

                              <div>
                                <div className="fw-bold">
                                  {item.name}
                                </div>

                                <small className="text-muted" style={{ display: 'block', wordBreak: 'break-all', fontSize: '10px', marginTop: '2px' }}>
                                  ID: {item.product?._id || item.product}
                                </small>
                              </div>
                            </td>

                            <td className="text-center fw-semibold">
                              {item.quantity}
                            </td>

                            <td className="text-end">
                              PKR{' '}
                              {item.price.toLocaleString()}
                            </td>

                            <td className="text-end pe-3 fw-black">
                              PKR{' '}
                              {(
                                item.price *
                                item.quantity
                              ).toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}

                      <tr className="bg-light">
                        <td
                          colSpan="3"
                          className="text-end fw-bold py-3"
                        >
                          Total Amount:
                        </td>

                        <td className="text-end pe-3 py-3 fw-black text-danger fs-6">
                          PKR{' '}
                          {selectedOrder.totalPrice.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </div>

              {/* Status */}
              <Row className="align-items-end g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="small fw-bold text-uppercase text-muted mb-2">
                      Order Fulfillment Status
                    </Form.Label>

                    <Form.Select
                      className="rounded-0 border-dark py-2"
                      value={newStatus}
                      onChange={(e) =>
                        setNewStatus(e.target.value)
                      }
                    >
                      <option value="pending">
                        Pending - Verification Required
                      </option>

                      <option value="dispatched">
                        Dispatched - In Transit
                      </option>

                      <option value="delivered">
                        Delivered - Order Closed
                      </option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={4} className="text-end">
                  <Button
                    variant="outline-danger"
                    className="rounded-0 w-100 py-2 fw-bold text-uppercase small"
                    onClick={() =>
                      handleDeleteOrder(selectedOrder._id)
                    }
                  >
                    Delete/Cancel Order
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="light"
            className="rounded-0 fw-bold text-uppercase small px-4"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="dark"
            className="rounded-0 fw-bold text-uppercase small px-4"
            onClick={handleStatusUpdate}
          >
            Confirm Change
          </Button>
        </Modal.Footer>
      </Modal>
    </motion.div>
  );
};

export default AdminOrders;
