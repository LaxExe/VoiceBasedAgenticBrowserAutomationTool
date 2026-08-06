"""
POST /execute-command
Body: { transcript, tabs_snapshot }
Flow:
  1. small_model.classify(transcript, tabs_snapshot) -> selected_headers + candidate commands
  2. IF selected_headers is non-empty: pull only those headers' data from
     tab_registry / dom_cache / screenshot_store.
     IF selected_headers is empty (low-confidence fallback): skip retrieval entirely and
     pass pulled_data = {} straight through — no header was checked, so nothing is fetched.
  3. decision_model.decide(transcript, pulled_data, chromium_commands.json) -> ordered Command[]
  4. return Command[] to the extension for command-dispatcher.ts to execute
This route contains NO chrome-API knowledge — it only ever returns command names/params
defined in schemas/chromium_commands.json.
"""
from flask import Blueprint, request, jsonify

execute_command_bp = Blueprint("execute_command", __name__)

@execute_command_bp.route("/execute-command", methods=["POST"])
def execute_command():
    # transcript = request.json["transcript"]
    # tabs_snapshot = request.json["tabs_snapshot"]
    # selection = small_model.classify(...)
    # data = tab_registry.gather(selection.selected_headers)
    # plan = decision_model.decide(transcript, data, selection.candidate_command_names)
    return jsonify({"commands": []})
