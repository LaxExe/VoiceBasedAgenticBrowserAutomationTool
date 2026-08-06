"""
The 'decision model': receives full data for ONLY the headers the small model checked
(tab list / dom_data / screenshots as applicable) plus chromium_commands.json, and returns
an ordered list of commands for the extension to execute.
Function:
  decide(transcript, pulled_data, candidate_commands) -> list[Command]
    - escalates to a vision-capable call itself if it needs to call escalate_to_vision
    - output is validated against chromium_commands.json before being returned to the route

Fallback path: pulled_data may be empty ({}) — this happens whenever small_model.py
returned selected_headers: []. In that case this model must plan using only the
transcript + the command catalog (no tab list, DOM text, or screenshots were fetched)
and pick the best command(s) it can from names/params alone. It should NOT request
data retrieval itself; retrieval only ever happens on the small model's say-so.
"""
