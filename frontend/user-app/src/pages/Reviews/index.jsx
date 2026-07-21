import React, { useState, useEffect } from 'react';
import { Card, Button, Textarea, Modal } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiStar, FiPlus, FiTrash2, FiMessageCircle, FiRefreshCw } from 'react-icons/fi';
import { useApp } from '../../context/AppContext';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Reviews() {
  const { products } = useApp();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [newReview, setNewReview] = useState({
    productId: '',
    rating: 5,
    comment: ''
  });

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/reviews/my`);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error loading my reviews:", err);
      toast.error("Failed to load your reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, []);

  useEffect(() => {
    if (products.length > 0 && !newReview.productId) {
      setNewReview(prev => ({ ...prev, productId: products[0].id }));
    }
  }, [products, newReview.productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.productId) {
      toast.error('Please select a product.');
      return;
    }
    if (!newReview.comment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }
    try {
      toast.loading('Submitting review...', { id: 'submit-review' });
      await axios.post(`${API_BASE}/api/reviews`, {
        productId: newReview.productId,
        rating: newReview.rating,
        comment: newReview.comment
      });
      toast.success('Review submitted successfully! It is pending moderation.', { id: 'submit-review' });
      setModalOpen(false);
      setNewReview({ productId: products[0]?.id || '', rating: 5, comment: '' });
      fetchMyReviews();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit review.', { id: 'submit-review' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      toast.loading('Deleting review...', { id: 'delete-review' });
      await axios.delete(`${API_BASE}/api/reviews/${id}`);
      toast.success('Review deleted', { id: 'delete-review' });
      fetchMyReviews();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to delete review.', { id: 'delete-review' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Product Reviews</h1>
          <p className="text-xs text-gray-400 font-semibold uppercase mt-0.5">Manage your opinions</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 text-xs font-bold py-2 px-4"
        >
          <FiPlus /> Write a Review
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 gap-2 text-primary font-bold">
          <FiRefreshCw className="animate-spin" size={20} />
          <span>Loading reviews...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {reviews.length > 0 ? (
            reviews.map((rev) => (
              <Card key={rev._id} className="flex flex-col sm:flex-row gap-4 p-5 items-stretch bg-white border border-gray-100">
                {/* Product Thumbnail */}
                <div className="w-16 h-16 bg-gray-50 rounded-large overflow-hidden flex-shrink-0 self-center border border-gray-100">
                  <img 
                    src={rev.product?.thumbnailUrl || 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp'} 
                    alt={rev.product?.name || 'Product'} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://mahaveer-smart-furniture-hub.s3.eu-north-1.amazonaws.com/cache/sofa/img-0.webp';
                    }}
                  />
                </div>

                {/* Review details */}
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-850 text-sm leading-tight">{rev.product?.name || 'N/A'}</h4>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                          rev.status === 'Approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                          rev.status === 'Rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                          'bg-yellow-50 text-yellow-600 border border-yellow-100'
                        }`}>
                          {rev.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-semibold">
                        {new Date(rev.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Rating Stars */}
                    <div className="flex text-yellow-500 mb-2.5">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-gray-250'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed italic">"{rev.comment}"</p>

                    {/* Merchant Reply if available */}
                    {rev.merchantReply && (
                      <div className="mt-3.5 bg-primary-light/10 border border-primary/10 rounded-large p-3 text-xs">
                        <span className="font-bold text-primary block mb-1">Response from Store:</span>
                        <p className="text-gray-650 font-medium">{rev.merchantReply}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action columns */}
                <div className="flex sm:flex-col justify-end items-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(rev._id)}
                    className="p-2 text-gray-400 hover:text-danger rounded-full hover:bg-gray-50 transition-colors animate-pulse-hover"
                    title="Delete Review"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-large">
              <FiMessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-medium">No reviews submitted yet</p>
            </div>
          )}
        </div>
      )}

      {/* Write a Review Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Write a Product Review">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Furniture Item</label>
            <select
              value={newReview.productId}
              onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-large text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>{prod.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Rating (1 to 5 Stars)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-2xl hover:scale-110 transition-transform focus:outline-none"
                >
                  <FiStar
                    className={`stroke-2 ${
                      star <= newReview.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                    }`}
                    size={22}
                  />
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Your Review Details"
            placeholder="Share your experience styling, assembling, or comfort quality..."
            value={newReview.comment}
            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
            required
          />

          <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Submit Review</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}