import React, { useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import LayersIcon from '@mui/icons-material/Layers';
import type { MapLayer } from '../../store/mapSlice';

interface LayerPickerProps {
  activeLayer: MapLayer;
  onLayerChange: (layer: MapLayer) => void;
}

const LayerPicker: React.FC<LayerPickerProps> = ({ activeLayer, onLayerChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLayerSelect = (layer: MapLayer) => {
    onLayerChange(layer);
    handleClose();
  };

  const layers: { value: MapLayer; label: string }[] = [
    { value: 'geo', label: 'Geographical' },
    { value: 'sat', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
  ];

  return (
    <Box className="floating-controls bottom-left-layers">
      <Tooltip title="Change Map View" placement="right">
        <IconButton
          onClick={handleClick}
          sx={{
            backgroundColor: 'white',
            '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(255, 255, 255, 0.9)' },
            transition: 'transform 0.2s',
            boxShadow: 3,
          }}
        >
          <LayersIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        {layers.map((layer) => (
          <MenuItem
            key={layer.value}
            onClick={() => handleLayerSelect(layer.value)}
            selected={activeLayer === layer.value}
          >
            {layer.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default LayerPicker;

