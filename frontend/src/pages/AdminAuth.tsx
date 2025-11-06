import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { authApi } from '../api/auth';
import '../styles/AuthStyles.css';

const AdminAuth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await authApi.login(form.email, form.password);

            // Check for admin role
            if (response.role !== 'admin') {
                setError("You are not authorized as an admin.");
                setIsLoading(false);
                return;
            }

            // Dispatch to Redux
            dispatch(loginSuccess({
                token: response.token,
                firstName: response.first_name,
                role: response.role,
            }));

            // Navigate to admin portal (we'll create this)
            navigate('/admin');
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || "Invalid Credentials or not an Admin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth={false} className="auth-page-container admin-login-container">
            <div className="auth-background"></div>
            <div className="auth-overlay"></div>
            
            <Box 
                className="auth-form-card"
                sx={{
                    maxWidth: 400,
                    backgroundColor: 'rgba(10, 20, 30, 0.85)',
                    backdropFilter: 'blur(10px)',
                }}
            >
                <Typography 
                    component="h1" 
                    variant="h5" 
                    sx={{ 
                        mb: 4, 
                        fontWeight: 300,
                        letterSpacing: 2,
                        textAlign: 'center',
                        color: '#e0e0e0',
                    }}
                >
                    ADMIN LOGIN
                </Typography>
                
                <form onSubmit={handleSubmit}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={form.email}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                '& fieldset': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputBase-input': {
                                color: '#e0e0e0',
                            },
                        }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={handleChange}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                                '& fieldset': {
                                    borderColor: 'rgba(255,255,255,0.2)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255,255,255,0.3)',
                                },
                            },
                            '& .MuiInputLabel-root': {
                                color: 'rgba(255,255,255,0.7)',
                            },
                            '& .MuiInputBase-input': {
                                color: '#e0e0e0',
                            },
                        }}
                    />

                    {error && (
                        <Typography 
                            color="error" 
                            sx={{ 
                                mt: 2, 
                                fontSize: '0.875rem',
                                textAlign: 'center',
                            }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ 
                            mt: 3, 
                            mb: 2,
                            p: 1.5, 
                            bgcolor: 'rgba(255, 87, 34, 0.8)',
                            color: '#fff',
                            '&:hover': { 
                                bgcolor: 'rgba(255, 87, 34, 1)',
                            },
                            fontWeight: 500,
                            letterSpacing: 1,
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
                    </Button>

                    <Button
                        fullWidth
                        variant="text"
                        onClick={() => navigate('/')}
                        sx={{
                            color: 'rgba(255,255,255,0.6)',
                            '&:hover': {
                                color: 'rgba(255,255,255,0.9)',
                            },
                        }}
                    >
                        Back to User Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default AdminAuth;