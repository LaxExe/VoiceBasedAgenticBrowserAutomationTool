from openai import OpenAI
from config import NVIDIA_API_KEY

def get_nvidia_client() -> OpenAI:
  if not NVIDIA_API_KEY:
    raise ValueError("NVIDIA_API_KEY is not configured in .env")
  
  return OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=NVIDIA_API_KEY
  )
