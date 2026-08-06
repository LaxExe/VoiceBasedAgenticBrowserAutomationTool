# Architecture Notes

Flow (per the trigger-key -> decision-model diagram):
Ctrl key held -> Web Speech API records -> transcript packaged as a request object ->
POST /execute-command -> small_model.classify() checks off relevant headers in
available_data_schema.json + shortlists candidate commands -> backend gathers only that
data from tab_registry/dom_cache/screenshot_store -> decision_model.decide() reads
chromium_commands.json + the gathered data -> returns ordered Command[] -> extension's
command-dispatcher.ts executes each command via the real chrome.* APIs.

Tab lifecycle invariant: tab_registry (+ dom_data + screenshots) must always have exactly
one row per currently open tab. tab-manager.ts (extension) notifies /tab-opened,
/tab-updated, /tab-closed; cleanup_service.py deletes on close (immediately, no soft-delete)
and runs a periodic sweep as a safety net against missed close events.

Restart resync: MV3 service workers get killed/restarted by Chrome, and deletion on close
is immediate, so nothing is assumed to survive a restart. Every service-worker startup
triggers a full chrome.tabs.query() -> POST /resync-tabs -> tab_registry.resync_all(),
rebuilding tabs/dom_data/screenshots for every currently open tab from scratch.

Low-confidence fallback: if the small model returns selected_headers: [], the backend
skips data retrieval entirely and passes the decision model an empty data set — the
decision model then plans from the transcript + chromium_commands.json alone. Data is
only ever pulled when the small model explicitly selects a header; the decision model
never requests retrieval itself.

Storage: Supabase from day one (not a local placeholder first).
