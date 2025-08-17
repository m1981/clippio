import { vi } from 'vitest';

// Mock SvelteKit modules that cause issues in tests
vi.mock('$app/environment', () => ({
  browser: false,
  dev: true,
  building: false,
  version: 'test'
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  preloadData: vi.fn(),
  preloadCode: vi.fn(),
  onNavigate: vi.fn(),
  afterNavigate: vi.fn(),
  beforeNavigate: vi.fn()
}));

vi.mock('$app/stores', () => ({
  page: {
    subscribe: vi.fn()
  },
  navigating: {
    subscribe: vi.fn()
  },
  updated: {
    subscribe: vi.fn()
  }
}));

// Mock window APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Set window dimensions for positioning tests
Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 1024,
});

Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1280,
});