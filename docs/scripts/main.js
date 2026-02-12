// Main initialization for SF Symbols demo
import { debounce, getVisibleCards, setFocusedCard, getGridColumns, getCenteredCardIndex } from './utils.js';
import { searchInput, renderingModeSelect, categorySelect, state, allSymbolsData, allViewBoxData, symbolNames, RENDERING_MODES, CHUNKS, chunksLoaded, categories, symbolCategories } from './data.js';
import { renderSymbols, updateData, closeDrawer } from './symbols.js';
import './theme.js';
import './modals.js';
import './colors.js';

// Debounced render for search input
const debouncedRender = debounce(renderSymbols, 150);

// Event listeners
searchInput.addEventListener('input', debouncedRender);
renderingModeSelect.addEventListener('change', updateData);
categorySelect.addEventListener('change', renderSymbols);

// Keyboard navigation
document.addEventListener('keydown', (event) => {
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

  const cards = getVisibleCards();
  if (cards.length === 0) return;

  const handleArrowKey = (getNewIndex) => {
    event.preventDefault();
    const newIndex = state.focusedIndex === -1 
      ? getCenteredCardIndex() 
      : getNewIndex();
    setFocusedCard(newIndex);
  };

  switch (event.key) {
    case 'ArrowUp':
      handleArrowKey(() => Math.max(0, state.focusedIndex - getGridColumns()));
      break;
    case 'ArrowDown':
      handleArrowKey(() => Math.min(cards.length - 1, state.focusedIndex + getGridColumns()));
      break;
    case 'ArrowLeft':
      handleArrowKey(() => Math.max(0, state.focusedIndex - 1));
      break;
    case 'ArrowRight':
      handleArrowKey(() => Math.min(cards.length - 1, state.focusedIndex + 1));
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
      if (event.metaKey || event.ctrlKey) {
        event.preventDefault();
        searchInput.focus();
      }
      break;
  }
});

// Close popovers when clicking outside
document.addEventListener('click', (event) => {
  if (!event.target.closest('.card-info-icon') && !event.target.closest('.popover')) {
    document.querySelectorAll('.popover').forEach(popoverElement => {
      const popover = bootstrap.Popover.getInstance(popoverElement.previousElementSibling);
      if (popover) popover.hide();
    });
  }
});

// Chunked data loader
const CHUNKED_META_URL = './meta.json';
let totalChunksToLoad = 0;
let chunksLoadedCount = 0;
let progressBarShownTime = 0;

function normalizeChunkUrl(rawUrl) {
  if (!rawUrl) return rawUrl;
  if (rawUrl.startsWith('./')) return rawUrl;
  if (rawUrl.startsWith('/')) return '.' + rawUrl;
  return './' + rawUrl;
}

function updateProgressBar(percentage) {
  const progressBar = document.getElementById('chunk-progress-bar');
  if (progressBar) {
    progressBar.style.width = percentage + '%';
    progressBar.parentElement.setAttribute('aria-valuenow', percentage);
  }
}

function showProgressBar() {
  const container = document.getElementById('chunk-progress-container');
  if (container) {
    progressBarShownTime = Date.now();
    container.classList.add('show');
  }
}

function hideProgressBar() {
  const container = document.getElementById('chunk-progress-container');
  if (container) {
    const delay = Math.max(0, 800 - (Date.now() - progressBarShownTime)) + 300;
    setTimeout(() => container.classList.remove('show'), delay);
  }
}

async function loadChunk(renderingMode, index) {
  if (chunksLoaded[renderingMode]?.has(index)) return;
  if (!CHUNKS[renderingMode]?.[index]) return;

  const url = normalizeChunkUrl(CHUNKS[renderingMode][index]);
  try {
    const json = await (await fetch(url)).json();
    
    allSymbolsData[renderingMode] = allSymbolsData[renderingMode] || {};
    allViewBoxData[renderingMode] = allViewBoxData[renderingMode] || {};
    
    Object.assign(allSymbolsData[renderingMode], json.data || {});
    Object.assign(allViewBoxData[renderingMode], json.viewBox || {});

    chunksLoaded[renderingMode] = chunksLoaded[renderingMode] || new Set();
    chunksLoaded[renderingMode].add(index);

    chunksLoadedCount++;
    updateProgressBar(Math.min(100, Math.round((chunksLoadedCount / totalChunksToLoad) * 100)));
    updateData();
  } catch (error) {
    console.error('Failed to load chunk', url, error);
  }
}

async function loadAllChunksForRenderingMode(renderingMode) {
  if (!CHUNKS[renderingMode]) return;
  for (let i = 0; i < CHUNKS[renderingMode].length; i++) {
    await loadChunk(renderingMode, i);
  }
}

async function initChunkedData() {
  try {
    const meta = await (await fetch(CHUNKED_META_URL)).json();
    
    // Update globals
    RENDERING_MODES.length = 0;
    RENDERING_MODES.push(...(meta.VARIANTS || []));
    Object.assign(symbolNames, meta.symbolNames || {});
    Object.assign(CHUNKS, meta.chunks || {});
    
    categories.length = 0;
    categories.push(...(meta.categories || []));
    Object.assign(symbolCategories, meta.symbolCategories || {});
    
    // Update SF Symbols version
    const versionEl = document.getElementById('sf-version');
    if (versionEl && meta.sfSymbolsVersion) {
      versionEl.textContent = meta.sfSymbolsVersion;
    }
    
    // Populate rendering mode dropdown from meta.json variants
    if (renderingModeSelect && RENDERING_MODES.length > 0) {
      renderingModeSelect.innerHTML = '';
      for (const mode of RENDERING_MODES) {
        const option = document.createElement('option');
        option.value = mode;
        option.textContent = mode.charAt(0).toUpperCase() + mode.slice(1);
        renderingModeSelect.appendChild(option);
      }
    }

    // Populate category dropdown
    if (categorySelect && categories.length > 0) {
      for (const category of categories) {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
      }
    }

    const defaultMode = RENDERING_MODES[0];
    if (!defaultMode) return;

    renderingModeSelect.value = defaultMode;

    // Calculate total chunks
    totalChunksToLoad = RENDERING_MODES.reduce((sum, mode) => 
      sum + (CHUNKS[mode]?.length || 0), 0);
    chunksLoadedCount = 0;

    if (totalChunksToLoad > 0) {
      showProgressBar();
      updateProgressBar(0);
    }

    // Load default mode first, then others in parallel
    await loadAllChunksForRenderingMode(defaultMode);
    await Promise.all(
      RENDERING_MODES
        .filter(mode => mode !== defaultMode)
        .map(loadAllChunksForRenderingMode)
    );

    if (totalChunksToLoad > 0) {
      setTimeout(hideProgressBar, 300);
    }
  } catch (error) {
    console.error('Failed to load chunked meta:', error);
  }
}

initChunkedData();
