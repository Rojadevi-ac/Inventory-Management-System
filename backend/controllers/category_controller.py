from flask import jsonify, request

from services.category_service import (
    create_category,
    delete_category,
    get_all_active_categories,
    get_categories,
    get_category_by_id,
    update_category,
)


def list_categories():
    search = request.args.get("search")
    status = request.args.get("status")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    categories, total, error = get_categories(search, status, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "categories": categories,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200


def list_active_categories():
    cats = get_all_active_categories()
    return jsonify({"categories": cats}), 200


def add_category():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip() or None

    if not name:
        return jsonify({"error": "Category name is required"}), 400

    cat_id, error = create_category(name, description)
    if error:
        return jsonify({"error": error}), 400

    cat = get_category_by_id(cat_id)
    return jsonify({"message": "Category created", "category": cat}), 201


def edit_category(category_id):
    data = request.get_json() or {}
    cat_id, error = update_category(
        category_id,
        name=data.get("name"),
        description=data.get("description"),
        status=data.get("status"),
    )
    if error:
        return jsonify({"error": error}), 400

    cat = get_category_by_id(cat_id)
    return jsonify({"message": "Category updated", "category": cat}), 200


def remove_category(category_id):
    cat_id, error = delete_category(category_id)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Category deactivated"}), 200
