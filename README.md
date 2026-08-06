# Voice Browser Extension

Hands-free Chrome control via voice, routed through two Claude calls (small/nano model
for classification, decision model for command planning) instead of hardcoded regex rules.

- `extension/` — Manifest V3 Chrome extension (TypeScript)
- `backend/` — Flask backend: routes, the two model wrappers, tab/DOM/screenshot storage, cleanup
- `docs/` — architecture notes

See `backend/schemas/chromium_commands.json` for the full command catalog and
`backend/schemas/available_data_schema.json` for the data-header contract between the
small model and the decision model.
