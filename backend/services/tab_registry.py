from db.supabase_client import supabase
from datetime import datetime, timezone

def register(tab: dict) -> None:
  tab_id = tab.get("id")
  if tab_id is None:
    return
  
  supabase.table("tabs").upsert({
    "tab_id": tab_id,
    "window_id": tab.get("windowId"),
    "title": tab.get("title"),
    "url": tab.get("url"),
    "active": tab.get("active"),
    "last_accessed": datetime.now(timezone.utc).isoformat()
  }).execute()

def update(tab: dict) -> None:
  tab_id = tab.get("id")
  if tab_id is None:
    return
  
  supabase.table("tabs").upsert({
    "tab_id": tab_id,
    "window_id": tab.get("windowId"),
    "title": tab.get("title"),
    "url": tab.get("url"),
    "active": tab.get("active"),
    "last_accessed": datetime.now(timezone.utc).isoformat()
  }).execute()
  
  # Invalidate stale dom_data on navigation
  supabase.table("dom_data").delete().eq("tab_id", tab_id).execute()

def remove(tab_id: int) -> None:
  supabase.table("tabs").delete().eq("tab_id", tab_id).execute()

def gather(selected_headers: list) -> dict:
  data = {}
  # Always gather tabs if selected headers asks for it or by default
  if "tabs" in selected_headers:
    res = supabase.table("tabs").select("*").execute()
    data["tabs"] = res.data
  if "dom_data" in selected_headers:
    res = supabase.table("dom_data").select("*").execute()
    data["dom_data"] = res.data
  if "screenshots" in selected_headers:
    res = supabase.table("screenshots").select("*").execute()
    data["screenshots"] = res.data
  return data

def resync_all(current_tabs: list) -> None:
  # Wipe all rows first
  supabase.table("tabs").delete().neq("tab_id", 0).execute()
  # Batch register all tabs
  for tab in current_tabs:
    register(tab)
