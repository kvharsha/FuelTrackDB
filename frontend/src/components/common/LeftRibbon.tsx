import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';

interface LeftRibbonProps {
  onToggle: () => void;
  isOpen: boolean;
}

const LeftRibbon: React.FC<LeftRibbonProps> = ({ onToggle, isOpen }) => {
  return (
    <Box
      className="floating-controls left-ribbon"
      sx={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: '0 8px 8px 0',
        p: 1,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 1)',
        },
      }}
      onMouseEnter={onToggle}
    >
      <Tooltip title="Favorites" placement="right">
        <IconButton
          size="small"
          sx={{
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'transform 0.2s',
          }}
        >
          <FavoriteIcon color="error" fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Recent" placement="right">
        <IconButton
          size="small"
          sx={{
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'transform 0.2s',
          }}
        >
          <HistoryIcon color="primary" fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Fuel Types" placement="right">
        <IconButton
          size="small"
          sx={{
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'transform 0.2s',
          }}
        >
          <LocalGasStationIcon sx={{ color: '#00ccff' }} fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reviews" placement="right">
        <IconButton
          size="small"
          sx={{
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'transform 0.2s',
          }}
        >
          <StarIcon color="warning" fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Download Maps" placement="right">
        <IconButton
          size="small"
          sx={{
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.04)' },
            transition: 'transform 0.2s',
          }}
        >
          <DownloadIcon color="success" fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default LeftRibbon;

