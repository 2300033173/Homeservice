import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  profile: null,
  earnings: [],
  stats: null,
  jobs: [],
  availability: {},
  isLoading: false,
  error: null,
};

const providersSlice = createSlice({
  name: 'providers',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setEarnings: (state, action) => {
      state.earnings = action.payload;
    },
    setStats: (state, action) => {
      state.stats = action.payload;
    },
    setJobs: (state, action) => {
      state.jobs = action.payload;
    },
    updateJob: (state, action) => {
      const index = state.jobs.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = { ...state.jobs[index], ...action.payload };
      }
    },
    setAvailability: (state, action) => {
      state.availability = action.payload;
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
  setProfile,
  updateProfile,
  setEarnings,
  setStats,
  setJobs,
  updateJob,
  setAvailability,
  setError,
  clearError,
} = providersSlice.actions;

export default providersSlice.reducer;