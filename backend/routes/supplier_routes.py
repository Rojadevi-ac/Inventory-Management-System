from flask import Blueprint

from controllers.supplier_controller import (
    add_supplier, edit_supplier, get_supplier, list_suppliers, remove_supplier,
)
from utils.jwt_helper import token_required

supplier_bp = Blueprint("suppliers", __name__, url_prefix="/api/suppliers")

# Everyone authenticated can list/view suppliers
supplier_bp.add_url_rule("", view_func=token_required()(list_suppliers), methods=["GET"])
supplier_bp.add_url_rule("/<int:supplier_id>", view_func=token_required()(get_supplier), methods=["GET"])

# Only admin can create/edit/delete suppliers
supplier_bp.add_url_rule("", view_func=token_required(roles=["admin"])(add_supplier), methods=["POST"])
supplier_bp.add_url_rule("/<int:supplier_id>", view_func=token_required(roles=["admin"])(edit_supplier), methods=["PUT"])
supplier_bp.add_url_rule("/<int:supplier_id>", view_func=token_required(roles=["admin"])(remove_supplier), methods=["DELETE"])
