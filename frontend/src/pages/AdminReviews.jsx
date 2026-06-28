import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import api from '../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    filterReviews();
  }, [reviews, searchTerm, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/products/reviews/all');
      if (Array.isArray(data)) {
        setReviews(data);
        setFilteredReviews(data);
      } else {
        setReviews([]);
        setFilteredReviews([]);
      }
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to fetch reviews. Please check permissions.');
      setReviews([]);
      setFilteredReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReviews = () => {
    let temp = [...reviews];

    // Search by product name or reviewer name or comment
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (r) =>
          r.productName.toLowerCase().includes(term) ||
          r.userName.toLowerCase().includes(term) ||
          r.comment.toLowerCase().includes(term)
      );
    }

    // Filter by rating
    if (ratingFilter !== 'all') {
      temp = temp.filter((r) => r.rating === parseInt(ratingFilter));
    }

    setFilteredReviews(temp);
  };

  const handleDelete = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This will update the product rating.')) return;

    try {
      await api.delete(`/products/${productId}/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      console.error(err);
      alert('Failed to delete review. Try again.');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditComment(review.comment);
    setModalError('');
    setModalSuccess('');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editComment.trim()) {
      setModalError('Comment cannot be empty.');
      return;
    }

    try {
      const { data } = await api.put(`/products/${editingReview.productId}/reviews/${editingReview._id}`, {
        rating: editRating,
        comment: editComment,
      });

      // Update in reviews array
      setReviews((prev) =>
        prev.map((r) =>
          r._id === editingReview._id
            ? { ...r, rating: editRating, comment: editComment }
            : r
        )
      );

      setModalSuccess('Review updated successfully!');
      setModalError('');
      setTimeout(() => {
        setShowEditModal(false);
        setEditingReview(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setModalError(err.response?.data?.error || 'Failed to update review.');
    }
  };

  return (
    <div className="admin-reviews-page anim-scale-in">
      <Row className="mb-4 align-items-center">
        <Col md={6}>
          <p className="text-secondary small">Moderate customer ratings and review comments across the store.</p>
        </Col>
        <Col md={6} className="d-flex justify-content-md-end gap-2">
          <Button variant="outline-dark" size="sm" className="rounded-0" onClick={fetchReviews} disabled={loading}>
            Refresh Reviews
          </Button>
        </Col>
      </Row>

      {/* Filter Bar */}
      <div className="bg-white p-3 border rounded-3 mb-4 shadow-sm">
        <Row className="g-3">
          <Col md={8}>
            <Form.Group controlId="search">
              <Form.Control
                type="text"
                placeholder="Search by Product Name, Reviewer, or Keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-3"
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="rating">
              <Form.Select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="rounded-3"
              >
                <option value="all">All Ratings (1-5 ★)</option>
                <option value="5">5 Stars (★★★★★)</option>
                <option value="4">4 Stars (★★★★)</option>
                <option value="3">3 Stars (★★★)</option>
                <option value="2">2 Stars (★★)</option>
                <option value="1">1 Star (★)</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      </div>

      {error && <div className="alert alert-danger shadow-sm rounded-3">{error}</div>}

      {/* Reviews Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-dark mb-2" role="status" />
          <p className="text-muted small">Loading reviews list...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center bg-white p-5 border rounded-3 shadow-sm">
          <div className="fs-6 fw-bold text-uppercase mb-2">Empty</div>
          <h5>No Reviews Found</h5>
          <p className="text-muted small mb-0">No matching product reviews match the current search or filters.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-3 shadow-sm overflow-hidden">
          <Table responsive hover className="align-middle mb-0">
            <thead className="bg-light table-light border-bottom text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="py-3">Reviewer</th>
                <th className="py-3">Rating</th>
                <th className="py-3" style={{ width: '40%' }}>Comment</th>
                <th className="py-3">Date</th>
                <th className="px-4 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((review) => (
                <tr key={review._id} style={{ transition: 'background-color 0.2s' }}>
                  <td className="px-4 py-3 fw-bold text-dark">{review.productName}</td>
                  <td className="py-3">
                    <div>{review.userName}</div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>{review.userEmail}</small>
                  </td>
                  <td className="py-3">
                    <div className="text-warning">
                      {'★'.repeat(review.rating)}
                      <span className="text-muted">{'★'.repeat(5 - review.rating)}</span>
                    </div>
                  </td>
                  <td className="py-3 text-muted small">{review.comment}</td>
                  <td className="py-3 small text-secondary">
                    {new Date(review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Button variant="link" className="text-dark p-0 me-3 fw-bold small uppercase text-decoration-none" onClick={() => handleEditClick(review)}>
                      Edit
                    </Button>
                    <Button variant="link" className="text-danger p-0 fw-bold small uppercase text-decoration-none" onClick={() => handleDelete(review.productId, review._id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="reviews-edit-modal">
        <Form onSubmit={handleEditSubmit}>
          <Modal.Header closeButton className="border-0 pb-0">
            <Modal.Title className="fw-bold fs-5">Edit Review</Modal.Title>
          </Modal.Header>
          <Modal.Body className="pt-3">
            {modalError && <div className="alert alert-danger py-2 small">{modalError}</div>}
            {modalSuccess && <div className="alert alert-success py-2 small">{modalSuccess}</div>}

            <p className="text-secondary small mb-3">
              Modifying review for: <strong>{editingReview?.productName}</strong> by {editingReview?.userName}
            </p>

            <Form.Group className="mb-3" controlId="editRatingSelect">
              <Form.Label className="fw-bold small">Rating (1-5 ★)</Form.Label>
              <Form.Select value={editRating} onChange={(e) => setEditRating(parseInt(e.target.value))}>
                <option value="5">5 Stars - Excellent</option>
                <option value="4">4 Stars - Good</option>
                <option value="3">3 Stars - Average</option>
                <option value="2">2 Stars - Poor</option>
                <option value="1">1 Star - Horrible</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="editCommentTextarea">
              <Form.Label className="fw-bold small">Review Comment</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                required
                className="rounded-3"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-0 pt-0">
            <Button variant="light" className="rounded-0 px-4 fw-bold text-uppercase small" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="dark" className="rounded-0 px-4 fw-bold text-uppercase small" type="submit" disabled={modalSuccess !== ''}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      <style>{`
        .reviews-edit-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default AdminReviews;
