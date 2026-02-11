// Color management for SF Symbols demo

// 42 Color palette (sorted by hex value ascending)
export const colors = [
  '#000000', '#00008B', '#0000FF', '#006400', '#00BFFF', '#00CED1', '#00FF00', '#00FFFF',
  '#1E90FF', '#2F4F4F', '#32CD32', '#696969', '#778899', '#800080', '#808080', '#8B0000',
  '#8FBC8F', '#90EE90', '#98FB98', '#9932CC', '#A52A2A', '#ADD8E6', '#B0C4DE', '#BC8F8F',
  '#C0C0C0', '#CD853F', '#D2691E', '#D3D3D3', '#DDA0DD', '#DEB887', '#F0E68C', '#F5DEB3',
  '#FF0000', '#FF00FF', '#FF1493', '#FF6347', '#FFA500', '#FFC0CB', '#FFD700', '#FFDAB9',
  '#FFFF00', '#FFFFFF'
];

export let currentColor = '#000000';

// Initialize color selector
export function initColorSelector() {
  const colorSelector = document.getElementById('color-selector');
  const colorSelected = document.getElementById('color-selected');
  const colorDropdown = document.getElementById('color-dropdown');
  const colorGrid = colorDropdown.querySelector('.color-grid');
  // Create a theme-aware option that uses CSS `currentColor`.
  // This option makes symbols theme-aware and will be the default on first visit.
  const themeOption = document.createElement('div');
  themeOption.className = 'color-option';
  themeOption.dataset.color = 'currentColor';
  themeOption.title = 'Theme color (currentColor)';
  themeOption.textContent = 'T';
  if (currentColor === 'currentColor') themeOption.classList.add('selected');
  themeOption.addEventListener('click', () => { selectColor('currentColor'); closeColorDropdown(); });
  colorGrid.appendChild(themeOption);

  // Create color options
  colors.forEach(color => {
    const colorOption = document.createElement('div');
    colorOption.className = 'color-option';
    colorOption.style.backgroundColor = color;
    colorOption.dataset.color = color;

    if (color === currentColor) {
      colorOption.classList.add('selected');
    }

    colorOption.addEventListener('click', () => {
      selectColor(color);
      closeColorDropdown();
    });

    colorGrid.appendChild(colorOption);
  });

  // Toggle dropdown
  colorSelector.addEventListener('click', (e) => {
    e.stopPropagation();
    colorSelector.classList.toggle('open');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!colorSelector.contains(e.target)) {
      closeColorDropdown();
    }
  });

  // Update selected color display
  updateColorDisplay();
}

export function selectColor(color) {
  currentColor = color;
  updateColorDisplay();
  updateColor();

  // Update selected state
  const colorOptions = document.querySelectorAll('.color-option');
  colorOptions.forEach(option => {
    option.classList.toggle('selected', option.dataset.color === color);
  });

  // Save to localStorage
  localStorage.setItem('sf-color', color);
}

export function updateColorDisplay() {
  const colorSelected = document.getElementById('color-selected');
  if (currentColor === 'currentColor') {
    // Visual indicator for theme-aware selection
    colorSelected.style.background = 'transparent';
    colorSelected.style.setProperty('border', '2px dashed var(--border-muted)');
    colorSelected.textContent = 'T';
    colorSelected.style.color = 'inherit';
  } else {
    colorSelected.style.background = currentColor;
    colorSelected.style.border = '';
    colorSelected.textContent = '';
  }
}

export function closeColorDropdown() {
  document.getElementById('color-selector').classList.remove('open');
}

// Update symbol color
export function updateColor() {
  // If using the special 'currentColor' token, set the color based on the current theme
  if (currentColor === 'currentColor') {
    // Get the current theme-aware color from CSS variables
    const isDarkMode = document.documentElement.classList.contains('soft-dark');
    const themeColor = isDarkMode ? '#adbac7' : '#24292e';
    document.documentElement.style.setProperty('--symbol-color', themeColor);
  } else {
    document.documentElement.style.setProperty('--symbol-color', currentColor);
  }
  // Notify theme module to refresh its icon (avoids circular import)
  document.dispatchEvent(new CustomEvent('sf-color-changed'));
}

// Initialize
const savedColor = localStorage.getItem('sf-color') || 'currentColor';
selectColor(savedColor);
initColorSelector();