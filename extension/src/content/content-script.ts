import { extractVisibleText, extractInteractiveElements } from './dom-extractor';
import { OverlayInjector } from './overlay-injector';

console.log("Voice extension content script injected.");

const hud = new OverlayInjector();
hud.mount();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'extract-dom') {
    try {
      const innerText = extractVisibleText();
      const interactiveElements = extractInteractiveElements();
      sendResponse({ success: true, innerText, interactiveElements });
    } catch (e: any) {
      sendResponse({ success: false, error: e.message || String(e) });
    }
    return true; // Keep channel open for async response
  }
  
  if (message.type === 'update-hud') {
    try {
      hud.update(message.status, message.detail);
      sendResponse({ success: true });
    } catch (e: any) {
      sendResponse({ success: false, error: e.message || String(e) });
    }
  }
});
