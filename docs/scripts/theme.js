// Theme management for SF Symbols demo

const themeToggleButton = document.getElementById('theme-toggle');
const themeToggleIcon = document.getElementById('theme-toggle-icon');

// Theme management
export function applyTheme(mode) {
  const header = document.querySelector('.frosted-header');
  // Add temporary class to suppress transitions/animations during theme switch
  document.body.classList.add('theme-switching');

  // Toggle classes on next frame to avoid triggering transitions
  requestAnimationFrame(() => {
    if (mode === 'dark') {
      document.body.classList.add('dark-mode');
      if (header) header.classList.add('dark');
    } else {
      document.body.classList.remove('dark-mode');
      if (header) header.classList.remove('dark');
    }
    localStorage.setItem('sf-theme', mode);
    themeToggleButton.setAttribute('aria-pressed', mode === 'dark' ? 'true' : 'false');
    updateThemeIcon(mode);

    // Remove the suppression class shortly after to re-enable transitions
    requestAnimationFrame(() => {
      setTimeout(() => document.body.classList.remove('theme-switching'), 120);
    });
  });
}

export function updateThemeIcon(mode) {
  // Use Bootstrap Icons for theme toggle: moon-stars (dark) and sun (light)
  if (mode === 'dark') {
    themeToggleIcon.innerHTML = '<i class="bi bi-moon-stars" aria-hidden="true" style="font-size:18px; line-height:1;"></i>';
  } else {
    themeToggleIcon.innerHTML = '<i class="bi bi-sun" aria-hidden="true" style="font-size:18px; line-height:1;"></i>';
  }
}

// Initialize theme
const savedTheme = localStorage.getItem('sf-theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(savedTheme);

themeToggleButton.addEventListener('click', () => {
  const newMode = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
  applyTheme(newMode);
});