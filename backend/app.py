import os
import sys

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
from routes.staff_routes import staff_bp


def create_app():
    app = Flask(__name__)

    CORS(app)

    # Register blueprints
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
    app.register_blueprint(staff_bp)

    # Health check
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "ok",
            "message": "IMS API is running"
        }), 200

    # 404 handler
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "error": "Resource not found"
        }), 404

    # TEMPORARY: show actual error
    @app.errorhandler(Exception)
    def handle_exception(error):
        import traceback

        print("🔥 ACTUAL ERROR:", repr(error))
        traceback.print_exc()

        return jsonify({
            "error": str(error)
        }), 500

    return app


# IMPORTANT: Gunicorn looks for this
app = create_app()


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )