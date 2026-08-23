from flask import Blueprint

from controllers.inventory_controller import list_inventory, update_reorder
from utils.jwt_helper import token_required

inventory_bp = Blueprint("inventory", __name__, url_prefix="/api/inventory")

inventory_bp.add_url_rule("", view_func=token_required()(list_inventory), methods=["GET"])
inventory_bp.add_url_rule(
    "/<int:product_id>/reorder", view_func=token_required()(update_reorder), methods=["PUT"]
)
