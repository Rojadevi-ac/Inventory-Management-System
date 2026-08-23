from flask import Blueprint

from controllers.category_controller import (
    add_category,
    edit_category,
    list_active_categories,
    list_categories,
    remove_category,
)
from utils.jwt_helper import token_required

category_bp = Blueprint("categories", __name__, url_prefix="/api/categories")

category_bp.add_url_rule("", view_func=token_required()(list_categories), methods=["GET"])
category_bp.add_url_rule("/active", view_func=token_required()(list_active_categories), methods=["GET"])
category_bp.add_url_rule("", view_func=token_required(roles=["admin", "manager"])(add_category), methods=["POST"])
category_bp.add_url_rule("/<int:category_id>", view_func=token_required(roles=["admin", "manager"])(edit_category), methods=["PUT"])
category_bp.add_url_rule("/<int:category_id>", view_func=token_required(roles=["admin"])(remove_category), methods=["DELETE"])
