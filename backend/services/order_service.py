from config.db import get_connection
from services.log_service import record_log
from utils.timezone import get_ist_now


def _format_order(o):
    if not o:
        return o
    if o.get("quantity") is not None:
        o["quantity"] = int(o["quantity"])
    if o.get("order_date") and hasattr(o["order_date"], "isoformat"):
        o["order_date"] = o["order_date"].isoformat()
    elif o.get("order_date"):
        o["order_date"] = str(o["order_date"])
    if o.get("created_at") and hasattr(o["created_at"], "isoformat"):
        o["created_at"] = o["created_at"].isoformat()
    elif o.get("created_at"):
        o["created_at"] = str(o["created_at"])
    return o


def _log_transaction(cursor, product_id, txn_type, quantity, reference_id=None):
    now_str = get_ist_now()
    cursor.execute(
        """INSERT INTO transactions (product_id, type, quantity, transaction_date, reference_id)
           VALUES (%s, %s, %s, %s, %s)""",
        (product_id, txn_type, quantity, now_str, reference_id),
    )


def place_order(product_id, quantity, user_id):
    if quantity <= 0:
        return None, "Quantity must be greater than zero"

    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id, name FROM products WHERE id = %s", (product_id,))
            prod = cursor.fetchone()
            if not prod:
                return None, "Product not found"

            cursor.execute(
                "SELECT quantity FROM inventory WHERE product_id = %s FOR UPDATE",
                (product_id,),
            )
            inv = cursor.fetchone()
            if not inv:
                return None, "Inventory record not found"

            prev_stock = inv["quantity"]
            if prev_stock < quantity:
                return None, f"Insufficient stock. Available: {prev_stock}"

            new_stock = prev_stock - quantity

            now_str = get_ist_now()
            cursor.execute(
                """INSERT INTO orders (product_id, quantity, order_date, created_by)
                   VALUES (%s, %s, %s, %s)""",
                (product_id, quantity, now_str, user_id),
            )
            order_id = cursor.lastrowid

            cursor.execute(
                "UPDATE inventory SET quantity = quantity - %s WHERE product_id = %s",
                (quantity, product_id),
            )
            _log_transaction(cursor, product_id, "OUT", quantity, order_id)

            # Record audit log
            details = f"Stock OUT (Order): -{quantity} units (Order ORD-{order_id:04d})"
            record_log(
                cursor,
                product_id=product_id,
                action_type="ORDER",
                user_id=user_id,
                quantity=quantity,
                previous_stock=prev_stock,
                new_stock=new_stock,
                details=details,
            )

            conn.commit()
            return order_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def get_orders(date_from=None, date_to=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if date_from:
                conditions.append("DATE(o.order_date) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(o.order_date) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM orders o {where}", params)
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT o.*, p.name AS product_name, p.sku, u.name AS created_by_name
                    FROM orders o
                    LEFT JOIN products p ON o.product_id = p.id
                    LEFT JOIN users u ON o.created_by = u.id
                    {where}
                    ORDER BY o.order_date DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            orders = [_format_order(o) for o in cursor.fetchall()]
            return orders, total, None
    finally:
        conn.close()
