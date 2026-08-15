/**
 * queryClient.js
 * -----------------------------------------
 * Lightweight, dependency-free data-fetching primitive built on top of
 * the axios instance. Rather than pulling in RTK Query/React Query as
 * an additional large dependency, this provides a minimal, consistent
 * `apiRequest` wrapper that every feature's `*.api.js` file uses —
 * consistent error unwrapping (backend's standard envelope) in one place.
 */

import axiosInstance from './axios';

/**
 * Unwraps the backend's standard { success, data, message, meta }
 * envelope and throws a normalized Error (with .errorCode and .errors)
 * on failure, so calling code can catch one consistent shape.
 */
export async function apiRequest(config) {
  try {
    const response = await axiosInstance(config);
    return { data: response.data.data, meta: response.data.meta, message: response.data.message };
  } catch (error) {
    const backendError = error.response?.data;
    const normalizedError = new Error(
      backendError?.message || error.message || 'Something went wrong'
    );
    normalizedError.errorCode = backendError?.errorCode || 'UNKNOWN_ERROR';
    normalizedError.errors = backendError?.errors || [];
    normalizedError.statusCode = error.response?.status;
    throw normalizedError;
  }
}