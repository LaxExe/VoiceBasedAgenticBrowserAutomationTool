import { dispatch } from './command-dispatcher';
import { initializeTabListeners, resyncAllTabs, startPeriodicSweep } from './tab-manager';

console.log("Service Worker started.");

// Initialize tab manager features
initializeTabListeners();
resyncAllTabs();
startPeriodicSweep();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'execute-commands') {
    dispatch(message.commands).then((results) => {
      sendResponse({ success: true, results });
    }).catch((err) => {
      sendResponse({ success: false, error: err.message || String(err) });
    });
    return true; // Keep response channel open for async response
  }
});

