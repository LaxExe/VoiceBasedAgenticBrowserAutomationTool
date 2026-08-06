from db.supabase_client import supabase
import services.tab_registry as tab_registry

def purge(tab_id: int) -> None:
  """Delete all data tied to that tab immediately.
  With SQL cascade constraints in schema.sql, deleting the tab from 'tabs'
  automatically removes related rows from 'dom_data' and 'screenshots'."""
  tab_registry.remove(tab_id)

def resync_on_startup(current_tabs: list) -> None:
  """Rebuild tab_registry from a fresh tabs snapshot."""
  tab_registry.resync_all(current_tabs)

def sweep(active_tab_ids: list[int]) -> None:
  """Compare Supabase rows against the fresh active tab IDs list and delete stale rows."""
  try:
    res = supabase.table("tabs").select("tab_id").execute()
    db_tab_ids = [row["tab_id"] for row in res.data]
    stale_ids = [tid for tid in db_tab_ids if tid not in active_tab_ids]
    for stale_id in stale_ids:
      print(f"Sweeper purging stale tab ID: {stale_id}")
      purge(stale_id)
  except Exception as e:
    print(f"Error in cleanup sweeper: {e}")
