import "./modulepreload-polyfill.js";
const openBtn = document.getElementById("openSidepanel");
const audioToggle = document.getElementById("audioToggle");
const parallelToggle = document.getElementById("parallelToggle");
chrome.storage.local.get(["audioFeedback", "parallelMode"], (data) => {
  if (data.audioFeedback !== void 0) {
    audioToggle.checked = data.audioFeedback;
  }
  if (data.parallelMode !== void 0) {
    parallelToggle.checked = data.parallelMode;
  }
});
openBtn.addEventListener("click", async () => {
  try {
    const window = await chrome.windows.getCurrent();
    if (window.id !== void 0) {
      await chrome.sidePanel.open({ windowId: window.id });
    }
  } catch (e) {
    console.error("Failed to open side panel:", e);
  }
});
audioToggle.addEventListener("change", () => {
  chrome.storage.local.set({ audioFeedback: audioToggle.checked });
});
parallelToggle.addEventListener("change", () => {
  chrome.storage.local.set({ parallelMode: parallelToggle.checked });
});
