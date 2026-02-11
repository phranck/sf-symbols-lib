/**
 * Lazy Icon Loader with Virtual Scrolling
 * 
 * Architecture:
 * 1. Icon metadata (names) loaded immediately (~100 KB) - enables instant search
 * 2. SVG components loaded on-demand when visible in viewport
 * 3. Virtual scrolling for efficient DOM handling
 * 
 * Handles 7,007 icons efficiently:
 * - Search: Instant (works on preloaded metadata)
 * - Rendering: Only visible icons (~40-80 at a time)
 * - Memory: Minimal (only visible DOM nodes)
 */

export class LazyIconLoader {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('icons');
    this.itemsPerRow = options.itemsPerRow || 8;
    this.bufferSize = options.bufferSize || 3; // rows before/after viewport
    this.rowHeight = options.rowHeight || 140; // px
    
    // Metadata for ALL icons (loaded immediately)
    this.allIconsMetadata = [];
    this.filteredMetadata = [];
    
    // Rendering state
    this.visibleRange = { start: 0, end: 0 };
    this.intersectionObserver = null;
    this.resizeObserver = null;
    this.scrollTimeout = null;
    
    // Loaded SVG components cache
    this.loadedComponents = new Map();
    
    this.init();
  }
  
  init() {
    // Create container structure
    this.createScrollContainer();
    
    // Setup observers
    this.setupIntersectionObserver();
    this.setupResizeObserver();
    this.setupScrollListener();
  }
  
  createScrollContainer() {
    this.container.innerHTML = `
      <div class="virtual-scroll-container">
        <div class="virtual-spacer-top"></div>
        <div class="virtual-content"></div>
        <div class="virtual-spacer-bottom"></div>
      </div>
    `;
    
    this.spacerTop = this.container.querySelector('.virtual-spacer-top');
    this.content = this.container.querySelector('.virtual-content');
    this.spacerBottom = this.container.querySelector('.virtual-spacer-bottom');
  }
  
  /**
   * Load icon metadata immediately (for instant search)
   * This is lightweight - just names, no SVG data
   */
  async loadMetadata(variant = 'hierarchical') {
    try {
      // Load the metadata file (we'll generate this)
      const response = await fetch(`data/${variant}-metadata.json`);
      if (!response.ok) {
        throw new Error(`Failed to load metadata: ${response.status}`);
      }
      
      this.allIconsMetadata = await response.json();
      this.filteredMetadata = [...this.allIconsMetadata];
      
      console.log(`✅ Loaded metadata for ${this.allIconsMetadata.length} icons`);
      
      this.totalRows = Math.ceil(this.filteredMetadata.length / this.itemsPerRow);
      this.updateSpacers();
      this.updateVisibleItems();
      
      return this.allIconsMetadata;
    } catch (error) {
      console.error('Failed to load icon metadata:', error);
      return [];
    }
  }
  
  /**
   * Set filtered icons (after search)
   */
  setFilteredIcons(icons) {
    this.filteredMetadata = icons;
    this.totalRows = Math.ceil(icons.length / this.itemsPerRow);
    this.visibleRange = { start: 0, end: 0 }; // Reset range
    this.updateSpacers();
    this.updateVisibleItems();
    
    // Scroll to top on filter change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  /**
   * Calculate which rows should be visible
   */
  calculateVisibleRange() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const viewportHeight = window.innerHeight;
    const headerHeight = 160; // Fixed header height
    
    const scrollStart = scrollTop - headerHeight;
    const scrollEnd = scrollTop + viewportHeight;
    
    const startRow = Math.max(0, Math.floor(scrollStart / this.rowHeight) - this.bufferSize);
    const endRow = Math.min(this.totalRows, Math.ceil(scrollEnd / this.rowHeight) + this.bufferSize);
    
    return { start: startRow, end: endRow };
  }
  
  /**
   * Update spacers to maintain scroll position
   */
  updateSpacers() {
    if (!this.totalRows) return;
    
    const topHeight = this.visibleRange.start * this.rowHeight;
    const bottomHeight = Math.max(0, (this.totalRows - this.visibleRange.end) * this.rowHeight);
    
    this.spacerTop.style.height = `${topHeight}px`;
    this.spacerBottom.style.height = `${bottomHeight}px`;
  }
  
  /**
   * Update visible items based on scroll position
   */
  updateVisibleItems() {
    const newRange = this.calculateVisibleRange();
    
    // Only update if range changed significantly
    if (newRange.start === this.visibleRange.start && newRange.end === this.visibleRange.end) {
      return;
    }
    
    this.visibleRange = newRange;
    this.updateSpacers();
    this.renderVisibleItems();
  }
  
  /**
   * Render only the visible icons
   */
  renderVisibleItems() {
    const startIndex = this.visibleRange.start * this.itemsPerRow;
    const endIndex = Math.min(this.filteredMetadata.length, this.visibleRange.end * this.itemsPerRow);
    const visibleIcons = this.filteredMetadata.slice(startIndex, endIndex);
    
    // Clear content
    this.content.innerHTML = '';
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'icon-grid';
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${this.itemsPerRow}, 1fr)`;
    grid.style.gap = '1rem';
    
    // Render visible icons
    visibleIcons.forEach((icon, index) => {
      const actualIndex = startIndex + index;
      const card = this.createIconCard(icon, actualIndex);
      grid.appendChild(card);
    });
    
    this.content.appendChild(grid);
    
    // Update stats
    this.updateStats(visibleIcons.length, this.filteredMetadata.length);
  }
  
  /**
   * Create an icon card element
   */
  createIconCard(icon, index) {
    const card = document.createElement('div');
    card.className = 'icon-card';
    card.dataset.index = index;
    card.dataset.iconName = icon.fileName;
    
    // Lazy load the actual icon component
    card.innerHTML = `
      <div class="icon-placeholder" data-icon="${icon.fileName}">
        <div class="loading-spinner"></div>
      </div>
      <div class="icon-name">${icon.pascalName}</div>
      <div class="icon-filename">${icon.fileName}</div>
    `;
    
    // Trigger lazy load when card enters viewport
    this.observeCard(card);
    
    return card;
  }
  
  /**
   * Observe card for lazy loading actual icon
   */
  observeCard(card) {
    if (!this.intersectionObserver) return;
    this.intersectionObserver.observe(card);
  }
  
  /**
   * Setup Intersection Observer for lazy loading icons
   */
  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadIcon(entry.target);
            this.intersectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '200px', // Load icons 200px before they enter viewport
      }
    );
  }
  
  /**
   * Load the actual icon component
   */
  async loadIcon(card) {
    const placeholder = card.querySelector('.icon-placeholder');
    if (!placeholder) return;
    
    const iconName = placeholder.dataset.icon;
    const pascalName = this.kebabToPascalCase(iconName);
    const variant = this.getVariant();
    
    try {
      // Dynamically import the icon component
      const module = await import(`../../dist/${variant}/${pascalName}.js`);
      const IconComponent = module[pascalName] || module.default;
      
      // Render the icon (as SVG string since we're in vanilla JS)
      // For now, just show a success indicator
      placeholder.innerHTML = `
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" style="color: var(--icon-color, currentColor);">
          <text x="12" y="12" text-anchor="middle" dominant-baseline="middle" font-size="8">✓</text>
        </svg>
      `;
      placeholder.classList.add('loaded');
      
    } catch (error) {
      console.error(`Failed to load icon: ${pascalName}`, error);
      placeholder.innerHTML = `
        <span style="color: red; font-size: 12px;">✗</span>
      `;
      placeholder.classList.add('error');
    }
  }
  
  /**
   * Setup resize observer to recalculate layout
   */
  setupResizeObserver() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateVisibleItems();
    });
    this.resizeObserver.observe(this.container);
  }
  
  /**
   * Setup scroll listener with debouncing
   */
  setupScrollListener() {
    window.addEventListener('scroll', () => {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.updateVisibleItems();
      }, 16); // ~60fps
    }, { passive: true });
  }
  
  /**
   * Update stats display
   */
  updateStats(visible, total) {
    const visibleEl = document.getElementById('visible-count');
    const totalEl = document.getElementById('total-count');
    
    if (visibleEl) visibleEl.textContent = visible.toLocaleString();
    if (totalEl) totalEl.textContent = total.toLocaleString();
  }
  
  /**
   * Get current variant from UI
   */
  getVariant() {
    const select = document.getElementById('variant-select');
    return select ? select.value : 'hierarchical';
  }
  
  /**
   * Convert kebab-case to PascalCase
   */
  kebabToPascalCase(kebabStr) {
    const result = kebabStr
      .split(/[-.]/)
      .filter(word => word.length > 0)
      .map(word => {
        if (/^\d+$/.test(word)) return word;
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
    return 'SF' + result;
  }
  
  /**
   * Filter icons based on search query (INSTANT - works on metadata)
   * This is fast because it only searches through metadata, not loaded SVGs
   */
  filterIcons(query) {
    if (!query || query.trim() === '') {
      this.setFilteredIcons(this.allIconsMetadata);
      return this.allIconsMetadata.length;
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/); // Support multi-word search
    
    const filtered = this.allIconsMetadata.filter(icon => {
      const searchText = `${icon.fileName} ${icon.pascalName}`.toLowerCase();
      
      // All terms must match (AND logic)
      return terms.every(term => searchText.includes(term));
    });
    
    this.setFilteredIcons(filtered);
    return filtered.length;
  }
  
  /**
   * Cleanup
   */
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    window.removeEventListener('scroll', this.scrollHandler);
  }
}
