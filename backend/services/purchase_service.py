from config.db import get_connection
from services.log_service import record_log
from utils.timezone import get_ist_now


def _format_purchase(pu):
    if not pu:
        return pu
    if pu.get("quantity") is not None:
        pu["quantity"] = int(pu["quantity"])
    if pu.get("purchase_date") and hasattr(pu["purchase_date"], "isoformat"):
        pu["purchase_date"] = pu["purchase_date"].isoformat()
    elif pu.get("purchase_date"):
        pu["purchase_date"] = str(pu["purchase_date"])
    if pu.get("created_at") and hasattr(pu["created_at"], "isoformat"):
        pu["created_at"] = pu["created_at"].isoformat()
    elif pu.get("created_at"):
        pu["created_at"] = str(pu["created_at"])
    return pu


def _log_transaction(cursor, product_id, txn_type, quantity, reference_id=None):
    now_str = get_ist_now()
    cursor.execute(
        """INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id)
           VALUES (%s, %s, %s, %s, %s)""",
        (product_id, txn_type, quantity, now_str, reference_id),
    )


def add_purchase(product_id, quantity, supplier_id, user_id):
    if quantity <= 0:
        return None, "Quantity must be greater than zero"

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name FROM products WHERE id = %s", (product_id,))
            prod = cursor.fetchone()
            if not prod:
                return None, "Product not found"

            # Validate supplier exists if provided
            supplier_name = None
            if supplier_id:
                cursor.execute("SELECT id, name FROM suppliers WHERE id = %s", (supplier_id,))
                sup = cursor.fetchone()
                if not sup:
                    return None, "Supplier not found"
                supplier_name = sup["name"]

            # Current stock
            cursor.execute("SELECT quantity FROM inventory WHERE product_id = %s", (product_id,))
            inv = cursor.fetchone()
            prev_stock = inv["quantity"] if inv else 0
            new_stock = prev_stock + quantity

            now_str = get_ist_now()
            cursor.execute(
                """INSERT INTO purchases (product_id, quantity, supplier_id, purchase_date, created_by)
                   VALUES (%s, %s, %s, %s, %s)""",
                (product_id, quantity, supplier_id, now_str, user_id),
            )
            purchase_id = cursor.lastrowid

            cursor.execute(
                "UPDATE inventory SET quantity = quantity + %s WHERE product_id = %s",
                (quantity, product_id),
            )
            _log_transaction(cursor, product_id, "IN", quantity, purchase_id)

            # Record audit log
            sup_info = f" from {supplier_name}" if supplier_name else ""
            details = f"Stock IN (Purchase): +{quantity} units{sup_info} (Invoice PUR-{purchase_id:04d})"
            record_log(
                cursor,
                product_id=product_id,
                action_type="PURCHASE",
                user_id=user_id,
                quantity=quantity,
                previous_stock=prev_stock,
                new_stock=new_stock,
                details=details,
            )

            conn.commit()
            return purchase_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def get_purchases(search=None, date_from=None, date_to=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if search:
                conditions.append(
                    "(p.name LIKE %s OR p.sku LIKE %s OR s.name LIKE %s OR CAST(pu.id AS CHAR) LIKE %s)"
                )
                term = f"%{search}%"
                params.extend([term, term, term, term])
            if date_from:
                conditions.append("DATE(pu.purchase_date) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(pu.purchase_date) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM purchases pu "
                           f"LEFT JOIN products p ON pu.product_id = p.id "
                           f"LEFT JOIN suppliers s ON pu.supplier_id = s.id "
                           f"{where}", params)
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT pu.*, p.name AS product_name, p.sku,
                           u.name AS created_by_name,
                           s.name AS supplier_name
                    FROM purchases pu
                    LEFT JOIN products p ON pu.product_id = p.id
                    LEFT JOIN users u ON pu.created_by = u.id
                    LEFT JOIN suppliers s ON pu.supplier_id = s.id
                    {where}
                    ORDER BY pu.purchase_date DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            purchases = [_format_purchase(pu) for pu in cursor.fetchall()]
            return purchases, total, None
    finally:
        conn.close()
