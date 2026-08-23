from flask import jsonify, request

from services.log_service import get_all_logs, get_product_logs


def list_product_logs(product_id):
    action_type = request.args.get("action_type")
    user_id = request.args.get("user_id")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    logs, total, error = get_product_logs(
        product_id=product_id,
        action_type=action_type,
        user_id=user_id,
        page=page,
        per_page=per_page,
    )
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "logs": logs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200


def list_global_logs():
    product_id = request.args.get("product_id")
    action_type = request.args.get("action_type")
    user_id = request.args.get("user_id")
    search = request.args.get("search")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 20))

    logs, total, error = get_all_logs(
        product_id=product_id,
        action_type=action_type,
        user_id=user_id,
        search=search,
        date_from=date_from,
        date_to=date_to,
        page=page,
        per_page=per_page,
    )
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "logs": logs,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200
