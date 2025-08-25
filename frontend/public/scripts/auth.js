// frontend/public/scripts/auth.js
// Minimal auth helpers for storing JWT from backend (e.g., after Google OAuth success page)
// In production, you might redirect to a SPA route and store there.

const Auth = (() => {
  const TOKEN_KEY = 'lb_jwt';

  const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  };

  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const clear = () => localStorage.removeItem(TOKEN_KEY);

  return { setToken, getToken, clear };
})();

// If the backend renders a page with a window.__TOKEN__ injected, we can capture it:
document.addEventListener('DOMContentLoaded', () => {
  if (window.__TOKEN__) {
    Auth.setToken(window.__TOKEN__);
  }
});
