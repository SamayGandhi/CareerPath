/**
 * useAuth.js
 * -----------------------------------------
 * Central hook wrapping auth actions + state. Handles the access-token
 * lifecycle (storing it in axios's module state, not Redux) alongside
 * dispatching the Redux user/session state.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../auth.api';
import { setCredentials, clearCredentials, setAuthStatus } from '../authSlice';
import { setAccessToken } from '../../../lib/axios';

export function useAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, status } = useSelector((state) => state.auth);

  const login = useCallback(
    async (credentials) => {
      const { data } = await authApi.login(credentials);
      setAccessToken(data.accessToken);
      dispatch(setCredentials({ user: data.user }));
      return data.user;
    },
    [dispatch]
  );

  const register = useCallback(
    async (payload) => {
      const { data } = await authApi.register(payload);
      setAccessToken(data.accessToken);
      dispatch(setCredentials({ user: data.user }));
      return data.user;
    },
    [dispatch]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      dispatch(clearCredentials());
      navigate('/login');
    }
  }, [dispatch, navigate]);

  /**
   * Attempts silent re-authentication on app load using the HttpOnly
   * refresh-token cookie. If it succeeds, the user is considered
   * logged in without re-entering credentials.
   */
  const attemptSilentLogin = useCallback(async () => {
    dispatch(setAuthStatus('loading'));
    try {
      const { data } = await authApi.refreshToken();
      setAccessToken(data.accessToken);
      // We have a valid access token but no user object yet from this
      // call alone — the caller (App.jsx) fetches /users/me right after.
      dispatch(setAuthStatus('authenticated'));
      return true;
    } catch {
      dispatch(setAuthStatus('unauthenticated'));
      return false;
    }
  }, [dispatch]);

  return { user, status, login, register, logout, attemptSilentLogin };
}