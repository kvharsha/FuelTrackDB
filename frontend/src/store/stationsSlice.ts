import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { Station } from '../api/stations';

export type FuelTypeFilter = 'cng' | 'petrol' | 'diesel' | 'ev_ac' | 'ev_dc' | 'lpg' | null;
export type SortOption = 'distance' | 'price' | 'rating';

interface StationsState {
  list: Station[];
  filtered: Station[];
  fuelType: FuelTypeFilter;
  sort: SortOption;
  current?: Station;
  recent: Station[];
}

const initialState: StationsState = {
  list: [],
  filtered: [],
  fuelType: null,
  sort: 'distance',
  current: undefined,
  recent: [],
};

const stationsSlice = createSlice({
  name: 'stations',
  initialState,
  reducers: {
    setStations: (state, action: PayloadAction<Station[]>) => {
      state.list = action.payload;
      state.filtered = action.payload;
    },
    setFiltered: (state, action: PayloadAction<Station[]>) => {
      state.filtered = action.payload;
    },
    setFuelType: (state, action: PayloadAction<FuelTypeFilter>) => {
      state.fuelType = action.payload;
    },
    setSort: (state, action: PayloadAction<SortOption>) => {
      state.sort = action.payload;
    },
    setCurrentStation: (state, action: PayloadAction<Station | undefined>) => {
      state.current = action.payload;
    },
    addRecent: (state, action: PayloadAction<Station>) => {
      // Remove if already exists
      state.recent = state.recent.filter(s => s.station_id !== action.payload.station_id);
      // Add to beginning
      state.recent.unshift(action.payload);
      // Keep only last 10
      state.recent = state.recent.slice(0, 10);
    },
  },
});

export const {
  setStations,
  setFiltered,
  setFuelType,
  setSort,
  setCurrentStation,
  addRecent,
} = stationsSlice.actions;
export default stationsSlice.reducer;

