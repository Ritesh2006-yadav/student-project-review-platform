/**
 * Purpose: Centralizes frontend API requests, JWT handling, session storage,
 * and role-aware redirects for student and faculty pages.
 */

(function initializeAppAPI() {
  const TOKEN_KEY = 'token';
  const LEGACY_TOKEN_KEY = 'student_portfolio_token';
  const USER_KEY = 'student_portfolio_user';

  const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);

  const decodeToken = (token = getToken()) => {
    if (!token) {
      return null;
    }

    try {
      const payload = token.split('.')[1];
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  };

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(LEGACY_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getStoredUser = () => {
    const rawUser = localStorage.getItem(USER_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  };

  const redirectToLogin = () => {
    window.location.href = '/';
  };

  const redirectByRole = (token = getToken()) => {
    const payload = decodeToken(token);

    if (payload && payload.role === 'faculty') {
      window.location.href = '/faculty-dashboard.html';
      return;
    }

    window.location.href = '/dashboard.html';
  };

  const requireAuth = () => {
    if (!getToken()) {
      redirectToLogin();
    }
  };

  const fetchAPI = async (endpoint, method = 'GET', body = null) => {
    const headers = {};
    const token = getToken();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const options = { method, headers };

    if (body instanceof FormData) {
      options.body = body;
    } else if (body !== null) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);
    const result = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearSession();
        redirectToLogin();
      }

      throw new Error(result.message || 'Request failed');
    }

    return result;
  };

  const attachLogout = (buttonId = 'logout-button') => {
    const button = document.getElementById(buttonId);

    if (!button) {
      return;
    }

    button.addEventListener('click', () => {
      clearSession();
      redirectToLogin();
    });
  };

  window.AppAPI = {
    fetchAPI,
    getToken,
    decodeToken,
    getStoredUser,
    setSession,
    clearSession,
    requireAuth,
    attachLogout,
    redirectByRole,
    redirectToLogin
  };
})();
