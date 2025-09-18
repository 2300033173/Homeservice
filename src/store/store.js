import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import servicesSlice from './servicesSlice';
import bookingsSlice from './bookingsSlice';
import providersSlice from './providersSlice';
import adminSlice from './adminSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    services: servicesSlice,
    bookings: bookingsSlice,
    providers: providersSlice,
    admin: adminSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;