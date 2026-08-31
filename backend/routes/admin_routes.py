from flask import Blueprint
from controllers.timezone_controller import (
    get_current_time,
    get_timezone_settings,
    update_timezone_settings,
)
from utils.jwt_helper import token_required

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

# Get timezone settings (all authenticated users)
admin_bp.add_url_rule("/timezone", view_func=token_required()(get_timezone_settings), methods=["GET"])

# Update timezone settings (Strictly admin role required — returns 403 Forbidden for non-admins)
admin_bp.add_url_rule("/timezone", view_func=token_required(roles=["admin"])(update_timezone_settings), methods=["PUT"])

# Public/live current time endpoint
admin_bp.add_url_rule("/current-time", view_func=token_required()(get_current_time), methods=["GET"])
