from db.supabase_client import supabase
from datetime import datetime, timezone

def store(tab_id: int, inner_text: str, interactive_elements: list) -> None:
  supabase.table("dom_data").upsert({
    "tab_id": tab_id,
    "inner_text": inner_text,
    "interactive_elements": interactive_elements,
    "extracted_at": datetime.now(timezone.utc).isoformat()
  }).execute()

def retrieve(tab_id: int) -> dict | None:
  res = supabase.table("dom_data").select("*").eq("tab_id", tab_id).execute()
  if res.data:
    return res.data[0]
  return None
