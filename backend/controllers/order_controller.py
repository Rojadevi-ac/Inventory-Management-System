from flask import jsonify, request

from services.order_service import get_orders, place_order


def create_order():
    data = request.get_json() or {}
    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if not product_id or quantity is None:
        return jsonify({"error": "product_id and quantity are required"}), 400

    try:
        product_id = int(product_id)
        quantity = int(quantity)
    except (TypeError, ValueError):
        return jsonify({"error": "product_id and quantity must be integers"}), 400

    user_id = request.user["user_id"]
    order_id, error = place_order(product_id, quantity, user_id)
    if error:
        status = 404 if "not found" in error.lower() else 400
        return jsonify({"error": error}), status

    return jsonify({"message": "Order placed", "order_id": order_id}), 201


def list_orders():
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    orders, total, error = get_orders(date_from, date_to, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "orders": orders,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }), 200
