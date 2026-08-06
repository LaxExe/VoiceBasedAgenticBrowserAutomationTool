import json
import re
from services.nvidia_client import get_nvidia_client
from models.prompts.decision_model_prompt import get_system_prompt

def decide(transcript: str, pulled_data: dict, candidate_commands: list) -> dict:
  try:
    client = get_nvidia_client()
    system_prompt = get_system_prompt()
    
    user_content = f"""User Voice Request: "{transcript}"
Candidate Commands suggested by classifier: {candidate_commands}
Current Browser/Tab Snapshot (pulled_data): {json.dumps(pulled_data)}"""

    print("Decision model input:", user_content)

    # Call the Nvidia Nemotron-3 model with reasoning enabled
    completion = client.chat.completions.create(
      model="nvidia/nemotron-3-ultra-550b-a55b",
      messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
      ],
      temperature=1.0,
      top_p=0.95,
      max_tokens=16384,
      extra_body={
        "chat_template_kwargs": {"enable_thinking": True},
        "reasoning_budget": 16384
      }
    )
    
    content = completion.choices[0].message.content or ""
    print(f"Decision model raw output: {content}")
    
    # Parse json block
    json_match = re.search(r"\{.*\}", content, re.DOTALL)
    if json_match:
      parsed = json.loads(json_match.group(0))
    else:
      parsed = json.loads(content)
      
    if not isinstance(parsed.get("commands"), list):
      parsed = {"commands": []}
      
    return parsed
    
  except Exception as e:
    print(f"Decision planning failed with error: {e}")
    return {"commands": []}
