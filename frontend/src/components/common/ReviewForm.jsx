'use client';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import userService from '../../services/userService';
import LoginModal from '../common/LoginModal';
import { addPendingAction } from '../../redux/slices/pendingActionsSlice';
import { useDispatch } from 'react-redux';

export default function ReviewForm({ itemId, itemType, onReviewAdded }) {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(addPendingAction({ type: 'addReview', payload: { itemId, itemType, rating, reviewText } }));
      setShowLoginModal(true);
      toast.error('Please login to submit a review');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      setSubmitting(true);
      await userService.addReview({ itemId, itemType, rating, reviewText });
      toast.success('Review submitted successfully!');
      setRating(0);
      setReviewText('');
      if (onReviewAdded) onReviewAdded();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="card border-0 rounded-3 p-4 mt-4" style={{ background: 'var(--bs)' }}>
        <h5 className="fw-bold mb-3" style={{ color: 'var(--tp)' }}>Write a Review</h5>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>Rating</label>
            <div className="d-flex gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="btn p-0 border-0 bg-transparent"
                  style={{ fontSize: '1.8rem', color: star <= (hoverRating || rating) ? '#f59e0b' : '#555', cursor: 'pointer' }}
                >
                  {star <= (hoverRating || rating) ? '★' : '☆'}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label fw-medium" style={{ color: 'var(--tp)' }}>Your Review</label>
            <textarea
              className="form-control"
              rows={4}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience..."
              style={{ background: 'var(--bs)', border: '1px solid var(--bdr)', color: 'var(--tp)', borderRadius: '8px' }}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn fw-semibold px-4 py-2"
            style={{ background: 'var(--ap)', color: '#fff', border: 'none' }}>
            {submitting ? <><span className="spinner-border spinner-border-sm me-2" />Submitting...</> : 'Submit Review'}
          </button>
        </form>
      </div>
      <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </>
  );
}
