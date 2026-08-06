import json
import re
from services.nvidia_client import get_nvidia_client
from models.prompts.small_model_prompt import SYSTEM_PROMPT

def classify(transcript: str) -> dict:
  try:
    client = get_nvidia_client()
    
    # We call Nvidia Nemotron-3 model
    completion = client.chat.completions.create(
      model="nvidia/nemotron-3-ultra-550b-a55b",
      messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Transcript to classify: \"{transcript}\""}
      ],
      temperature=0.1, # Keep temperature low for structured output classification
      top_p=0.95,
      max_tokens=1000,
      extra_body={
        "chat_template_kwargs": {"enable_thinking": False} # Disable thinking for faster classification
      }
    )
    
    content = completion.choices[0].message.content or ""
    print(f"Small model raw classification output: {content}")
    
    # Parse json block
    json_match = re.search(r"\{.*\}", content, re.DOTALL)
    if json_match:
      parsed = json.loads(json_match.group(0))
    else:
      parsed = json.loads(content)
      
    # Validate structure and enforce low_confidence_fallback if parsing fails
    if not isinstance(parsed.get("selected_headers"), list):
      parsed["selected_headers"] = []
    if not isinstance(parsed.get("candidate_command_names"), list):
      parsed["candidate_command_names"] = []
      
    return parsed
    
  except Exception as e:
    print(f"Classification failed with error: {e}")
    # Fallback path: return empty headers
    return {
      "selected_headers": [],
      "candidate_command_names": [],
      "target_tab_hint": None
    }
