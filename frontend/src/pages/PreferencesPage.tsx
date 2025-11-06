import React, { useEffect, useState } from 'react';
import { Container, Box, Typography, TextField, Button, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setTheme } from '../store/uiSlice';
import { dbHelpers } from '../db/dexieDb';
import { FuelTypeFilter } from '../store/stationsSlice';

const PreferencesPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { theme } = useSelector((state: RootState) => state.ui);
    
    const [defaultFuelType, setDefaultFuelType] = useState<FuelTypeFilter>('petrol');
    const [defaultRadius, setDefaultRadius] = useState<number>(10);
    const [speedProfile, setSpeedProfile] = useState<number>(50);
    const [dataSaver, setDataSaver] = useState<boolean>(false);
    const [units, setUnits] = useState<'km' | 'mi'>('km');

    useEffect(() => {
        // Load preferences from Dexie
        const loadPreferences = async () => {
            const fuelType = await dbHelpers.getSetting<FuelTypeFilter>('defaultFuelType', 'petrol');
            const radius = await dbHelpers.getSetting<number>('defaultRadius', 10);
            const speed = await dbHelpers.getSetting<number>('speedProfile', 50);
            const saver = await dbHelpers.getSetting<boolean>('dataSaver', false);
            const unit = await dbHelpers.getSetting<'km' | 'mi'>('units', 'km');
            
            setDefaultFuelType(fuelType);
            setDefaultRadius(radius);
            setSpeedProfile(speed);
            setDataSaver(saver);
            setUnits(unit);
        };
        
        loadPreferences();
    }, []);

    const handleSave = async () => {
        await dbHelpers.setSetting('defaultFuelType', defaultFuelType);
        await dbHelpers.setSetting('defaultRadius', defaultRadius);
        await dbHelpers.setSetting('speedProfile', speedProfile);
        await dbHelpers.setSetting('dataSaver', dataSaver);
        await dbHelpers.setSetting('units', units);
        alert('Preferences saved!');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" sx={{ mb: 4 }}>
                    Preferences
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Theme */}
                    <FormControl fullWidth>
                        <InputLabel>Theme</InputLabel>
                        <Select
                            value={theme}
                            label="Theme"
                            onChange={(e) => dispatch(setTheme(e.target.value as 'light' | 'dark'))}
                        >
                            <MenuItem value="light">Light</MenuItem>
                            <MenuItem value="dark">Dark</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Default Fuel Type */}
                    <FormControl fullWidth>
                        <InputLabel>Default Fuel Type</InputLabel>
                        <Select
                            value={defaultFuelType}
                            label="Default Fuel Type"
                            onChange={(e) => setDefaultFuelType(e.target.value as FuelTypeFilter)}
                        >
                            <MenuItem value="cng">CNG</MenuItem>
                            <MenuItem value="petrol">Petrol</MenuItem>
                            <MenuItem value="diesel">Diesel</MenuItem>
                            <MenuItem value="ev_ac">EV AC</MenuItem>
                            <MenuItem value="ev_dc">EV DC</MenuItem>
                            <MenuItem value="lpg">LPG</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Default Search Radius */}
                    <TextField
                        fullWidth
                        label="Default Search Radius (km)"
                        type="number"
                        value={defaultRadius}
                        onChange={(e) => setDefaultRadius(parseFloat(e.target.value))}
                        inputProps={{ min: 1, max: 100 }}
                    />

                    {/* Speed Profile */}
                    <TextField
                        fullWidth
                        label="Speed Profile (km/h)"
                        type="number"
                        value={speedProfile}
                        onChange={(e) => setSpeedProfile(parseFloat(e.target.value))}
                        inputProps={{ min: 1, max: 200 }}
                        helperText="Used for ETA calculations"
                    />

                    {/* Data Saver */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={dataSaver}
                                onChange={(e) => setDataSaver(e.target.checked)}
                            />
                        }
                        label="Data Saver (Reduce max tile zoom offline)"
                    />

                    {/* Units */}
                    <FormControl fullWidth>
                        <InputLabel>Units</InputLabel>
                        <Select
                            value={units}
                            label="Units"
                            onChange={(e) => setUnits(e.target.value as 'km' | 'mi')}
                        >
                            <MenuItem value="km">Kilometers</MenuItem>
                            <MenuItem value="mi">Miles</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            sx={{ flex: 1 }}
                        >
                            Save Preferences
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/map')}
                            sx={{ flex: 1 }}
                        >
                            Back to Map
                        </Button>
                    </Box>

                    {/* Report Issue */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                        <Button
                            variant="text"
                            fullWidth
                            onClick={() => window.location.href = 'mailto:support@fueltrackdb.com?subject=Issue Report'}
                        >
                            Report Issue
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PreferencesPage;
