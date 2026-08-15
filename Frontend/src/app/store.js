/**
 * store.js
 * -----------------------------------------
 * Redux Toolkit store. Per the approved state-management strategy,
 * Redux holds only global CLIENT state (auth session, theme) — server
 * data (courses, roadmaps, etc.) is fetched per-feature via the
 * apiRequest wrapper and held in local component/hook state, not here.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});