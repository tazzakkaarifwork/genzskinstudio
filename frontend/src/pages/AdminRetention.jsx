import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Table, Button, Form, Badge, Tab, Tabs } from 'react-bootstrap';
import api from '../services/api';

const AdminRetention = () => {
  const [inactiveCustomers, setInactiveCustomers] = useState([]);
  const [settings, setSettings] = useState({
    autoReminderEnabled: false,
    inactivityDays: 30,
    inactivityValue: 30,
    inactivityUnit: 'days',
    couponCode: 'GLOWBACK10',
    discountPercent: 10,
    emailTemplate: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Settings edit state
  const [editSettings, setEditSettings] = useState({ ...settings });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [bulkLoading, setBulkLoading] = useState(false);

  // Promo codes state
  const [promoCodes, setPromoCodes] = useState([]);
  const [promoForm, setPromoForm] = useState({ code: '', discountPercent: '', label: '' });
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const fetchRetentionData = async () => {
    try {
      setLoading(true);
      const [retentionRes, promoRes] = await Promise.allSettled([
        api.get('/retention/inactive'),
        api.get('/retention/promo-codes'),
      ]);
      if (retentionRes.status === 'fulfilled') {
        setInactiveCustomers(retentionRes.value.data.inactiveCustomers || []);
        if (retentionRes.value.data.settings) {
          setSettings(retentionRes.value.data.settings);
          setEditSettings(retentionRes.value.data.settings);
        }
      }
      if (promoRes.status === 'fulfilled') {
        setPromoCodes(promoRes.value.data || []);
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch retention details. Please check server connections.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPromoCode = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoLoading(true);
    try {
      const { data } = await api.post('/retention/promo-codes', promoForm);
      setPromoCodes(data);
      setPromoForm({ code: '', discountPercent: '', label: '' });
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Failed to add promo code.');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleDeletePromoCode = async (id) => {
    if (!window.confirm('Remove this promo code?')) return;
    try {
      const { data } = await api.delete(`/retention/promo-codes/${id}`);
      setPromoCodes(data);
    } catch (err) {
      setPromoError(err.response?.data?.error || 'Failed to delete promo code.');
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      setSettingsSaving(true);
      const { data } = await api.put('/retention/settings', editSettings);
      setSettings(data.settings);
      setSuccessMsg('Retention configurations saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
      setError('Failed to update configurations.');
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSendReminder = async (email) => {
    try {
      setActionLoading(prev => ({ ...prev, [email]: true }));
      const { data } = await api.post('/retention/remind', { email });
      
      // Update local state to reflect newly sent reminder
      setInactiveCustomers(prev =>
        prev.map(cust =>
          cust.email === email
            ? { ...cust, latestReminder: data.reminder }
            : cust
        )
      );
      
      alert(data.message || 'Retention promo reminder sent!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to dispatch email reminder.');
    } finally {
      setActionLoading(prev => ({ ...prev, [email]: false }));
    }
  };

  const handleSendReminderAll = async () => {
    if (inactiveCustomers.length === 0) {
      alert('No inactive customers to remind.');
      return;
    }
    if (!window.confirm(`Are you sure you want to send promotional emails to all ${inactiveCustomers.length} inactive customers?`)) {
      return;
    }
    try {
      setBulkLoading(true);
      const { data } = await api.post('/retention/remind-all');
      alert(data.message || 'Bulk reminders dispatched successfully!');
      fetchRetentionData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to dispatch bulk email reminders.');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="admin-retention-page anim-scale-in">
      <Row className="mb-4">
        <Col>
          <p className="text-secondary small">Identify inactive customers who haven't ordered in over 30 days and re-engage them with automated or manual discounts.</p>
        </Col>
      </Row>

      {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}
      {successMsg && <div className="alert alert-success shadow-sm rounded-3">{successMsg}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark mb-2" role="status" />
          <p className="text-muted small">Loading customer records...</p>
        </div>
      ) : (
        <Tabs defaultActiveKey="customers" id="retention-tabs" className="mb-4 custom-tabs">
          {/* Customers Tab */}
          <Tab eventKey="customers" title={`Inactive Customers (${inactiveCustomers.length})`}>
            <Row className="mb-3">
              <Col>
                <div className="d-flex justify-content-between align-items-center bg-white p-3 border rounded-3 shadow-sm">
                  <div className="small text-secondary">
                    Currently tracking users with <strong>{settings.inactivityValue || settings.inactivityDays} {settings.inactivityUnit || 'days'}</strong> of inactivity.
                  </div>
                  <div className="d-flex gap-2">
                    <Button variant="outline-dark" size="sm" onClick={fetchRetentionData} disabled={bulkLoading}>
                      Refresh List
                    </Button>
                    <Button variant="dark" size="sm" onClick={handleSendReminderAll} disabled={bulkLoading}>
                      {bulkLoading ? 'Dispatched...' : 'Remind All Inactive'}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>

            {inactiveCustomers.length === 0 ? (
              <div className="text-center bg-white p-5 border rounded-3 shadow-sm">
                <div className="fs-6 fw-bold text-uppercase mb-2">Clear</div>
                <h5>All Clear!</h5>
                <p className="text-muted small mb-0">No active customers exceed the {settings.inactivityValue || settings.inactivityDays} {settings.inactivityUnit || 'days'} inactivity threshold!</p>
              </div>
            ) : (
              <div className="bg-white border rounded-3 shadow-sm overflow-hidden">
                <Table responsive hover className="align-middle mb-0">
                  <thead className="bg-light table-light border-bottom text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    <tr>
                      <th className="px-4 py-3">Customer Details</th>
                      <th className="py-3">Days Inactive</th>
                      <th className="py-3">Last Purchase</th>
                      <th className="py-3">Stats</th>
                      <th className="py-3">Latest Action</th>
                      <th className="px-4 py-3 text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inactiveCustomers.map((cust) => (
                      <tr key={cust.email} style={{ transition: 'background-color 0.2s' }}>
                        <td className="px-4 py-3">
                          <div className="fw-bold text-dark">{cust.name}</div>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>{cust.email}</small>
                          {cust.phone && <div className="text-muted small" style={{ fontSize: '0.7rem' }}>{cust.phone}</div>}
                        </td>
                        <td className="py-3">
                          <Badge bg={cust.daysInactive > 60 ? 'danger' : 'warning'} className="px-2 py-1 fs-7 fw-bold">
                            {cust.inactivityText || `${cust.daysInactive} Days`}
                          </Badge>
                        </td>
                        <td className="py-3 small text-secondary">
                          {new Date(cust.lastOrderDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3">
                          <div className="small">orders: <strong>{cust.orderCount}</strong></div>
                          <div className="small text-success">spent: <strong>PKR {cust.totalSpent.toLocaleString()}</strong></div>
                        </td>
                        <td className="py-3 small">
                          {cust.latestReminder ? (
                            <div>
                              <Badge bg="success" className="mb-1">Reminded</Badge>
                              <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                                {new Date(cust.latestReminder.sentAt).toLocaleDateString()}<br />
                                code: <strong>{cust.latestReminder.couponCode}</strong>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted italic">Never Notified</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Button
                            variant="dark"
                            size="sm"
                            className="rounded-pill px-3"
                            onClick={() => handleSendReminder(cust.email)}
                            disabled={actionLoading[cust.email]}
                          >
                            {actionLoading[cust.email] ? 'Sending...' : 'Remind Email'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Tab>

          {/* Configurations Tab */}
          <Tab eventKey="settings" title="Retention Settings">
            <Row>
              <Col lg={8} className="mx-auto">
                <Card className="border shadow-sm rounded-3">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-4">Re-engagement Campaigns Config</h5>
                    <Form onSubmit={handleSettingsSubmit}>
                      <Form.Group className="mb-4" controlId="autoReminderEnabled">
                        <Form.Check
                          type="switch"
                          id="auto-reminder-switch"
                          label="Enable Automatic 30-Day Reminders"
                          checked={editSettings.autoReminderEnabled}
                          onChange={(e) => setEditSettings({ ...editSettings, autoReminderEnabled: e.target.checked })}
                          className="fw-bold small"
                        />
                        <Form.Text className="text-muted">
                          If enabled, the system will automatically dispatch promotional emails to clients who haven't ordered in the specified inactive interval (requires server cron task).
                        </Form.Text>
                      </Form.Group>

                      <Row className="mb-3">
                        <Col md={4}>
                          <Form.Group controlId="inactivityValue">
                            <Form.Label className="small fw-bold">Inactivity Limit</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              value={editSettings.inactivityValue || 30}
                              onChange={(e) => setEditSettings({ ...editSettings, inactivityValue: parseInt(e.target.value) || 0 })}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="inactivityUnit">
                            <Form.Label className="small fw-bold">Unit</Form.Label>
                            <Form.Select
                              value={editSettings.inactivityUnit || 'days'}
                              onChange={(e) => setEditSettings({ ...editSettings, inactivityUnit: e.target.value })}
                              required
                            >
                              <option value="days">Days</option>
                              <option value="minutes">Minutes</option>
                            </Form.Select>
                          </Form.Group>
                        </Col>
                        <Col md={4}>
                          <Form.Group controlId="discountPercent">
                            <Form.Label className="small fw-bold">Discount (%)</Form.Label>
                            <Form.Control
                              type="number"
                              min={1}
                              max={99}
                              value={editSettings.discountPercent}
                              onChange={(e) => setEditSettings({ ...editSettings, discountPercent: parseInt(e.target.value) || 0 })}
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3" controlId="couponCode">
                        <Form.Label className="small fw-bold">Default Promotion Coupon Code</Form.Label>
                        <Form.Control
                          type="text"
                          value={editSettings.couponCode}
                          onChange={(e) => setEditSettings({ ...editSettings, couponCode: e.target.value.toUpperCase() })}
                          required
                          placeholder="e.g. COMEBACK10"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="emailTemplate">
                        <Form.Label className="small fw-bold">Email Message Template</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={6}
                          value={editSettings.emailTemplate}
                          onChange={(e) => setEditSettings({ ...editSettings, emailTemplate: e.target.value })}
                          required
                        />
                        <Form.Text className="text-muted small">
                          Use tags: <code>{"{{name}}"}</code> for buyer's name, <code>{"{{code}}"}</code> for the promo coupon, and <code>{"{{discount}}"}</code> for discount percentage.
                        </Form.Text>
                      </Form.Group>

                      <div className="d-grid mt-4">
                        <Button variant="dark" type="submit" disabled={settingsSaving} className="rounded-3 py-2 fw-bold">
                          {settingsSaving ? 'Saving Configurations...' : 'Save Configurations'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Promo Codes Tab */}
          <Tab eventKey="promo-codes" title={`Promo Codes (${promoCodes.length})`}>
            <Row className="g-4">
              {/* Add new promo code */}
              <Col md={5}>
                <Card className="border-0 shadow-sm rounded-3 p-4">
                  <h6 className="fw-bold text-uppercase mb-3" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>
                    ➕ Add New Promo Code
                  </h6>
                  {promoError && <div className="alert alert-danger small py-2">{promoError}</div>}
                  <Form onSubmit={handleAddPromoCode}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted text-uppercase">Code</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. SUMMER20"
                        value={promoForm.code}
                        onChange={e => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                        required
                        style={{ textTransform: 'uppercase' }}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-bold text-muted text-uppercase">Discount %</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        max="100"
                        placeholder="e.g. 20"
                        value={promoForm.discountPercent}
                        onChange={e => setPromoForm({ ...promoForm, discountPercent: e.target.value })}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-bold text-muted text-uppercase">Label (optional)</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g. Summer Sale"
                        value={promoForm.label}
                        onChange={e => setPromoForm({ ...promoForm, label: e.target.value })}
                      />
                    </Form.Group>
                    <Button type="submit" variant="dark" size="sm" className="w-100 fw-bold text-uppercase" disabled={promoLoading}>
                      {promoLoading ? 'Adding…' : 'Add Promo Code'}
                    </Button>
                  </Form>
                </Card>
              </Col>

              {/* Existing promo codes */}
              <Col md={7}>
                <Card className="border-0 shadow-sm rounded-3 overflow-hidden">
                  <div className="p-3 border-bottom bg-light">
                    <span className="fw-bold text-uppercase small" style={{ letterSpacing: '0.08em' }}>
                      Active Promo Codes
                    </span>
                  </div>
                  {promoCodes.length === 0 ? (
                    <div className="text-center py-5 text-muted small">
                      No custom promo codes yet. Add one on the left.
                    </div>
                  ) : (
                    <Table hover responsive className="mb-0 align-middle">
                      <thead className="bg-light table-light border-bottom text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                        <tr>
                          <th className="px-4 py-3">Code</th>
                          <th className="py-3">Discount</th>
                          <th className="py-3">Label</th>
                          <th className="px-4 py-3 text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {promoCodes.map(pc => (
                          <tr key={pc._id}>
                            <td className="px-4 py-3">
                              <Badge bg="dark" className="fw-bold" style={{ letterSpacing: '0.08em', fontSize: '0.78rem' }}>
                                {pc.code}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <span className="fw-bold text-success">{pc.discountPercent}% off</span>
                            </td>
                            <td className="py-3 text-muted small">{pc.label || '—'}</td>
                            <td className="px-4 py-3 text-end">
                              <Button
                                variant="outline-danger"
                                size="sm"
                                style={{ fontSize: '0.7rem' }}
                                onClick={() => handleDeletePromoCode(pc._id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card>
              </Col>
            </Row>
          </Tab>
        </Tabs>

      )}

      <style>{`
        .custom-tabs .nav-link {
          color: #6b7280;
          font-weight: 600;
          font-size: 0.88rem;
          border: none;
          padding: 10px 20px;
        }
        .custom-tabs .nav-link.active {
          color: #000;
          border-bottom: 2px solid #000;
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default AdminRetention;
