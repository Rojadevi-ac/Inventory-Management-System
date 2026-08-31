import zoneinfo
from flask import jsonify, request, g
from utils.timezone_helper import (
    SUPPORTED_TIMEZONES,
    get_configured_timezone,
    get_setting,
    get_timezone_details,
    set_setting,
)


def get_timezone_settings():
    tz_details = get_timezone_details()
    manual_datetime = get_setting("manual_datetime", None)

    return jsonify({
        "timezone": tz_details["iana"],
        "timezone_label": tz_details["label"],
        "utc_offset": tz_details["utc_offset"],
        "current_date": tz_details["current_date"],
        "current_time": tz_details["current_time"],
        "iso": tz_details["iso"],
        "manual_datetime": manual_datetime,
        "supported_timezones": SUPPORTED_TIMEZONES,
    }), 200


def update_timezone_settings():

    data = request.get_json() or {}
    tz_input = (data.get("timezone") or "").strip()
    manual_input = data.get("manual_datetime")

    if not tz_input:
        return jsonify({"error": "Timezone is required"}), 400

    # Validate IANA timezone
    try:
        zoneinfo.ZoneInfo(tz_input)
    except Exception:
        return jsonify({"error": f"Invalid IANA timezone: '{tz_input}'"}), 400

    # Save timezone
    success_tz = set_setting("timezone", tz_input)

    # Save optional manual datetime (or clear if null/empty string)
    if manual_input is not None:
        if manual_input == "" or manual_input is False:
            set_setting("manual_datetime", None)
        else:
            set_setting("manual_datetime", str(manual_input).strip())

    if not success_tz:
        return jsonify({"error": "Failed to save timezone configuration"}), 500

    tz_details = get_timezone_details(tz_input)
    return jsonify({
        "message": "Global timezone configuration updated successfully",
        "timezone": tz_details["iana"],
        "timezone_label": tz_details["label"],
        "utc_offset": tz_details["utc_offset"],
        "current_date": tz_details["current_date"],
        "current_time": tz_details["current_time"],
        "manual_datetime": get_setting("manual_datetime", None),
    }), 200


def get_current_time():
    tz_details = get_timezone_details()
    return jsonify({
        "timezone": tz_details["iana"],
        "utc_offset": tz_details["utc_offset"],
        "current_date": tz_details["current_date"],
        "current_time": tz_details["current_time"],
        "iso": tz_details["iso"],
    }), 200
