from flask import Blueprint

from controllers.supplier_issue_controller import (
    add_supplier_issue,
    get_damage_summary,
    get_quality_summary,
    get_supplier_purchases,
    list_supplier_issues,
    update_issue_status,
)
from utils.jwt_helper import token_required

supplier_issue_bp = Blueprint("supplier_issues", __name__, url_prefix="/api/supplier-issues")

# List all supplier issues / damages
supplier_issue_bp.add_url_rule("", view_func=token_required()(list_supplier_issues), methods=["GET"])

# Create new supplier issue
supplier_issue_bp.add_url_rule("", view_func=token_required()(add_supplier_issue), methods=["POST"])

# Update issue status / resolution
supplier_issue_bp.add_url_rule("/<int:issue_id>/status", view_func=token_required()(update_issue_status), methods=["PUT"])

# Get purchases for a selected supplier
supplier_issue_bp.add_url_rule("/supplier/<int:supplier_id>/purchases", view_func=token_required()(get_supplier_purchases), methods=["GET"])

# Get damage summary & remaining quantity calculation for a purchase/product
supplier_issue_bp.add_url_rule("/damage-summary", view_func=token_required()(get_damage_summary), methods=["GET"])

# Get supplier quality statistics summary
supplier_issue_bp.add_url_rule("/supplier/<int:supplier_id>/quality", view_func=token_required()(get_quality_summary), methods=["GET"])
