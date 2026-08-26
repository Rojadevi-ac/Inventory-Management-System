from flask import Blueprint

from controllers.auth_controller import (
    create_staff, edit_user, list_users, login, profile, register, remove_user,
)
from utils.jwt_helper import token_required

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

# Public
auth_bp.add_url_rule("/login", view_func=login, methods=["POST"])
auth_bp.add_url_rule("/register", view_func=register, methods=["POST"])
auth_bp.add_url_rule("/signup", view_func=register, methods=["POST"])

# Authenticated
auth_bp.add_url_rule("/profile", view_func=token_required()(profile), methods=["GET"])

# Admin + Manager: manage users
auth_bp.add_url_rule(
    "/users",
    view_func=token_required(roles=["admin", "manager"])(list_users),
    methods=["GET"],
)
auth_bp.add_url_rule(
    "/users",
    view_func=token_required(roles=["admin", "manager"])(create_staff),
    methods=["POST"],
)
auth_bp.add_url_rule(
    "/users/<int:user_id>",
    view_func=token_required(roles=["admin", "manager"])(edit_user),
    methods=["PUT"],
)

# Admin only: delete user
auth_bp.add_url_rule(
    "/users/<int:user_id>",
    view_func=token_required(roles=["admin"])(remove_user),
    methods=["DELETE"],
)
