"""
Single place responsible for deleting EVERYTHING tied to a tab_id once it closes:
  - tab_registry row
  - dom_cache row
  - screenshot_store row + the actual R2 object
Called from routes/tab_sync.py's /tab-closed handler. Also exposes a periodic sweep
(compare tab_registry against a fresh chrome.tabs.query snapshot) as a safety net in case
a /tab-closed call is ever missed (e.g. browser crash).

Resync policy: deletion on close is immediate and NOT assumed to persist across an
extension restart. MV3 service workers get killed/restarted by Chrome at will, so on
every service-worker startup (see tab_registry.resync_all) the registry is treated as
possibly stale: enumerate chrome.tabs.query() and rebuild tabs/dom_data/screenshots rows
for every currently open tab from scratch, discarding any leftover rows for tabs no
longer open. Nothing is assumed to survive a restart.
"""

def resync_on_startup(current_tabs: list) -> None:
    """Rebuild tab_registry (and clear dom_data/screenshots) from a fresh tabs snapshot.
    Called once when the service worker (re)starts / reconnects to the backend."""
    pass
