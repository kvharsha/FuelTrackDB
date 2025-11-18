import React, { useState, useEffect } from 'react';
import { Paper, InputBase, IconButton, Box, Typography, Fade } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { motion, AnimatePresence } from 'framer-motion';
import type { Station } from '../../api/stations';
import { fuzzySearch } from '../../utils/fuzzy';

interface SearchBarProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ stations, onStationSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      const filtered = fuzzySearch(stations, query);
      setResults(filtered.slice(0, 8));
      setShowResults(true);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query, stations]);

  const handleSelect = (station: Station) => {
    onStationSelect(station);
    setQuery('');
    setShowResults(false);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: 500,
      }}
    >
      <Paper
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="floating-controls center-search-bar"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          boxShadow: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
        }}
      >
        <SearchIcon sx={{ ml: 1, color: 'text.secondary' }} />
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder="Search Station or Place Name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setShowResults(true)}
        />
        {query && (
          <IconButton
            type="button"
            sx={{ p: '10px' }}
            onClick={() => {
              setQuery('');
              setShowResults(false);
            }}
          >
            <ClearIcon />
          </IconButton>
        )}
      </Paper>

      <AnimatePresence>
        {showResults && results.length > 0 && (
          <Paper
            component={motion.div}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="search-suggestions"
            sx={{
              mt: 1,
              maxHeight: 300,
              overflow: 'auto',
              boxShadow: 4,
              borderRadius: '16px',
            }}
          >
          {results.map((station) => (
            <Box
              key={station.station_id}
              sx={{
                p: 1.5,
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              }}
              onClick={() => handleSelect(station)}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                {station.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {station.address} — {station.city}
              </Typography>
            </Box>
          ))}
          </Paper>
        )}
      </AnimatePresence>

      {showResults && query.trim() && results.length === 0 && (
        <Paper
          sx={{
            mt: 1,
            p: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No results found
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;

