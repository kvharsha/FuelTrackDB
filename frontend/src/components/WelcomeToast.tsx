import React, { useEffect, useState } from 'react';
import { Box, Typography, Slide } from '@mui/material';

interface WelcomeToastProps {
    firstName: string;
    show: boolean;
    onHide?: () => void;
}

// Greets the user: shows a larger toast, then smoothly transitions to a small
// persistent badge at top-left after a short delay.
const WelcomeToast: React.FC<WelcomeToastProps> = ({ firstName, show, onHide }) => {
    const [shrunk, setShrunk] = useState(false);
    const [visible, setVisible] = useState(show);

    useEffect(() => {
        let t1: number | undefined;
        let t2: number | undefined;
        if (show) {
            setVisible(true);
            // After 3s, shrink into a small badge
            t1 = window.setTimeout(() => setShrunk(true), 3000);
            // After 6s total, hide completely
            t2 = window.setTimeout(() => {
                setVisible(false);
                onHide?.();
            }, 6000);
        } else {
            setShrunk(false);
            setVisible(false);
        }
        return () => {
            if (t1) window.clearTimeout(t1);
            if (t2) window.clearTimeout(t2);
        };
    }, [show, onHide]);

    if (!visible) return null;

    return (
        <Slide direction="right" in={!shrunk} mountOnEnter unmountOnExit>
            <Box
                sx={{
                    position: 'absolute',
                    top: shrunk ? 16 : '50%',
                    left: shrunk ? 16 : 10,
                    transform: shrunk ? 'none' : 'translateY(-50%)',
                    zIndex: 2000,
                    p: shrunk ? 1 : 2,
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                    color: 'white',
                    borderRadius: shrunk ? '20px' : '8px',
                    boxShadow: 3,
                    minWidth: shrunk ? '48px' : '220px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.5s ease',
                }}
            >
                <Typography variant={shrunk ? 'subtitle1' : 'h6'} sx={{ px: shrunk ? 0 : 1 }}>
                    {shrunk ? `${firstName[0] || 'U'}` : `Welcome, ${firstName}! 👋`}
                </Typography>
            </Box>
        </Slide>
    );
};

export default WelcomeToast;