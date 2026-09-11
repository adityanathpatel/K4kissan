import React from 'react';
import StarRating from './StarRating';
import { User } from 'lucide-react';

const ReviewList = ({ reviews, loading }) => {
    if (loading) {
        return <div className="text-center py-4 text-gray-500">Loading reviews...</div>;
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {reviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">
                                    {review.profiles?.full_name || review.profiles?.username || 'Anonymous'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <StarRating rating={review.rating} readonly size={16} />
                    </div>

                    {review.comment && (
                        <p className="text-gray-700 mt-3 leading-relaxed">{review.comment}</p>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReviewList;
