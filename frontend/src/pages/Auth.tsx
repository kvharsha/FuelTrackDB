import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { authApi } from '../api/auth';
import '../styles/AuthStyles.css';


const Auth = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [tabValue, setTabValue] = useState(0);
    const [form, setForm] = useState({ 
        email: '', password: '', 
        full_name: '', password_confirm: '',
        gender: '', exact_home_address: '', age: '', username: '', phone: ''
    });
    
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailStatus, setEmailStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
    const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | 'checking' | null>(null);
    const emailCheckTimer = React.useRef<number | null>(null);
    const usernameCheckTimer = React.useRef<number | null>(null);
 
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));

        if (tabValue === 1 && name === 'email') {
            setEmailStatus('checking');
            if (emailCheckTimer.current) window.clearTimeout(emailCheckTimer.current as any);
            emailCheckTimer.current = window.setTimeout(async () => {
                try {
                    const res = await authApi.checkEmail(value);
                    setEmailStatus(res.available ? 'available' : 'taken');
                } catch (err) {
                    setEmailStatus('taken');
                }
            }, 400);
        }
        if (tabValue === 1 && name === 'username') {
            setUsernameStatus('checking');
            if (usernameCheckTimer.current) window.clearTimeout(usernameCheckTimer.current as any);
            usernameCheckTimer.current = window.setTimeout(async () => {
                try {
                    const res = await authApi.checkUsername(value);
                    setUsernameStatus(res.available ? 'available' : 'taken');
                } catch (err) {
                    setUsernameStatus('taken');
                }
            }, 400);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (tabValue === 0) {
                // Login
                const response = await authApi.login(form.email, form.password);
                
                // Dispatch to Redux
                dispatch(loginSuccess({
                    token: response.token,
                    firstName: response.first_name,
                    role: response.role,
                }));
                
                // Ask for location permission
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        () => navigate(response.role === 'admin' ? '/admin' : '/map'),
                        () => navigate(response.role === 'admin' ? '/admin' : '/map')
                    );
                } else {
                    navigate(response.role === 'admin' ? '/admin' : '/map');
                }
            } else {
                // Registration
                await authApi.register({
                    email: form.email,
                    full_name: form.full_name,
                    password: form.password,
                    password_confirm: form.password_confirm,
                    phone: form.phone || undefined,
                    username: form.username || undefined,
                    gender: form.gender || undefined,
                    age: form.age ? parseInt(form.age) : undefined,
                    exact_home_address: form.exact_home_address || undefined,
                });
                setTabValue(0);
                setError('');
                alert("Registration successful! Please log in.");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed. Check network or server.');
        } finally {
            setIsLoading(false);
        }
    };

    const EmailHelperText = () => {
        if (tabValue === 0) return null;
        if (emailStatus === 'checking') return <Typography color="info" variant="caption">Checking availability...</Typography>;
        if (emailStatus === 'available') return <Typography color="success" variant="caption">Email looks good ✅</Typography>;
        if (emailStatus === 'taken') return <Typography color="error" variant="caption">Enter a valid email ❌</Typography>;
        return null;
    }

    return (
        <Container component="main" maxWidth={false} className="auth-page-container">
            <div className="auth-background"></div>
            <div className="auth-overlay"></div>
            
            <Box className="auth-form-card">
                <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                    FuelTrackDB
                </Typography>
                
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                    <Tab label="Login" />
                    <Tab label="Sign Up" />
                </Tabs>
                
                <form onSubmit={handleSubmit} className="form-scroll">
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
                        InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                    />
                    {EmailHelperText()}

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
                        InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                    />

                    {tabValue === 1 && (
                        <>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="full_name"
                                label="Full name"
                                name="full_name"
                                value={form.full_name}
                                onChange={handleChange}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                id="username"
                                label="Preferred username"
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                helperText={usernameStatus === 'checking' ? 'Checking...' : usernameStatus === 'available' ? 'Username available' : usernameStatus === 'taken' ? 'Username taken' : ''}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                id="gender"
                                label="Gender (M/F/X)"
                                name="gender"
                                value={form.gender}
                                onChange={handleChange}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                id="exact_home_address"
                                label="Exact Home Address"
                                name="exact_home_address"
                                value={form.exact_home_address}
                                onChange={handleChange}
                                multiline
                                minRows={2}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                id="age"
                                label="Age"
                                name="age"
                                value={form.age}
                                onChange={handleChange}
                                type="number"
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="password_confirm"
                                label="Confirm password"
                                name="password_confirm"
                                type="password"
                                value={form.password_confirm}
                                onChange={handleChange}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />

                            <TextField
                                margin="normal"
                                fullWidth
                                id="phone"
                                label="Phone (optional)"
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                InputProps={{ sx: { backgroundColor: 'rgba(255,255,255,0.04)' } }}
                            />
                        </>
                    )}

                    {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, p: 1.5, bgcolor: '#00ccff', '&:hover': { bgcolor: '#00aae0' } }}
                        disabled={
                            isLoading || (
                                tabValue === 1 && (
                                    emailStatus !== 'available' || (
                                        (form.username || '').trim() !== '' && usernameStatus !== 'available'
                                    )
                                )
                            )
                        }
                    >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : (tabValue === 0 ? 'Login' : 'Sign Up')}
                    </Button>
                </form>

                <Button 
                    onClick={() => navigate('/admin/login')} 
                    variant="text" 
                    sx={{ color: '#aaa', mt: 1, width: '100%' }}
                >
                    Admin Login
                </Button>
            </Box>
        </Container>
    );
};

export default Auth;