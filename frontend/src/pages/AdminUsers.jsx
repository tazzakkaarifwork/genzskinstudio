import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.put(`/users/${editingUser._id}`, formData);
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update user');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Permanently remove this user?')) {
      await api.delete(`/users/${id}`);
      fetchUsers();
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone || '', address: user.address || '', city: user.city || '', role: user.role });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', email: '', phone: '', address: '', city: '', role: 'user' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <h4 className="fw-black text-uppercase tracking-tighter mb-4 text-dark">User Directory</h4>

      <Card className="border-0 shadow-sm rounded-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-dark text-white">
            <tr className="text-uppercase small tracking-widest" style={{fontSize: '11px'}}>
              <th className="py-3 ps-4">User Details</th>
              <th className="py-3">Location</th>
              <th className="py-3">Privilege</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-bottom">
                <td className="ps-4">
                  <div className="fw-black text-dark text-uppercase small">{user.name}</div>
                  <div className="text-muted small lowercase">{user.email}</div>
                  <div className="text-muted" style={{fontSize:'10px'}}>{user.phone || 'No contact'}</div>
                </td>
                <td className="text-muted small text-uppercase fw-bold">{user.city || '-'}</td>
                <td>
                  <span className={`fw-black px-2 py-1 rounded-0 ${user.role === 'admin' ? 'bg-dark text-white' : 'bg-light text-dark'}`} style={{fontSize: '9px', letterSpacing: '1px'}}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td className="text-end pe-4">
                  <Button variant="link" className="text-dark p-0 me-3 fw-black small uppercase text-decoration-none" onClick={() => handleEdit(user)}>Edit</Button>
                  {user.role !== 'admin' && (
                    <Button variant="link" className="text-danger p-0 fw-black small uppercase text-decoration-none" onClick={() => handleDelete(user._id)}>Remove</Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered>
        <div className="p-2">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-black text-uppercase tracking-tighter">Edit Credentials</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="py-4">
              {error && <Alert variant="danger" className="rounded-0 small">{error}</Alert>}
              <div className="d-flex gap-3 mb-3">
                <Form.Group className="flex-grow-1">
                  <Form.Label className="small fw-bold uppercase text-muted">Full Name</Form.Label>
                  <Form.Control className="rounded-0 border-dark" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </Form.Group>
                <Form.Group className="w-25">
                  <Form.Label className="small fw-bold uppercase text-muted">Role</Form.Label>
                  <Form.Select className="rounded-0 border-dark" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </Form.Select>
                </Form.Group>
              </div>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Email Address</Form.Label>
                <Form.Control className="rounded-0 border-dark" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Shipping City</Form.Label>
                <Form.Control className="rounded-0 border-dark" type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0 pt-0">
              <Button variant="light" className="rounded-0 px-4 fw-bold uppercase small" onClick={handleCloseModal}>Discard</Button>
              <Button type="submit" variant="dark" className="rounded-0 px-4 fw-bold uppercase small" disabled={loading}>Update Account</Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminUsers;