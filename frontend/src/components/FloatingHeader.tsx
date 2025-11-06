import React, { useState } from 'react';
import { Box, Avatar, Menu, MenuItem, Tooltip, IconButton } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import { useNavigate } from 'react-router-dom';

interface FloatingHeaderProps {
    firstName: string;
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({ firstName }) => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const avatarLetter = firstName ? firstName[0].toUpperCase() : 'U';

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => { setAnchorEl(event.currentTarget); };
    const handleMenuClose = () => { setAnchorEl(null); };
    
    const handleLogout = () => { localStorage.clear(); navigate('/'); };
    const handlePreferences = () => { handleMenuClose(); navigate('/preferences'); };
    const handleDayNightToggle = () => { alert("Day/Night mode toggled!"); handleMenuClose(); };

    return (
        <Box className="floating-controls top-right-header">
            <Tooltip title="User Menu" placement="left">
                <IconButton 
                    onClick={handleMenuOpen} 
                    sx={{ 
                        transition: 'transform 0.2s', 
                        // The 'deflect' hover effect: big then small
                        '&:hover': { transform: 'scale(1.1)' } 
                    }}
                >
                    <Avatar 
                        sx={{ 
                            bgcolor: '#00ccff', 
                            width: 48, 
                            height: 48, 
                            boxShadow: 3 
                        }}
                    >
                        {avatarLetter}
                    </Avatar>
                </IconButton>
            </Tooltip>
            
            <Menu
                anchorEl={anchorEl}
                id="user-menu"
                open={open}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handlePreferences}><SettingsIcon sx={{ mr: 1 }} /> Preferences</MenuItem>
                <MenuItem onClick={handleDayNightToggle}><NightsStayIcon sx={{ mr: 1 }} /> Day/Night</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
            </Menu>
        </Box>
    );
};

export default FloatingHeader;