// Entry point for the background service worker (MV3).
// Responsibilities:
//   - Wire up chrome.tabs.onCreated / onRemoved / onUpdated listeners -> tab-manager.ts
//   - Receive transcripts from content scripts / side panel -> forward to backend-client.ts
//   - Receive the decision model's command list back from Flask -> hand off to command-dispatcher.ts
// Deliberately thin: no business logic lives here, only wiring.
