import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  InputAdornment,
} from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminApi } from '../api/admin';
import type { User } from '../api/admin';
import { stationsApi } from '../api/stations';
import type { Station, FuelType, StationFuel } from '../api/stations';
import { reviewsApi } from '../api/reviews';
import type { Review } from '../api/reviews';

const AdminPortal: React.FC = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [stations, setStations] = useState<Station[]>([]);
    const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingStation, setEditingStation] = useState<Station | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success',
    });

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tabValue, searchQuery]);

    const loadData = async () => {
        try {
            if (tabValue === 0) {
                const data = await stationsApi.getStations();
                setStations(data);
            } else if (tabValue === 1) {
                const data = await stationsApi.getFuelTypes();
                setFuelTypes(data);
            } else if (tabValue === 2) {
                const data = await adminApi.getUsers(searchQuery);
                setUsers(data);
            } else if (tabValue === 3) {
                const data = await reviewsApi.getReviews();
                setReviews(data);
            }
        } catch (error) {
            showSnackbar('Error loading data', 'error');
        }
    };

    const showSnackbar = (message: string, severity: 'success' | 'error') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleToggleUserBlock = async (userId: number) => {
        try {
            await adminApi.toggleUserBlock(userId);
            showSnackbar('User status updated', 'success');
            loadData();
        } catch (error) {
            showSnackbar('Error updating user', 'error');
        }
    };

    const handleDeleteStation = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            try {
                await adminApi.deleteStation(id);
                showSnackbar('Station deleted', 'success');
                loadData();
            } catch (error) {
                showSnackbar('Error deleting station', 'error');
            }
        }
    };

    const handleDeleteReview = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                // Note: Delete review endpoint needs to be implemented in backend
                // For now, just show a message
                showSnackbar('Delete review feature coming soon', 'error');
                // await reviewsApi.deleteReview(id);
                // showSnackbar('Review deleted', 'success');
                // loadData();
            } catch (error) {
                showSnackbar('Error deleting review', 'error');
            }
        }
    };

    const exportToCSV = (data: any[], filename: string) => {
        if (data.length === 0) return;
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Station columns
    const stationColumns: GridColDef[] = [
        { field: 'station_id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: 'Name', width: 200, editable: true },
        { field: 'address', headerName: 'Address', width: 250 },
        { field: 'city', headerName: 'City', width: 150 },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="edit"
                    icon={<EditIcon />}
                    label="Edit"
                    onClick={() => {
                        setEditingStation(params.row);
                        setOpenDialog(true);
                    }}
                />,
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDeleteStation(params.row.station_id)}
                    showInMenu
                />,
            ],
        },
    ];

    // User columns
    const userColumns: GridColDef[] = [
        { field: 'user_id', headerName: 'ID', width: 80 },
        { field: 'email', headerName: 'Email', width: 250 },
        { field: 'full_name', headerName: 'Name', width: 200 },
        { field: 'role', headerName: 'Role', width: 100 },
        {
            field: 'is_active',
            headerName: 'Active',
            width: 100,
            type: 'boolean',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="block"
                    icon={<BlockIcon />}
                    label={params.row.is_active ? 'Block' : 'Unblock'}
                    onClick={() => handleToggleUserBlock(params.row.user_id)}
                />,
            ],
        },
    ];

    // Review columns
    const reviewColumns: GridColDef[] = [
        { field: 'review_id', headerName: 'ID', width: 80 },
        { field: 'station_name', headerName: 'Station', width: 200 },
        { field: 'user_email', headerName: 'User', width: 200 },
        { field: 'rating', headerName: 'Rating', width: 100 },
        { field: 'comment', headerName: 'Comment', width: 300 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem
                    key="delete"
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDeleteReview(params.row.review_id)}
                />,
            ],
        },
    ];

    // Chart data
    const ratingDistribution = reviews.reduce((acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const ratingChartData = Object.entries(ratingDistribution).map(([rating, count]) => ({
        rating: `${rating} stars`,
        count,
    }));

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    // Filtered data
    const filteredStations = stations.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredUsers = users.filter(u =>
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">Admin Portal</Typography>
                <Button variant="outlined" onClick={() => navigate('/map')}>
                    Back to Map
                </Button>
            </Box>

            <Paper sx={{ p: 2, mb: 2 }}>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                    <Tab label="Stations" />
                    <Tab label="Fuel Types" />
                    <Tab label="Users" />
                    <Tab label="Reviews" />
                    <Tab label="Analytics" />
                </Tabs>
            </Paper>

            <Paper sx={{ p: 3 }}>
                {(tabValue === 0 || tabValue === 2) && (
                    <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                        <TextField
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={() => {
                                if (tabValue === 0) {
                                    exportToCSV(filteredStations, 'stations.csv');
                                } else {
                                    exportToCSV(filteredUsers, 'users.csv');
                                }
                            }}
                        >
                            Export CSV
                        </Button>
                    </Box>
                )}

                {tabValue === 0 && (
                    <DataGrid
                        rows={filteredStations}
                        columns={stationColumns}
                        getRowId={(row) => row.station_id}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        sx={{ height: 600 }}
                    />
                )}

                {tabValue === 1 && (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => exportToCSV(fuelTypes, 'fuel_types.csv')}
                            >
                                Export CSV
                            </Button>
                        </Box>
                        <DataGrid
                            rows={fuelTypes}
                            columns={[
                                { field: 'fuel_type_id', headerName: 'ID', width: 100 },
                                { field: 'name', headerName: 'Name', width: 200, editable: true },
                                { field: 'description', headerName: 'Description', width: 300 },
                                {
                                    field: 'is_active',
                                    headerName: 'Active',
                                    width: 100,
                                    type: 'boolean',
                                    editable: true,
                                },
                            ]}
                            getRowId={(row) => row.fuel_type_id}
                            pageSizeOptions={[10, 25, 50]}
                            sx={{ height: 600 }}
                        />
                    </Box>
                )}

                {tabValue === 2 && (
                    <DataGrid
                        rows={filteredUsers}
                        columns={userColumns}
                        getRowId={(row) => row.user_id}
                        pageSizeOptions={[10, 25, 50]}
                        initialState={{
                            pagination: { paginationModel: { pageSize: 10 } },
                        }}
                        sx={{ height: 600 }}
                    />
                )}

                {tabValue === 3 && (
                    <Box>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                startIcon={<DownloadIcon />}
                                onClick={() => exportToCSV(reviews, 'reviews.csv')}
                            >
                                Export CSV
                            </Button>
                        </Box>
                        <DataGrid
                            rows={reviews}
                            columns={reviewColumns}
                            getRowId={(row) => row.review_id}
                            pageSizeOptions={[10, 25, 50]}
                            initialState={{
                                pagination: { paginationModel: { pageSize: 10 } },
                            }}
                            sx={{ height: 600 }}
                        />
                    </Box>
                )}

                {tabValue === 4 && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 3 }}>
                            Review Ratings Distribution
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={ratingChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="rating" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#00ccff" />
                            </BarChart>
                        </ResponsiveContainer>

                        <Typography variant="h6" sx={{ mt: 4, mb: 3 }}>
                            Rating Distribution (Pie Chart)
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={ratingChartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ rating, percent }) => `${rating}: ${(percent * 100).toFixed(0)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="count"
                                >
                                    {ratingChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Edit Station</DialogTitle>
                <DialogContent>
                    {editingStation && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                            <TextField
                                label="Name"
                                defaultValue={editingStation.name}
                                fullWidth
                            />
                            <TextField
                                label="Address"
                                defaultValue={editingStation.address}
                                fullWidth
                            />
                            <TextField
                                label="City"
                                defaultValue={editingStation.city}
                                fullWidth
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            showSnackbar('Station updated', 'success');
                            setOpenDialog(false);
                            loadData();
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default AdminPortal;
