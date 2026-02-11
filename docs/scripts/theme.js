// Theme management for SF Symbols demo
import { updateColor } from './colors.js';

let themeToggleButton = null;
let themeToggleIcon = null;

function ensureElements() {
  if (!themeToggleButton) themeToggleButton = document.getElementById('theme-toggle');
  if (!themeToggleIcon) themeToggleIcon = document.getElementById('theme-toggle-icon');
}

// Theme management
export function applyTheme(mode) {
  ensureElements();
  const htmlElement = document.documentElement;
  // Add temporary class to suppress transitions/animations during theme switch
  htmlElement.classList.add('theme-switching');

  // Toggle classes on next frame to avoid triggering transitions
  requestAnimationFrame(() => {
    if (mode === 'soft-dark') {
      htmlElement.classList.add('soft-dark');
    } else {
      htmlElement.classList.remove('soft-dark');
    }
    localStorage.setItem('sf-theme', mode);
    themeToggleButton?.setAttribute('aria-pressed', mode === 'soft-dark' ? 'true' : 'false');
    updateThemeIcon(mode);
    updateColor();  // Update symbol colors when theme changes

    // Remove the suppression class shortly after to re-enable transitions
    requestAnimationFrame(() => {
      setTimeout(() => htmlElement.classList.remove('theme-switching'), 120);
    });
  });
}

export function updateThemeIcon(mode) {
  ensureElements();
  if (!themeToggleIcon) return;
  // Use Bootstrap Icons for theme toggle: moon-stars (soft-dark) and sun (light)
  if (mode === 'soft-dark') {
    themeToggleIcon.innerHTML = '<i class="bi bi-moon-stars" aria-hidden="true" style="font-size:18px; line-height:1;"></i>';
  } else {
    themeToggleIcon.innerHTML = '<i class="bi bi-sun" aria-hidden="true" style="font-size:18px; line-height:1;"></i>';
  }
}

// Initialize theme
const savedTheme = localStorage.getItem('sf-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'soft-dark' : 'light');
applyTheme(savedTheme);

ensureElements();
themeToggleButton.addEventListener('click', () => {
  const newMode = document.documentElement.classList.contains('soft-dark') ? 'light' : 'soft-dark';
  applyTheme(newMode);
});

// Refresh theme icon when color module changes (avoids circular import)
document.addEventListener('sf-color-changed', () => {
  const mode = document.documentElement.classList.contains('soft-dark') ? 'soft-dark' : 'light';
  updateThemeIcon(mode);
});