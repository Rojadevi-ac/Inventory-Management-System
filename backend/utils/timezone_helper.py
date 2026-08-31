import zoneinfo
from datetime import datetime, timezone, timedelta
from config.db import get_connection

SUPPORTED_TIMEZONES = [
    {"iana": "Asia/Kolkata", "label": "India Standard Time (Asia/Kolkata)"},
    {"iana": "Asia/Dubai", "label": "Gulf Standard Time (Asia/Dubai)"},
    {"iana": "Asia/Singapore", "label": "Singapore Time (Asia/Singapore)"},
    {"iana": "Asia/Tokyo", "label": "Japan Standard Time (Asia/Tokyo)"},
    {"iana": "Asia/Hong_Kong", "label": "Hong Kong Time (Asia/Hong_Kong)"},
    {"iana": "Asia/Riyadh", "label": "Arabia Standard Time (Asia/Riyadh)"},
    {"iana": "Europe/London", "label": "Greenwich Mean / British Time (Europe/London)"},
    {"iana": "Europe/Paris", "label": "Central European Time (Europe/Paris)"},
    {"iana": "Europe/Berlin", "label": "Central European Time (Europe/Berlin)"},
    {"iana": "America/New_York", "label": "Eastern Time (America/New_York)"},
    {"iana": "America/Chicago", "label": "Central Time (America/Chicago)"},
    {"iana": "America/Denver", "label": "Mountain Time (America/Denver)"},
    {"iana": "America/Los_Angeles", "label": "Pacific Time (America/Los_Angeles)"},
    {"iana": "Australia/Sydney", "label": "Australian Eastern Time (Australia/Sydney)"},
    {"iana": "Pacific/Auckland", "label": "New Zealand Time (Pacific/Auckland)"},
    {"iana": "UTC", "label": "Coordinated Universal Time (UTC)"},
]


def get_setting(key, default=None):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT setting_value FROM system_settings WHERE setting_key = %s", (key,))
            row = cursor.fetchone()
            return row["setting_value"] if row else default
    except Exception:
        return default
    finally:
        conn.close()


def set_setting(key, value):
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                """INSERT INTO system_settings (setting_key, setting_value)
                   VALUES (%s, %s)
                   ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)""",
                (key, value if value is not None else None),
            )
            conn.commit()
            return True
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()


def get_configured_timezone():
    tz_str = get_setting("timezone", "Asia/Kolkata")
    try:
        zoneinfo.ZoneInfo(tz_str)
        return tz_str
    except Exception:
        return "Asia/Kolkata"


def get_timezone_details(tz_str=None):
    if not tz_str:
        tz_str = get_configured_timezone()

    try:
        tz = zoneinfo.ZoneInfo(tz_str)
    except Exception:
        tz_str = "Asia/Kolkata"
        tz = zoneinfo.ZoneInfo(tz_str)

    now = datetime.now(tz)
    offset = now.utcoffset()
    total_seconds = int(offset.total_seconds()) if offset else 0
    sign = "+" if total_seconds >= 0 else "-"
    total_seconds = abs(total_seconds)
    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    offset_str = f"UTC{sign}{hours:02d}:{minutes:02d}"

    # Match label from list if available
    matched = next((item for item in SUPPORTED_TIMEZONES if item["iana"] == tz_str), None)
    label = matched["label"] if matched else f"{tz_str} ({offset_str})"

    return {
        "iana": tz_str,
        "label": label,
        "utc_offset": offset_str,
        "current_date": now.strftime("%d %b %Y"),
        "current_time": now.strftime("%I:%M:%S %p"),
        "iso": now.isoformat(),
    }


def get_ist_now():
    """Returns current ISO formatted time for database insertion."""
    tz_str = get_configured_timezone()
    try:
        tz = zoneinfo.ZoneInfo(tz_str)
    except Exception:
        tz = zoneinfo.ZoneInfo("Asia/Kolkata")
    return datetime.now(tz).strftime("%Y-%m-%d %H:%M:%S")
