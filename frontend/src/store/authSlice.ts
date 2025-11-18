import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  firstName: string | null;
  role: 'user' | 'admin' | null;
  isAdmin: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  firstName: localStorage.getItem('userFirstName'),
  role: (localStorage.getItem('userRole') as 'user' | 'admin' | null) || null,
  isAdmin: localStorage.getItem('userRole') === 'admin',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ token: string; firstName: string; role: 'user' | 'admin' }>) => {
      state.token = action.payload.token;
      state.firstName = action.payload.firstName;
      state.role = action.payload.role;
      state.isAdmin = action.payload.role === 'admin';
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('userFirstName', action.payload.firstName);
      localStorage.setItem('userRole', action.payload.role);
    },
    logout: (state) => {
      state.token = null;
      state.firstName = null;
      state.role = null;
      state.isAdmin = false;
      localStorage.removeItem('token');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userRole');
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

