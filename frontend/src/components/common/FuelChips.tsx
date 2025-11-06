import React from 'react';
import { Box, Chip } from '@mui/material';
import { FuelTypeFilter } from '../../store/stationsSlice';

interface FuelChipsProps {
  selected: FuelTypeFilter;
  onSelect: (fuelType: FuelTypeFilter) => void;
}

const fuelTypes: { value: FuelTypeFilter; label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }[] = [
  { value: 'cng', label: 'CNG', color: 'info' },
  { value: 'petrol', label: 'Petrol', color: 'primary' },
  { value: 'diesel', label: 'Diesel', color: 'default' },
  { value: 'ev_ac', label: 'EV AC', color: 'success' },
  { value: 'ev_dc', label: 'EV DC', color: 'success' },
  { value: 'lpg', label: 'LPG', color: 'warning' },
];

const FuelChips: React.FC<FuelChipsProps> = ({ selected, onSelect }) => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1 }}>
      <Chip
        label="All"
        onClick={() => onSelect(null)}
        color={selected === null ? 'primary' : 'default'}
        variant={selected === null ? 'filled' : 'outlined'}
      />
      {fuelTypes.map((fuel) => (
        <Chip
          key={fuel.value}
          label={fuel.label}
          onClick={() => onSelect(fuel.value)}
          color={selected === fuel.value ? fuel.color : 'default'}
          variant={selected === fuel.value ? 'filled' : 'outlined'}
        />
      ))}
    </Box>
  );
};

export default FuelChips;

