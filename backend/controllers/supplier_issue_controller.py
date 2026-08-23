from flask import jsonify, request

from services.supplier_issue_service import (
    create_supplier_issue,
    get_purchase_product_damage_summary,
    get_purchases_by_supplier,
    get_supplier_issues,
    get_supplier_quality_summary,
    update_supplier_issue_status,
)


def list_supplier_issues():
    search = request.args.get("search")
    supplier_id = request.args.get("supplier_id")
    purchase_id = request.args.get("purchase_id")
    product_id = request.args.get("product_id")
    issue_type = request.args.get("issue_type")
    status = request.args.get("status")
    resolution = request.args.get("resolution")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    issues, total, error = get_supplier_issues(
        search=search,
        supplier_id=supplier_id,
        purchase_id=purchase_id,
        product_id=product_id,
        issue_type=issue_type,
        status=status,
        resolution=resolution,
        date_from=date_from,
        date_to=date_to,
        page=page,
        per_page=per_page,
    )
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "issues": issues,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200


def add_supplier_issue():
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    data = request.get_json() or {}

    supplier_id = data.get("supplier_id")
    purchase_id = data.get("purchase_id")
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    issue_type = (data.get("issue_type") or "").strip()
    reason = (data.get("reason") or "").strip()
    notes = (data.get("notes") or "").strip() or None
    deduct_inventory = bool(data.get("deduct_inventory", True))

    if not supplier_id or not purchase_id or not product_id:
        return jsonify({"error": "Supplier, purchase, and product are required"}), 400

    if not quantity or not issue_type or not reason:
        return jsonify({"error": "Quantity, issue type, and reason are required"}), 400

    try:
        quantity = int(quantity)
        if quantity <= 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Quantity must be a positive integer"}), 400

    issue_id, error = create_supplier_issue(
        supplier_id=int(supplier_id),
        purchase_id=int(purchase_id),
        product_id=int(product_id),
        quantity=quantity,
        issue_type=issue_type,
        reason=reason,
        notes=notes,
        deduct_inventory=deduct_inventory,
        user_id=user_id,
    )
    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": "Supplier issue reported successfully", "issue_id": issue_id}), 201


def update_issue_status(issue_id):
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    data = request.get_json() or {}

    status = data.get("status")
    resolution = data.get("resolution")
    notes = data.get("notes")

    if not status:
        return jsonify({"error": "Status is required"}), 400

    _, error = update_supplier_issue_status(
        issue_id=issue_id,
        status=status,
        resolution=resolution,
        notes=notes,
        user_id=user_id,
    )
    if error:
        return jsonify({"error": error}), 400

    return jsonify({"message": f"Supplier issue updated to '{status}'"}), 200


def get_supplier_purchases(supplier_id):
    purchases = get_purchases_by_supplier(supplier_id)
    return jsonify({"purchases": purchases}), 200


def get_damage_summary():
    purchase_id = request.args.get("purchase_id")
    product_id = request.args.get("product_id")

    if not purchase_id or not product_id:
        return jsonify({"error": "purchase_id and product_id are required"}), 400

    summary, error = get_purchase_product_damage_summary(int(purchase_id), int(product_id))
    if error:
        return jsonify({"error": error}), 400

    return jsonify(summary), 200


def get_quality_summary(supplier_id):
    summary, error = get_supplier_quality_summary(supplier_id)
    if error:
        return jsonify({"error": error}), 400

    return jsonify(summary), 200
