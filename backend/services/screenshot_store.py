"""
Uploads captured screenshots to Cloudflare R2 (S3-compatible), stores only the resulting
URL + timestamp in Supabase/tab_registry. Deletes the R2 object when the tab closes.
"""
