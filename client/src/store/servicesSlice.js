import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  categories: [],
  providers: [],
  selectedProvider: null,
  searchResults: [],
  isLoading: false,
  error: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProviders: (state, action) => {
      state.providers = action.payload;
    },
    setSelectedProvider: (state, action) => {
      state.selectedProvider = action.payload;
    },
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setCategories,
  setProviders,
  setSelectedProvider,
  setSearchResults,
  setError,
  clearError,
} = servicesSlice.actions;

export default servicesSlice.reducer;