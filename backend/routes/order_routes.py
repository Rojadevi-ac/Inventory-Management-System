from flask import Blueprint

from controllers.order_controller import create_order, list_orders
from utils.jwt_helper import token_required

order_bp = Blueprint("orders", __name__, url_prefix="/api/orders")

order_bp.add_url_rule("", view_func=token_required()(create_order), methods=["POST"])
order_bp.add_url_rule("", view_func=token_required()(list_orders), methods=["GET"])
