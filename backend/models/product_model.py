import random
import re


def generate_sku(category, name, size):
    """
    Generates a short, human-readable SKU.
    Format: CAT3-NAME4-SZ3-NNNN
    Example: APR-JEAN-MED-4823  or  CLO-SHRT-XL-7291
    """
    cat = re.sub(r"[^A-Za-z0-9]", "", category.upper())[:3] or "CAT"
    nm = re.sub(r"[^A-Za-z0-9]", "", name.upper())[:4] or "PRD"
    sz = re.sub(r"[^A-Za-z0-9]", "", size.upper())[:3] or "STD"
    rand = random.randint(1000, 9999)
    return f"{cat}-{nm}-{sz}-{rand}"


def sku_exists(cursor, sku, exclude_id=None):
    if exclude_id:
        cursor.execute("SELECT id FROM products WHERE sku = %s AND id != %s", (sku, exclude_id))
    else:
        cursor.execute("SELECT id FROM products WHERE sku = %s", (sku,))
    return cursor.fetchone() is not None

