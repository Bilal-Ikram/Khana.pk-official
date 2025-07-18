import React from 'react';
import { Star } from 'lucide-react';

const ReviewList = ({ reviews, type = 'restaurant' }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="flex items-center gap-4 mb-6">
        <div className="text-4xl font-bold">
          {(reviews.reduce((acc, r) => acc + r.rating.score, 0) / reviews.length).toFixed(1)}
        </div>
        <div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= (reviews.reduce((acc, r) => acc + r.rating.score, 0) / reviews.length)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Based on {reviews.length} reviews
          </p>
        </div>
      </div>

      {/* Review List */}
      <div className="divide-y">
        {reviews.map((review, index) => (
          <div key={index} className="py-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.rating.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating.score
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {type === 'menuItem' && (
                <div className="text-sm text-gray-500">
                  Ordered on {new Date(review.orderDate).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {review.rating.review && (
              <p className="mt-3 text-gray-600">{review.rating.review}</p>
            )}
            
            {review.rating.photos && review.rating.photos.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {review.rating.photos.map((photo, photoIndex) => (
                  <img
                    key={photoIndex}
                    src={photo}
                    alt={`Review photo ${photoIndex + 1}`}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 