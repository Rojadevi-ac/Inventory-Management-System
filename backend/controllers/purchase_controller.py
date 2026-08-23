from flask import jsonify, request

from services.purchase_service import add_purchase, get_purchases


def create_purchase():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity")
    supplier_id = data.get("supplier_id") or None

    if not product_id or quantity is None:
        return jsonify({"error": "product_id and quantity are required"}), 400

    try:
        product_id = int(product_id)
        quantity = int(quantity)
        if supplier_id is not None:
            supplier_id = int(supplier_id)
    except (TypeError, ValueError):
        return jsonify({"error": "product_id, quantity, and supplier_id must be integers"}), 400

    user_id = request.user["user_id"]
    purchase_id, error = add_purchase(product_id, quantity, supplier_id, user_id)
    if error:
        status = 404 if "not found" in error.lower() else 400
        return jsonify({"error": error}), status

    return jsonify({"message": "Purchase recorded", "purchase_id": purchase_id}), 201


def list_purchases():
    search = request.args.get("search")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    purchases, total, error = get_purchases(search, date_from, date_to, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "purchases": purchases,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200
