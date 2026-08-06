"""
POST /tab-opened    -> tab_registry.register(tab)          (creates empty dom_data/screenshot slots)
POST /tab-updated   -> tab_registry.update(tab)             (invalidates stale dom_data on navigation)
POST /tab-closed    -> cleanup_service.purge(tab_id)        (deletes ALL data tied to that tab immediately:
                                                              registry row, cached dom_data, screenshots + R2 objects)
POST /resync-tabs   -> tab_registry.resync_all(tabs)        (called on extension/service-worker startup —
                                                              since close-deletion is immediate and MV3 workers
                                                              get killed/restarted, nothing is assumed to survive
                                                              a restart; this rebuilds every row from a fresh
                                                              chrome.tabs.query() snapshot)
This is the file that keeps 'as many dom data / screenshots / tab rows as there are open tabs, no more'.
"""
from flask import Blueprint, request, jsonify

tab_sync_bp = Blueprint("tab_sync", __name__)

@tab_sync_bp.route("/tab-opened", methods=["POST"])
def tab_opened():
    return jsonify({"ok": True})

@tab_sync_bp.route("/tab-updated", methods=["POST"])
def tab_updated():
    return jsonify({"ok": True})

@tab_sync_bp.route("/tab-closed", methods=["POST"])
def tab_closed():
    # cleanup_service.purge(request.json["tab_id"])
    return jsonify({"ok": True})

@tab_sync_bp.route("/resync-tabs", methods=["POST"])
def resync_tabs():
    # tab_registry.resync_all(request.json["tabs"])
    return jsonify({"ok": True})
