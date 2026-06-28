import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this category?')) {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-black text-uppercase tracking-tighter m-0">Category Management</h4>
        <Button 
          variant="dark" 
          className="rounded-0 px-4 fw-bold text-uppercase small"
          onClick={() => setShowModal(true)}
        >
          + Add New
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-0">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr className="text-uppercase small fw-black tracking-widest text-muted">
              <th className="py-3 ps-4">Category Name</th>
              <th className="py-3">Description</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category._id} className="border-bottom-0">
                <td className="ps-4 fw-bold text-dark">{category.name}</td>
                <td className="text-muted small">{category.description || 'No description provided.'}</td>
                <td className="text-end pe-4">
                  <Button variant="link" className="text-dark p-0 me-3 text-decoration-none fw-bold small uppercase" onClick={() => handleEdit(category)}>Edit</Button>
                  <Button variant="link" className="text-danger p-0 text-decoration-none fw-bold small uppercase" onClick={() => handleDelete(category._id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} centered className="rounded-0">
        <div className="p-2">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-black text-uppercase tracking-tighter">
              {editingCategory ? 'Modify Category' : 'New Collection'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {error && <Alert variant="danger" className="rounded-0 small">{error}</Alert>}
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted">Category Title</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  type="text"
                  placeholder="e.g. Serums"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold text-uppercase text-muted">Brief Description</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  as="textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" className="rounded-0 px-4 fw-bold text-uppercase small" onClick={handleCloseModal}>Close</Button>
              <Button type="submit" variant="dark" className="rounded-0 px-4 fw-bold text-uppercase small" disabled={loading}>
                {loading ? 'Processing...' : 'Save Category'}
              </Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminCategories;