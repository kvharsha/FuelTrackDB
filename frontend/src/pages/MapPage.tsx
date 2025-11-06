import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Button, Paper } from '@mui/material';
import L from 'leaflet';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setCenter, setZoom, setRoute, clearRoute, setLocationGranted, setWifiQuality, setActiveLayer } from '../store/mapSlice';
import { setStations, setCurrentStation, addRecent, setFuelType } from '../store/stationsSlice';
import { setFavorites, toggleFavorite } from '../store/favoritesSlice';
import { setPackages } from '../store/offlineSlice';
import { setSidePanelOpen, setWelcomeShown } from '../store/uiSlice';
import { stationsApi } from '../api/stations';
import type { Station, StationFuel } from '../api/stations';
import { favoritesApi } from '../api/favorites';
import { reviewsApi } from '../api/reviews';
import { offlineApi } from '../api/offline';
import type { OfflinePackage } from '../api/offline';
import { geolocation } from '../utils/geolocation';
import { km, tupleToLatLng } from '../utils/haversine';
import { findPath } from '../utils/gridSearch';
import type { Bounds } from '../utils/gridSearch';
import { dbHelpers } from '../db/dexieDb';
import SearchBar from '../components/common/SearchBar';
import MapControls from '../components/common/MapControls';
import LayerPicker from '../components/common/LayerPicker';
import LeftRibbon from '../components/common/LeftRibbon';
import SidePanel from '../components/common/SidePanel';
import AvatarMenu from '../components/common/AvatarMenu';
import Compass from '../components/common/Compass';
import WelcomeToast from '../components/WelcomeToast';
import OnboardingModal from '../components/OnboardingModal';
import '../styles/MapStyles.css';

// Fix Leaflet icons
import markerRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerRetina,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

// Custom marker colors
const createMarkerIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        iconSize: [20, 20],
    });
};

// Map event handler component
const MapEventHandler: React.FC<{ onBoundsChange: (bounds: Bounds) => void }> = ({ onBoundsChange }) => {
    const map = useMapEvents({
        moveend: () => {
            const bounds = map.getBounds();
            onBoundsChange({
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            });
        },
    });
    return null;
};

// Tile layer component that changes based on active layer
const DynamicTileLayer: React.FC<{ layer: 'geo' | 'sat' | 'terrain' }> = ({ layer }) => {
    if (layer === 'sat') {
        return (
            <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
        );
    } else if (layer === 'terrain') {
        return (
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
            />
        );
    } else {
        return (
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        );
    }
};

const MapPage: React.FC = () => {
    const dispatch = useDispatch();
    const { center, zoom, route, wifiQuality, activeLayer } = useSelector((state: RootState) => state.map);
    const { firstName } = useSelector((state: RootState) => state.auth);
    const { isSidePanelOpen, welcomeShown } = useSelector((state: RootState) => state.ui);
    const { list: stations, recent, fuelType } = useSelector((state: RootState) => state.stations);
    const { ids: favoriteIds } = useSelector((state: RootState) => state.favorites);
    const { packages: offlinePackages } = useSelector((state: RootState) => state.offline);
    
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [stationFuels, setStationFuels] = useState<StationFuel[]>([]);
    const [lastVisitedStation, setLastVisitedStation] = useState<Station | undefined>();
    const [navigatingTo, setNavigatingTo] = useState<Station | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load stations and fuels
                const [stationsData, fuelsData, favoritesData, packagesData] = await Promise.all([
                    stationsApi.getStations(),
                    stationsApi.getStationFuels(),
                    favoritesApi.getFavorites(),
                    offlineApi.getPackages(),
                ]);

                dispatch(setStations(stationsData));
                setStationFuels(fuelsData);
                dispatch(setFavorites(favoritesData.map(f => f.station)));
                dispatch(setPackages(packagesData));

                // Cache to Dexie
                await dbHelpers.cacheStations(stationsData);
                await dbHelpers.cacheStationFuels(fuelsData);

                // Load recent from Dexie
                const recentStations = await dbHelpers.getRecent();
                recentStations.forEach(s => dispatch(addRecent(s)));
            } catch (error) {
                console.error('Error loading data:', error);
                // Try loading from cache
                const cachedStations = await dbHelpers.getCachedStations();
                if (cachedStations.length > 0) {
                    dispatch(setStations(cachedStations));
                }
            }
        };

        loadData();
    }, [dispatch]);

    // Request geolocation on mount and restore map position
    useEffect(() => {
        // Restore map position from localStorage
        const savedCenter = localStorage.getItem('mapCenter');
        const savedZoom = localStorage.getItem('mapZoom');
        if (savedCenter) {
            try {
                const [lat, lng] = JSON.parse(savedCenter);
                dispatch(setCenter([lat, lng]));
            } catch (e) {
                // Ignore parse errors
            }
        }
        if (savedZoom) {
            try {
                dispatch(setZoom(parseInt(savedZoom)));
            } catch (e) {
                // Ignore parse errors
            }
        }

        geolocation.getCurrentPosition()
            .then((position) => {
                const loc: [number, number] = [position.latitude, position.longitude];
                setUserLocation(loc);
                // Only center on user location if no saved position
                if (!savedCenter) {
                    dispatch(setCenter(loc));
                }
                dispatch(setLocationGranted(true));
            })
            .catch((error) => {
                console.error('Geolocation error:', error);
                dispatch(setLocationGranted(false));
            });
    }, [dispatch]);

    // Save map position on change
    useEffect(() => {
        localStorage.setItem('mapCenter', JSON.stringify(center));
    }, [center]);

    useEffect(() => {
        localStorage.setItem('mapZoom', String(zoom));
    }, [zoom]);

    // Show onboarding on first visit
    useEffect(() => {
        const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
        if (!hasSeenOnboarding && firstName) {
            setShowOnboarding(true);
        }
    }, [firstName]);

    // Handle station selection
    const handleStationSelect = useCallback((station: Station) => {
        if (station.latitude && station.longitude) {
            const latLng: [number, number] = [parseFloat(String(station.latitude)), parseFloat(String(station.longitude))];
            dispatch(setCenter(latLng));
            dispatch(setZoom(16));
            dispatch(setCurrentStation(station));
            dispatch(addRecent(station));
            dbHelpers.addRecent(station);
            setLastVisitedStation(station);
        }
    }, [dispatch]);

    // Handle navigation
    const handleNavigate = useCallback((station: Station) => {
        setNavigatingTo(station);
        dispatch(setCurrentStation(station));
    }, [dispatch]);

    // Navigation handler component
    const NavigationHandler: React.FC = () => {
        const map = useMap();
        
        useEffect(() => {
            if (!navigatingTo || !userLocation || !navigatingTo.latitude || !navigatingTo.longitude) {
                if (!navigatingTo) {
                    dispatch(clearRoute());
                }
                return;
            }

            const start: [number, number] = userLocation;
            const end: [number, number] = [
                parseFloat(String(navigatingTo.latitude)),
                parseFloat(String(navigatingTo.longitude)),
            ];

            const bounds = map.getBounds();
            const mapBounds: Bounds = {
                minLat: bounds.getSouth(),
                maxLat: bounds.getNorth(),
                minLng: bounds.getWest(),
                maxLng: bounds.getEast(),
            };

            // Find path using A*
            const path = findPath(start, end, mapBounds);

            // Calculate total distance
            let totalDistance = 0;
            for (let i = 0; i < path.length - 1; i++) {
                totalDistance += km(tupleToLatLng(path[i]), tupleToLatLng(path[i + 1]));
            }

            // Calculate ETA (assuming 50 km/h average speed)
            const speedKmh = 50;
            const etaMins = (totalDistance / speedKmh) * 60;

            dispatch(setRoute({ route: path, distanceKm: totalDistance, etaMins }));
        }, [map, navigatingTo, userLocation, dispatch]);
        
        return null;
    };

    // Handle favorite toggle
    const handleToggleFavorite = useCallback(async (stationId: number) => {
        try {
            const isFavorite = favoriteIds.includes(stationId);
            if (isFavorite) {
                await favoritesApi.removeFavorite(stationId);
            } else {
                await favoritesApi.addFavorite(stationId);
            }
            dispatch(toggleFavorite(stationId));
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    }, [favoriteIds, dispatch]);

    // Handle review submit
    const handleReviewSubmit = useCallback(async (stationId: number, rating: number, comment: string) => {
        try {
            await reviewsApi.createReview({ station: stationId, rating, comment });
            alert('Review submitted successfully!');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Error submitting review');
        }
    }, []);

    // Handle package click
    const handlePackageClick = useCallback((pkg: OfflinePackage) => {
        const centerLat = (pkg.min_lat + pkg.max_lat) / 2;
        const centerLng = (pkg.min_lon + pkg.max_lon) / 2;
        dispatch(setCenter([centerLat, centerLng]));
        // Map will update via center change
    }, [dispatch]);

    // Get filtered stations based on fuel type
    const getFilteredStations = useCallback(() => {
        if (!fuelType) return stations;
        
        // Filter stations that have the selected fuel type available
        const availableStationIds = new Set(
            stationFuels
                .filter(sf => {
                    // This is simplified - you'd want to check actual fuel type names
                    return sf.is_available;
                })
                .map(sf => sf.station)
        );
        
        return stations.filter(s => availableStationIds.has(s.station_id));
    }, [stations, stationFuels, fuelType]);

    const filteredStations = getFilteredStations();
    const favoriteStations = stations.filter(s => favoriteIds.includes(s.station_id));

    // Get station fuel info
    const getStationFuelInfo = useCallback((stationId: number) => {
        return stationFuels.find(sf => sf.station === stationId && sf.is_available);
    }, [stationFuels]);

    // Get price color based on relative price (green = cheapest, red = most expensive)
    const getPriceColor = useCallback((price: number | undefined) => {
        if (!price) return '#ff9800'; // Orange for no price
        
        const prices = filteredStations
            .map(s => {
                const fuelInfo = getStationFuelInfo(s.station_id);
                return fuelInfo?.price_per_unit;
            })
            .filter((p): p is number => p !== undefined);
        
        if (prices.length === 0) return '#4caf50';
        
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice;
        
        if (priceRange === 0) return '#4caf50';
        
        const normalizedPrice = (price - minPrice) / priceRange;
        
        // Green to red gradient
        if (normalizedPrice < 0.33) return '#4caf50'; // Green (cheapest)
        if (normalizedPrice < 0.66) return '#ff9800'; // Orange (medium)
        return '#f44336'; // Red (most expensive)
    }, [filteredStations, getStationFuelInfo]);

    const handleOnboardingClose = () => {
        setShowOnboarding(false);
        localStorage.setItem('hasSeenOnboarding', 'true');
    };

    return (
        <Box sx={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* Onboarding Modal */}
            {firstName && (
                <OnboardingModal
                    open={showOnboarding}
                    firstName={firstName}
                    onClose={handleOnboardingClose}
                />
            )}

            {/* Welcome Toast */}
            {firstName && !welcomeShown && (
                <WelcomeToast
                    firstName={firstName}
                    show={true}
                    onHide={() => {
                        dispatch(setWelcomeShown(true));
                    }}
                />
            )}

            {/* Avatar Menu */}
            <AvatarMenu />

            {/* Search Bar */}
            <SearchBar stations={stations} onStationSelect={handleStationSelect} />

            {/* Left Ribbon */}
            <LeftRibbon
                onToggle={() => dispatch(setSidePanelOpen(!isSidePanelOpen))}
                isOpen={isSidePanelOpen}
            />

            {/* Side Panel */}
            <SidePanel
                open={isSidePanelOpen}
                onClose={() => dispatch(setSidePanelOpen(false))}
                favorites={favoriteStations}
                recent={recent}
                offlinePackages={offlinePackages}
                selectedFuelType={fuelType}
                onFuelTypeChange={(ft) => dispatch(setFuelType(ft))}
                onStationClick={handleStationSelect}
                onPackageClick={handlePackageClick}
                onReviewSubmit={handleReviewSubmit}
                lastVisitedStation={lastVisitedStation}
            />

            {/* Map */}
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="map-page-container"
                style={{ height: '100vh', width: '100vw' }}
            >
                <DynamicTileLayer layer={activeLayer} />
                
                <MapEventHandler
                    onBoundsChange={() => {
                        // Could use bounds for filtering or caching
                    }}
                />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={L.divIcon({
                            className: 'current-location-marker',
                            html: '<div style="background-color: #00ccff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                            iconSize: [16, 16],
                        })}
                    >
                        <Popup>Your Current Location</Popup>
                    </Marker>
                )}

                {/* Station Markers */}
                {filteredStations.map((station) => {
                    if (!station.latitude || !station.longitude) return null;
                    
                    const position: [number, number] = [
                        parseFloat(String(station.latitude)),
                        parseFloat(String(station.longitude)),
                    ];
                    
                    const fuelInfo = getStationFuelInfo(station.station_id);
                    const isFavorite = favoriteIds.includes(station.station_id);
                    const markerColor = fuelInfo 
                        ? getPriceColor(fuelInfo.price_per_unit)
                        : '#ff9800';

                    return (
                        <Marker
                            key={station.station_id}
                            position={position}
                            icon={createMarkerIcon(markerColor)}
                        >
                            <Popup>
                                <Box sx={{ minWidth: 200 }}>
                                    <Typography variant="h6" sx={{ mb: 1 }}>
                                        {station.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {station.address}, {station.city}
                                    </Typography>
                                    {fuelInfo && (
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            Price: ₹{fuelInfo.price_per_unit?.toFixed(2)}/unit
                                        </Typography>
                                    )}
                                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                handleNavigate(station);
                                                // Haptic feedback (if supported)
                                                if (navigator.vibrate) {
                                                    navigator.vibrate(50);
                                                }
                                            }}
                                        >
                                            Navigate
                                        </Button>
                                        <Button
                                            size="small"
                                            variant={isFavorite ? 'contained' : 'outlined'}
                                            color={isFavorite ? 'error' : 'primary'}
                                            onClick={() => handleToggleFavorite(station.station_id)}
                                        >
                                            {isFavorite ? '★' : '☆'}
                                        </Button>
                                    </Box>
                                </Box>
                            </Popup>
                        </Marker>
                    );
                })}

                {/* Navigation Handler */}
                <NavigationHandler />

                {/* Route Polyline */}
                {route.length > 0 && (
                    <Polyline
                        positions={route}
                        color="#00ccff"
                        weight={4}
                        opacity={0.7}
                    />
                )}

                {/* Map Controls */}
                <MapControls
                    userLocation={userLocation}
                    wifiQuality={wifiQuality}
                    onWifiQualityChange={(quality) => dispatch(setWifiQuality(quality))}
                />

                {/* Layer Picker */}
                <LayerPicker
                    activeLayer={activeLayer}
                    onLayerChange={(layer) => dispatch(setActiveLayer(layer))}
                />

                {/* Compass */}
                <Compass />
            </MapContainer>

            {/* Route Info */}
            {route.length > 0 && (
                <Paper
                    sx={{
                        position: 'absolute',
                        bottom: 100,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 1000,
                        p: 2,
                        boxShadow: 4,
                        borderRadius: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Distance: {km(tupleToLatLng(route[0]), tupleToLatLng(route[route.length - 1])).toFixed(2)} km
                    </Typography>
                    {route.length > 2 && (
                        <Typography variant="caption" color="text.secondary">
                            ETA: ~{Math.round((km(tupleToLatLng(route[0]), tupleToLatLng(route[route.length - 1])) / 50) * 60)} mins
                        </Typography>
                    )}
                </Paper>
            )}
        </Box>
    );
};

export default MapPage;
