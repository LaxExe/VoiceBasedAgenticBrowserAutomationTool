"""
Central config: Anthropic API key (never sent to the client), Supabase URL/key,
Cloudflare R2 bucket credentials, cheap-model / decision-model model names.
Loaded from environment variables — never hardcoded.
"""
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env
base_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(base_dir, ".env"))


NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
SMALL_MODEL_NAME = os.environ.get("SMALL_MODEL_NAME", "nvidia/nemotron-3-ultra-550b-a55b")
DECISION_MODEL_NAME = os.environ.get("DECISION_MODEL_NAME", "nvidia/nemotron-3-ultra-550b-a55b")
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY")

