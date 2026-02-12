// Symbol rendering and management for SF Symbols demo
import { FLIP_MEASURE_THRESHOLD, copyToClipboard, getVisibleCards, setFocusedCard, kebabToPascalCase } from './utils.js';
import { currentData, currentViewBox, allSymbolsData, allViewBoxData, state, searchInput, renderingModeSelect, categorySelect, iconsContainer, visibleCountEl, totalCountEl, infoSymbols, symbolNames, symbolCategories } from './data.js';

// Create and append bottom drawer
const bottomDrawer = document.createElement('aside');
bottomDrawer.id = 'bottom-drawer';
bottomDrawer.setAttribute('aria-hidden', 'true');
bottomDrawer.innerHTML = '<div id="drawer-content" class="drawer-content"></div>';
document.body.appendChild(bottomDrawer);
bottomDrawer.addEventListener('wheel', (e) => {
  if (!e.target.closest('.drawer-code')) {
    e.preventDefault();
  }
});

// Helper: Check if dark mode is active
function isDarkMode() {
  return document.documentElement.classList.contains('soft-dark');
}

// Helper: Get current rendering mode
function getCurrentRenderingMode() {
  return renderingModeSelect?.value || 'dualtone';
}

// Helper: Create clipboard icon element (SF Symbol or Bootstrap fallback)
function createClipboardIcon() {
  const clipboardKey = 'document.on.clipboard.fill';
  const span = document.createElement('span');
  span.style.display = 'inline-flex';
  span.style.width = '18px';
  span.style.height = '18px';
  
  if (currentData?.[clipboardKey]) {
    const viewBox = currentViewBox[clipboardKey] || '0 0 24 24';
    span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" width="18" height="18">${currentData[clipboardKey]}</svg>`;
  } else {
    span.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true" style="font-size:16px; line-height:1;"></i>';
  }
  return span;
}

// Helper: Create SVG element from content
function createSvgElement(content, viewBox, width, height) {
  const size = width && height ? ` width="${width}" height="${height}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor"${size}>${content}</svg>`;
}

// Render symbols grid
export function renderSymbols() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const selectedCategory = categorySelect?.value || '';
  const renderingMode = getCurrentRenderingMode();

  // Prepare entries and FLIP measurements
  const entries = Object.entries(currentData);
  const existingCards = iconsContainer.querySelectorAll('.card');
  const shouldMeasureFlip = existingCards.length > 0 && 
    existingCards.length <= FLIP_MEASURE_THRESHOLD && 
    entries.length <= FLIP_MEASURE_THRESHOLD;
  
  let oldRects = null;
  if (shouldMeasureFlip) {
    oldRects = new Map();
    existingCards.forEach(node => {
      oldRects.set(node.dataset.sfKey || '', node.getBoundingClientRect());
    });
  }

  // Build new content
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  for (const [key, svgContent] of entries) {
    // Category filter
    if (selectedCategory && !(symbolCategories[key] || []).includes(selectedCategory)) {
      continue;
    }

    // Search filter with OR/AND support
    if (query) {
      const searchText = key.toLowerCase();
      const orSegments = query.split('|').map(s => s.trim()).filter(Boolean);
      const matches = orSegments.some(segment => {
        const tokens = segment.split('&')
          .flatMap(p => p.trim().split(/\s+/))
          .filter(Boolean);
        return tokens.every(token => searchText.includes(token));
      });
      if (!matches) continue;
    }

    visibleCount++;

    const card = document.createElement('div');
    card.className = 'card';
    card.title = symbolNames?.[key] || kebabToPascalCase(key);
    card.dataset.sfKey = key;
    card.dataset.renderingMode = renderingMode;

    const viewBox = currentViewBox[key] || '0 0 24 24';
    card.innerHTML = createSvgElement(svgContent, viewBox);

    // Add info icon for restricted symbols
    if (infoSymbols.has(key)) {
      const infoIcon = document.createElement('div');
      infoIcon.className = 'card-info-icon';
      infoIcon.innerHTML = '<i class="bi bi-info-circle-fill" style="color: inherit;" aria-hidden="true"></i>';
      
      infoIcon.addEventListener('click', (ev) => {
        ev.stopPropagation();
        document.querySelectorAll('.popover').forEach(p => p.remove());
        
        const popover = new bootstrap.Popover(infoIcon, {
          content: "This symbol may not be modified and may only be used to refer to Apple's Markup feature.",
          placement: 'top',
          trigger: 'manual',
          animation: true,
          customClass: isDarkMode() ? 'popover-dark' : ''
        });
        popover.show();
        setTimeout(() => popover.hide(), 6000);
      });
      
      card.appendChild(infoIcon);
    }

    card.addEventListener('click', (ev) => {
      if (ev.target.closest('.card-info-icon')) return;

      state.selectedSymbolKey = key;
      document.querySelectorAll('.card.selected, .card.focused').forEach(node => {
        node.classList.remove('selected', 'focused');
      });
      card.classList.add('selected', 'focused');
      
      const cards = getVisibleCards();
      state.focusedIndex = cards.indexOf(card);
      renderDrawerContent();
      openDrawer();
      setTimeout(() => setFocusedCard(state.focusedIndex), 400);
    });

    fragment.appendChild(card);
  }

  // Replace content
  iconsContainer.innerHTML = '';
  iconsContainer.appendChild(fragment);
  state.focusedIndex = -1;

  // FLIP animation
  if (oldRects) {
    for (const node of iconsContainer.querySelectorAll('.card')) {
      const oldRect = oldRects.get(node.dataset.sfKey || '');
      if (oldRect) {
        const newRect = node.getBoundingClientRect();
        node.style.transform = `translate(${oldRect.left - newRect.left}px, ${oldRect.top - newRect.top}px)`;
        node.style.transition = 'transform 320ms cubic-bezier(.2,.8,.2,1)';
        requestAnimationFrame(() => { node.style.transform = ''; });
        node.addEventListener('transitionend', function cleanup() {
          node.style.transition = '';
          node.removeEventListener('transitionend', cleanup);
        });
      }
    }
  }

  visibleCountEl.textContent = visibleCount.toLocaleString();
  totalCountEl.textContent = entries.length.toLocaleString();
}

// Modal state tracking
let isAboutModalOpen = false;
let pendingUpdate = false;

export function setAboutModalOpen(isOpen) {
  isAboutModalOpen = isOpen;
  if (!isOpen && pendingUpdate) {
    pendingUpdate = false;
    requestAnimationFrame(renderSymbols);
  }
}

// Update data when rendering mode changes
export function updateData() {
  const renderingMode = getCurrentRenderingMode();
  const newData = allSymbolsData[renderingMode] || {};
  const newViewBox = allViewBoxData[renderingMode] || {};

  Object.assign(currentData, newData);
  Object.assign(currentViewBox, newViewBox);

  if (isAboutModalOpen) {
    pendingUpdate = true;
    return;
  }

  requestAnimationFrame(renderSymbols);
  renderDrawerContent();
}

globalThis.updateData = updateData;

// Render drawer content
export function renderDrawerContent() {
  const container = document.getElementById('drawer-content');
  if (!container) return;
  
  container.innerHTML = '';
  container.classList.toggle('empty', !state.selectedSymbolKey);

  if (!state.selectedSymbolKey) {
    renderEmptyDrawer(container);
    return;
  }

  renderSelectedDrawer(container);
}

function renderEmptyDrawer(container) {
  const emptyWrap = document.createElement('div');
  Object.assign(emptyWrap.style, {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'inherit'
  });

  const iconEl = document.createElement('div');
  iconEl.style.marginBottom = '0.6rem';
  const qKey = 'questionmark.app.dashed';
  if (currentData[qKey]) {
    iconEl.innerHTML = createSvgElement(currentData[qKey], currentViewBox[qKey] || '0 0 24 24', 64, 64);
  } else {
    iconEl.textContent = '?';
    iconEl.style.fontSize = '64px';
  }

  const titleEl = document.createElement('div');
  titleEl.style.marginTop = '8px';
  titleEl.style.fontWeight = '600';
  titleEl.textContent = 'No SF Symbol selected';

  emptyWrap.append(iconEl, titleEl);
  container.appendChild(emptyWrap);
}

function renderSelectedDrawer(container) {
  const key = state.selectedSymbolKey;
  const packageName = symbolNames?.[key] || kebabToPascalCase(key);
  const renderingMode = getCurrentRenderingMode();

  const contentWrap = document.createElement('div');
  contentWrap.className = 'drawer-selected';
  contentWrap.style.width = '100%';
  contentWrap.style.paddingTop = '0';

  // Left: Preview
  const leftCol = createPreviewColumn(key, renderingMode);
  
  // Middle: Info
  const infoCol = createInfoColumn(key, packageName);
  
  // Right: Code
  const codeCol = createCodeColumn(key, packageName, renderingMode);

  contentWrap.append(leftCol, infoCol, codeCol);
  container.appendChild(contentWrap);
}

function createPreviewColumn(key, renderingMode) {
  const leftCol = document.createElement('div');
  leftCol.className = 'drawer-left';
  Object.assign(leftCol.style, {
    flex: '0 0 140px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  });

  const previewBox = document.createElement('div');
  previewBox.className = 'drawer-preview-box';
  Object.assign(previewBox.style, {
    width: '180px',
    height: '180px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    boxSizing: 'border-box'
  });

  if (currentData[key]) {
    previewBox.dataset.renderingMode = renderingMode;
    const viewBox = currentViewBox[key] || '0 0 24 24';
    previewBox.innerHTML = createSvgElement(currentData[key], viewBox, '100%', '100%');
  } else {
    previewBox.textContent = 'SFSym';
    previewBox.style.fontSize = '18px';
    previewBox.style.color = 'inherit';
  }

  leftCol.appendChild(previewBox);
  return leftCol;
}

function createInfoColumn(key, packageName) {
  const infoCol = document.createElement('div');
  infoCol.className = 'drawer-info';
  Object.assign(infoCol.style, {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '0.95rem',
    justifyContent: 'center'
  });

  const createInfoRow = (label, value, copyText) => {
    const row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    });

    const left = document.createElement('div');
    const labelEl = document.createElement('div');
    labelEl.className = 'drawer-label';
    labelEl.textContent = label;
    const valueEl = document.createElement('div');
    Object.assign(valueEl.style, { fontSize: '1.3rem', fontWeight: 'bold', lineHeight: '1.2' });
    valueEl.textContent = value;
    left.append(labelEl, valueEl);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'drawer-copy-btn btn btn-sm';
    Object.assign(btn.style, { width: '36px', height: '28px' });
    btn.title = `Copy ${label} to Clipboard`;
    btn.setAttribute('aria-label', btn.title);
    btn.appendChild(createClipboardIcon());
    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      copyToClipboard(copyText, `${copyText} copied to clipboard`);
    });

    row.append(left, btn);
    return row;
  };

  infoCol.append(
    createInfoRow('Package Symbol Name', packageName, key),
    createInfoRow('Apple Symbol Name', key, key)
  );

  return infoCol;
}

function createCodeColumn(key, packageName, renderingMode) {
  const codeCol = document.createElement('div');
  codeCol.className = 'drawer-code';

  const codeContent = document.createElement('pre');
  codeContent.className = 'codebox-bg';

  const packagePath = `sf-symbols-lib/${renderingMode}`;
  const componentSpan = `<span class="syntax-component">${packageName}</span>`;

  codeContent.innerHTML = generateCodePreview(componentSpan, packageName, packagePath);

  // Copy button
  const copyButton = document.createElement('button');
  copyButton.className = 'drawer-copy-btn';
  copyButton.title = 'Copy code to clipboard';
  copyButton.setAttribute('aria-label', 'Copy code to clipboard');
  copyButton.appendChild(createClipboardIcon());
  copyButton.addEventListener('click', () => {
    const codeText = generateCodeText(packageName, packagePath);
    copyToClipboard(codeText, 'Code copied to clipboard');
  });

  codeCol.append(codeContent, copyButton);
  return codeCol;
}

function generateCodeText(packageName, packagePath) {
  return `import { ${packageName} } from '${packagePath}';

function MyComponent() {
  return (
    <div>
      {/* Basic usage */}
      <${packageName} />

      {/* With size */}
      <${packageName} size={32} />

      {/* With size preset */}
      <${packageName} size="lg" />

      {/* Color via CSS */}
      <${packageName} className="text-red-500" />

      {/* Inline style */}
      <${packageName} style={{ color: '#ff0000' }} />

      {/* With CSS variable */}
      <${packageName} style={{ color: 'var(--accent-color)' }} />

      {/* Icon button */}
      <button className="icon-button">
        <${packageName} size="sm" />
      </button>

      {/* Button with icon and text */}
      <button className="flex items-center gap-2">
        <${packageName} size="xs" />
        <span>Edit</span>
      </button>

      {/* Danger button */}
      <button className="flex items-center gap-2 text-red-500">
        <${packageName} size="xs" />
        <span>Delete</span>
      </button>
    </div>
  );
}`;
}

function generateCodePreview(componentSpan, componentName, packagePath) {
  return `
<span class="line-number">1</span>  <span class="syntax-keyword">import</span> { ${componentSpan} } <span class="syntax-keyword">from</span> <span class="syntax-string">'${packagePath}'</span>;
<span class="line-number">2</span>
<span class="line-number">3</span>  <span class="syntax-keyword">function</span> <span class="syntax-component">MyComponent</span>() {
<span class="line-number">4</span>    <span class="syntax-keyword">return</span> (
<span class="line-number">5</span>      <span class="syntax-component">&lt;div&gt;</span>
<span class="line-number">6</span>        {/* Basic usage */}
<span class="line-number">7</span>        <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">8</span>  
<span class="line-number">9</span>        {/* With size */}
<span class="line-number">10</span>       <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">size</span>={<span class="syntax-number">32</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">11</span> 
<span class="line-number">12</span>       {/* With size preset */}
<span class="line-number">13</span>       <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">size</span>=<span class="syntax-string">"lg"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">14</span> 
<span class="line-number">15</span>       {/* Color via CSS */}
<span class="line-number">16</span>       <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">className</span>=<span class="syntax-string">"text-red-500"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">17</span> 
<span class="line-number">18</span>       {/* Inline style */}
<span class="line-number">19</span>       <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">style</span>={<span class="syntax-punctuation">{{</span> <span class="syntax-property">color:</span> <span class="syntax-string">'#ff0000'</span> <span class="syntax-punctuation">}}</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">20</span> 
<span class="line-number">21</span>       {/* With CSS variable */}
<span class="line-number">22</span>       <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">style</span>={<span class="syntax-punctuation">{{</span> <span class="syntax-property">color:</span> <span class="syntax-string">'var(--accent-color)'</span> <span class="syntax-punctuation">}}</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">23</span> 
<span class="line-number">24</span>       {/* Icon button */}
<span class="line-number">25</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"icon-button"</span><span class="syntax-component">&gt;</span>
<span class="line-number">26</span>         <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">size</span>=<span class="syntax-string">"sm"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">27</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">28</span> 
<span class="line-number">29</span>       {/* Button with icon and text */}
<span class="line-number">30</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"flex items-center gap-2"</span><span class="syntax-component">&gt;</span>
<span class="line-number">31</span>         <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">size</span>=<span class="syntax-string">"xs"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">32</span>         <span class="syntax-component">&lt;span&gt;</span>Edit<span class="syntax-component">&lt;/span&gt;</span>
<span class="line-number">33</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">34</span> 
<span class="line-number">35</span>       {/* Danger button */}
<span class="line-number">36</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"flex items-center gap-2 text-red-500"</span><span class="syntax-component">&gt;</span>
<span class="line-number">37</span>         <span class="syntax-component">&lt;${componentName}</span> <span class="syntax-property">size</span>=<span class="syntax-string">"xs"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">38</span>         <span class="syntax-component">&lt;span&gt;</span>Delete<span class="syntax-component">&lt;/span&gt;</span>
<span class="line-number">39</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">40</span>     <span class="syntax-component">&lt;/div&gt;</span>
<span class="line-number">41</span>   );
<span class="line-number">42</span> }
  `;
}

export function openDrawer() {
  bottomDrawer.setAttribute('aria-hidden', 'false');
  bottomDrawer.classList.add('open');
  document.body.classList.add('drawer-open');
}

export function closeDrawer() {
  bottomDrawer.setAttribute('aria-hidden', 'true');
  bottomDrawer.classList.remove('open');
  document.body.classList.remove('drawer-open');
}
