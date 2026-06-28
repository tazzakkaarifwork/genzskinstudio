import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Image, Card, Row, Col, Badge } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [setTimer, setSetTimer] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', price: '', description: '', category: '',
    featured: false, newArrival: false, stock: 10,
    whyYoullLoveIt: '',
    perfectFor: '',
    ingredients: '',
    howToUse: '',
    dermatologistNotes: '',
    additionalInfo: '',
    recommended: false,
    timerEnabled: false,
    discountPercent: 0,
    offerExpiresDate: '',
    offerExpiresTime: '',
  });

  // Separate image file states
  const [cardImageFile, setCardImageFile] = useState(null);
  const [cardHoverImageFile, setCardHoverImageFile] = useState(null);
  const [detailImageFiles, setDetailImageFiles] = useState([]);

  // Previews
  const [cardImagePreview, setCardImagePreview] = useState('');
  const [cardHoverPreview, setCardHoverPreview] = useState('');
  const [detailPreviews, setDetailPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Product images gallery view
  const [viewImagesProduct, setViewImagesProduct] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
      ]);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
    } catch (error) {
      console.error(error);
      setProducts([]);
      setCategories([]);
    }
  };

  // Build ordered files array: cardImage first, then cardHover, then detailImages
  const buildFilesArray = () => {
    const files = [];
    if (cardImageFile) files.push(cardImageFile);
    if (cardHoverImageFile) files.push(cardHoverImageFile);
    detailImageFiles.forEach(f => files.push(f));
    return files;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let offerExpiresAtCombined = '';
    if (setTimer && formData.offerExpiresDate) {
      const timeStr = formData.offerExpiresTime || '00:00';
      const [year, month, day] = formData.offerExpiresDate.split('-');
      const [hours, minutes] = timeStr.split(':');
      const localDate = new Date(year, Number(month) - 1, day, hours, minutes);
      if (!isNaN(localDate.getTime())) {
        offerExpiresAtCombined = localDate.toISOString();
      }
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'offerExpiresDate' && key !== 'offerExpiresTime') {
        // Convert booleans to string so backend receives 'true'/'false'
        formDataToSend.append(key, String(formData[key]));
      }
    });
    formDataToSend.append('offerExpiresAt', offerExpiresAtCombined);


    if (!editingProduct && !cardImageFile) {
      setError('Please upload at least a Card Main Image');
      setLoading(false);
      return;
    }

    if (cardImageFile) {
      formDataToSend.append('cardImage', cardImageFile);
    }
    if (cardHoverImageFile) {
      formDataToSend.append('cardHoverImage', cardHoverImageFile);
    }
    if (detailImageFiles.length > 0) {
      detailImageFiles.forEach(file => {
        formDataToSend.append('detailImages', file);
      });
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formDataToSend, config);
      } else {
        await api.post('/products', formDataToSend, config);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this product from inventory?')) {
      await api.delete(`/products/${id}`);
      fetchData();
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    let expireDate = '';
    let expireTime = '';
    if (product.offerExpiresAt) {
      const dateObj = new Date(product.offerExpiresAt);
      if (!isNaN(dateObj.getTime())) {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        expireDate = `${year}-${month}-${day}`;
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        expireTime = `${hours}:${minutes}`;
      }
    }

    setSetTimer(!!product.offerExpiresAt);

    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category: product.category?._id || product.category,
      featured: product.featured,
      newArrival: product.newArrival,
      stock: product.stock,
      whyYoullLoveIt: product.whyYoullLoveIt || '',
      perfectFor: product.perfectFor || '',
      ingredients: product.ingredients || '',
      howToUse: product.howToUse || '',
      dermatologistNotes: product.dermatologistNotes || '',
      additionalInfo: product.additionalInfo || '',
      recommended: product.recommended || false,
      timerEnabled: product.timerEnabled || false,
      discountPercent: product.discountPercent || 0,
      offerExpiresDate: expireDate,
      offerExpiresTime: expireTime,
    });
    // Show existing images as previews
    setCardImagePreview(product.cardImage || product.images?.[0] || product.image || '');
    setCardHoverPreview(product.cardHoverImage || product.images?.[1] || '');
    setDetailPreviews(
      product.detailImages?.length ? product.detailImages :
      (product.images?.slice(2) || [])
    );
    setCardImageFile(null);
    setCardHoverImageFile(null);
    setDetailImageFiles([]);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setSetTimer(false);
    setFormData({
      name: '', price: '', description: '', category: '',
      featured: false, newArrival: false, stock: 10,
      whyYoullLoveIt: '', perfectFor: '', ingredients: '', howToUse: '',
      dermatologistNotes: '', additionalInfo: '',
      recommended: false, timerEnabled: false,
      discountPercent: 0, offerExpiresDate: '', offerExpiresTime: '',
    });
    setCardImageFile(null);
    setCardHoverImageFile(null);
    setDetailImageFiles([]);
    setCardImagePreview('');
    setCardHoverPreview('');
    setDetailPreviews([]);
  };

  const getProductCardImage = (product) => {
    const raw = product.cardImage || product.image || product.images?.[0];
    if (!raw) return 'https://via.placeholder.com/50x55?text=No+Img';
    if (raw.startsWith('http')) return raw;
    return raw.startsWith('/') ? raw : `/${raw}`;
  };

  const getAllProductImages = (product) => {
    const imgs = [];
    if (product.cardImage) imgs.push({ url: product.cardImage, label: 'Card Main' });
    if (product.cardHoverImage) imgs.push({ url: product.cardHoverImage, label: 'Card Hover' });
    (product.detailImages || []).forEach((url, i) => imgs.push({ url, label: `Detail ${i + 1}` }));
    // fallback: legacy images
    if (imgs.length === 0) {
      (product.images || []).forEach((url, i) => imgs.push({ url, label: `Image ${i + 1}` }));
      if (imgs.length === 0 && product.image) imgs.push({ url: product.image, label: 'Image' });
    }
    return imgs;
  };

  const onCardImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardImageFile(file);
      setCardImagePreview(URL.createObjectURL(file));
    }
  };

  const onCardHoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCardHoverImageFile(file);
      setCardHoverPreview(URL.createObjectURL(file));
    }
  };

  const onDetailImagesChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setDetailImageFiles(files);
    setDetailPreviews(files.map(f => URL.createObjectURL(f)));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <style>{`
        .img-section-label { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #555; margin-bottom: 4px; }
        .img-preview-thumb { width: 64px; height: 64px; object-fit: cover; border-radius: 8px; border: 1.5px solid #ddd; }
        .img-preview-thumb.active { border-color: #000; }
        .img-gallery-modal .modal-content { border-radius: 16px; }
        .img-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 12px; }
        .img-gallery-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .img-gallery-item img { width: 100%; height: 100px; object-fit: cover; border-radius: 10px; border: 1px solid #eee; }
        .img-gallery-item span { font-size: 0.65rem; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
        .admin-table-img-group { display: flex; gap: 4px; align-items: center; }
        .admin-table-img-group img { width: 36px; height: 40px; object-fit: cover; border-radius: 4px; border: 1px solid #eee; }
        .admin-img-count { font-size: 0.65rem; color: #888; font-weight: 700; }
        /* Toggle Switch */
        .gz-toggle-wrap { display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f8f9fa; border: 1.5px solid #dee2e6; border-radius: 8px; cursor: pointer; transition: border-color 0.2s; }
        .gz-toggle-wrap:hover { border-color: #000; }
        .gz-toggle-wrap.active { border-color: #000; background: #f0f0f0; }
        .gz-toggle-switch { position: relative; width: 40px; height: 22px; flex-shrink: 0; }
        .gz-toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
        .gz-toggle-slider { position: absolute; inset: 0; background: #ccc; border-radius: 22px; transition: background 0.2s; cursor: pointer; }
        .gz-toggle-slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
        .gz-toggle-switch input:checked + .gz-toggle-slider { background: #111; }
        .gz-toggle-switch input:checked + .gz-toggle-slider::before { transform: translateX(18px); }
        .gz-toggle-label { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: #444; user-select: none; }
        .gz-toggle-sub { font-size: 0.68rem; color: #888; font-weight: 400; letter-spacing: 0; }
        .gz-timer-reveal { background: #fff8e1; border: 1.5px dashed #f0a500; border-radius: 8px; padding: 14px 16px; margin-bottom: 12px; }
      `}</style>

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-black text-uppercase tracking-tighter m-0">Inventory Manage</h4>
          <p className="text-muted small mb-0 uppercase tracking-widest">Total Products: {products.length}</p>
        </div>
        <Button variant="dark" className="rounded-0 px-4 fw-bold small text-uppercase" onClick={() => setShowModal(true)}>
          + Add Product
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-0 overflow-hidden">
        <Table hover responsive className="mb-0 align-middle border-0">
          <thead className="bg-light border-bottom">
            <tr className="text-uppercase small fw-black tracking-widest text-muted">
              <th className="py-3 ps-4">Images</th>
              <th className="py-3">Details</th>
              <th className="py-3">Category</th>
              <th className="py-3">Stock</th>
              <th className="py-3">Flags</th>
              <th className="py-3 text-end pe-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => {
              const allImgs = getAllProductImages(product);
              return (
                <tr key={product._id} className="border-bottom">
                  <td className="ps-4">
                    <div className="admin-table-img-group">
                      <img src={getProductCardImage(product)} alt={product.name} />
                      <div>
                        <div className="admin-img-count">{allImgs.length} imgs</div>
                        <Button
                          variant="link"
                          className="p-0 text-muted small"
                          style={{ fontSize: '0.65rem', textDecoration: 'none' }}
                          onClick={() => setViewImagesProduct(product)}
                        >
                          View All
                        </Button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-dark mb-0">{product.name}</div>
                    <div className="text-muted small fw-black">PKR {product.price.toLocaleString()}</div>
                  </td>
                  <td className="small text-uppercase fw-semibold">{product.category?.name || 'Uncategorized'}</td>
                  <td>
                    <span className={`fw-bold small ${product.stock < 5 ? 'text-danger' : 'text-dark'}`}>
                      {product.stock} Units
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      {product.featured && <span className="badge bg-dark rounded-0 px-2" style={{fontSize:'8px'}}>FEATURED</span>}
                      {product.newArrival && <span className="badge bg-outline-dark border border-dark text-dark rounded-0 px-2" style={{fontSize:'8px'}}>NEW</span>}
                    </div>
                  </td>
                  <td className="text-end pe-4">
                    <Button variant="link" className="text-dark p-0 me-3 fw-bold small uppercase text-decoration-none" onClick={() => handleEdit(product)}>Edit</Button>
                    <Button variant="link" className="text-danger p-0 fw-bold small uppercase text-decoration-none" onClick={() => handleDelete(product._id)}>Delete</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>

      {/* Image Gallery View Modal */}
      <Modal show={!!viewImagesProduct} onHide={() => setViewImagesProduct(null)} centered className="img-gallery-modal">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-black text-uppercase" style={{ fontSize: '1rem' }}>
            Product Images — {viewImagesProduct?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3 px-4">
          {viewImagesProduct && (() => {
            const imgs = getAllProductImages(viewImagesProduct);
            if (imgs.length === 0) return <p className="text-muted small">No images uploaded.</p>;
            return (
              <div className="img-gallery-grid">
                {imgs.map((img, i) => (
                  <div key={i} className="img-gallery-item">
                    <img src={img.url} alt={img.label} />
                    <span>{img.label}</span>
                  </div>
                ))}
              </div>
            );
          })()}
        </Modal.Body>
      </Modal>

      {/* Add/Edit Product Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <div className="p-3">
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-black text-uppercase tracking-tighter">
              {editingProduct ? 'Modify Product' : 'Register New Item'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body className="py-4">
              {error && <Alert variant="danger" className="rounded-0 small">{error}</Alert>}
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold uppercase text-muted">Product Name</Form.Label>
                    <Form.Control className="rounded-0 border-dark" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold uppercase text-muted">Price (PKR)</Form.Label>
                    <Form.Control className="rounded-0 border-dark" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Full Description</Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Why You'll Love It</Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.whyYoullLoveIt} onChange={(e) => setFormData({ ...formData, whyYoullLoveIt: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Perfect For</Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.perfectFor} onChange={(e) => setFormData({ ...formData, perfectFor: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Ingredients</Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.ingredients} onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">How to Use</Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.howToUse} onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })} />
                <Form.Text className="text-muted" style={{ fontSize: '0.68rem' }}>Enter each step on a new line. Displayed as a numbered list.</Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Dermatologist Notes <span className="text-muted fw-normal">(Optional)</span></Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.dermatologistNotes} onChange={(e) => setFormData({ ...formData, dermatologistNotes: e.target.value })} placeholder="e.g. Clinically tested, suitable for sensitive skin..." />
                <Form.Text className="text-muted" style={{ fontSize: '0.68rem' }}>Enter each note on a new line. Shown prominently above other details.</Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold uppercase text-muted">Additional Product Information <span className="text-muted fw-normal">(Optional)</span></Form.Label>
                <Form.Control className="rounded-0 border-dark" as="textarea" rows={2} value={formData.additionalInfo} onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })} placeholder="e.g. shelf life, storage conditions, certifications..." />
                <Form.Text className="text-muted" style={{ fontSize: '0.68rem' }}>Enter each point on a new line.</Form.Text>
              </Form.Group>

              {/* ── PRODUCT VISIBILITY & BEHAVIOR TOGGLES ── */}
              <div className="mb-3 p-3 border rounded-0" style={{ background: '#fafafa' }}>
                <div className="small fw-bold text-uppercase text-muted mb-3" style={{ letterSpacing: '0.08em', fontSize: '0.7rem' }}>Product Options</div>
                <div className="d-flex flex-wrap gap-4">
                  <Form.Check
                    type="switch"
                    id="recommended-switch"
                    label={<span className="fw-bold small">⭐ Recommended Product</span>}
                    checked={formData.recommended}
                    onChange={(e) => setFormData({ ...formData, recommended: e.target.checked })}
                  />
                  <Form.Check
                    type="switch"
                    id="timerEnabled-switch"
                    label={<span className="fw-bold small">⏱ Show Countdown Timer</span>}
                    checked={formData.timerEnabled}
                    onChange={(e) => setFormData({ ...formData, timerEnabled: e.target.checked })}
                  />
                </div>
                {formData.recommended && <Form.Text className="text-success d-block mt-1" style={{ fontSize: '0.68rem' }}>✓ This product will appear in the Home page Recommendations section.</Form.Text>}
                {formData.timerEnabled && <Form.Text className="text-warning d-block mt-1" style={{ fontSize: '0.68rem' }}>⚠ Timer will only show if a discount and expiry date are also set.</Form.Text>}
              </div>


              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold uppercase text-muted">Category</Form.Label>
                    <Form.Select className="rounded-0 border-dark" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                      <option value="">Select Category</option>
                      {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold uppercase text-muted">Stock Quantity</Form.Label>
                    <Form.Control className="rounded-0 border-dark" type="number" min="0" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} required />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold uppercase text-muted">Discount Percent (%)</Form.Label>
                    <Form.Control className="rounded-0 border-dark" type="number" min="0" max="100" value={formData.discountPercent} onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) || 0 })} />
                    {formData.discountPercent > 0 && (
                      <Form.Text className="text-success" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                        ✓ {formData.discountPercent}% discount active
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* ── OFFER EXPIRY TIMER TOGGLE ── */}
              {formData.discountPercent > 0 && (
                <div className="mb-3">
                  <label
                    className={`gz-toggle-wrap ${setTimer ? 'active' : ''}`}
                    onClick={() => {
                      const next = !setTimer;
                      setSetTimer(next);
                      if (!next) setFormData({ ...formData, offerExpiresDate: '', offerExpiresTime: '' });
                    }}
                  >
                    <div className="gz-toggle-switch">
                      <input type="checkbox" checked={setTimer} onChange={() => {}} />
                      <span className="gz-toggle-slider" />
                    </div>
                    <div>
                      <div className="gz-toggle-label">
                        {setTimer ? '⏱ Expiry Timer ON' : 'Set Offer Expiry Timer'}
                      </div>
                      <div className="gz-toggle-sub">
                        {setTimer
                          ? 'Discount auto-expires on the set date'
                          : 'Optional — leave off for a permanent discount'}
                      </div>
                    </div>
                  </label>

                  {setTimer && (
                    <div className="gz-timer-reveal mt-2">
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#7a6000' }}>Expiry Date</Form.Label>
                            <Form.Control
                              className="rounded-0"
                              style={{ borderColor: '#f0a500' }}
                              type="date"
                              value={formData.offerExpiresDate}
                              onChange={(e) => setFormData({ ...formData, offerExpiresDate: e.target.value })}
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-2">
                            <Form.Label className="small fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.08em', color: '#7a6000' }}>Expiry Time <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span></Form.Label>
                            <Form.Control
                              className="rounded-0"
                              style={{ borderColor: '#f0a500' }}
                              type="time"
                              value={formData.offerExpiresTime}
                              onChange={(e) => setFormData({ ...formData, offerExpiresTime: e.target.value })}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  )}
                </div>
              )}

              {/* ── IMAGE UPLOAD SECTION ── */}
              <div className="border rounded-0 border-dark p-3 mb-3">
                <p className="fw-bold small text-uppercase mb-3" style={{ letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  Product Images
                  {editingProduct && <span className="text-muted fw-normal ms-2" style={{ textTransform: 'none', letterSpacing: 0 }}>(leave blank to keep existing)</span>}
                </p>
                <Row>
                  {/* Card Main Image */}
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <div className="img-section-label">Card Main Image <Badge bg="dark" className="ms-1" style={{ fontSize: '8px' }}>1 Image</Badge></div>
                      <Form.Text className="text-muted d-block mb-2" style={{ fontSize: '0.7rem' }}>Shown on product listing cards</Form.Text>
                      <Form.Control
                        className="rounded-0 border-dark"
                        type="file"
                        onChange={onCardImageChange}
                        accept="image/*"
                        required={!editingProduct}
                      />
                      {cardImagePreview && (
                        <div className="mt-2">
                          <img src={cardImagePreview} alt="Card preview" className="img-preview-thumb active" />
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Card Hover Image */}
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <div className="img-section-label">Card Hover Image <Badge bg="secondary" className="ms-1" style={{ fontSize: '8px' }}>1 Image</Badge></div>
                      <Form.Text className="text-muted d-block mb-2" style={{ fontSize: '0.7rem' }}>Shown on mouse hover</Form.Text>
                      <Form.Control
                        className="rounded-0 border-dark"
                        type="file"
                        onChange={onCardHoverChange}
                        accept="image/*"
                      />
                      {cardHoverPreview && (
                        <div className="mt-2">
                          <img src={cardHoverPreview} alt="Hover preview" className="img-preview-thumb" />
                        </div>
                      )}
                    </Form.Group>
                  </Col>

                  {/* Detail Images */}
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <div className="img-section-label">Detail Page Images <Badge bg="info" text="dark" className="ms-1" style={{ fontSize: '8px' }}>Up to 5</Badge></div>
                      <Form.Text className="text-muted d-block mb-2" style={{ fontSize: '0.7rem' }}>Gallery on product detail page</Form.Text>
                      <Form.Control
                        className="rounded-0 border-dark"
                        type="file"
                        onChange={onDetailImagesChange}
                        accept="image/*"
                        multiple
                      />
                      {detailPreviews.length > 0 && (
                        <div className="mt-2 d-flex gap-1 flex-wrap">
                          {detailPreviews.map((src, i) => (
                            <img key={i} src={src} alt={`Detail ${i + 1}`} className="img-preview-thumb" />
                          ))}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </div>

              <div className="d-flex gap-4 mt-2">
                <Form.Check type="checkbox" label={<span className="small fw-bold uppercase">Featured</span>} checked={formData.featured} onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} />
                <Form.Check type="checkbox" label={<span className="small fw-bold uppercase">New Arrival</span>} checked={formData.newArrival} onChange={(e) => setFormData({ ...formData, newArrival: e.target.checked })} />
              </div>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="light" className="rounded-0 px-4 fw-bold uppercase small" onClick={handleCloseModal}>Cancel</Button>
              <Button type="submit" variant="dark" className="rounded-0 px-4 fw-bold uppercase small" disabled={loading}>{loading ? 'Uploading...' : 'Confirm Inventory'}</Button>
            </Modal.Footer>
          </Form>
        </div>
      </Modal>
    </motion.div>
  );
};

export default AdminProducts;
