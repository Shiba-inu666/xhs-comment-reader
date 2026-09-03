"use strict";

function enableActionSidePanel() {
  try {
    const operation = chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
    if (operation && typeof operation.catch === "function") operation.catch(() => {});
  } catch (_error) {
    // The side panel page can still be opened from Chrome's side-panel menu.
  }
}

chrome.runtime.onInstalled.addListener(enableActionSidePanel);
chrome.runtime.onStartup.addListener(enableActionSidePanel);
enableActionSidePanel();

