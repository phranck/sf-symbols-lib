/**
 * Global application state managed by Zustand.
 *
 * Holds display settings (theme, render mode, color), search/filter state,
 * icon selection, and preview card visibility. All actions that modify state
 * live here so components remain pure renderers.
 */
import { create } from 'zustand';

import type { IconEntry } from '@/lib/icons';

// ── Types ───────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';
export type RenderMode = 'dualtone' | 'monochrome';
export type OpenDropdown = 'category' | 'color' | null;

// ── Color palette (42 colors + theme token) ─────────────────────────────

export const COLOR_PALETTE = [
  // Reds
  '#8B0000', '#FF0000', '#A52A2A', '#FF6347',
  // Oranges
  '#D2691E', '#CD853F', '#FFA500',
  // Yellows
  '#FFD700', '#FFFF00', '#F0E68C',
  // Greens
  '#006400', '#32CD32', '#00FF00', '#8FBC8F', '#90EE90', '#98FB98',
  // Cyans
  '#00CED1', '#00FFFF', '#00BFFF',
  // Blues
  '#1E90FF', '#ADD8E6', '#0000FF', '#00008B', '#B0C4DE',
  // Purples / Magentas
  '#800080', '#9932CC', '#DDA0DD', '#FF00FF', '#FF1493', '#FFC0CB',
  // Warm neutrals
  '#DEB887', '#F5DEB3', '#FFDAB9', '#BC8F8F',
  // Grays (dark to light)
  '#000000', '#2F4F4F', '#696969', '#778899', '#808080', '#C0C0C0', '#D3D3D3', '#FFFFFF',
] as const;

/** Special token: use the theme foreground color for icons */
export const THEME_COLOR = 'currentColor';

// ── Store shape ─────────────────────────────────────────────────────────

interface AppState {
  // Display
  theme: Theme;
  renderMode: RenderMode;
  iconColor: string;

  // Search & filter
  searchQuery: string;
  selectedCategory: string;

  // Selection & preview
  selectedIcon: IconEntry | null;
  previewOpen: boolean;
  focusedIndex: number;

  // Modals
  aboutModalOpen: boolean;
  copyModalOpen: boolean;

  // Dropdowns (mutually exclusive)
  openDropdown: OpenDropdown;

  // Toast
  toastMessage: string | null;

  // Actions: display
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setRenderMode: (renderMode: RenderMode) => void;
  setIconColor: (color: string) => void;

  // Actions: search & filter
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;

  // Actions: selection & preview
  setSelectedIcon: (icon: IconEntry | null) => void;
  openPreview: (icon: IconEntry) => void;
  closePreview: () => void;
  setFocusedIndex: (index: number) => void;

  // Actions: modals
  setAboutModalOpen: (open: boolean) => void;
  setCopyModalOpen: (open: boolean) => void;
  openAboutModal: () => void;
  openCopyModal: () => void;
  closeAllModals: () => void;

  // Actions: dropdowns
  setOpenDropdown: (dropdown: OpenDropdown) => void;

  // Actions: toast
  setToastMessage: (message: string | null) => void;
}

// ── Persistence helpers ─────────────────────────────────────────────────

function loadTheme(): Theme {
  const saved = localStorage.getItem('sf-theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function loadColor(): string {
  return localStorage.getItem('sf-color') ?? THEME_COLOR;
}

function loadRenderMode(): RenderMode {
  const saved = localStorage.getItem('sf-render-mode');
  if (saved === 'dualtone' || saved === 'monochrome') return saved;
  return 'dualtone';
}

// ── Store ───────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()((set) => ({
  // Initial values
  theme: loadTheme(),
  renderMode: loadRenderMode(),
  iconColor: loadColor(),
  searchQuery: '',
  selectedCategory: '',
  selectedIcon: null,
  previewOpen: false,
  focusedIndex: -1,
  aboutModalOpen: false,
  copyModalOpen: false,
  openDropdown: null,
  toastMessage: null,

  // Display
  setTheme: (theme) => {
    localStorage.setItem('sf-theme', theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('sf-theme', next);
      return { theme: next };
    }),
  setRenderMode: (renderMode) => {
    localStorage.setItem('sf-render-mode', renderMode);
    set({ renderMode });
  },
  setIconColor: (iconColor) => {
    localStorage.setItem('sf-color', iconColor);
    set({ iconColor });
  },

  // Search & filter
  setSearchQuery: (searchQuery) => set({ searchQuery, focusedIndex: -1 }),
  setSelectedCategory: (selectedCategory) =>
    set({ selectedCategory, focusedIndex: -1 }),

  // Selection & preview
  setSelectedIcon: (selectedIcon) => set({ selectedIcon }),
  openPreview: (icon) =>
    set({ selectedIcon: icon, previewOpen: true }),
  closePreview: () =>
    set({ previewOpen: false, selectedIcon: null, focusedIndex: -1 }),
  setFocusedIndex: (focusedIndex) => set({ focusedIndex }),

  // Modals
  setAboutModalOpen: (aboutModalOpen) => set({ aboutModalOpen }),
  setCopyModalOpen: (copyModalOpen) => set({ copyModalOpen }),
  openAboutModal: () => set({ aboutModalOpen: true, copyModalOpen: false }),
  openCopyModal: () => set({ copyModalOpen: true, aboutModalOpen: false }),
  closeAllModals: () => set({ aboutModalOpen: false, copyModalOpen: false }),

  // Dropdowns
  setOpenDropdown: (openDropdown) => set({ openDropdown }),

  // Toast
  setToastMessage: (toastMessage) => set({ toastMessage }),
}));
