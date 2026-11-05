import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const RatingStars = ({
  rating = 0,
  maxStars = 5,
  size = 'w-4 h-4',
  interactive = false,
  onRate,
  showScore = false,
  reviewsCount = null,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = displayRating >= starValue;
          const isHalf = !isFilled && displayRating >= starValue - 0.5;

          return (
            <button
              type="button"
              key={i}
              disabled={!interactive}
              onClick={() => interactive && onRate && onRate(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              className={`${interactive ? 'cursor-pointer transform hover:scale-110 transition-transform p-0.5' : 'cursor-default'}`}
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                className={`${size} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isHalf
                    ? 'text-amber-400 fill-amber-400/50'
                    : 'text-slate-600'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-xs font-semibold text-slate-300 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
      {reviewsCount !== null && (
        <span className="text-xs text-slate-500">
          ({reviewsCount})
        </span>
      )}
    </div>
  );
};
