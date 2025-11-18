import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  theme: 'light' | 'dark';
  isSidePanelOpen: boolean;
  welcomeShown: boolean;
}

const initialState: UiState = {
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  isSidePanelOpen: false,
  welcomeShown: localStorage.getItem('welcomeShown') === 'true',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
    },
    setSidePanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidePanelOpen = action.payload;
    },
    setWelcomeShown: (state, action: PayloadAction<boolean>) => {
      state.welcomeShown = action.payload;
      localStorage.setItem('welcomeShown', String(action.payload));
    },
  },
});

export const { setTheme, toggleTheme, setSidePanelOpen, setWelcomeShown } = uiSlice.actions;
export default uiSlice.reducer;

