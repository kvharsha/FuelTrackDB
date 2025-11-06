import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import uiReducer from './uiSlice';
import mapReducer from './mapSlice';
import stationsReducer from './stationsSlice';
import favoritesReducer from './favoritesSlice';
import offlineReducer from './offlineSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    map: mapReducer,
    stations: stationsReducer,
    favorites: favoritesReducer,
    offline: offlineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

