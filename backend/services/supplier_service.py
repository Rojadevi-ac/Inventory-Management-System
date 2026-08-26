from datetime import datetime, date
from config.db import get_connection


def _format_supplier(s):
    if not s:
        return s
    for k, v in list(s.items()):
        if isinstance(v, (datetime, date)) or hasattr(v, "isoformat"):
            s[k] = v.isoformat()
        elif hasattr(v, "as_tuple"):
            s[k] = float(v)
    return s


def get_suppliers(search=None, page=1, per_page=50):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            conditions = []
            params = []

            if search:
                conditions.append("(s.name LIKE %s OR s.contact_person LIKE %s)")
                term = f"%{search}%"
                params.extend([term, term])

            where = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            offset = (page - 1) * per_page

            cursor.execute(f"SELECT COUNT(*) AS total FROM suppliers s {where}", params)
            total = int(cursor.fetchone()["total"])

            cursor.execute(
                f"""SELECT * FROM suppliers s {where}
                    ORDER BY s.name ASC
                    LIMIT %s OFFSET %s""",
                params + [per_page, offset],
            )
            suppliers = [_format_supplier(s) for s in cursor.fetchall()]
            return suppliers, total, None
    except Exception as e:
        return [], 0, str(e)
    finally:
        conn.close()


def get_supplier_by_id(supplier_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
            return _format_supplier(cursor.fetchone())
    finally:
        conn.close()


def create_supplier(name, contact_person, phone, email, address, started_at, logo_url=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO suppliers (name, contact_person, phone, email, address, started_at, logo_url)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (name, contact_person, phone, email, address, started_at, logo_url),
            )
            supplier_id = cursor.lastrowid
            conn.commit()
            return supplier_id, None
    except Exception as e:
        conn.rollback()
        return None, str(e)
    finally:
        conn.close()


def update_supplier(supplier_id, name, contact_person, phone, email, address, started_at, logo_url=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM suppliers WHERE id = %s", (supplier_id,))
            sup = cursor.fetchone()
            if not sup:
                return False, "Supplier not found"

            new_logo = logo_url if logo_url is not None else sup.get("logo_url")

            cursor.execute(
                """UPDATE suppliers
                   SET name=%s, contact_person=%s, phone=%s, email=%s, address=%s, started_at=%s, logo_url=%s
                   WHERE id=%s""",
                (name, contact_person, phone, email, address, started_at, new_logo, supplier_id),
            )
            conn.commit()
            return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        conn.close()


def delete_supplier(supplier_id):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM suppliers WHERE id = %s", (supplier_id,))
            if not cursor.fetchone():
                return False, "Supplier not found"
            cursor.execute("DELETE FROM suppliers WHERE id = %s", (supplier_id,))
            conn.commit()
            return True, None
    except Exception as e:
        conn.rollback()
        return False, str(e)
    finally:
        conn.close()
