from config.db import get_connection


def get_inventory(stock_status=None, search=None, page=1, per_page=10):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if search:
                conditions.append("(p.name LIKE %s OR p.sku LIKE %s)")
                term = f"%{search}%"
                params.extend([term, term])
            if stock_status == "low":
                conditions.append("i.quantity < i.reorder_level")
            elif stock_status == "in_stock":
                conditions.append("i.quantity >= i.reorder_level")

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(
                f"""SELECT COUNT(*) AS total FROM inventory i
                    JOIN products p ON i.product_id = p.id {where}""",
                params,
            )
            total = cursor.fetchone()["total"]

            cursor.execute(
                f"""SELECT i.*, p.name, p.sku, p.category, p.size, p.price,
                           CASE WHEN i.quantity < i.reorder_level THEN 1 ELSE 0 END AS low_stock
                    FROM inventory i
                    JOIN products p ON i.product_id = p.id
                    {where}
                    ORDER BY low_stock DESC, p.name ASC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            items = cursor.fetchall()
            return items, total, None
    finally:
        conn.close()


def update_reorder_level(product_id, reorder_level):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE inventory SET reorder_level = %s WHERE product_id = %s",
                (reorder_level, product_id),
            )
            if cursor.rowcount == 0:
                return False, "Inventory record not found"
            conn.commit()
            return True, None
    finally:
        conn.close()


def get_low_stock_count():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "SELECT COUNT(*) AS count FROM inventory WHERE quantity < reorder_level"
            )
            return cursor.fetchone()["count"]
    finally:
        conn.close()


def get_total_stock():
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COALESCE(SUM(quantity), 0) AS total FROM inventory")
            return cursor.fetchone()["total"]
    finally:
        conn.close()
