"""
Flask app factory / entrypoint.
Registers blueprints from routes/, initializes db/supabase_client, applies flask-cors
(required since requests originate from a chrome-extension:// origin).
"""
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    CORS(app, origins=["chrome-extension://*"])
    from routes.execute_command import execute_command_bp
    from routes.tab_sync import tab_sync_bp
    from routes.health import health_bp
    app.register_blueprint(execute_command_bp)
    app.register_blueprint(tab_sync_bp)
    app.register_blueprint(health_bp)
    return app

if __name__ == "__main__":
    create_app().run(debug=True)
