// Modal management for SF Symbols demo
import { copyToClipboard } from './utils.js';
import { state } from './data.js';
import { setAboutModalOpen } from './symbols.js';

// About modal: create DOM once and control via show/hide
const aboutButton = document.getElementById('about-button');
const aboutModalOverlay = document.createElement('div');
aboutModalOverlay.className = 'modal-overlay';
aboutModalOverlay.id = 'about-modal';
aboutModalOverlay.setAttribute('role', 'dialog');
aboutModalOverlay.setAttribute('aria-modal', 'true');
aboutModalOverlay.setAttribute('aria-hidden', 'true');

const aboutModal = document.createElement('div');
aboutModal.className = 'about-modal';

const aboutTitle = document.createElement('h2');
aboutTitle.textContent = 'SF Symbols Library';

const aboutContent = document.createElement('div');
aboutContent.className = 'about-content';
aboutContent.innerHTML = `
  <div class="about-inner">
    <div class="about-body">
      <div class="about-tabs">
        <div class="about-tabs-header" role="tablist">
          <button class="tab-btn active" data-tab="about" role="tab" aria-selected="true">About</button>
          <button class="tab-btn" data-tab="search" role="tab" aria-selected="false">Search</button>
          <button class="tab-btn" data-tab="shortcuts" role="tab" aria-selected="false">Shortcuts</button>
        </div>

        <div class="about-tabs-body">
          <div class="tab-pane" data-pane="about">
            <!-- ABOUT_CONTENT -->
          </div>

          <div class="tab-pane" data-pane="search" hidden>
            <!-- SEARCH_CONTENT -->
          </div>

          <div class="tab-pane" data-pane="shortcuts" hidden>
            <!-- SHORTCUTS_CONTENT -->
          </div>
        </div>
      </div>
    </div>
  </div>
`;
// default active tab class for styling
aboutContent.classList.add('active-tab-about');

const okButton = document.createElement('button');
okButton.className = 'theme-toggle';
okButton.type = 'button';
okButton.textContent = 'OK';
okButton.addEventListener('click', () => closeAboutModal());

// Header / Content / Footer structure
const aboutHeader = document.createElement('div');
aboutHeader.className = 'about-modal-header';
aboutHeader.appendChild(aboutTitle);

const aboutFooter = document.createElement('div');
aboutFooter.className = 'about-modal-footer';
aboutFooter.style.display = 'flex';
aboutFooter.style.justifyContent = 'center';
aboutFooter.style.paddingTop = '12px';
aboutFooter.appendChild(okButton);

aboutModal.appendChild(aboutHeader);
aboutModal.appendChild(aboutContent);
aboutModal.appendChild(aboutFooter);

aboutModalOverlay.appendChild(aboutModal);
document.body.appendChild(aboutModalOverlay);

function setActiveTab(tabName) {
  const headerButtons = aboutContent.querySelectorAll('.tab-btn');
  const panes = aboutContent.querySelectorAll('.tab-pane');

  // IMPORTANT: Capture current height BEFORE changing content
  const startHeight = aboutModal.offsetHeight;

  // Now switch the tab content
  headerButtons.forEach((btn) => {
    const isActive = btn.dataset.tab === tabName;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', String(isActive));
  });
  panes.forEach((pane) => {
    pane.hidden = pane.dataset.pane !== tabName;
  });

  // Sync a class on the container so CSS can style the tab pane to match the active tab
  aboutContent.classList.remove('active-tab-about', 'active-tab-search', 'active-tab-shortcuts');
  aboutContent.classList.add('active-tab-' + tabName);

  // If switching to shortcuts, ensure they are processed into keycaps
  if (tabName === 'shortcuts') processShortcuts();

  // Animate modal height when content changes while modal is visible
  animateAboutModalHeight(startHeight);
}

/**
 * Animate the `aboutModal` height from startHeight to the new content height.
 * Works only when modal is visible (class `show` on overlay).
 * @param {number} startHeight - The height before content changed
 */
function animateAboutModalHeight(startHeight) {
  if (!aboutModal || !aboutModalOverlay.classList.contains('show')) {
    return;
  }

  // Skip animation if this is the initial open (startHeight would be very small or zero)
  if (startHeight < 50) {
    return;
  }

  // Remove any previous transition
  aboutModal.style.transition = 'none';

  // Measure natural height (content has already changed)
  aboutModal.style.height = 'auto';
  const newHeight = aboutModal.offsetHeight;

  // If heights are equal, no animation needed
  if (Math.abs(newHeight - startHeight) < 1) {
    return;
  }

  // Set to start height (before content changed)
  aboutModal.style.height = startHeight + 'px';

  // Force browser to apply the height
  // eslint-disable-next-line no-unused-expressions
  aboutModal.offsetHeight;

  // Now enable the transition and animate to new height
  aboutModal.style.transition = 'height 350ms cubic-bezier(0.2, 0.9, 0.2, 1)';
  aboutModal.style.height = newHeight + 'px';

  // Clean up after animation completes
  const handleTransitionEnd = () => {
    aboutModal.style.height = 'auto';
    aboutModal.style.transition = 'none';
    aboutModal.removeEventListener('transitionend', handleTransitionEnd);
  };

  aboutModal.addEventListener('transitionend', handleTransitionEnd, { once: true });
}

// Process rendered shortcuts HTML: convert inline <code> elements into styled key badges
function processShortcuts() {
  const pane = aboutContent.querySelector('[data-pane="shortcuts"]');
  if (!pane) return;

  const paragraphs = Array.from(pane.querySelectorAll('p'));
  paragraphs.forEach((p) => {
    // Normalize inline backticks to <code>
    if (p.innerHTML && p.innerHTML.indexOf('`') !== -1) {
      p.innerHTML = p.innerHTML.replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    const nodes = Array.from(p.childNodes);
    const rows = [];

    for (let idx = 0; idx < nodes.length; idx++) {
      const node = nodes[idx];
      if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'CODE') {
        const codeText = node.textContent.trim();

        // Gather description nodes following this <code> until next <code>
        const descParts = [];
        let j = idx + 1;
        while (j < nodes.length && !(nodes[j].nodeType === Node.ELEMENT_NODE && nodes[j].tagName === 'CODE')) {
          const followNode = nodes[j];
          if (followNode.nodeType === Node.TEXT_NODE) {
            const cleaned = followNode.textContent.replace(/\s+/g, ' ').trim();
            if (cleaned) descParts.push(cleaned);
          } else if (followNode.nodeType === Node.ELEMENT_NODE) {
            const cleaned = followNode.textContent.replace(/\s+/g, ' ').trim();
            if (cleaned) descParts.push(cleaned);
          }
          j++;
        }

        const descText = descParts.join(' ').trim();

        // Build row element
        const row = document.createElement('div');
        row.className = 'shortcut-row';

        const left = document.createElement('div');
        left.className = 'shortcut-desc';
        left.textContent = descText;

        const kbdGroup = document.createElement('div');
        kbdGroup.className = 'kbd-group';

        const parts = codeText.split(/\s*\+\s*|\s+/).filter(Boolean);
        parts.forEach((part) => {
          const keySpan = document.createElement('span');
          keySpan.className = 'kbd-key';
          keySpan.innerHTML = mapKeyToSymbol(part);
          kbdGroup.appendChild(keySpan);
        });

        // Keycaps column on the left, description on the right
        row.appendChild(kbdGroup);
        row.appendChild(left);
        rows.push(row);

        // advance idx to the last consumed node
        idx = j - 1;
      }
    }

    if (rows.length > 0) {
      p.innerHTML = '';
      rows.forEach((r) => p.appendChild(r));
    }
  });
}

/**
 * Map a key token to a visual symbol or normalized label.
 * Accepts tokens like 'ArrowUp', 'Arrow Up', 'Enter', 'Esc', 'Cmd', '⌘', 'Shift', 'Ctrl', 'Alt', 'F5', letters, etc.
 */
function mapKeyToSymbol(token) {
  const t = token.replace(/[^\w\d]/g, '').toLowerCase();
  switch (t) {
    case 'arrowup':
    case 'uparrow':
    case 'up':
      return '↑';
    case 'arrowdown':
    case 'downarrow':
    case 'down':
      return '↓';
    case 'arrowleft':
    case 'leftarrow':
    case 'left':
      return '←';
    case 'arrowright':
    case 'rightarrow':
    case 'right':
      return '→';
    case 'enter':
    case 'return':
      return '⏎';
    case 'esc':
    case 'escape':
      return '⎋';
    case 'shift':
      return '⇧';
    case 'ctrl':
    case 'control':
    case '⌃':
      return '⌃';
    case 'alt':
    case 'option':
    case 'opt':
      return '⌥';
    case 'cmd':
    case 'command':
    case 'meta':
    case '⌘':
      return '⌘';
    default:
      // F-keys and single characters keep their label (uppercase)
      if (/^f\d+$/i.test(token)) return token.toUpperCase();
      if (/^[a-z0-9]$/i.test(token)) return token.toUpperCase();
      // Otherwise return trimmed token as-is (escaped)
      return escapeHtml(token);
  }
}

function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function openAboutModal(activeTab = 'about') {
  // Pause background grid updates to prevent jank during modal animations
  setAboutModalOpen(true);

  // Show overlay first so height animations can measure visible dimensions
  aboutModalOverlay.classList.add('show');
  aboutModalOverlay.setAttribute('aria-hidden', 'false');

  // Defer setActiveTab to next frame so it doesn't block the initial CSS transition
  requestAnimationFrame(() => {
    setActiveTab(activeTab);
    // Focus OK button after tab is set
    setTimeout(() => okButton.focus(), 60);
  });
}

export function closeAboutModal() {
  aboutModalOverlay.classList.remove('show');
  aboutModalOverlay.setAttribute('aria-hidden', 'true');

  // Resume background grid updates (will process pending updates if any)
  setAboutModalOpen(false);

  if (aboutButton) aboutButton.focus();
}

if (aboutButton) {
  aboutButton.addEventListener('click', (ev) => {
    ev.stopPropagation();
    openAboutModal('about');
  });

  // Allow tab clicks
  aboutContent.addEventListener('click', (ev) => {
    const button = ev.target.closest('.tab-btn');
    if (!button) return;
    const tab = button.dataset.tab;
    setActiveTab(tab);
  });
}

// Close modal on overlay click outside content
aboutModalOverlay.addEventListener('click', (ev) => {
  if (ev.target === aboutModalOverlay) closeAboutModal();
});

// Close modal on Escape
document.addEventListener('keydown', (event) => {
  if ((event.key === 'Escape' || event.key === 'Esc') && aboutModalOverlay.classList.contains('show')) {
    closeAboutModal();
  }
});

// Copy modal: create DOM once and control via show/hide
const copyModalOverlay = document.createElement('div');
copyModalOverlay.className = 'modal-overlay';
copyModalOverlay.id = 'copy-modal';
copyModalOverlay.setAttribute('role', 'dialog');
copyModalOverlay.setAttribute('aria-modal', 'true');
copyModalOverlay.setAttribute('aria-hidden', 'true');

const copyModal = document.createElement('div');
copyModal.className = 'copy-modal';

const copyTitle = document.createElement('h3');
copyTitle.textContent = 'Copy to Clipboard';

const copyOptionsContainer = document.createElement('div');
copyOptionsContainer.className = 'copy-options';

copyModal.appendChild(copyTitle);
copyModal.appendChild(copyOptionsContainer);
copyModalOverlay.appendChild(copyModal);
document.body.appendChild(copyModalOverlay);

let copyModalFocusedIndex = 0;
let copyOptions = [];

export function openCopyModal() {
  if (!state.selectedSymbolKey) return;

  const displayName = (globalThis.symbolNames || {})[state.selectedSymbolKey] || state.selectedSymbolKey;

  // Clear and rebuild options
  copyOptionsContainer.innerHTML = '';
  copyOptions = [];

  // Package Symbol Name option
  const packageOption = document.createElement('div');
  packageOption.className = 'copy-option';
  packageOption.innerHTML = `
    <span class="copy-option-label">Package Symbol Name</span>
    <span class="copy-option-value">${displayName}</span>
  `;
  packageOption.dataset.copyValue = displayName;
  packageOption.addEventListener('click', () => copyAndClose(displayName));
  copyOptionsContainer.appendChild(packageOption);
  copyOptions.push(packageOption);

  // Apple Symbol Name option
  const appleOption = document.createElement('div');
  appleOption.className = 'copy-option';
  appleOption.innerHTML = `
    <span class="copy-option-label">Apple Symbol Name</span>
    <span class="copy-option-value">${state.selectedSymbolKey}</span>
  `;
  appleOption.dataset.copyValue = state.selectedSymbolKey;
  appleOption.addEventListener('click', () => copyAndClose(state.selectedSymbolKey));
  copyOptionsContainer.appendChild(appleOption);
  copyOptions.push(appleOption);

  // React Component option
  const reactOption = document.createElement('div');
  reactOption.className = 'copy-option';
  reactOption.innerHTML = `
    <span class="copy-option-label">React Component</span>
    <span class="copy-option-value">&lt;SFSymbol name={${displayName}} size={32} /&gt;</span>
  `;
  reactOption.dataset.copyValue = `<SFSymbol name={${displayName}} size={32} />`;
  reactOption.addEventListener('click', () => copyAndClose(`<SFSymbol name={${displayName}} size={32} />`));
  copyOptionsContainer.appendChild(reactOption);
  copyOptions.push(reactOption);

  // Reset focus to first option
  copyModalFocusedIndex = 0;
  updateCopyModalFocus();

  copyModalOverlay.classList.add('show');
  copyModalOverlay.setAttribute('aria-hidden', 'false');
}

export function closeCopyModal() {
  copyModalOverlay.classList.remove('show');
  copyModalOverlay.setAttribute('aria-hidden', 'true');
}

function updateCopyModalFocus() {
  copyOptions.forEach((option, index) => {
    option.classList.toggle('focused', index === copyModalFocusedIndex);
  });
}

function copyAndClose(text) {
  copyToClipboard(text);
  closeCopyModal();
}

// Close copy modal on overlay click outside content
copyModalOverlay.addEventListener('click', (event) => {
  if (event.target === copyModalOverlay) closeCopyModal();
});

// Copy modal keyboard navigation
document.addEventListener('keydown', (event) => {
  if (!copyModalOverlay.classList.contains('show')) return;

  switch (event.key) {
    case 'Escape':
    case 'Esc':
      event.preventDefault();
      closeCopyModal();
      break;

    case 'ArrowDown':
      event.preventDefault();
      copyModalFocusedIndex = (copyModalFocusedIndex + 1) % copyOptions.length;
      updateCopyModalFocus();
      break;

    case 'ArrowUp':
      event.preventDefault();
      copyModalFocusedIndex = (copyModalFocusedIndex - 1 + copyOptions.length) % copyOptions.length;
      updateCopyModalFocus();
      break;

    case 'Enter':
      event.preventDefault();
      if (copyOptions[copyModalFocusedIndex]) {
        const text = copyOptions[copyModalFocusedIndex].dataset.copyValue;
        copyAndClose(text);
      }
      break;
  }
});

// Search help: open About modal with Search tab
const searchHelpButton = document.getElementById('search-help-button');
if (searchHelpButton) {
  searchHelpButton.addEventListener('click', (ev) => {
    ev.stopPropagation();
    openAboutModal('search');
  });
}