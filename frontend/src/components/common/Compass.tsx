import React, { useEffect, useState } from 'react';
import { Box, Paper } from '@mui/material';
import NavigationIcon from '@mui/icons-material/Navigation';
import { useMap } from 'react-leaflet';

const Compass: React.FC = () => {
    const map = useMap();
    const [bearing, setBearing] = useState(0);

    useEffect(() => {
        const updateBearing = () => {
            // Get map bounds to determine orientation
            // In a real implementation, you'd use device orientation API
            // For now, we'll use a simple north indicator
            setBearing(0); // Always point north
        };

        map.on('moveend', updateBearing);
        updateBearing();

        return () => {
            map.off('moveend', updateBearing);
        };
    }, [map]);

    return (
        <Paper
            sx={{
                position: 'absolute',
                top: 80,
                right: 16,
                zIndex: 1000,
                p: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: 48,
                height: 48,
                boxShadow: 4,
            }}
        >
            <NavigationIcon
                sx={{
                    transform: `rotate(${bearing}deg)`,
                    transition: 'transform 0.3s ease',
                    color: 'primary.main',
                }}
            />
        </Paper>
    );
};

export default Compass;

