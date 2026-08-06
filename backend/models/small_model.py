"""
The 'nano/small model' from the architecture: a cheap, fast, text-only Claude call
whose ONLY job is classification, never execution.
Function:
  classify(transcript: str, tabs_snapshot: list) -> SmallModelOutput
    - matches available_data_schema.json's small_model_output_contract exactly:
      { selected_headers: [...], candidate_command_names: [...], target_tab_hint }
    - forced into strict JSON via tool-use / response schema (see prompts/small_model_prompt.py)

Low-confidence fallback: if the model isn't confident enough to pick a header or a
candidate command, it returns selected_headers: [] rather than guessing. An empty
selected_headers list is the explicit signal (see available_data_schema.json) telling
the route to skip all data retrieval and hand the raw request straight to the decision
model — data is ONLY ever pulled when a header is actually selected here.
"""
