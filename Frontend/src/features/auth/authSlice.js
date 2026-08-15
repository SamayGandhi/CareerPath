/**
 * authSlice.js
 * -----------------------------------------
 * Global client-side auth session state: current user + auth status.
 * The access token itself lives in lib/axios.js's module-level variable
 * (not Redux/localStorage) — per secure practice, it's memory-only and
 * re-obtained via refresh-token on page reload.
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  status: 'idle', // 'idle' | 'loading' | 'authenticated' | 'unauthenticated'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.status = 'authenticated';
    },
    clearCredentials(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
    setAuthStatus(state, action) {
      state.status = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, setAuthStatus } = authSlice.actions;
export default authSlice.reducer;