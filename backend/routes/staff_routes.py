from flask import Blueprint

from controllers.auth_controller import (
    create_staff, edit_user, list_users, remove_user,
)
from utils.jwt_helper import token_required

staff_bp = Blueprint("staff", __name__, url_prefix="/api/staff")

staff_bp.add_url_rule(
    "",
    view_func=token_required(roles=["admin", "manager"])(list_users),
    methods=["GET"],
    strict_slashes=False,
)
staff_bp.add_url_rule(
    "",
    view_func=token_required(roles=["admin", "manager"])(create_staff),
    methods=["POST"],
    strict_slashes=False,
)
staff_bp.add_url_rule(
    "/<int:user_id>",
    view_func=token_required(roles=["admin", "manager"])(edit_user),
    methods=["PUT"],
    strict_slashes=False,
)
staff_bp.add_url_rule(
    "/<int:user_id>",
    view_func=token_required(roles=["admin"])(remove_user),
    methods=["DELETE"],
    strict_slashes=False,
)
