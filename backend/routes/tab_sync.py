from flask import Blueprint, request, jsonify
import services.tab_registry as tab_registry
import services.cleanup_service as cleanup_service

tab_sync_bp = Blueprint("tab_sync", __name__)

@tab_sync_bp.route("/tab-opened", methods=["POST"])
def tab_opened():
  data = request.get_json() or {}
  tab = data.get("tab")
  if tab:
    tab_registry.register(tab)
  return jsonify({"ok": True})

@tab_sync_bp.route("/tab-updated", methods=["POST"])
def tab_updated():
  data = request.get_json() or {}
  tab = data.get("tab")
  if tab:
    tab_registry.update(tab)
  return jsonify({"ok": True})

@tab_sync_bp.route("/tab-closed", methods=["POST"])
def tab_closed():
  data = request.get_json() or {}
  tab_id = data.get("tab_id")
  if tab_id is not None:
    cleanup_service.purge(tab_id)
  return jsonify({"ok": True})

@tab_sync_bp.route("/resync-tabs", methods=["POST"])
def resync_tabs():
  data = request.get_json() or {}
  tabs = data.get("tabs", [])
  cleanup_service.resync_on_startup(tabs)
  return jsonify({"ok": True})

@tab_sync_bp.route("/sweep-tabs", methods=["POST"])
def sweep_tabs():
  data = request.get_json() or {}
  active_tab_ids = data.get("active_tab_ids", [])
  cleanup_service.sweep(active_tab_ids)
  return jsonify({"ok": True})

@tab_sync_bp.route("/upload-dom", methods=["POST"])
def upload_dom():
  data = request.get_json() or {}
  tab_id = data.get("tab_id")
  inner_text = data.get("inner_text", "")
  interactive_elements = data.get("interactive_elements", [])
  if tab_id is not None:
    import services.dom_cache as dom_cache
    dom_cache.store(tab_id, inner_text, interactive_elements)
  return jsonify({"ok": True})

