from flask import Blueprint

from controllers.dashboard_controller import dashboard, list_transactions
from utils.jwt_helper import token_required

dashboard_bp = Blueprint("dashboard", __name__, url_prefix="/api/dashboard")

dashboard_bp.add_url_rule("", view_func=token_required()(dashboard), methods=["GET"])
dashboard_bp.add_url_rule(
    "/transactions", view_func=token_required()(list_transactions), methods=["GET"]
)
