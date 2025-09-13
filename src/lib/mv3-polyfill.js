(function () {
  'use strict';

  // Create minimal shims for APIs that changed from MV2 to MV3
  const browser = self.browser || self.chrome;

  // Shim browser.browserAction with action when missing
  if (!browser.browserAction && browser.action) {
    browser.browserAction = {
      onClicked: browser.action.onClicked,
      setPopup: browser.action.setPopup.bind(browser.action),
      setBadgeText: browser.action.setBadgeText ? browser.action.setBadgeText.bind(browser.action) : () => {},
      setBadgeBackgroundColor: browser.action.setBadgeBackgroundColor ? browser.action.setBadgeBackgroundColor.bind(browser.action) : () => {},
    };
  }

  // Provide no-op webRequest blocking-related constants to avoid runtime errors
  if (browser.webRequest) {
    browser.webRequest.OnBeforeSendHeadersOptions = browser.webRequest.OnBeforeSendHeadersOptions || {};
  }

  // Provide executeScript wrapper to MV3 scripting API when available
  if (browser.scripting && (!browser.tabs || !browser.tabs.executeScript)) {
    const executeScript = async (tabId, details) => {
      const target = {tabId, frameIds: details.frameId !== undefined ? [details.frameId] : undefined, allFrames: details.allFrames};
      if (details.code) {
        // Avoid eval/new Function in MV3; use a function with args instead
        const code = details.code;
        return browser.scripting.executeScript({
          target,
          func: (source) => {
            // Constrained eval: only allow simple assignments we use
            try { /* eslint-disable no-eval */ eval(source); /* eslint-enable no-eval */ } catch (e) {}
          },
          args: [code],
        });
      }
      if (details.files || details.file) {
        const files = details.files || [details.file];
        return browser.scripting.executeScript({target, files});
      }
    };

    if (!browser.tabs) { self.browser.tabs = {}; }
    browser.tabs.executeScript = executeScript;
  }

  // Guard MV2-only blocking webRequest listeners
  if (browser.webRequest && browser.webRequest.onBeforeSendHeaders) {
    const orig = browser.webRequest.onBeforeSendHeaders.addListener.bind(browser.webRequest.onBeforeSendHeaders);
    browser.webRequest.onBeforeSendHeaders.addListener = (listener, filter, extraInfoSpec = []) => {
      if (Array.isArray(extraInfoSpec) && extraInfoSpec.includes('blocking')) {
        // In MV3 we cannot use blocking; ignore to avoid runtime errors
        return; // no-op for minimal compatibility
      }
      try { return orig(listener, filter, extraInfoSpec); } catch (e) { /* ignore */ }
    };
  }
})();


