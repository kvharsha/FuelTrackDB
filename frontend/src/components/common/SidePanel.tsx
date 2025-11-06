import React, { useState, memo } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Button,
  TextField,
  Rating,
  IconButton,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import { Station } from '../../api/stations';
import { OfflinePackage } from '../../api/offline';
import RatingStars from './RatingStars';
import FuelChips from './FuelChips';
import { FuelTypeFilter } from '../../store/stationsSlice';

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  favorites: Station[];
  recent: Station[];
  offlinePackages: OfflinePackage[];
  selectedFuelType: FuelTypeFilter;
  onFuelTypeChange: (fuelType: FuelTypeFilter) => void;
  onStationClick: (station: Station) => void;
  onPackageClick: (pkg: OfflinePackage) => void;
  onReviewSubmit?: (stationId: number, rating: number, comment: string) => void;
  lastVisitedStation?: Station;
}

const SidePanel: React.FC<SidePanelProps> = memo(({
  open,
  onClose,
  favorites,
  recent,
  offlinePackages,
  selectedFuelType,
  onFuelTypeChange,
  onStationClick,
  onPackageClick,
  onReviewSubmit,
  lastVisitedStation,
}) => {
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');

  const handleReviewSubmit = () => {
    if (lastVisitedStation && reviewRating && onReviewSubmit) {
      onReviewSubmit(lastVisitedStation.station_id, reviewRating, reviewComment);
      setReviewRating(5);
      setReviewComment('');
    }
  };

  if (!open) return null;

  return (
    <Paper
      sx={{
        position: 'absolute',
        left: 60,
        top: 0,
        bottom: 0,
        width: 320,
        zIndex: 1000,
        overflow: 'auto',
        boxShadow: 5,
      }}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Menu</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Favorites */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <FavoriteIcon color="error" fontSize="small" />
          Favorites
        </Typography>
        {favorites.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No favorites yet
          </Typography>
        ) : (
          <List dense>
            {favorites.map((station) => (
              <ListItemButton key={station.station_id} onClick={() => onStationClick(station)}>
                <ListItemText
                  primary={station.name}
                  secondary={station.address}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* Recent */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" fontSize="small" />
          Recent
        </Typography>
        {recent.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recent stations
          </Typography>
        ) : (
          <List dense>
            {recent.map((station) => (
              <ListItemButton key={station.station_id} onClick={() => onStationClick(station)}>
                <ListItemText
                  primary={station.name}
                  secondary={station.city}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>

      <Divider />

      {/* Fuel Type Filter */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Fuel Type
        </Typography>
        <FuelChips selected={selectedFuelType} onSelect={onFuelTypeChange} />
      </Box>

      <Divider />

      {/* Reviews */}
      {lastVisitedStation && (
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Rate Last Station
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {lastVisitedStation.name}
          </Typography>
          <Rating
            value={reviewRating}
            onChange={(_, value) => setReviewRating(value)}
            size="large"
            sx={{ mb: 1 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Your review..."
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleReviewSubmit}
            disabled={!reviewRating}
          >
            Submit Review
          </Button>
        </Box>
      )}

      <Divider />

      {/* Download Maps */}
      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon color="success" fontSize="small" />
          Download Maps
        </Typography>
        {offlinePackages.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No offline packages
          </Typography>
        ) : (
          <List dense>
            {offlinePackages.map((pkg) => (
              <ListItemButton key={pkg.package_id} onClick={() => onPackageClick(pkg)}>
                <ListItemText
                  primary={pkg.name}
                  secondary={`${pkg.min_lat.toFixed(2)}, ${pkg.min_lon.toFixed(2)} - ${pkg.max_lat.toFixed(2)}, ${pkg.max_lon.toFixed(2)}`}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
});

SidePanel.displayName = 'SidePanel';

export default SidePanel;

