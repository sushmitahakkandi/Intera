import React, { useState } from 'react';
import { Card, Button, Textarea, Modal } from '../../../../shared/components/Common';
import { toast } from 'react-hot-toast';
import { FiStar, FiPlus, FiTrash2, FiMessageCircle } from 'react-icons/fi';

export default function Reviews() {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      productName: 'Luxury Modern Sofa',
      productImage: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80',
      rating: 5,
      comment: 'Super comfortable cushions, beautiful premium linen cover. Highly recommended for standard living rooms!',
      date: '20 July 2025'
    },
    {
      id: 2,
      productName: 'Ergonomic Office Chair',
      productImage: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=150&q=80',
      rating: 4,
      comment: 'Excellent lumbar support and height adjustable mechanics. Wheels slide very smoothly.',
      date: '15 June 2025'
    }
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    productName: 'Luxury Modern Sofa',
    rating: 5,
    comment: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) {
      toast.error('Review comment cannot be empty.');
      return;
    }
    const submitted = {
      id: Date.now(),
      productName: newReview.productName,
      productImage: newReview.productName.includes('Sofa')
        ? 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=150&q=80',
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setReviews([submitted, ...reviews]);
    setModalOpen(false);
    setNewReview({ productName: 'Luxury Modern Sofa', rating: 5, comment: '' });
    toast.success('Review submitted successfully!');
  };

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.success('Review deleted');
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

      <div className="flex flex-col gap-6">
        {reviews.length > 0 ? (
          reviews.map((rev) => (
            <Card key={rev.id} className="flex flex-col sm:flex-row gap-4 p-5 items-stretch bg-white">
              {/* Product Thumbnail */}
              <div className="w-16 h-16 bg-gray-150 rounded-large overflow-hidden flex-shrink-0 self-center">
                <img src={rev.productImage} alt={rev.productName} className="w-full h-full object-cover" />
              </div>

              {/* Review details */}
              <div className="flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-1">
                    <h4 className="font-bold text-gray-850 text-sm">{rev.productName}</h4>
                    <span className="text-[10px] text-gray-400 font-semibold">{rev.date}</span>
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
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">{rev.comment}</p>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex sm:flex-col justify-end items-end border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4 flex-shrink-0">
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="p-2 text-gray-450 hover:text-danger rounded-full hover:bg-gray-50 transition-colors"
                  title="Delete Review"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400 border border-dashed rounded-large">
            <FiMessageCircle size={40} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm font-medium">No reviews submitted yet</p>
          </div>
        )}
      </div>

      {/* Write a Review Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Write a Product Review">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Select Furniture Item</label>
            <select
              value={newReview.productName}
              onChange={(e) => setNewReview({ ...newReview, productName: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-large text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Luxury Modern Sofa">Luxury Modern Sofa</option>
              <option value="Ergonomic Office Chair">Ergonomic Office Chair</option>
              <option value="Solid Oak Dining Table">Solid Oak Dining Table</option>
              <option value="Premium Storage Cabinet">Premium Storage Cabinet</option>
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