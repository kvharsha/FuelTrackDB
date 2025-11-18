import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type LatLngTuple = [number, number];
export type MapLayer = 'geo' | 'sat' | 'terrain';
export type WifiQuality = 'excellent' | 'ok' | 'poor' | 'offline';

interface MapState {
  center: LatLngTuple;
  zoom: number;
  route: LatLngTuple[];
  etaMins: number;
  distanceKm: number;
  locationGranted: boolean;
  wifiQuality: WifiQuality;
  activeLayer: MapLayer;
}

const initialState: MapState = {
  center: [12.9716, 77.5946], // Default: Bangalore
  zoom: 13,
  route: [],
  etaMins: 0,
  distanceKm: 0,
  locationGranted: false,
  wifiQuality: 'offline',
  activeLayer: 'geo',
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setCenter: (state, action: PayloadAction<LatLngTuple>) => {
      state.center = action.payload;
    },
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = action.payload;
    },
    setRoute: (state, action: PayloadAction<{ route: LatLngTuple[]; distanceKm: number; etaMins: number }>) => {
      state.route = action.payload.route;
      state.distanceKm = action.payload.distanceKm;
      state.etaMins = action.payload.etaMins;
    },
    clearRoute: (state) => {
      state.route = [];
      state.distanceKm = 0;
      state.etaMins = 0;
    },
    setLocationGranted: (state, action: PayloadAction<boolean>) => {
      state.locationGranted = action.payload;
    },
    setWifiQuality: (state, action: PayloadAction<WifiQuality>) => {
      state.wifiQuality = action.payload;
    },
    setActiveLayer: (state, action: PayloadAction<MapLayer>) => {
      state.activeLayer = action.payload;
    },
  },
});

export const {
  setCenter,
  setZoom,
  setRoute,
  clearRoute,
  setLocationGranted,
  setWifiQuality,
  setActiveLayer,
} = mapSlice.actions;
export default mapSlice.reducer;

