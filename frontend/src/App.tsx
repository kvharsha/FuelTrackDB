// // frontend/src/App.tsx

// import { useState, useEffect } from 'react';
// import './App.css';

// interface Station {
//     station_id: number; // Must match the backend key
//     name: string;
//     address: string;
//     city: string;
//     latitude: string | null;
//     longitude: string | null;
//     status: string;
// }

// // Get the API base URL from the environment variables configured in docker-compose.yml
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// function App() {
//   const [stations, setStations] = useState<Station[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // The full URL is: http://localhost:8000/api/stations/
//     const url = `${API_BASE_URL}stations/`;
    
//     fetch(url)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         setStations(data.results || data); 
//         setLoading(false);
//       })
//       .catch((err: unknown) => { // FIX: Type 'err' as unknown
//         console.error("Fetch error:", err);
        
//         let message = "An unknown error occurred.";
        
//         // FIX: Use a type guard to ensure 'err' is an Error object
//         if (err instanceof Error) {
//             message = err.message;
//         }

//         // The 'message' variable is now guaranteed to be a string, resolving the error
//         setError(`Failed to fetch data. Check API: ${message}`);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <h1>Loading Stations...</h1>;
//   if (error) return <h1>Error loading data: {error}</h1>;
//   if (stations.length === 0) return <h1>No stations found. Please add data via the Django Admin.</h1>;

//   return (
//     <div className="App">
//       <h1>FuelTrackDB Stations</h1>
//       <p>Data successfully pulled from the Django API running on port 8000.</p>
//       <div className="station-list">
//         {stations.map(station => (
//           // FIX: Use station.station_id instead of station.id
//           <div key={station.station_id} className="station-card">
//             <h2>{station.name}</h2>
//             <p><strong>ID:</strong> {station.station_id}</p>
//             <p><strong>Address:</strong> {station.address}</p>
//             <p><strong>City:</strong> {station.city}</p>
//             <p><strong>Status:</strong> {station.status}</p>
//             <p><strong>Latitude:</strong> {station.latitude}</p>
//             <p><strong>Longitude:</strong> {station.longitude}</p>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default App;

// import { useState, useEffect } from 'react';
// import './App.css';


// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet'; // Used for custom marker icons


// // Fix for default Leaflet icons not appearing in Webpack/Vite
// delete (L.Icon.Default.prototype as any)._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'leaflet/marker-icon-2x.png',
//   iconUrl: 'leaflet/marker-icon.png',
//   shadowUrl: 'leaflet/marker-shadow.png',
// });


// // Define the expected structure for TypeScript
// interface Station {
//     station_id: number;
//     name: string;
//     address: string;
//     city: string;
//     latitude: string | null;
//     longitude: string | null;
//     status: string;
// }

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// function App() {
//   const [stations, setStations] = useState<Station[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const url = `${API_BASE_URL}stations/`;
    
//     fetch(url)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         setStations(data.results || data); 
//         setLoading(false);
//       })
//       .catch((err: unknown) => {
//         console.error("Fetch error:", err);
        
//         let message = "An unknown error occurred.";
//         if (err instanceof Error) {
//             message = err.message;
//         }

//         setError(`Failed to fetch data. Check API: ${message}`);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) return <h1>Loading Stations...</h1>;
//   if (error) return <h1>Error loading data: {error}</h1>;
//   if (stations.length === 0) return <h1>No stations found. Please add data via the Django Admin.</h1>;

//   // Calculate the map center based on the first station found, or use a default
//   const defaultCenter: [number, number] = [12.9716, 77.5946]; // Default to Bangalore (or any city near your data)
//   const mapCenter: [number, number] = 
//     stations.length > 0 && stations[0].latitude && stations[0].longitude
//       ? [parseFloat(stations[0].latitude), parseFloat(stations[0].longitude)]
//       : defaultCenter;

//   return (
//     <div className="App">
//       <h1>⛽ Fuel Stations Map</h1>
//       <p>Click on a marker to see station details.</p>
      
//       {/* New Map Component */}
//       <MapContainer 
//         center={mapCenter} 
//         zoom={13} 
//         scrollWheelZoom={true}
//         className="map-container" // Use the CSS class defined below
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />
        
//         {stations.map(station => {
//           // Check if coordinates exist before creating a marker
//           if (station.latitude && station.longitude) {
//             const position: [number, number] = [
//               parseFloat(station.latitude),
//               parseFloat(station.longitude)
//             ];

//             return (
//               <Marker key={station.station_id} position={position}>
//                 <Popup>
//                   <h3>{station.name}</h3>
//                   <p>Status: <strong>{station.status}</strong></p>
//                   <p>{station.address}, {station.city}</p>
//                 </Popup>
//               </Marker>
//             );
//           }
//           return null;
//         })}
//       </MapContainer>
//     </div>
//   );
// }

// export default App;

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import { store } from './store';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import Auth from './pages/Auth';
import AdminAuth from './pages/AdminAuth';

// Lazy load heavy components
const MapPage = lazy(() => import('./pages/MapPage'));
const PreferencesPage = lazy(() => import('./pages/PreferencesPage'));
const AdminPortal = lazy(() => import('./pages/AdminPortal'));

// Loading fallback component
const LoadingFallback: React.FC = () => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
        }}
    >
        <CircularProgress />
    </Box>
);

// Component to protect routes requiring authentication
const PrivateRoute: React.FC<{ element: React.ReactElement; requireAdmin?: boolean }> = ({ 
    element, 
    requireAdmin = false 
}) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    
    if (!token) {
        return <Navigate to="/" />;
    }
    
    if (requireAdmin && role !== 'admin') {
        return <Navigate to="/map" />;
    }
    
    return element;
};

// Inner app component that can use Redux hooks
const AppRoutes = () => {
    const theme = useSelector((state: RootState) => state.ui.theme);
    
    const muiTheme = createTheme({
        palette: {
            mode: theme,
            primary: {
                main: '#00ccff',
            },
        },
    });

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Auth />} /> 
                <Route path="/admin/login" element={<AdminAuth />} /> 
                
                {/* Private Routes */}
                <Route 
                    path="/map" 
                    element={
                        <PrivateRoute 
                            element={
                                <Suspense fallback={<LoadingFallback />}>
                                    <MapPage />
                                </Suspense>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/preferences" 
                    element={
                        <PrivateRoute 
                            element={
                                <Suspense fallback={<LoadingFallback />}>
                                    <PreferencesPage />
                                </Suspense>
                            } 
                        />
                    } 
                />
                <Route 
                    path="/admin" 
                    element={
                        <PrivateRoute 
                            element={
                                <Suspense fallback={<LoadingFallback />}>
                                    <AdminPortal />
                                </Suspense>
                            } 
                            requireAdmin={true} 
                        />
                    } 
                />
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" />} /> 
            </Routes>
        </ThemeProvider>
    );
};

const App = () => {
    return (
        <Provider store={store}>
            <Router>
                <AppRoutes />
            </Router>
        </Provider>
    );
};

export default App;