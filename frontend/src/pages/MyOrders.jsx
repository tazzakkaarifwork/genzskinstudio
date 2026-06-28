import React, { useState, useEffect } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import Navbar from '../components/Navbar';
const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/myorders');
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      dispatched: 'info',
      delivered: 'success',
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <>
      <Helmet>
        <title>My Orders - GenZ Skin Care</title>
      </Helmet>
      <Container className="my-5">
        <h2 className="mb-4">My Orders</h2>
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8)}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.orderItems.length} items</td>
                  <td>PKR {order.totalPrice.toLocaleString()}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>{order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery' : 'EasyPaisa'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>
    </>
  );
};

export default MyOrders;