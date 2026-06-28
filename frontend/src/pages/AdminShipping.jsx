import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminShipping = () => {
  const [settings, setSettings] = useState({ freeCities: ['karachi'], standardCharge: 150, freeMatchMode: 'exact' });
  const [freeCitiesInput, setFreeCitiesInput] = useState('karachi');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/shipping/settings');
      setSettings(data);
      setFreeCitiesInput(data.freeCities?.join(', ') || 'karachi');
    } catch (err) {
      console.error('Failed to load shipping settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const freeCities = freeCitiesInput.split(',').map(c => c.trim().toLowerCase()).filter(Boolean);
      const { data } = await api.put('/shipping/settings', {
        ...settings,
        freeCities,
      });
      setSettings(data);
      setMessage({ type: 'success', text: 'Shipping settings updated successfully!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading shipping settings...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h4 className="fw-black text-uppercase tracking-tighter mb-4">Shipping Settings</h4>

      {message.text && (
        <Alert variant={message.type} className="rounded-0 small" dismissible onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      <Card className="border-0 shadow-sm rounded-0 p-4">
        <Form onSubmit={handleSave}>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-uppercase text-muted">Free Delivery Cities</Form.Label>
            <Form.Control
              className="rounded-0 border-dark"
              type="text"
              value={freeCitiesInput}
              onChange={(e) => setFreeCitiesInput(e.target.value)}
              placeholder="karachi, lahore, islamabad"
            />
            <Form.Text className="text-muted">
              Comma-separated list of cities eligible for free delivery. Matching is case-insensitive.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-uppercase text-muted">Standard Delivery Charge (PKR)</Form.Label>
            <Form.Control
              className="rounded-0 border-dark"
              type="number"
              value={settings.standardCharge}
              onChange={(e) => setSettings({ ...settings, standardCharge: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-uppercase text-muted">City Matching Mode</Form.Label>
            <Form.Select
              className="rounded-0 border-dark"
              value={settings.freeMatchMode}
              onChange={(e) => setSettings({ ...settings, freeMatchMode: e.target.value })}
            >
              <option value="exact">Exact match (city name must match exactly)</option>
              <option value="includes">Includes (city name contains keyword)</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" variant="dark" className="rounded-0 px-4 fw-bold text-uppercase small" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Form>
      </Card>
    </motion.div>
  );
};

export default AdminShipping;
