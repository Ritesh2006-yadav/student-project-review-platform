/**
 * Purpose: Applies a persistent light/dark theme across the frontend and
 * wires up toggle buttons using localStorage.
 */

(function initializeTheme() {
  const THEME_KEY = 'theme';
  const root = document.documentElement;

  const getSavedTheme = () => localStorage.getItem(THEME_KEY) || 'light';

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
      button.dataset.theme = theme;

      if (button.querySelector('.theme-icon')) {
        return;
      }

      button.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
  };

  const toggleTheme = () => {
    const nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, nextTheme);
    applyTheme(nextTheme);
  };

  applyTheme(getSavedTheme());

  document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getSavedTheme());

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.addEventListener('click', toggleTheme);
    });
  });
})();
