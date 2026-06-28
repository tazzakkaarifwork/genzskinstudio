import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Table } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminFAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data } = await api.get('/faqs');
      if (Array.isArray(data)) {
        setFaqs(data);
      } else {
        setFaqs([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load FAQs');
      setFaqs([]);
    }
  };

  const handleClose = () => {
    setShow(false);
    setEditing(null);
    setError('');
    setForm({ question: '', answer: '' });
  };

  const handleEdit = (faq) => {
    setEditing(faq);
    setForm({ question: faq.question, answer: faq.answer });
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this FAQ?')) {
      await api.delete(`/faqs/${id}`);
      fetchFaqs();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/faqs/${editing._id}`, form);
      } else {
        await api.post('/faqs', form);
      }
      fetchFaqs();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save FAQ');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-black text-uppercase tracking-tighter m-0">FAQs Management</h4>
          <p className="text-muted small mb-0 uppercase tracking-widest">Total FAQs: {faqs.length}</p>
        </div>
        <Button variant="dark" className="rounded-0 px-4 fw-bold small text-uppercase" onClick={() => setShow(true)}>
          + Add FAQ
        </Button>
      </div>

      {error && <Alert variant="danger" className="rounded-0 small">{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle border-0">
          <thead className="bg-light border-bottom">
            <tr className="text-uppercase small fw-black tracking-widest text-muted">
              <th className="py-3 ps-4">#</th>
              <th className="py-3">Question</th>
              <th className="py-3">Answer</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {faqs.map((faq, i) => (
              <tr key={faq._id} className="border-bottom">
                <td className="ps-4 small text-muted">{i + 1}</td>
                <td className="fw-bold text-dark">{faq.question}</td>
                <td className="text-muted small" style={{ maxWidth: '420px', whiteSpace: 'normal' }}>{faq.answer}</td>
                <td className="text-end pe-4">
                  <Button variant="link" className="text-dark p-0 me-3 fw-bold small uppercase text-decoration-none" onClick={() => handleEdit(faq)}>Edit</Button>
                  <Button variant="link" className="text-danger p-0 fw-bold small uppercase text-decoration-none" onClick={() => handleDelete(faq._id)}>Delete</Button>
                </td>
              </tr>
            ))}
            {faqs.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center text-muted py-5">No FAQs yet. Add your first one above.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal show={show} onHide={handleClose} centered>
        <div className="p-2">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-black text-uppercase tracking-tighter">
              {editing ? 'Edit FAQ' : 'Add FAQ'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-uppercase text-muted">Question</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  type="text"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold text-uppercase text-muted">Answer</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  as="textarea"
                  rows={3}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" className="rounded-0 px-4 fw-bold text-uppercase small" onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="dark" className="rounded-0 px-4 fw-bold text-uppercase small">Save</Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminFAQs;
