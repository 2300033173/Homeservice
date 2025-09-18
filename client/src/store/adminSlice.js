import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboard: {
    stats: null,
    recentBookings: [],
    monthlyRevenue: [],
  },
  providers: [],
  bookings: [],
  analytics: {
    revenueByDay: [],
    jobsHeatmap: [],
    categoryStats: [],
  },
  promoCodes: [],
  isLoading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setDashboardStats: (state, action) => {
      state.dashboard.stats = action.payload;
    },
    setRecentBookings: (state, action) => {
      state.dashboard.recentBookings = action.payload;
    },
    setMonthlyRevenue: (state, action) => {
      state.dashboard.monthlyRevenue = action.payload;
    },
    setProviders: (state, action) => {
      state.providers = action.payload;
    },
    updateProvider: (state, action) => {
      const index = state.providers.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.providers[index] = { ...state.providers[index], ...action.payload };
      }
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    setAnalytics: (state, action) => {
      state.analytics = { ...state.analytics, ...action.payload };
    },
    setPromoCodes: (state, action) => {
      state.promoCodes = action.payload;
    },
    addPromoCode: (state, action) => {
      state.promoCodes.unshift(action.payload);
    },
    updatePromoCode: (state, action) => {
      const index = state.promoCodes.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.promoCodes[index] = { ...state.promoCodes[index], ...action.payload };
      }
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
  setDashboardStats,
  setRecentBookings,
  setMonthlyRevenue,
  setProviders,
  updateProvider,
  setBookings,
  setAnalytics,
  setPromoCodes,
  addPromoCode,
  updatePromoCode,
  setError,
  clearError,
} = adminSlice.actions;

export default adminSlice.reducer;