from flask import Blueprint

from controllers.product_controller import (
    add_product, edit_product, delete_product, restore_deleted_product,
    get_product, list_categories, list_products,
)
from utils.jwt_helper import token_required

product_bp = Blueprint("products", __name__, url_prefix="/api/products")

product_bp.add_url_rule("", view_func=token_required()(add_product), methods=["POST"])
product_bp.add_url_rule("", view_func=token_required()(list_products), methods=["GET"])
product_bp.add_url_rule("/categories", view_func=token_required()(list_categories), methods=["GET"])
product_bp.add_url_rule("/<int:product_id>", view_func=token_required()(get_product), methods=["GET"])
product_bp.add_url_rule("/<int:product_id>", view_func=token_required(roles=["admin", "manager"])(edit_product), methods=["PUT"])
product_bp.add_url_rule("/<int:product_id>", view_func=token_required(roles=["admin"])(delete_product), methods=["DELETE"])
product_bp.add_url_rule("/<int:product_id>/restore", view_func=token_required(roles=["admin"])(restore_deleted_product), methods=["PUT"])
