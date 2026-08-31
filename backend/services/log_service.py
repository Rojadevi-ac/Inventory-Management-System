from datetime import datetime, date
from config.db import get_connection
from utils.timezone import get_ist_now


def _format_log(log):
    if not log:
        return log
    for k, v in list(log.items()):
        if isinstance(v, (datetime, date)) or hasattr(v, "isoformat"):
            log[k] = v.isoformat()
        elif hasattr(v, "as_tuple"):
            log[k] = float(v)
    return log


def record_log(cursor, product_id, action_type, user_id=None, quantity=None,
               previous_stock=None, new_stock=None, details=None):
    """
    Record a product status/audit log entry with exact IST timestamp.
    Must be called with an active cursor inside a transaction.
    """
    now_str = get_ist_now()
    cursor.execute(
        """INSERT INTO product_logs (product_id, user_id, action_type, quantity,
                                    previous_stock, new_stock, details, created_at)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
        (product_id, user_id, action_type, quantity, previous_stock, new_stock, details, now_str),
    )


def get_product_logs(product_id, action_type=None, user_id=None, page=1, per_page=20):
    """
    Fetch chronological audit log history for a specific product.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = ["pl.product_id = %s"]
            params = [product_id]

            if action_type:
                conditions.append("pl.action_type = %s")
                params.append(action_type)
            if user_id:
                conditions.append("pl.user_id = %s")
                params.append(user_id)

            where = f"WHERE {' AND '.join(conditions)}"
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM product_logs pl {where}", params)
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT pl.*, p.name AS product_name, p.sku, p.image_url,
                           u.name AS user_name, u.email AS user_email,
                           u.role AS user_role, u.avatar_url AS user_avatar
                    FROM product_logs pl
                    LEFT JOIN products p ON pl.product_id = p.id
                    LEFT JOIN users u ON pl.user_id = u.id
                    {where}
                    ORDER BY pl.created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            logs = [_format_log(log) for log in cursor.fetchall()]
            return logs, total, None
    except Exception as e:
        return [], 0, str(e)
    finally:
        conn.close()


def get_all_logs(product_id=None, action_type=None, user_id=None,
                 search=None, date_from=None, date_to=None, page=1, per_page=20):
    """
    Fetch global audit logs with staff filter, action filter, date filter, etc.
    """
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if product_id:
                conditions.append("pl.product_id = %s")
                params.append(product_id)
            if action_type:
                conditions.append("pl.action_type = %s")
                params.append(action_type)
            if user_id:
                conditions.append("pl.user_id = %s")
                params.append(user_id)
            if search:
                conditions.append("(p.name LIKE %s OR p.sku LIKE %s OR u.name LIKE %s OR pl.details LIKE %s)")
                term = f"%{search}%"
                params.extend([term, term, term, term])
            if date_from:
                conditions.append("DATE(pl.created_at) >= %s")
                params.append(date_from)
            if date_to:
                conditions.append("DATE(pl.created_at) <= %s")
                params.append(date_to)

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(
                f"""SELECT COUNT(*) AS total FROM product_logs pl
                    LEFT JOIN products p ON pl.product_id = p.id
                    LEFT JOIN users u ON pl.user_id = u.id
                    {where}""",
                params,
            )
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT pl.*, p.name AS product_name, p.sku, p.image_url,
                           u.name AS user_name, u.email AS user_email,
                           u.role AS user_role, u.avatar_url AS user_avatar
                    FROM product_logs pl
                    LEFT JOIN products p ON pl.product_id = p.id
                    LEFT JOIN users u ON pl.user_id = u.id
                    {where}
                    ORDER BY pl.created_at DESC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            logs = [_format_log(log) for log in cursor.fetchall()]
            return logs, total, None
    except Exception as e:
        return [], 0, str(e)
    finally:
        conn.close()
