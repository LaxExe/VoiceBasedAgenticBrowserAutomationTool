const openBtn = document.getElementById('openSidepanel') as HTMLButtonElement;
const audioToggle = document.getElementById('audioToggle') as HTMLInputElement;
const parallelToggle = document.getElementById('parallelToggle') as HTMLInputElement;

// Load settings from storage
chrome.storage.local.get(['audioFeedback', 'parallelMode'], (data) => {
  if (data.audioFeedback !== undefined) {
    audioToggle.checked = data.audioFeedback;
  }
  if (data.parallelMode !== undefined) {
    parallelToggle.checked = data.parallelMode;
  }
});

// Open the side panel
openBtn.addEventListener('click', async () => {
  try {
    const window = await chrome.windows.getCurrent();
    if (window.id !== undefined) {
      await chrome.sidePanel.open({ windowId: window.id });
    }
  } catch (e) {
    console.error("Failed to open side panel:", e);
  }
});

// Update audio toggle
audioToggle.addEventListener('change', () => {
  chrome.storage.local.set({ audioFeedback: audioToggle.checked });
});

// Update parallel toggle
parallelToggle.addEventListener('change', () => {
  chrome.storage.local.set({ parallelMode: parallelToggle.checked });
});
