import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface FavoritesState {
  ids: number[];
}

const initialState: FavoritesState = {
  ids: [],
};

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    setFavorites: (state, action: PayloadAction<number[]>) => {
      state.ids = action.payload;
    },
    addFavorite: (state, action: PayloadAction<number>) => {
      if (!state.ids.includes(action.payload)) {
        state.ids.push(action.payload);
      }
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.ids = state.ids.filter(id => id !== action.payload);
    },
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const index = state.ids.indexOf(action.payload);
      if (index > -1) {
        state.ids.splice(index, 1);
      } else {
        state.ids.push(action.payload);
      }
    },
  },
});

export const { setFavorites, addFavorite, removeFavorite, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;

