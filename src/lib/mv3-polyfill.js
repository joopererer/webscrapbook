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
        return browser.scripting.executeScript({target, func: new Function(details.code)});
      }
      if (details.files || details.file) {
        const files = details.files || [details.file];
        return browser.scripting.executeScript({target, files});
      }
    };

    if (!browser.tabs) { self.browser.tabs = {}; }
    browser.tabs.executeScript = executeScript;
  }
})();


