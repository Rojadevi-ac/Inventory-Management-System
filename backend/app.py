import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS

from routes.auth_routes import auth_bp
from routes.product_routes import product_bp
from routes.inventory_routes import inventory_bp
from routes.purchase_routes import purchase_bp
from routes.order_routes import order_bp
from routes.dashboard_routes import dashboard_bp
from routes.supplier_routes import supplier_bp
from routes.category_routes import category_bp
from routes.log_routes import log_bp
from routes.supplier_issue_routes import supplier_issue_bp


def create_app():
    app = Flask(__name__)
    CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])

    app.register_blueprint(auth_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(inventory_bp)
    app.register_blueprint(purchase_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(supplier_bp)
    app.register_blueprint(category_bp)
    app.register_blueprint(log_bp)
    app.register_blueprint(supplier_issue_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "message": "IMS API is running"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)
