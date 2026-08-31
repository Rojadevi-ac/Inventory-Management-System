from datetime import datetime, timezone, timedelta

# Indian Standard Time Zone (UTC+05:30)
IST = timezone(timedelta(hours=5, minutes=30))


def get_ist_now():
    """Returns current Indian Standard Time (IST, UTC+05:30) as YYYY-MM-DD HH:MM:SS string."""
    return datetime.now(IST).strftime("%Y-%m-%d %H:%M:%S")
