from config.db import get_connection
from models.product_model import generate_sku, sku_exists
from services.log_service import record_log


def _format_product(p):
    if not p:
        return p
    if p.get("price") is not None:
        p["price"] = float(p["price"])
    if p.get("quantity") is not None:
        p["quantity"] = int(p["quantity"])
    if p.get("reorder_level") is not None:
        p["reorder_level"] = int(p["reorder_level"])
    if p.get("created_at") and hasattr(p["created_at"], "isoformat"):
        p["created_at"] = p["created_at"].isoformat()
    elif p.get("created_at"):
        p["created_at"] = str(p["created_at"])
    if p.get("updated_at") and hasattr(p["updated_at"], "isoformat"):
        p["updated_at"] = p["updated_at"].isoformat()
    elif p.get("updated_at"):
        p["updated_at"] = str(p["updated_at"])
    return p


def _ensure_unique_sku(cursor, category, name, size, preferred_sku=None):
    if preferred_sku:
        if not sku_exists(cursor, preferred_sku):
            return preferred_sku
        raise ValueError("SKU already exists")

    for _ in range(10):
        candidate = generate_sku(category, name, size)
        if not sku_exists(cursor, candidate):
            return candidate
    raise ValueError("Unable to generate unique SKU")


def create_product(name, category, size, price, sku=None, barcode=None,
                   reorder_level=10, category_id=None, image_url=None, user_id=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # Resolve category name from category_id if provided
            if category_id and not category:
                cursor.execute(
                    "SELECT name FROM categories WHERE id = %s", (category_id,))
                row = cursor.fetchone()
                if row:
                    category = row["name"]
                else:
                    return None, None, "Category not found"

            final_sku = _ensure_unique_sku(
                cursor, category, name, size, sku or None)

            cursor.execute(
                """INSERT INTO products (name, category, size, price, sku, barcode, image_url, category_id)
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
                (name, category, size, price, final_sku, barcode, image_url, category_id),
            )
            product_id = cursor.lastrowid

            cursor.execute(
                "INSERT INTO inventory (product_id, quantity, reorder_level) VALUES (%s, %s, %s)",
                (product_id, 0, reorder_level),
            )

            # Record audit log
            record_log(
                cursor,
                product_id=product_id,
                action_type="CREATE",
                user_id=user_id,
                quantity=0,
                previous_stock=0,
                new_stock=0,
                details=f"Product created: '{name}' ({size}) at ₹{float(price):.2f}, SKU {final_sku}",
            )

            conn.commit()
            return product_id, final_sku, None
    except ValueError as e:
        return None, None, str(e)
    except Exception as e:
        conn.rollback()
        return None, None, str(e)
    finally:
        conn.close()


def update_product(product_id, name=None, category=None, size=None,
                   price=None, sku=None, barcode=None, image_url=None,
                   reorder_level=None, category_id=None, status=None, user_id=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM products WHERE id = %s", (product_id,))
            prod = cursor.fetchone()
            if not prod:
                return None, "Product not found"

            changes = []
            new_name = (name or "").strip() or prod["name"]
            if new_name != prod["name"]:
                changes.append(f"Name: '{prod['name']}' → '{new_name}'")

            new_size = (size or "").strip() or prod["size"]
            if new_size != prod["size"]:
                changes.append(f"Quantity/Pack: '{prod['size']}' → '{new_size}'")

            new_barcode = barcode if barcode is not None else prod["barcode"]
            new_image = image_url if image_url is not None else prod.get("image_url")
            new_status = status or prod["status"]
            if new_status != prod["status"]:
                changes.append(f"Status: '{prod['status']}' → '{new_status}'")

            # Handle category
            new_category_id = category_id if category_id is not None else prod["category_id"]
            if new_category_id and (not category or category_id != prod.get("category_id")):
                cursor.execute(
                    "SELECT name FROM categories WHERE id = %s", (new_category_id,))
                row = cursor.fetchone()
                new_category = row["name"] if row else prod["category"]
            else:
                new_category = (category or "").strip() or prod["category"]

            if new_category != prod["category"]:
                changes.append(f"Category: '{prod['category']}' → '{new_category}'")

            # Handle price
            if price is not None:
                try:
                    new_price = float(price)
                    if new_price < 0:
                        return None, "Price must be positive"
                    if abs(new_price - float(prod["price"])) > 0.001:
                        changes.append(f"Price: ₹{float(prod['price']):.2f} → ₹{new_price:.2f}")
                except (TypeError, ValueError):
                    return None, "Invalid price"
            else:
                new_price = prod["price"]

            # Handle SKU
            if sku and sku != prod["sku"]:
                if sku_exists(cursor, sku, exclude_id=product_id):
                    return None, "SKU already exists"
                new_sku = sku
                changes.append(f"SKU: '{prod['sku']}' → '{new_sku}'")
            else:
                new_sku = prod["sku"]

            cursor.execute(
                """UPDATE products SET name=%s, category=%s, size=%s, price=%s,
                   sku=%s, barcode=%s, image_url=%s, category_id=%s, status=%s
                   WHERE id=%s""",
                (new_name, new_category, new_size, new_price,
                 new_sku, new_barcode, new_image, new_category_id, new_status, product_id),
            )

            # Update reorder level in inventory if provided
            if reorder_level is not None:
                rl = int(reorder_level)
                if rl >= 0:
                    cursor.execute("SELECT reorder_level, quantity FROM inventory WHERE product_id=%s", (product_id,))
                    inv = cursor.fetchone()
                    if inv and inv["reorder_level"] != rl:
                        changes.append(f"Reorder alert: {inv['reorder_level']} → {rl}")
                    cursor.execute(
                        "UPDATE inventory SET reorder_level=%s WHERE product_id=%s",
                        (rl, product_id))

            # Current stock
            cursor.execute("SELECT quantity FROM inventory WHERE product_id = %s", (product_id,))
            inv_row = cursor.fetchone()
            curr_stock = inv_row["quantity"] if inv_row else 0

            # Action type determining
            if status == "inactive" and prod["status"] == "active":
                action = "ARCHIVE"
                desc = f"Product deactivated/archived: '{prod['name']}'"
            elif status == "active" and prod["status"] == "inactive":
                action = "RESTORE"
                desc = f"Product restored to active inventory: '{prod['name']}'"
            else:
                action = "UPDATE"
                desc = f"Product updated: {', '.join(changes)}" if changes else "Product details updated"

            record_log(
                cursor,
                product_id=product_id,
                action_type=action,
                user_id=user_id,
                previous_stock=curr_stock,
                new_stock=curr_stock,
                details=desc,
            )

            conn.commit()
            return product_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def soft_delete_product(product_id, user_id=None):
    """Set product status to 'inactive' (soft-delete)."""
    return update_product(product_id, status="inactive", user_id=user_id)


def restore_product(product_id, user_id=None):
    """Restore a soft-deleted product."""
    return update_product(product_id, status="active", user_id=user_id)


def get_products(search=None, category=None, page=1, per_page=10,
                 status="active", category_id=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = ["p.status = %s"]
            params = [status]

            if search:
                conditions.append("(p.name LIKE %s OR p.sku LIKE %s)")
                term = f"%{search}%"
                params.extend([term, term])
            if category:
                conditions.append("p.category = %s")
                params.append(category)
            if category_id:
                conditions.append("p.category_id = %s")
                params.append(category_id)

            where = f"WHERE {' AND '.join(conditions)}"
            offset = (page - 1) * per_page

            cursor.execute(
                f"SELECT COUNT(*) AS total FROM products p {where}", params)
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT p.*, i.quantity, i.reorder_level,
                           CASE WHEN i.quantity < i.reorder_level THEN 1 ELSE 0 END AS low_stock
                    FROM products p
                    LEFT JOIN inventory i ON p.id = i.product_id
                    {where}
                    ORDER BY p.created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            products = [_format_product(p) for p in cursor.fetchall()]
            return products, total, None
    finally:
        conn.close()


def get_product_by_id(product_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """SELECT p.*, i.quantity, i.reorder_level
                   FROM products p
                   LEFT JOIN inventory i ON p.id = i.product_id
                   WHERE p.id = %s""",
                (product_id,),
            )
            return _format_product(cursor.fetchone())
    finally:
        conn.close()


def get_categories():
    """Get categories from the categories table (active only)."""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT name FROM categories WHERE status = 'active' ORDER BY name"
            )
            return [row["name"] for row in cursor.fetchall()]
    finally:
        conn.close()
