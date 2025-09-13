// Minimal MV3 service worker loader for Chromium
// - Provides shims for MV2 APIs used in the codebase
// - Loads background modules except viewer (MV2 webRequest heavy)

// Ensure `window` exists to satisfy code that checks `window.background`
if (typeof window === 'undefined') {
  // eslint-disable-next-line no-global-assign
  self.window = self;
}

// Lightweight MV3 polyfills and guards
importScripts(
  'lib/mv3-polyfill.js',
  'lib/browser-polyfill.js'
);

// Core libraries used by background modules
importScripts(
  'core/common.js',
  'core/optionsAuto.js',
  'core/extension.js'
);

// Provide a no-op viewer to avoid MV2 webRequest dependency for minimal build
if (!self.viewer) {
  self.viewer = { toggleViewerListeners() {} };
}

// Load modules that do not require MV2 webRequest blocking
importScripts(
  'scrapbook/server.js',
  'capturer/background.js',
  'editor/background.js',
  'core/background.js'
);


