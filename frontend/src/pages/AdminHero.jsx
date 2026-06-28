import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Image } from 'react-bootstrap';
import { motion } from 'framer-motion';
import api from '../services/api';

const AdminHero = () => {
  const [formData, setFormData] = useState({
    tagline: '',
    titleLine1: '',
    titleLine2Outline: '',
    titleLine3: '',
    subtitle: '',
    buttonText: '',
  });
  const [bannerImages, setBannerImages] = useState([]);
  const [newBannerFiles, setNewBannerFiles] = useState([]);
  const [newBannerPreviews, setNewBannerPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingBanners, setUploadingBanners] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Marquee texts states
  const [marqueeTexts, setMarqueeTexts] = useState([]);
  const [newMarqueeText, setNewMarqueeText] = useState('');
  const [editingMarqueeId, setEditingMarqueeId] = useState(null);
  const [editingMarqueeText, setEditingMarqueeText] = useState('');
  const [marqueeLoading, setMarqueeLoading] = useState(false);

  // Media banner states
  const [mediaBannerType, setMediaBannerType] = useState('');
  const [mediaBannerUrl, setMediaBannerUrl] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState('');
  const [mediaPreviewType, setMediaPreviewType] = useState('');
  const [mediaUploading, setMediaUploading] = useState(false);
  const [mediaDeleting, setMediaDeleting] = useState(false);

  useEffect(() => {
    fetchHeroData();
    fetchMarquees();
  }, []);

  const fetchHeroData = async () => {
    try {
      const { data } = await api.get('/hero');
      if (data) {
        setFormData({
          tagline: data.tagline || '',
          titleLine1: data.titleLine1 || '',
          titleLine2Outline: data.titleLine2Outline || '',
          titleLine3: data.titleLine3 || '',
          subtitle: data.subtitle || '',
          buttonText: data.buttonText || '',
        });
        setBannerImages(data.bannerImages || []);
        setMediaBannerType(data.mediaBannerType || '');
        setMediaBannerUrl(data.mediaBannerUrl || '');
      }
    } catch (err) {
      console.error('Error fetching hero data:', err);
      setError('Failed to fetch Hero settings.');
    } finally {
      setFetching(false);
    }
  };

  const fetchMarquees = async () => {
    try {
      const { data } = await api.get('/marquee');
      setMarqueeTexts(data || []);
    } catch (err) {
      console.error('Error fetching marquees:', err);
    }
  };

  const handleAddMarquee = async (e) => {
    e.preventDefault();
    if (!newMarqueeText.trim()) return;
    setError('');
    setSuccess('');
    setMarqueeLoading(true);
    try {
      await api.post('/marquee', { text: newMarqueeText.trim() });
      setNewMarqueeText('');
      fetchMarquees();
      setSuccess('Marquee text added successfully!');
    } catch (err) {
      setError('Failed to add marquee text.');
    } finally {
      setMarqueeLoading(false);
    }
  };

  const handleUpdateMarquee = async (e) => {
    e.preventDefault();
    if (!editingMarqueeText.trim() || !editingMarqueeId) return;
    setError('');
    setSuccess('');
    setMarqueeLoading(true);
    try {
      await api.put(`/marquee/${editingMarqueeId}`, { text: editingMarqueeText.trim() });
      setEditingMarqueeId(null);
      setEditingMarqueeText('');
      fetchMarquees();
      setSuccess('Marquee text updated successfully!');
    } catch (err) {
      setError('Failed to update marquee text.');
    } finally {
      setMarqueeLoading(false);
    }
  };

  const handleDeleteMarquee = async (id) => {
    if (!window.confirm('Delete this text from the slider?')) return;
    setError('');
    setSuccess('');
    try {
      await api.delete(`/marquee/${id}`);
      fetchMarquees();
      setSuccess('Marquee text deleted.');
    } catch (err) {
      setError('Failed to delete marquee text.');
    }
  };

  const handleMoveMarquee = async (index, direction) => {
    const newItems = [...marqueeTexts];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    try {
      const ids = newItems.map(item => item._id);
      await api.put('/marquee/reorder', { ids });
      fetchMarquees();
    } catch (err) {
      setError('Failed to reorder marquee texts.');
    }
  };

  const handleMediaFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
    setMediaPreviewType(file.type.startsWith('video/') ? 'video' : 'image');
  };

  const handleUploadMediaBanner = async () => {
    if (!mediaFile) return;
    setError('');
    setSuccess('');
    setMediaUploading(true);
    const fd = new FormData();
    fd.append('media', mediaFile);
    try {
      const { data } = await api.post('/hero/media', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMediaBannerType(data.mediaBannerType);
      setMediaBannerUrl(data.mediaBannerUrl);
      setMediaFile(null);
      setMediaPreview('');
      setSuccess('Media banner uploaded successfully!');
    } catch (err) {
      setError('Failed to upload media banner.');
    } finally {
      setMediaUploading(false);
    }
  };

  const handleDeleteMediaBanner = async () => {
    if (!window.confirm('Remove media banner?')) return;
    setError('');
    setSuccess('');
    setMediaDeleting(true);
    try {
      const { data } = await api.delete('/hero/media');
      setMediaBannerType('');
      setMediaBannerUrl('');
      setSuccess('Media banner removed.');
    } catch (err) {
      setError('Failed to remove media banner.');
    } finally {
      setMediaDeleting(false);
    }
  };

  const handleBannerFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setNewBannerFiles(files);
    setNewBannerPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleUploadBanners = async () => {
    if (!newBannerFiles.length) return;
    setError('');
    setSuccess('');
    setUploadingBanners(true);
    const fd = new FormData();
    newBannerFiles.forEach(f => fd.append('bannerImages', f));
    try {
      const { data } = await api.post('/hero/banners', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerImages(data.bannerImages || []);
      setNewBannerFiles([]);
      setNewBannerPreviews([]);
      setSuccess('Banner images uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload banners.');
    } finally {
      setUploadingBanners(false);
    }
  };

  const handleDeleteBanner = async (index) => {
    if (!window.confirm('Remove this banner image?')) return;
    setDeleteLoading(index);
    try {
      const { data } = await api.delete(`/hero/banners/${index}`);
      setBannerImages(data.bannerImages || []);
      setSuccess('Banner removed.');
    } catch (err) {
      setError('Failed to delete banner.');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key]));
    try {
      await api.put('/hero', formDataToSend, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Hero section text updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update Hero settings.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <style>{`
        .banner-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; margin-top: 16px; }
        .banner-card { position: relative; border-radius: 10px; overflow: hidden; border: 1.5px solid #e0e0e0; }
        .banner-card img { width: 100%; height: 100px; object-fit: cover; display: block; }
        .banner-card .banner-delete { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.7); border: none; border-radius: 50%; width: 26px; height: 26px; color: #fff; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .banner-card .banner-delete:hover { background: #dc3545; }
        .banner-index { position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.6rem; font-weight: 700; padding: 2px 8px; border-radius: 10px; text-transform: uppercase; letter-spacing: 0.08em; }
        .banner-new-preview { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 12px; }
        .banner-new-preview img { width: 80px; height: 60px; object-fit: cover; border-radius: 8px; border: 2px dashed #aaa; }
      `}</style>

      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h4 className="fw-black text-uppercase tracking-tighter m-0">Hero Section CRUD</h4>
          <p className="text-muted small mb-0 uppercase tracking-widest">Configure your main homepage presentation</p>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-0 small" onClose={() => setError('')} dismissible>{error}</Alert>}
      {success && <Alert variant="success" className="rounded-0 small" onClose={() => setSuccess('')} dismissible>{success}</Alert>}

      <Row className="g-4">
        {/* Banner Images Section */}
        <Col lg={12}>
          <Card className="border-0 shadow-sm rounded-0 p-4 mb-2">
            <h6 className="fw-black text-uppercase mb-1" style={{ letterSpacing: '0.1em', fontSize: '0.78rem' }}>
              🖼 Hero Banner Images (Slider)
            </h6>
            <p className="text-muted small mb-3">
              Upload banner images for the homepage slider. Add as many as you want — they will auto-rotate every 4 seconds.
            </p>

            {/* Current Banners */}
            {bannerImages.length > 0 ? (
              <div>
                <p className="small fw-bold text-muted text-uppercase mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                  Current Banners ({bannerImages.length})
                </p>
                <div className="banner-grid">
                  {bannerImages.map((imgUrl, i) => (
                    <div key={i} className="banner-card">
                      <img src={imgUrl} alt={`Banner ${i + 1}`} />
                      <button
                        className="banner-delete"
                        onClick={() => handleDeleteBanner(i)}
                        disabled={deleteLoading === i}
                        title="Remove banner"
                      >
                        {deleteLoading === i ? '…' : '×'}
                      </button>
                      <span className="banner-index">#{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed rounded" style={{ borderStyle: 'dashed', borderColor: '#ddd', background: '#fafafa' }}>
                <p className="text-muted small mb-0">No banner images yet. Upload below to get started.</p>
              </div>
            )}

            {/* Upload New Banners */}
            <div className="mt-4">
              <Form.Label className="small fw-bold text-uppercase text-muted">Add New Banner Images</Form.Label>
              <div className="d-flex align-items-start gap-3">
                <div className="flex-grow-1">
                  <Form.Control
                    className="rounded-0 border-dark"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleBannerFilesChange}
                  />
                  <Form.Text className="text-muted">
                    Select multiple images at once. They will be appended to existing banners.
                  </Form.Text>
                  {newBannerPreviews.length > 0 && (
                    <div className="banner-new-preview">
                      {newBannerPreviews.map((src, i) => (
                        <img key={i} src={src} alt={`New banner ${i + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="dark"
                  className="rounded-0 px-4 fw-bold small text-uppercase mt-0"
                  onClick={handleUploadBanners}
                  disabled={uploadingBanners || newBannerFiles.length === 0}
                  style={{ whiteSpace: 'nowrap', height: '38px' }}
                >
                  {uploadingBanners ? 'Uploading…' : `Upload ${newBannerFiles.length > 0 ? `(${newBannerFiles.length})` : ''}`}
                </Button>
              </div>
            </div>
          </Card>
        </Col>

        {/* Text Content Form */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-0 p-4">
            <h6 className="fw-black text-uppercase mb-3" style={{ letterSpacing: '0.1em', fontSize: '0.78rem' }}>✏️ Text Content</h6>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted">Tagline</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  type="text"
                  placeholder="e.g. Est. 2025 — Skincare Reimagined"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Title Line 1</Form.Label>
                    <Form.Control
                      className="rounded-0 border-dark"
                      type="text"
                      placeholder="e.g. GLOW UP"
                      value={formData.titleLine1}
                      onChange={(e) => setFormData({ ...formData, titleLine1: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Title Line 2 (Outline)</Form.Label>
                    <Form.Control
                      className="rounded-0 border-dark"
                      type="text"
                      placeholder="e.g. WITH GENZ"
                      value={formData.titleLine2Outline}
                      onChange={(e) => setFormData({ ...formData, titleLine2Outline: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="small fw-bold text-uppercase text-muted">Title Line 3</Form.Label>
                    <Form.Control
                      className="rounded-0 border-dark"
                      type="text"
                      placeholder="e.g. SKIN STUDIO"
                      value={formData.titleLine3}
                      onChange={(e) => setFormData({ ...formData, titleLine3: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted">Subtitle Description</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  as="textarea"
                  rows={3}
                  placeholder="Describe your skincare philosophy..."
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="small fw-bold text-uppercase text-muted">Button Text</Form.Label>
                <Form.Control
                  className="rounded-0 border-dark"
                  type="text"
                  placeholder="e.g. Shop Now"
                  value={formData.buttonText}
                  onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                  required
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-2">
                <Button
                  type="submit"
                  variant="dark"
                  className="rounded-0 px-5 py-2 fw-bold text-uppercase small"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Update Text Content'}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* Live Preview */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-0 p-4 bg-dark text-white d-flex flex-column justify-content-between position-relative overflow-hidden" style={{ minHeight: '380px' }}>
            {bannerImages.length > 0 && (
              <div
                style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url(${bannerImages[0]})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  opacity: 0.35, zIndex: 0,
                }}
              />
            )}
            <div className="position-relative" style={{ zIndex: 1 }}>
              <div className="border border-secondary p-1 px-3 d-inline-block rounded-pill text-uppercase mb-3" style={{ fontSize: '9px', letterSpacing: '2px', color: '#ffc107', borderColor: '#ffc107' }}>
                {formData.tagline || 'Tagline Placeholder'}
              </div>
              <h2 className="fw-black text-uppercase m-0 tracking-tighter" style={{ fontSize: '2.2rem', lineHeight: '1.1' }}>
                {formData.titleLine1 || 'GLOW UP'}
                <br />
                <span style={{ WebkitTextStroke: '1px white', color: 'transparent' }}>
                  {formData.titleLine2Outline || 'WITH GENZ'}
                </span>
                <br />
                {formData.titleLine3 || 'SKIN STUDIO'}
              </h2>
              <p className="text-muted small mt-3" style={{ maxWidth: '300px', lineHeight: 1.6 }}>
                {formData.subtitle || 'Subtitle content will appear here...'}
              </p>
            </div>
            <div className="mt-4 position-relative" style={{ zIndex: 1 }}>
              <Button
                variant="warning"
                className="rounded-pill px-4 fw-bold text-uppercase text-dark"
                style={{ fontSize: '10px', backgroundColor: '#ffc107', border: 'none' }}
              >
                {formData.buttonText || 'Shop Now'}
              </Button>
            </div>
            <div className="position-absolute text-white-50" style={{ fontSize: '9px', zIndex: 1, bottom: '15px', right: '15px' }}>
              LIVE PREVIEW • {bannerImages.length} banners
            </div>
          </Card>
        </Col>
      </Row>

      {/* ── NEW: HERO TEXT SLIDER & MEDIA BANNER SECTIONS ── */}
      <Row className="g-4 mt-2">
        {/* Marquee Management Card */}
        <Col lg={7}>
          <Card className="border-0 shadow-sm rounded-0 p-4">
            <h6 className="fw-black text-uppercase mb-1" style={{ letterSpacing: '0.1em', fontSize: '0.78rem' }}>
              📢 Homepage Hero Text Slider (Marquee)
            </h6>
            <p className="text-muted small mb-3">
              Add, edit, delete, and reorder texts that rotate under the Hero section.
            </p>

            {/* Add/Edit Marquee Form */}
            <Form onSubmit={editingMarqueeId ? handleUpdateMarquee : handleAddMarquee} className="mb-4">
              <div className="d-flex gap-2">
                <Form.Control
                  className="rounded-0 border-dark"
                  type="text"
                  placeholder="e.g. Cruelty Free, Vegan Formulas..."
                  value={editingMarqueeId ? editingMarqueeText : newMarqueeText}
                  onChange={(e) => editingMarqueeId ? setEditingMarqueeText(e.target.value) : setNewMarqueeText(e.target.value)}
                  required
                />
                {editingMarqueeId ? (
                  <>
                    <Button variant="dark" className="rounded-0 px-3 fw-bold small text-uppercase" type="submit" disabled={marqueeLoading}>
                      Save
                    </Button>
                    <Button variant="light" className="rounded-0 px-3 fw-bold small text-uppercase border" onClick={() => { setEditingMarqueeId(null); setEditingMarqueeText(''); }}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button variant="dark" className="rounded-0 px-4 fw-bold small text-uppercase" type="submit" disabled={marqueeLoading}>
                    Add
                  </Button>
                )}
              </div>
            </Form>

            {/* Marquee Items List */}
            {marqueeTexts.length > 0 ? (
              <div className="border border-bottom-0">
                {marqueeTexts.map((item, idx) => (
                  <div key={item._id} className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
                    <span className="small fw-semibold">{item.text}</span>
                    <div className="d-flex align-items-center gap-2">
                      <Button size="sm" variant="light" className="border p-1" onClick={() => handleMoveMarquee(idx, -1)} disabled={idx === 0} title="Move Up">
                        ▲
                      </Button>
                      <Button size="sm" variant="light" className="border p-1" onClick={() => handleMoveMarquee(idx, 1)} disabled={idx === marqueeTexts.length - 1} title="Move Down">
                        ▼
                      </Button>
                      <Button size="sm" variant="outline-dark" className="rounded-0 small py-1" onClick={() => { setEditingMarqueeId(item._id); setEditingMarqueeText(item.text); }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline-danger" className="rounded-0 small py-1" onClick={() => handleDeleteMarquee(item._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 border border-dashed rounded" style={{ borderStyle: 'dashed', borderColor: '#ddd', background: '#fafafa' }}>
                <p className="text-muted small mb-0">No custom slider texts. System is falling back to defaults.</p>
              </div>
            )}
          </Card>
        </Col>

        {/* Media Banner Card */}
        <Col lg={5}>
          <Card className="border-0 shadow-sm rounded-0 p-4">
            <h6 className="fw-black text-uppercase mb-1" style={{ letterSpacing: '0.1em', fontSize: '0.78rem' }}>
              🎥 Homepage Media Banner (Community Section)
            </h6>
            <p className="text-muted small mb-3">
              Upload a full-width image or video shown after the Community Reviews section.
            </p>

            {/* ── Current Banner ── */}
            {mediaBannerUrl ? (
              <div className="mb-3">
                {/* Type badge */}
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span
                    className="text-uppercase fw-bold"
                    style={{
                      fontSize: '0.65rem', letterSpacing: '0.12em',
                      background: mediaBannerType === 'video' ? '#0f0f0f' : '#166534',
                      color: '#fff', padding: '3px 10px', borderRadius: '4px'
                    }}
                  >
                    {mediaBannerType === 'video' ? '▶ Video' : '🖼 Image'} — Active
                  </span>
                </div>

                {/* Preview */}
                <div style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '10px', overflow: 'hidden', border: '1.5px solid #e0e0e0', background: '#000' }}>
                  {mediaBannerType === 'video' ? (
                    <video src={mediaBannerUrl} muted controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <img src={mediaBannerUrl} alt="Media Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  )}
                </div>

                {/* Action buttons */}
                <div className="d-flex gap-2 mt-3">
                  {/* Replace / Edit = just upload a new one (overwrites) */}
                  <label
                    htmlFor="media-replace-input"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '6px', height: '38px', cursor: 'pointer',
                      background: '#f5f5f5', border: '1.5px solid #ddd',
                      borderRadius: '0', fontWeight: '700', fontSize: '0.75rem',
                      textTransform: 'uppercase', letterSpacing: '0.08em', color: '#333'
                    }}
                  >
                    ✎ Replace / Edit
                    <input
                      id="media-replace-input"
                      type="file"
                      accept="image/*,video/*"
                      style={{ display: 'none' }}
                      onChange={handleMediaFileChange}
                    />
                  </label>

                  <Button
                    variant="danger"
                    className="rounded-0 fw-bold small text-uppercase"
                    style={{ flex: 1, height: '38px', fontSize: '0.75rem', letterSpacing: '0.08em' }}
                    onClick={handleDeleteMediaBanner}
                    disabled={mediaDeleting}
                  >
                    {mediaDeleting ? 'Deleting…' : '🗑 Delete Banner'}
                  </Button>
                </div>

                {/* Show replace preview if a new file selected */}
                {mediaPreview && (
                  <div className="mt-3 border rounded p-2 bg-light">
                    <div className="small text-muted mb-2 text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>New Upload Preview:</div>
                    {mediaPreviewType === 'video' ? (
                      <video src={mediaPreview} muted controls style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <img src={mediaPreview} alt="Preview" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }} />
                    )}
                    <div className="d-flex gap-2 mt-2">
                      <Button
                        variant="dark"
                        size="sm"
                        className="rounded-0 fw-bold text-uppercase w-100"
                        onClick={handleUploadMediaBanner}
                        disabled={mediaUploading}
                      >
                        {mediaUploading ? 'Uploading…' : '⬆ Confirm Replace'}
                      </Button>
                      <Button
                        variant="light"
                        size="sm"
                        className="rounded-0 fw-bold text-uppercase border"
                        onClick={() => { setMediaFile(null); setMediaPreview(''); }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── No banner yet — upload form ── */
              <div>
                <div className="text-center py-4 mb-3 border rounded" style={{ borderStyle: 'dashed', borderColor: '#ccc', background: '#fafafa' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📂</div>
                  <p className="text-muted small mb-0 fw-bold">No media banner uploaded yet</p>
                  <p className="text-muted" style={{ fontSize: '0.72rem' }}>Upload an image or video below</p>
                </div>

                <div className="d-flex align-items-start gap-2">
                  <div className="flex-grow-1">
                    <Form.Control
                      className="rounded-0 border-dark"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaFileChange}
                    />
                    <Form.Text className="text-muted">Supports images (JPG/PNG/WEBP) or MP4 videos.</Form.Text>
                    {mediaPreview && (
                      <div className="mt-2 border rounded p-2 bg-light">
                        {mediaPreviewType === 'video' ? (
                          <video src={mediaPreview} muted controls style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }} />
                        ) : (
                          <img src={mediaPreview} alt="Preview" style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '6px' }} />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="dark"
                    className="rounded-0 px-3 fw-bold small text-uppercase"
                    onClick={handleUploadMediaBanner}
                    disabled={mediaUploading || !mediaFile}
                    style={{ whiteSpace: 'nowrap', height: '38px' }}
                  >
                    {mediaUploading ? 'Uploading…' : 'Upload'}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
};

export default AdminHero;
