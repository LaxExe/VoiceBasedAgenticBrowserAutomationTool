"""
Central config: Anthropic API key (never sent to the client), Supabase URL/key,
Cloudflare R2 bucket credentials, cheap-model / decision-model model names.
Loaded from environment variables — never hardcoded.
"""
import os

ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY")
SMALL_MODEL_NAME = os.environ.get("SMALL_MODEL_NAME", "claude-haiku-4-5-20251001")
DECISION_MODEL_NAME = os.environ.get("DECISION_MODEL_NAME", "claude-sonnet-5")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
CLOUDFLARE_R2_BUCKET = os.environ.get("CLOUDFLARE_R2_BUCKET")
