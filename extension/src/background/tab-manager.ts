// Tracks tab lifecycle and keeps the backend's tab registry in sync.
// Functions:
//   onTabCreated(tab)   -> POST /tab-opened   { tabId, windowId, title, url }
//   onTabUpdated(tab)   -> POST /tab-updated  { tabId, title, url }  (invalidates cached dom_data)
//   onTabRemoved(tabId) -> POST /tab-closed   { tabId }  (triggers cleanup_service on backend)
// This is the ONLY file that should call chrome.tabs.onCreated/onRemoved/onUpdated directly.
//
// onExtensionStartup() -> chrome.tabs.query({}) -> POST /resync-tabs { tabs }
//   MV3 service workers are killed/restarted by Chrome at will, and tab-closed cleanup on
//   the backend is immediate (no soft-delete), so nothing is assumed to survive a restart.
//   Every time this worker (re)starts, do a full snapshot of currently open tabs and let
//   the backend's tab_registry.resync_all() rebuild its rows from scratch.
