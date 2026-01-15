// Main initialization for SF Symbols demo
import { debounce, getVisibleCards, setFocusedCard, getGridColumns, getCenteredCardIndex } from './utils.js';
import { searchInput, variantSelect, state, allSymbolsData, allViewBoxData, symbolNames, VARIANTS, CHUNKS, chunksLoaded } from './data.js';
import { renderSymbols, updateData, openDrawer, closeDrawer } from './symbols.js';
import './theme.js';
import './modals.js';
import './colors.js';

// Debounced render for search input
const debouncedRender = debounce(renderSymbols, 150);

// Search input event
searchInput.addEventListener('input', debouncedRender);

// Variant select event
variantSelect.addEventListener('change', updateData);

// Keyboard navigation
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

  const cards = getVisibleCards();
  if (cards.length === 0) return;

  switch (event.key) {
    case 'ArrowUp':
      event.preventDefault();
      if (state.focusedIndex === -1) {
        setFocusedCard(getCenteredCardIndex());
      } else {
        const columns = getGridColumns();
        const newIndex = Math.max(0, state.focusedIndex - columns);
        setFocusedCard(newIndex);
      }
      break;

    case 'ArrowDown':
      event.preventDefault();
      if (state.focusedIndex === -1) {
        setFocusedCard(getCenteredCardIndex());
      } else {
        const columns = getGridColumns();
        const newIndex = Math.min(cards.length - 1, state.focusedIndex + columns);
        setFocusedCard(newIndex);
      }
      break;

    case 'ArrowLeft':
      event.preventDefault();
      if (state.focusedIndex === -1) {
        setFocusedCard(getCenteredCardIndex());
      } else {
        const newIndex = Math.max(0, state.focusedIndex - 1);
        setFocusedCard(newIndex);
      }
      break;

    case 'ArrowRight':
      event.preventDefault();
      if (state.focusedIndex === -1) {
        setFocusedCard(getCenteredCardIndex());
      } else {
        const newIndex = Math.min(cards.length - 1, state.focusedIndex + 1);
        setFocusedCard(newIndex);
      }
      break;

    case 'Enter':
      event.preventDefault();
      if (state.focusedIndex >= 0 && state.focusedIndex < cards.length) {
        cards[state.focusedIndex].click();
      }
      break;

    case 'Escape':
      event.preventDefault();
      closeDrawer();
      break;

    case 'f':
      // cmd+f (Mac) or ctrl+f (Windows) focuses search input
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        searchInput.focus();
      }
      break;
  }
});

// Close info popover on Escape
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' || ev.key === 'Esc') {
    if (infoSymbolPopover.classList.contains('show')) {
      infoSymbolPopover.classList.remove('show');
      infoSymbolPopover.setAttribute('aria-hidden', 'true');
      currentInfoIcon = null;
    }
  }
});

// Close popovers when clicking outside
document.addEventListener('click', (ev) => {
  // Close popovers if clicking outside of info icons and popovers
  if (!ev.target.closest('.card-info-icon') && !ev.target.closest('.popover')) {
    const existingPopovers = document.querySelectorAll('.popover');
    existingPopovers.forEach(p => {
      const popover = bootstrap.Popover.getInstance(p.previousElementSibling);
      if (popover) popover.hide();
    });
  }
});

// Chunked data loader
const CHUNKED_META_URL = './meta.json';

function normalizeChunkUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  if (rawUrl.startsWith('./')) return rawUrl;
  if (rawUrl.startsWith('/')) return '.' + rawUrl; // Convert absolute to relative
  return './' + rawUrl;
}

async function loadChunk(variant, index) {
  // Skip if already loaded
  if (chunksLoaded[variant] && chunksLoaded[variant].has(index)) return;
  if (!CHUNKS[variant] || !CHUNKS[variant][index]) return;

  const rawUrl = CHUNKS[variant][index];
  const url = normalizeChunkUrl(rawUrl);
  try {
    const res = await fetch(url);
    const json = await res.json();
    allSymbolsData[variant] = allSymbolsData[variant] || {};
    allViewBoxData[variant] = allViewBoxData[variant] || {};
    // Assign data properties individually to avoid readonly issues
    const data = json.data || {};
    for (const key in data) {
      allSymbolsData[variant][key] = data[key];
    }
    const viewBox = json.viewBox || {};
    for (const key in viewBox) {
      allViewBoxData[variant][key] = viewBox[key];
    }

    // Mark chunk as loaded
    if (!chunksLoaded[variant]) chunksLoaded[variant] = new Set();
    chunksLoaded[variant].add(index);

    // Always call updateData after loading a chunk to refresh the display
    updateData();
  } catch (err) {
    console.error('Failed to load chunk', url, err);
  }
}

// Load all chunks for a variant sequentially to ensure progressive updates
async function loadAllChunksForVariant(variant) {
  if (!CHUNKS[variant]) return;
  for (let i = 0; i < CHUNKS[variant].length; i++) {
    await loadChunk(variant, i);
  }
}

async function initChunkedData() {
  try {
    const res = await fetch(CHUNKED_META_URL);
    const meta = await res.json();
    // Write safe globals
    VARIANTS.length = 0;
    VARIANTS.push(...(meta.VARIANTS || []));
    Object.assign(symbolNames, meta.symbolNames || {});
    Object.assign(CHUNKS, meta.chunks || {});

    const defaultVariant = VARIANTS[0];

    if (defaultVariant) {
      // Set variant select
      variantSelect.value = defaultVariant;

      // Load all chunks for the default variant first (sequentially for progressive loading)
      await loadAllChunksForVariant(defaultVariant);

      // Then load remaining variants in the background
      for (const variantName of VARIANTS) {
        if (variantName !== defaultVariant) {
          loadAllChunksForVariant(variantName); // fire and forget for other variants
        }
      }
    }
  } catch (err) {
    console.error('Failed to load chunked meta:', err);
  }
}

// Initialize data loading
initChunkedData();