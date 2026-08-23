from flask import jsonify, request

from services.product_service import (
    create_product, get_categories, get_product_by_id, get_products,
    update_product, soft_delete_product, restore_product,
)


def add_product():
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    category = (data.get("category") or "").strip()
    size = (data.get("size") or "").strip()
    price = data.get("price")
    sku = (data.get("sku") or "").strip() or None
    barcode = (data.get("barcode") or "").strip() or None
    reorder_level = data.get("reorder_level", 10)
    category_id = data.get("category_id")
    image_url = (data.get("image_url") or "").strip() or None

    if not name or not size or price is None:
        return jsonify({"error": "Name, size, and price are required"}), 400

    if not category_id and not category:
        return jsonify({"error": "Category is required"}), 400

    try:
        price = float(price)
        if price < 0:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Price must be a valid positive number"}), 400

    product_id, final_sku, error = create_product(
        name, category, size, price, sku, barcode, reorder_level, category_id, image_url, user_id=user_id
    )
    if error:
        return jsonify({"error": error}), 400

    product = get_product_by_id(product_id)
    return jsonify({"message": "Product created", "product": product, "sku": final_sku}), 201


def edit_product(product_id):
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    data = request.get_json() or {}
    pid, error = update_product(
        product_id,
        name=data.get("name"),
        category=data.get("category"),
        size=data.get("size"),
        price=data.get("price"),
        sku=data.get("sku"),
        barcode=data.get("barcode"),
        image_url=data.get("image_url"),
        reorder_level=data.get("reorder_level"),
        category_id=data.get("category_id"),
        status=data.get("status"),
        user_id=user_id,
    )
    if error:
        return jsonify({"error": error}), 400

    product = get_product_by_id(pid)
    return jsonify({"message": "Product updated", "product": product}), 200


def delete_product(product_id):
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    pid, error = soft_delete_product(product_id, user_id=user_id)
    if error:
        return jsonify({"error": error}), 400
    return jsonify({"message": "Product archived"}), 200


def restore_deleted_product(product_id):
    user_id = request.user.get("user_id") if hasattr(request, "user") and request.user else None
    pid, error = restore_product(product_id, user_id=user_id)
    if error:
        return jsonify({"error": error}), 400
    product = get_product_by_id(pid)
    return jsonify({"message": "Product restored", "product": product}), 200


def list_products():
    search = request.args.get("search")
    category = request.args.get("category")
    category_id = request.args.get("category_id")
    status = request.args.get("status", "active")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 10))

    products, total, error = get_products(
        search, category, page, per_page, status, category_id)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "products": products,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200


def get_product(product_id):
    product = get_product_by_id(product_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    return jsonify(product), 200


def list_categories():
    return jsonify({"categories": get_categories()}), 200
