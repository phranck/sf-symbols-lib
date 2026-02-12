/**
 * Global application state managed by Zustand.
 *
 * Holds display settings (theme, render mode, color), search/filter state,
 * icon selection, and drawer visibility. All actions that modify state
 * live here so components remain pure renderers.
 */
import { create } from 'zustand';

import type { IconEntry } from '@/lib/icons';

// ── Types ───────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark';
export type RenderMode = 'dualtone' | 'monochrome';

// ── Color palette (42 colors + theme token) ─────────────────────────────

export const COLOR_PALETTE = [
  '#000000', '#00008B', '#0000FF', '#006400', '#00BFFF', '#00CED1',
  '#00FF00', '#00FFFF', '#1E90FF', '#2F4F4F', '#32CD32', '#696969',
  '#778899', '#800080', '#808080', '#8B0000', '#8FBC8F', '#90EE90',
  '#98FB98', '#9932CC', '#A52A2A', '#ADD8E6', '#B0C4DE', '#BC8F8F',
  '#C0C0C0', '#CD853F', '#D2691E', '#D3D3D3', '#DDA0DD', '#DEB887',
  '#F0E68C', '#F5DEB3', '#FF0000', '#FF00FF', '#FF1493', '#FF6347',
  '#FFA500', '#FFC0CB', '#FFD700', '#FFDAB9', '#FFFF00', '#FFFFFF',
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

  // Selection & drawer
  selectedIcon: IconEntry | null;
  drawerOpen: boolean;
  focusedIndex: number;

  // Modals
  aboutModalOpen: boolean;
  copyModalOpen: boolean;

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

  // Actions: selection & drawer
  setSelectedIcon: (icon: IconEntry | null) => void;
  openDrawer: (icon: IconEntry) => void;
  closeDrawer: () => void;
  setFocusedIndex: (index: number) => void;

  // Actions: modals
  setAboutModalOpen: (open: boolean) => void;
  setCopyModalOpen: (open: boolean) => void;

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
  drawerOpen: false,
  focusedIndex: -1,
  aboutModalOpen: false,
  copyModalOpen: false,
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

  // Selection & drawer
  setSelectedIcon: (selectedIcon) => set({ selectedIcon }),
  openDrawer: (icon) =>
    set({ selectedIcon: icon, drawerOpen: true }),
  closeDrawer: () =>
    set({ drawerOpen: false, selectedIcon: null, focusedIndex: -1 }),
  setFocusedIndex: (focusedIndex) => set({ focusedIndex }),

  // Modals
  setAboutModalOpen: (aboutModalOpen) => set({ aboutModalOpen }),
  setCopyModalOpen: (copyModalOpen) => set({ copyModalOpen }),

  // Toast
  setToastMessage: (toastMessage) => set({ toastMessage }),
}));
