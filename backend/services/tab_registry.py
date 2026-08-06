"""
Source of truth for 'what tabs currently exist and what do we know about each one'.
Backed by Supabase (or a local table) with one row per open tab.
Functions:
  register(tab), update(tab), remove(tab_id), gather(selected_headers) -> dict
  resync_all(current_tabs) -> rebuilds every row from scratch (see services/cleanup_service.py) —
      called on extension/service-worker startup, since deletion on tab-close is immediate
      and nothing is assumed to survive an extension restart.
Invariant this file must enforce: row count in tab_registry == number of currently open tabs,
always. tab_sync.py routes call directly into this.
"""
