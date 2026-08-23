from flask import jsonify, request

from services.dashboard_service import get_dashboard_stats, get_transactions


def dashboard():
    stats = get_dashboard_stats()
    return jsonify(stats), 200


def list_transactions():
    txn_type = request.args.get("type")
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    transactions, total, error = get_transactions(txn_type, date_from, date_to, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "transactions": transactions,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }), 200
