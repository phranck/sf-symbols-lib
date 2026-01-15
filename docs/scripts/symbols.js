// Symbol rendering and management for SF Symbols demo
import { FLIP_MEASURE_THRESHOLD, debounce, copyToClipboard, getVisibleCards, setFocusedCard, kebabToPascalCase } from './utils.js';
import { currentData, currentViewBox, allSymbolsData, allViewBoxData, state, searchInput, variantSelect, iconsContainer, visibleCountEl, totalCountEl, infoSymbols, symbolNames } from './data.js';
import { openCopyModal } from './modals.js';
import { currentColor } from './colors.js';

let bottomDrawer;

// Elements
bottomDrawer = document.createElement('aside');
bottomDrawer.id = 'bottom-drawer';
bottomDrawer.setAttribute('aria-hidden', 'true');
bottomDrawer.innerHTML = `<div id="drawer-content" class="drawer-content"></div>`;
document.body.appendChild(bottomDrawer);
bottomDrawer.addEventListener('wheel', (e) => {
  if (!e.target.closest('.drawer-code')) {
    e.preventDefault();
  }
});

// Render symbols
export function renderSymbols() {
  const query = (searchInput.value || '').trim().toLowerCase();

  // Prepare entries and decide whether to run expensive FLIP measurements
  const entries = Object.entries(currentData);
  const totalEntries = entries.length;
  const existingCards = iconsContainer.querySelectorAll('.card');
  let oldRects = null;
  const shouldMeasureFlip = existingCards.length > 0 && existingCards.length <= FLIP_MEASURE_THRESHOLD && totalEntries <= FLIP_MEASURE_THRESHOLD;
  if (shouldMeasureFlip) {
    oldRects = new Map();
    existingCards.forEach(node => {
      const titleKey = node.dataset.sfKey || '';
      oldRects.set(titleKey, node.getBoundingClientRect());
    });
  }

  // Build new content into a DocumentFragment to minimize reflows
  const fragment = document.createDocumentFragment();
  let visibleCount = 0;

  entries.forEach(([key, svgContent]) => {
    const name = key;
    const searchText = (name + ' ' + key).toLowerCase();

    // Advanced search parsing:
    // - '|' splits OR segments: match any segment
    // - within a segment, '&' or whitespace indicates AND: all tokens must match
    if (query) {
      const orSegments = query.split('|').map(s => s.trim()).filter(Boolean);
      // If there are OR segments, a symbol matches if any segment matches
      const matchesOr = orSegments.some(segment => {
        // Split by '&' first, then by whitespace to support both 'a & b' and 'a b'
        const andParts = segment.split('&').map(p => p.trim()).filter(Boolean);
        // Expand whitespace-separated tokens inside each andPart
        const tokens = andParts.flatMap(p => p.split(/\s+/).map(t => t.trim()).filter(Boolean));
        // All tokens in this segment must be present
        return tokens.every(token => searchText.includes(token));
      });
      if (!matchesOr) return;
    }

    visibleCount++;

    const card = document.createElement('div');
    card.className = 'card';
    // Use package name for tooltip if available, otherwise Apple name
    const packageNameForCard = (symbolNames || {})[key] || kebabToPascalCase(key);
    card.title = packageNameForCard;
    card.dataset.sfKey = key;

    const vb = currentViewBox[key] || '0 0 24 24';
    // Always force fill for consistency
    const shouldForceCardFill = true;
    card.innerHTML = shouldForceCardFill
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor">${svgContent}</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${svgContent}</svg>`;

    // Add info icon for symbols that require attribution
    if (infoSymbols.has(key)) {
      const infoIcon = document.createElement('div');
      infoIcon.className = 'card-info-icon';
      infoIcon.innerHTML = '<i class="bi bi-info-circle-fill" style="color: inherit;" aria-hidden="true"></i>';
      
      // Add click handler directly to the icon
      infoIcon.addEventListener('click', (ev) => {
        ev.stopPropagation();
        
        // Close any existing popovers first
        const existingPopovers = document.querySelectorAll('.popover');
        existingPopovers.forEach(p => p.remove());
        
        // Use Bootstrap popover
        const isDark = document.body.classList.contains('dark-mode');
        const popover = new bootstrap.Popover(infoIcon, {
          content: 'This symbol may not be modified and may only be used to refer to Apple\'s Markup feature.',
          placement: 'top',
          trigger: 'manual',
          animation: true,
          html: false,
          customClass: isDark ? 'popover-dark' : ''
        });
        
        // Show the popover
        popover.show();
        
        // Auto-hide after 6 seconds
        setTimeout(() => {
          popover.hide();
        }, 6000);
      });
      
      card.appendChild(infoIcon);
    }

    card.addEventListener('click', (ev) => {
      // Don't select if clicking on info icon
      if (ev.target.closest('.card-info-icon')) return;

      // Mark selected symbol (no clipboard copy)
      state.selectedSymbolKey = key;
      // update visuals
      document.querySelectorAll('.card.selected').forEach(node => node.classList.remove('selected'));
      document.querySelectorAll('.card.focused').forEach(node => node.classList.remove('focused'));
      card.classList.add('selected');
      card.classList.add('focused');
      // Update focusedIndex for keyboard navigation
      const cards = getVisibleCards();
      state.focusedIndex = cards.indexOf(card);
      renderDrawerContent();
      // Open bottom drawer automatically when selecting a symbol
      openDrawer();
      // After drawer animation completes, ensure selected card remains visible
      setTimeout(() => {
        setFocusedCard(state.focusedIndex);
      }, 400);
    });

    fragment.appendChild(card);
  });

  // Replace nodes
  iconsContainer.innerHTML = '';
  iconsContainer.appendChild(fragment);

  // Reset keyboard focus when grid changes
  state.focusedIndex = -1;

  // After new nodes are in the DOM, run FLIP if we measured old positions
  if (oldRects) {
    const newNodes = Array.from(iconsContainer.querySelectorAll('.card'));
    newNodes.forEach(node => {
      const titleKey = node.dataset.sfKey || '';
      const newRect = node.getBoundingClientRect();
      const oldRect = oldRects.get(titleKey);
      if (oldRect) {
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;
        // Apply inverse transform
        node.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        node.style.transition = 'transform 320ms cubic-bezier(.2,.8,.2,1)';
        // Force reflow then play
        requestAnimationFrame(() => {
          node.style.transform = '';
        });
        // Cleanup after animation
        node.addEventListener('transitionend', function cleanup() {
          node.style.transition = '';
          node.removeEventListener('transitionend', cleanup);
        });
      }
    });
  }

  visibleCountEl.textContent = visibleCount.toLocaleString();
  totalCountEl.textContent = entries.length.toLocaleString();
}

// Update data when variant changes
export function updateData() {
  const variant = variantSelect.value;

  // Clear currentData and assign new data without reassigning the variable
  Object.keys(currentData).forEach(key => delete currentData[key]);
  Object.assign(currentData, allSymbolsData[variant] || {});

  // Same for currentViewBox
  Object.keys(currentViewBox).forEach(key => delete currentViewBox[key]);
  Object.assign(currentViewBox, allViewBoxData[variant] || {});

  // Defer heavy rendering to the next animation frame to keep UI responsive
  requestAnimationFrame(() => renderSymbols());
  // Re-render drawer content in case icon keys changed
  renderDrawerContent();
}

// Make updateData globally accessible for the loader
globalThis.updateData = updateData;

// Render drawer content depending on selection state.
export function renderDrawerContent() {
  const container = document.getElementById('drawer-content');
  if (!container) return;
  container.innerHTML = '';
  // mark empty state class for vertical centering when nothing selected
  container.classList.toggle('empty', !state.selectedSymbolKey);

  if (!state.selectedSymbolKey) {
    // Empty view centered
    const emptyWrap = document.createElement('div');
    emptyWrap.style.height = '100%';
    emptyWrap.style.display = 'flex';
    emptyWrap.style.flexDirection = 'column';
    emptyWrap.style.alignItems = 'center';
    emptyWrap.style.justifyContent = 'center';
    emptyWrap.style.textAlign = 'center';
    emptyWrap.style.color = 'inherit';

    // questionmark icon
    const qKey = 'questionmark.app.dashed';
    const iconEl = document.createElement('div');
    iconEl.style.marginBottom = '0.6rem';
    if (currentData[qKey]) {
      const vb = currentViewBox[qKey] || '0 0 24 24';
      iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor" width="64" height="64">${currentData[qKey]}</svg>`;
    } else {
      iconEl.textContent = '?';
      iconEl.style.fontSize = '64px';
    }

    const titleEl = document.createElement('div');
    titleEl.style.marginTop = '8px';
    titleEl.style.fontWeight = '600';
    titleEl.textContent = 'No SF Symbol selected';

    emptyWrap.appendChild(iconEl);
    emptyWrap.appendChild(titleEl);
    container.appendChild(emptyWrap);
    return;
  }

  // Selected view - horizontal layout: preview | labels | codebox
  const displayName = state.selectedSymbolKey;
  // Prefer the package export name when available; fall back to PascalConversion of the apple key.
  const packageName = (symbolNames || {})[state.selectedSymbolKey] || kebabToPascalCase(state.selectedSymbolKey);
  const contentWrap = document.createElement('div');
  contentWrap.className = 'drawer-selected';
  contentWrap.style.width = '100%';
  contentWrap.style.paddingTop = '0';

  // Left: framed preview
  const leftCol = document.createElement('div');
  leftCol.className = 'drawer-left';
  leftCol.style.flex = '0 0 140px';
  leftCol.style.display = 'flex';
  leftCol.style.flexDirection = 'column';
  leftCol.style.alignItems = 'center';
  leftCol.style.justifyContent = 'center';

  const previewBox = document.createElement('div');
  previewBox.style.width = '180px';
  previewBox.style.height = '180px';
  previewBox.style.border = '1px solid rgba(0,0,0,0.12)';
  previewBox.style.borderRadius = '8px';
  previewBox.style.display = 'flex';
  previewBox.style.alignItems = 'center';
  previewBox.style.justifyContent = 'center';
  // 40px margin around the SF Symbol inside the preview box
  previewBox.style.padding = '40px';
  previewBox.style.boxSizing = 'border-box';
  previewBox.style.background = 'transparent';

  const svgKey = state.selectedSymbolKey;
  if (currentData[svgKey]) {
    const vb = currentViewBox[svgKey] || '0 0 24 24';
    // Always force fill for consistency
    const shouldForcePreviewFill = true;
    previewBox.innerHTML = shouldForcePreviewFill
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="${currentColor}" width="100%" height="100%">${currentData[svgKey]}</svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="100%" height="100%">${currentData[svgKey]}</svg>`;
  } else {
    previewBox.textContent = 'SFSym';
    previewBox.style.fontSize = '18px';
    previewBox.style.color = 'inherit';
  }

  leftCol.appendChild(previewBox);

  // Middle: labels and values
  const infoCol = document.createElement('div');
  infoCol.className = 'drawer-info';
  infoCol.style.flex = '1 1 auto';
  infoCol.style.display = 'flex';
  infoCol.style.flexDirection = 'column';
  infoCol.style.gap = '8px';
  infoCol.style.fontSize = '0.95rem';
  // vertically center the text group relative to the preview symbol
  infoCol.style.justifyContent = 'center';

  const pkgLabel = document.createElement('div');
  pkgLabel.className = 'drawer-label';
  pkgLabel.textContent = 'Package Symbol Name';
  const pkgValue = document.createElement('div');
  // Use the package name (with SF prefix)
  pkgValue.textContent = packageName;
  pkgValue.style.fontSize = '1.3rem';
  pkgValue.style.fontWeight = 'bold';
  pkgValue.style.lineHeight = '1.2';

  const appleLabel = document.createElement('div');
  appleLabel.className = 'drawer-label';
  appleLabel.textContent = 'Apple Symbol Name';
  const appleValue = document.createElement('div');
  appleValue.textContent = state.selectedSymbolKey;
  appleValue.style.fontSize = '1.3rem';
  appleValue.style.fontWeight = 'bold';
  appleValue.style.lineHeight = '1.2';

  // Build rows with copy buttons for package and apple names
  function makeCopyButton(copyText, titleText, toastText) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'drawer-copy-btn btn btn-sm';
    btn.style.width = '36px';
    btn.style.height = '28px';
    btn.title = titleText;
    btn.setAttribute('aria-label', titleText);

    // Try to render the SF Symbol 'document.on.clipboard.fill' from the loaded data if available,
    // otherwise fall back to a Bootstrap icon.
    const sfKey = 'document.on.clipboard.fill';
    if (currentData && currentData[sfKey]) {
      const vb = currentViewBox[sfKey] || '0 0 24 24';
      const svgSpan = document.createElement('span');
      svgSpan.style.display = 'inline-flex';
      svgSpan.style.width = '18px';
      svgSpan.style.height = '18px';
      svgSpan.innerHTML = `<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${vb}\" fill=\"currentColor\" width=\"18\" height=\"18\">${currentData[sfKey]}</svg>`;
      btn.appendChild(svgSpan);
    } else {
      btn.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true" style="font-size:16px; line-height:1;"></i>';
    }

    btn.addEventListener('click', (ev) => {
      ev.stopPropagation();
      copyToClipboard(copyText, toastText || (copyText + ' copied to clipboard'));
    });

    return btn;
  }

  // Package row
  const pkgRow = document.createElement('div');
  pkgRow.style.display = 'flex';
  pkgRow.style.alignItems = 'center';
  pkgRow.style.justifyContent = 'space-between';

  const pkgLeft = document.createElement('div');
  pkgLeft.appendChild(pkgLabel);
  pkgLeft.appendChild(pkgValue);

  const pkgCopyBtn = makeCopyButton(displayName, 'Copy Package Symbol Name to Clipboard');
  pkgRow.appendChild(pkgLeft);
  pkgRow.appendChild(pkgCopyBtn);

  // Apple row
  const appleRow = document.createElement('div');
  appleRow.style.display = 'flex';
  appleRow.style.alignItems = 'center';
  appleRow.style.justifyContent = 'space-between';

  const appleLeft = document.createElement('div');
  appleLeft.appendChild(appleLabel);
  appleLeft.appendChild(appleValue);

  const appleCopyBtn = makeCopyButton(state.selectedSymbolKey, 'Copy Apple Symbol Name to Clipboard');
  appleRow.appendChild(appleLeft);
  appleRow.appendChild(appleCopyBtn);

  infoCol.appendChild(pkgRow);
  infoCol.appendChild(appleRow);

  // Right: code box with React component usage
  const codeCol = document.createElement('div');
  codeCol.className = 'drawer-code';
  const codeContent = document.createElement('pre');
  codeContent.className = 'codebox-bg';
  
  // Add copy button
  const copyButton = document.createElement('button');
  copyButton.className = 'drawer-copy-btn';
  copyButton.title = 'Copy code to clipboard';
  copyButton.setAttribute('aria-label', 'Copy code to clipboard');
  
  // Try to render the SF Symbol 'document.on.clipboard.fill' from the loaded data if available,
  // otherwise fall back to a Bootstrap icon.
  const sfKey = 'document.on.clipboard.fill';
  if (currentData && currentData[sfKey]) {
    const vb = currentViewBox[sfKey] || '0 0 24 24';
    const svgSpan = document.createElement('span');
    svgSpan.style.display = 'inline-flex';
    svgSpan.style.width = '18px';
    svgSpan.style.height = '18px';
    svgSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="currentColor" width="18" height="18">${currentData[sfKey]}</svg>`;
    copyButton.appendChild(svgSpan);
  } else {
    copyButton.innerHTML = '<i class="bi bi-clipboard" aria-hidden="true" style="font-size:16px; line-height:1;"></i>';
  }
  
  copyButton.addEventListener('click', () => {
    // Prefer package export name; fallback to Apple symbol string when not a valid identifier
    const _package = packageName;
    const _isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(_package);
    const _currentVariant = (variantSelect && variantSelect.value) ? variantSelect.value : 'hierarchical';
    const _packagePath = `sf-symbols-lib/${_currentVariant}`;
    const importLine = _isValidIdentifier ? `import { SFSymbol, ${_package} } from '${_packagePath}';` : `import { SFSymbol } from '${_packagePath}';`;
    const nameInline = _isValidIdentifier ? `{${_package}}` : `"${state.selectedSymbolKey}"`;

    const codeText = `${importLine}\n\nfunction MyComponent() {
  return (
    <div>
      {/* Basic usage */}
      <SFSymbol name=${nameInline} />

      {/* With size */}
      <SFSymbol name=${nameInline} size={32} />

      {/* With size preset */}
      <SFSymbol name=${nameInline} size="lg" />

      {/* Color via CSS */}
      <SFSymbol name=${nameInline} className="text-red-500" />

      {/* Inline style */}
      <SFSymbol name=${nameInline} style={{ color: '#ff0000' }} />

      {/* With CSS variable */}
      <SFSymbol name=${nameInline} style={{ color: 'var(--accent-color)' }} />

      {/* Icon button */}
      <button className="icon-button">
        <SFSymbol name=${nameInline} size={20} />
      </button>

      {/* Button with icon and text */}
      <button className="flex items-center gap-2">
        <SFSymbol name=${nameInline} size={16} />
        <span>Edit</span>
      </button>

      {/* Danger button */}
      <button className="flex items-center gap-2 text-red-500">
        <SFSymbol name=${nameInline} size={16} />
        <span>Delete</span>
      </button>
    </div>
  );
}`;
    copyToClipboard(codeText, 'Code copied to clipboard');
  });

  const _isValidIdentifier = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(packageName);
  const _importSpan = _isValidIdentifier ? `<span class="syntax-component">SFSymbol</span>, <span class="syntax-component">${packageName}</span>` : `<span class="syntax-component">SFSymbol</span>`;
  const _nameSpan = _isValidIdentifier ? `<span class="syntax-punctuation">{</span><span class="syntax-component">${packageName}</span><span class="syntax-punctuation">}</span>` : `<span class="syntax-string">"${state.selectedSymbolKey}"</span>`;

  const _displayVariant = (variantSelect && variantSelect.value) ? variantSelect.value : 'hierarchical';
  const _displayPackagePath = `sf-symbols-lib/${_displayVariant}`;
  codeContent.innerHTML = `
<span class="line-number">1</span>  <span class="syntax-keyword">import</span> { ${_importSpan} } <span class="syntax-keyword">from</span> <span class="syntax-string">'${_displayPackagePath}'</span>;
<span class="line-number">2</span>
<span class="line-number">3</span>  <span class="syntax-keyword">function</span> <span class="syntax-component">MyComponent</span>() {
<span class="line-number">4</span>    <span class="syntax-keyword">return</span> (
<span class="line-number">5</span>      <span class="syntax-component">&lt;div&gt;</span>
<span class="line-number">6</span>        {/* Basic usage */}
<span class="line-number">7</span>        <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-component">/&gt;</span>
<span class="line-number">8</span>  
<span class="line-number">9</span>        {/* With size */}
<span class="line-number">10</span>       <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">size</span>={<span class="syntax-number">32</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">11</span> 
<span class="line-number">12</span>       {/* With size preset */}
<span class="line-number">13</span>       <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">size</span>=<span class="syntax-string">"lg"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">14</span> 
<span class="line-number">15</span>       {/* Color via CSS */}
<span class="line-number">16</span>       <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">className</span>=<span class="syntax-string">"text-red-500"</span> <span class="syntax-component">/&gt;</span>
<span class="line-number">17</span> 
<span class="line-number">18</span>       {/* Inline style */}
<span class="line-number">19</span>       <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">style</span>={<span class="syntax-punctuation">{{</span> <span class="syntax-property">color:</span> <span class="syntax-string">'#ff0000'</span> <span class="syntax-punctuation">}}</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">20</span> 
<span class="line-number">21</span>       {/* With CSS variable */}
<span class="line-number">22</span>       <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">style</span>={<span class="syntax-punctuation">{{</span> <span class="syntax-property">color:</span> <span class="syntax-string">'var(--accent-color)'</span> <span class="syntax-punctuation">}}</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">23</span> 
<span class="line-number">24</span>       {/* Icon button */}
<span class="line-number">25</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"icon-button"</span><span class="syntax-component">&gt;</span>
<span class="line-number">26</span>         <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">size</span>={<span class="syntax-number">20</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">27</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">28</span> 
<span class="line-number">29</span>       {/* Button with icon and text */}
<span class="line-number">30</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"flex items-center gap-2"</span><span class="syntax-component">&gt;</span>
<span class="line-number">31</span>         <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">size</span>={<span class="syntax-number">16</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">32</span>         <span class="syntax-component">&lt;span&gt;</span>Edit<span class="syntax-component">&lt;/span&gt;</span>
<span class="line-number">33</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">34</span> 
<span class="line-number">35</span>       {/* Danger button */}
<span class="line-number">36</span>       <span class="syntax-component">&lt;button</span> <span class="syntax-property">className</span>=<span class="syntax-string">"flex items-center gap-2 text-red-500"</span><span class="syntax-component">&gt;</span>
<span class="line-number">37</span>         <span class="syntax-component">&lt;SFSymbol</span> <span class="syntax-property">name</span>=${_nameSpan} <span class="syntax-property">size</span>={<span class="syntax-number">16</span>} <span class="syntax-component">/&gt;</span>
<span class="line-number">38</span>         <span class="syntax-component">&lt;span&gt;</span>Delete<span class="syntax-component">&lt;/span&gt;</span>
<span class="line-number">39</span>       <span class="syntax-component">&lt;/button&gt;</span>
<span class="line-number">40</span>     <span class="syntax-component">&lt;/div&gt;</span>
<span class="line-number">41</span>   );
<span class="line-number">42</span> }
  `;
  
  codeContent.appendChild(copyButton);
  codeCol.appendChild(codeContent);
  codeCol.appendChild(copyButton);

  contentWrap.appendChild(leftCol);
  contentWrap.appendChild(infoCol);
  contentWrap.appendChild(codeCol);
  container.appendChild(contentWrap);
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