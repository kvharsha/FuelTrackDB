import React from 'react';
import { Box, Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  readOnly?: boolean;
  onChange?: (value: number | null) => void;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxRating = 5,
  size = 'medium',
  readOnly = true,
  onChange,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating
        value={rating}
        max={maxRating}
        size={size}
        readOnly={readOnly}
        onChange={(_, value) => onChange?.(value)}
        emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
      />
      {readOnly && (
        <Box component="span" sx={{ ml: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
          {rating.toFixed(1)}
        </Box>
      )}
    </Box>
  );
};

export default RatingStars;

