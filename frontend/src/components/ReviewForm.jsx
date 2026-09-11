import React, { useState } from 'react';
import { database } from '../lib/firebase';
import { ref, push, set } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import StarRating from './StarRating';

const ReviewForm = ({ productId, orderId, onSuccess, onCancel }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            if (database && user) {
                const reviewsRef = ref(database, 'reviews');
                const newReviewRef = push(reviewsRef);
                await set(newReviewRef, {
                    product_id: productId,
                    buyer_id: user.uid || user.id,
                    order_id: orderId,
                    rating,
                    comment: comment.trim() || null,
                    created_at: new Date().toISOString()
                });
            }

            if (onSuccess) onSuccess();
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating *
                </label>
                <StarRating rating={rating} onRatingChange={setRating} size={32} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review (Optional)
                </label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Share your experience with this product..."
                    maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                    {comment.length}/500 characters
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    disabled={submitting}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting || rating === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
            </div>
        </form>
    );
};

export default ReviewForm;
