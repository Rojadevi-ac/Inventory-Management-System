from flask import Blueprint

from controllers.log_controller import list_global_logs, list_product_logs
from utils.jwt_helper import token_required

log_bp = Blueprint("logs", __name__, url_prefix="/api/logs")

# Global audit logs
log_bp.add_url_rule("", view_func=token_required()(list_global_logs), methods=["GET"])

# Product-specific audit logs
log_bp.add_url_rule("/products/<int:product_id>", view_func=token_required()(list_product_logs), methods=["GET"])
