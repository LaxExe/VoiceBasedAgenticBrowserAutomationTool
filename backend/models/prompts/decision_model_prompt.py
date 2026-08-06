import os

def get_system_prompt() -> str:
  base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
  commands_path = os.path.join(base_dir, "schemas", "chromium_commands.json")
  
  commands_catalog = ""
  try:
    with open(commands_path, "r", encoding="utf-8") as f:
      commands_catalog = f.read()
  except Exception as e:
    commands_catalog = f"// Error loading catalog: {e}"
      
  return f"""You are the planning decision model for a voice-controlled browser extension.
Your goal is to output an ordered JSON list of commands to execute to fulfill the user's request.

Here is the catalog of available commands you can choose from:
{commands_catalog}

Rules for generation:
1. Return ONLY a JSON object with a single key "commands" containing an array of command objects.
   Example:
   {{
     "commands": [
       {{ "name": "open_tab", "params": {{ "url": "https://google.com" }} }}
     ]
   }}
2. Verify that command names match the catalog exactly.
3. Verify that the parameters provided match the param schema for each command.
4. If the user's request cannot be completed with the current command catalog, return an empty array for "commands".
5. Do not include any explanations, markdown code blocks (e.g. ```json), or formatting other than the valid raw JSON object.
"""
