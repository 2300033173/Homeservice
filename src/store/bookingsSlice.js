import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  bookings: [],
  currentBooking: null,
  trackingData: null,
  isLoading: false,
  error: null,
};

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setBookings: (state, action) => {
      state.bookings = action.payload;
    },
    addBooking: (state, action) => {
      state.bookings.unshift(action.payload);
    },
    updateBooking: (state, action) => {
      const index = state.bookings.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.bookings[index] = { ...state.bookings[index], ...action.payload };
      }
    },
    setCurrentBooking: (state, action) => {
      state.currentBooking = action.payload;
    },
    setTrackingData: (state, action) => {
      state.trackingData = action.payload;
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
  setBookings,
  addBooking,
  updateBooking,
  setCurrentBooking,
  setTrackingData,
  setError,
  clearError,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;