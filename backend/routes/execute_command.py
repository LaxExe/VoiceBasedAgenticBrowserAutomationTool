from flask import Blueprint, request, jsonify
import models.small_model as small_model
import models.decision_model as decision_model
import services.tab_registry as tab_registry

execute_command_bp = Blueprint("execute_command", __name__)

@execute_command_bp.route("/execute-command", methods=["POST"])
def execute_command():
  data = request.get_json() or {}
  transcript = data.get("transcript", "")
  print(f"Received request to execute voice command: '{transcript}'")
  
  # Step 1: Run classification model
  classification = small_model.classify(transcript)
  selected_headers = classification.get("selected_headers", [])
  candidate_commands = classification.get("candidate_command_names", [])
  
  # Step 2: Gather data or fallback
  if selected_headers:
    print(f"Gathering data for selected headers: {selected_headers}")
    pulled_data = tab_registry.gather(selected_headers)
  else:
    print("Low-confidence fallback or empty headers. Skipping data gathering.")
    pulled_data = {}
    
  # Step 3: Run decision model to plan actions
  plan = decision_model.decide(transcript, pulled_data, candidate_commands)
  print(f"Formulated execution plan: {plan}")
  
  return jsonify(plan)
