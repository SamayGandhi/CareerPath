/**
 * App.jsx
 * -----------------------------------------
 * Root component: wires Redux Provider, Router, Theme/Toast providers,
 * ErrorBoundary, and attempts silent re-authentication on load via the
 * refresh-token cookie before rendering guarded routes.
 */

import { useEffect, useState } from 'react';
import { Provider, useDispatch } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { store } from './store';
import AppRouter from './AppRouter';
import { ThemeProvider } from './providers/ThemeProvider';
import { ToastProvider } from '../components/feedback/Toast';
import ErrorBoundary from '../components/feedback/ErrorBoundary';
import { setAccessToken } from '../lib/axios';
import { authApi } from '../features/auth/auth.api';
import { setCredentials, setAuthStatus } from '../features/auth/authSlice';
import Spinner from '../components/ui/atoms/Spinner';

function AuthBootstrap({ children }) {
  const dispatch = useDispatch();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      dispatch(setAuthStatus('loading'));
      try {
        const { data } = await authApi.refreshToken();
        setAccessToken(data.accessToken);

        // Fetch the current user now that we have a valid access token.
        const { apiRequest } = await import('../lib/queryClient');
        const meResponse = await apiRequest({ method: 'GET', url: '/users/me' });
        dispatch(setCredentials({ user: meResponse.data.user }));
      } catch {
        dispatch(setAuthStatus('unauthenticated'));
      } finally {
        setBootstrapped(true);
      }
    }
    bootstrap();
  }, [dispatch]);

  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spinner size={32} />
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <ThemeProvider>
          <ToastProvider>
            <BrowserRouter>
              <AuthBootstrap>
                <AppRouter />
              </AuthBootstrap>
            </BrowserRouter>
          </ToastProvider>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}