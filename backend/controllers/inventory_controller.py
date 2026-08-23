from flask import jsonify, request

from services.inventory_service import get_inventory, update_reorder_level


def list_inventory():
    stock_status = request.args.get("stock_status")
    search = request.args.get("search")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    items, total, error = get_inventory(stock_status, search, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "inventory": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }), 200


def update_reorder(product_id):
    data = request.get_json() or {}
    reorder_level = data.get("reorder_level")

    if reorder_level is None:
        return jsonify({"error": "reorder_level is required"}), 400

    try:
        reorder_level = int(reorder_level)
        if reorder_level < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "reorder_level must be a valid non-negative integer"}), 400

    success, error = update_reorder_level(product_id, reorder_level)
    if not success:
        return jsonify({"error": error}), 404

    return jsonify({"message": "Reorder level updated"}), 200
