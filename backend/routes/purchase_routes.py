from flask import Blueprint

from controllers.purchase_controller import create_purchase, list_purchases
from utils.jwt_helper import token_required

purchase_bp = Blueprint("purchases", __name__, url_prefix="/api/purchases")

purchase_bp.add_url_rule("", view_func=token_required()(create_purchase), methods=["POST"])
purchase_bp.add_url_rule("", view_func=token_required()(list_purchases), methods=["GET"])
