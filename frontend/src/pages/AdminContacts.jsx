import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Table } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/contact');
      if (Array.isArray(data)) {
        setContacts(data);
      } else {
        setContacts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load contact messages');
      setContacts([]);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this contact message?')) return;
    await api.delete(`/contact/${id}`);
    fetchContacts();
  };

  return (
    <>
      <Helmet>
        <title>Admin - Contact Messages</title>
      </Helmet>

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-black text-uppercase tracking-tighter m-0">Contact Messages</h4>
          <p className="text-muted small mb-0 uppercase tracking-widest">Total Messages: {contacts.length}</p>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-0 small">{error}</Alert>}

      <Card className="border-0 shadow-sm rounded-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle border-0">
          <thead className="bg-light border-bottom">
            <tr className="text-uppercase small fw-black tracking-widest text-muted">
              <th className="py-3 ps-4">Name</th>
              <th className="py-3">Email</th>
              <th className="py-3">Message</th>
              <th className="py-3">Date</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.map((contact) => (
              <tr key={contact._id} className="border-bottom">
                <td className="ps-4 fw-bold">{contact.name}</td>
                <td className="small">{contact.email}</td>
                <td className="small" style={{ maxWidth: '420px', whiteSpace: 'normal' }}>{contact.message}</td>
                <td className="small text-muted">{new Date(contact.createdAt).toLocaleDateString()}</td>
                <td className="text-end pe-4">
                  <Button variant="link" className="text-danger p-0 fw-bold small uppercase text-decoration-none" onClick={() => handleDelete(contact._id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-5">No contact messages yet.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
};

export default AdminContacts;
