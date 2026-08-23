from flask import jsonify, request

from services.supplier_service import (
    create_supplier, delete_supplier, get_supplier_by_id,
    get_suppliers, update_supplier,
)


def list_suppliers():
    search = request.args.get("search")
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 50))

    suppliers, total, error = get_suppliers(search, page, per_page)
    if error:
        return jsonify({"error": error}), 400

    return jsonify({
        "suppliers": suppliers,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": max(1, (total + per_page - 1) // per_page),
    }), 200


def get_supplier(supplier_id):
    supplier = get_supplier_by_id(supplier_id)
    if not supplier:
        return jsonify({"error": "Supplier not found"}), 404
    return jsonify(supplier), 200


def add_supplier():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    contact_person = (data.get("contact_person") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    email = (data.get("email") or "").strip() or None
    address = (data.get("address") or "").strip() or None
    started_at = (data.get("started_at") or "").strip()
    logo_url = (data.get("logo_url") or "").strip() or None

    if not name:
        return jsonify({"error": "Supplier name is required"}), 400
    if not started_at:
        return jsonify({"error": "Start date (started_at) is required"}), 400

    supplier_id, error = create_supplier(name, contact_person, phone, email, address, started_at, logo_url)
    if error:
        return jsonify({"error": error}), 400

    supplier = get_supplier_by_id(supplier_id)
    return jsonify({"message": "Supplier created", "supplier": supplier}), 201


def edit_supplier(supplier_id):
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    contact_person = (data.get("contact_person") or "").strip() or None
    phone = (data.get("phone") or "").strip() or None
    email = (data.get("email") or "").strip() or None
    address = (data.get("address") or "").strip() or None
    started_at = (data.get("started_at") or "").strip()
    logo_url = data.get("logo_url") if "logo_url" in data else None

    if not name:
        return jsonify({"error": "Supplier name is required"}), 400
    if not started_at:
        return jsonify({"error": "Start date is required"}), 400

    ok, error = update_supplier(supplier_id, name, contact_person, phone, email, address, started_at, logo_url)
    if not ok:
        status = 404 if "not found" in (error or "").lower() else 400
        return jsonify({"error": error}), status

    supplier = get_supplier_by_id(supplier_id)
    return jsonify({"message": "Supplier updated", "supplier": supplier}), 200


def remove_supplier(supplier_id):
    ok, error = delete_supplier(supplier_id)
    if not ok:
        status = 404 if "not found" in (error or "").lower() else 400
        return jsonify({"error": error}), status
    return jsonify({"message": "Supplier deleted"}), 200
