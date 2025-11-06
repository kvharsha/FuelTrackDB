import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OfflinePackage } from '../api/offline';

interface OfflineState {
  packages: OfflinePackage[];
  downloading: boolean;
}

const initialState: OfflineState = {
  packages: [],
  downloading: false,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setPackages: (state, action: PayloadAction<OfflinePackage[]>) => {
      state.packages = action.payload;
    },
    addPackage: (state, action: PayloadAction<OfflinePackage>) => {
      state.packages.push(action.payload);
    },
    removePackage: (state, action: PayloadAction<number>) => {
      state.packages = state.packages.filter(p => p.package_id !== action.payload);
    },
    setDownloading: (state, action: PayloadAction<boolean>) => {
      state.downloading = action.payload;
    },
  },
});

export const { setPackages, addPackage, removePackage, setDownloading } = offlineSlice.actions;
export default offlineSlice.reducer;

