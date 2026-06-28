import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import api from '../services/api';

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Compose Campaign State
  const [campaignSubject, setCampaignSubject] = useState('');
  const [campaignBody, setCampaignBody] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Search State
  const [searchSubscriber, setSearchSubscriber] = useState('');

  useEffect(() => {
    fetchNewsletterData();
  }, []);

  const fetchNewsletterData = async () => {
    try {
      setLoading(true);
      const [subRes, campRes] = await Promise.all([
        api.get('/newsletter/subscribers'),
        api.get('/newsletter/campaigns'),
      ]);
      setSubscribers(subRes.data || []);
      setCampaigns(campRes.data || []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch subscribers or campaign data. Check auth privileges.');
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!campaignSubject.trim() || !campaignBody.trim()) return;

    try {
      setBroadcastLoading(true);
      setBroadcastSuccess('');
      setPreviewUrl('');
      const { data } = await api.post('/newsletter/campaign', {
        subject: campaignSubject,
        body: campaignBody,
      });

      setBroadcastSuccess(data.message || 'Newsletter broadcast completed!');
      if (data.previewUrl) {
        setPreviewUrl(data.previewUrl);
      }
      setCampaignSubject('');
      setCampaignBody('');
      
      // Update campaigns history list
      setCampaigns(prev => [data.campaign, ...prev]);
      
      setTimeout(() => {
        setBroadcastSuccess('');
        setPreviewUrl('');
      }, 12000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to broadcast newsletter campaign.');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this subscriber?')) return;
    try {
      setError('');
      await api.delete(`/newsletter/subscribers/${id}`);
      setSubscribers(prev => prev.filter(sub => sub._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete subscriber.');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm('Are you sure you want to completely delete this campaign history log?')) return;
    try {
      setError('');
      await api.delete(`/newsletter/campaigns/${id}`);
      setCampaigns(prev => prev.filter(camp => camp._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to delete campaign.');
    }
  };

  const getFilteredSubscribers = () => {
    if (!searchSubscriber.trim()) return subscribers;
    const term = searchSubscriber.toLowerCase();
    return subscribers.filter(sub => sub.email.toLowerCase().includes(term));
  };

  return (
    <div className="admin-subscribers-page anim-scale-in">
      <Row className="mb-4">
        <Col>
          <p className="text-secondary small">Broadcast marketing campaigns to email newsletter subscribers, track subscriber count, and audit email campaign history.</p>
        </Col>
      </Row>

      {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark mb-2" role="status" />
          <p className="text-muted small">Loading newsletter records...</p>
        </div>
      ) : (
        <Tabs defaultActiveKey="compose" id="newsletter-tabs" className="mb-4 custom-tabs">
          {/* Tab 1: Compose and Sent Campaigns */}
          <Tab eventKey="compose" title="Marketing Campaign Center">
            <Row className="g-4 mt-1">
              <Col lg={7}>
                <Card className="border shadow-sm rounded-3">
                  <Card.Body className="p-4">
                    {broadcastSuccess && (
                      <div className="alert alert-success py-3 small rounded-3 shadow-sm mb-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                          <span>{broadcastSuccess}</span>
                          {previewUrl && (
                            <a
                              href={previewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-dark text-white rounded-pill px-3 py-1 fw-bold tracking-widest text-uppercase transition-all hover-scale"
                              style={{ fontSize: '0.68rem', letterSpacing: '0.08em', textDecoration: 'none' }}
                            >
                              View Sent Test Email
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <Form onSubmit={handleBroadcastSubmit}>
                      <Form.Group className="mb-3" controlId="subject">
                        <Form.Label className="small fw-bold">Email Subject Line</Form.Label>
                        <Form.Control
                          type="text"
                          value={campaignSubject}
                          onChange={(e) => setCampaignSubject(e.target.value)}
                          required
                          placeholder="e.g. Introducing our new summer hydration glow drops!"
                        />
                      </Form.Group>

                      <Form.Group className="mb-4" controlId="body">
                        <Form.Label className="small fw-bold">Email Body Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={8}
                          value={campaignBody}
                          onChange={(e) => setCampaignBody(e.target.value)}
                          required
                          placeholder="Write your email contents here... Plain text supported."
                        />
                      </Form.Group>

                      <div className="d-grid">
                        <Button variant="dark" type="submit" disabled={broadcastLoading} className="rounded-3 py-2 fw-bold">
                          {broadcastLoading ? 'Broadcasting Newsletter...' : 'Broadcast to Subscribers'}
                        </Button>
                      </div>
                    </Form>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="border shadow-sm rounded-3 h-100">
                  <Card.Body className="p-4">
                    <h5 className="fw-bold mb-3">Campaign History Log</h5>
                    <p className="text-secondary small mb-4">Audit log of manual and automated new product launches.</p>

                    {campaigns.length === 0 ? (
                      <div className="text-center py-5 text-muted small">No newsletter campaigns sent yet.</div>
                    ) : (
                      <div className="campaign-history-list" style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '5px' }}>
                        {campaigns.map((camp) => (
                          <div key={camp._id} className="border-bottom pb-3 mb-3">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="fw-bold text-dark small" style={{ fontSize: '0.85rem' }}>{camp.subject}</span>
                              <Badge bg={camp.triggerType === 'new_arrival' ? 'info' : 'dark'} className="fs-7">
                                {camp.triggerType === 'new_arrival' ? 'Arrival' : 'Manual'}
                              </Badge>
                            </div>
                            <div className="text-muted small mb-2" style={{ fontSize: '0.78rem', whiteSpace: 'pre-wrap' }}>
                              {camp.body.substring(0, 100)}...
                            </div>
                            <div className="d-flex justify-content-between align-items-center text-secondary style-date" style={{ fontSize: '0.72rem' }}>
                              <div>
                                <span>{new Date(camp.sentAt).toLocaleDateString()}</span>
                                <span className="ms-3">Recipients: <strong>{camp.recipientsCount}</strong></span>
                              </div>
                              <Button
                                variant="link"
                                className="text-danger p-0 text-decoration-none hover-scale"
                                style={{ fontSize: '0.72rem' }}
                                onClick={() => handleDeleteCampaign(camp._id)}
                              >
                                <i className="bi bi-trash" /> Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab>

          {/* Tab 2: Subscribers List */}
          <Tab eventKey="subscribers" title={`Newsletter Subscribers (${subscribers.length})`}>
            <Row className="mb-3 mt-1">
              <Col md={8}>
                <Form.Group controlId="searchSub">
                  <Form.Control
                    type="text"
                    placeholder="Search subscribers by email address..."
                    value={searchSubscriber}
                    onChange={(e) => setSearchSubscriber(e.target.value)}
                    className="rounded-3 shadow-sm"
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex justify-content-md-end">
                <Button variant="outline-dark" size="sm" onClick={fetchNewsletterData} className="w-100">
                  Refresh List
                </Button>
              </Col>
            </Row>

            {getFilteredSubscribers().length === 0 ? (
              <div className="text-center bg-white p-5 border rounded-3 shadow-sm">
                <div className="fs-6 fw-bold text-uppercase mb-2">Empty</div>
                <h5>No Subscribers</h5>
                <p className="text-muted small mb-0">No active matching email subscribers found.</p>
              </div>
            ) : (
              <div className="bg-white border rounded-3 shadow-sm overflow-hidden">
                <Table responsive hover className="align-middle mb-0">
                  <thead className="bg-light table-light border-bottom text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                    <tr>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="py-3">Subscribed Date</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredSubscribers().map((sub) => (
                      <tr key={sub._id} style={{ transition: 'background-color 0.2s' }}>
                        <td className="px-4 py-3 fw-bold text-dark">{sub.email}</td>
                        <td className="py-3 small text-secondary">
                          {new Date(sub.subscribedAt).toLocaleString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge bg={sub.active ? 'success' : 'secondary'} className="px-2 py-1">
                            {sub.active ? 'Active' : 'Unsubscribed'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-end">
                          <Button
                            variant="link"
                            className="text-danger p-0 text-decoration-none hover-scale"
                            onClick={() => handleDeleteSubscriber(sub._id)}
                          >
                            <i className="bi bi-trash" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
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
        .campaign-history-list::-webkit-scrollbar {
          width: 4px;
        }
        .campaign-history-list::-webkit-scrollbar-thumb {
          background-color: #ddd;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default AdminSubscribers;
