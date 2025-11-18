import React, { useState } from 'react';
import { Box, List, ListItem, ListItemText, ListItemIcon, Divider, Collapse, Typography, Button, ListItemButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import HistoryIcon from '@mui/icons-material/History';
import MapIcon from '@mui/icons-material/Map';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

// Interface structure is crucial for TypeScript
interface Station {
    station_id: number;
    name: string;
    address: string;
    city: string;
    latitude: string | null;
    longitude: string | null;
    status: string;
}

interface FloatingPanelProps {
    stations: Station[]; 
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ stations }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [openFavorites, setOpenFavorites] = useState(false);
    const [openDownloaded, setOpenDownloaded] = useState(false);
    
    // Mock Data
    const mockRecents = stations.slice(0, 3);
    const mockDownloadedMaps = ['Bangalore', 'Chennai', 'Delhi'];
    const fuelTypes = ['Petrol', 'Diesel', 'CNG', 'EV (AC)', 'EV (DC)', 'LPG'];


    return (
        <Box 
            className="floating-panel"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            sx={{
                width: isHovered ? '250px' : '30px', /* Minimal width is 1cm (~30px) */
                left: isHovered ? '0' : '0', 
                transition: 'width 0.3s ease-in-out',
            }}
        >
            <List component="nav" sx={{ pt: 10 }}>
                {isHovered ? (
                    <Box sx={{ p: 2 }}>
                        {/* Favorite Stations */}
                        <ListItem sx={{ p: 0 }}>
                            <ListItemButton onClick={() => setOpenFavorites(!openFavorites)} sx={{ '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.2s' }}>
                                <ListItemIcon><FavoriteIcon color="error" /></ListItemIcon>
                                <ListItemText primary="Favorite Stations" />
                                {openFavorites ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openFavorites} timeout="auto" unmountOnExit>
                            {/* ... Favorites list content ... */}
                            <Typography sx={{ pl: 4, color: 'white' }}>List of 5 favorite stations...</Typography>
                        </Collapse>

                        <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />

                        {/* Change Fuel Type Filter */}
                        <Typography variant="subtitle1" sx={{ p: 1, mt: 2 }}>Change Fuel Type</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1 }}>
                            {fuelTypes.map(fuel => (
                                <Button key={fuel} variant="outlined" size="small" sx={{ color: 'white', borderColor: '#00ccff', '&:hover': { bgcolor: '#00ccff50', transform: 'scale(1.05)' }, transition: 'transform 0.2s' }}>
                                    {fuel}
                                </Button>
                            ))}
                        </Box>

                        <Divider sx={{ my: 1, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
                        
                        {/* Download Maps Section */}
                        <ListItem sx={{ p: 0 }}>
                            <ListItemButton onClick={() => setOpenDownloaded(!openDownloaded)} sx={{ '&:hover': { transform: 'scale(1.05)' }, transition: 'transform 0.2s' }}>
                                <ListItemIcon><MapIcon color="success" /></ListItemIcon>
                                <ListItemText primary="Download Maps" />
                                {openDownloaded ? <ExpandLess /> : <ExpandMore />}
                            </ListItemButton>
                        </ListItem>
                        <Collapse in={openDownloaded} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ pl: 4 }}>
                                {mockDownloadedMaps.map(map => (
                                    <ListItem key={map} sx={{ p: 0 }}>
                                        <ListItemButton>
                                            <ListItemText primary={map} sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Collapse>
                        
                    </Box>
                ) : (
                    /* Minimal view: 1cm strip */
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1, gap: 3 }}>
                        <FavoriteIcon color="error" sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />
                        <HistoryIcon color="primary" sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />
                        <MapIcon color="success" sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />
                        <LocalGasStationIcon sx={{ color: '#00ccff', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.2)' } }} />
                    </Box>
                )}
            </List>
        </Box>
    );
};

export default FloatingPanel;