
import math
from datetime import datetime

# Each validate_* function returns (cleaned_values, error_message).
# Exactly one of the two is None.

MAX_ID = 2**63 - 1  # largest integer SQLite can store
MAX_BUDGET = 10**12


def parse_id(value):
    if not (value.isascii() and value.isdigit()):
        return None
    number = int(value)
    return number if 0 < number <= MAX_ID else None


def parse_date(value):
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None


def clean_text(data, key):
    value = data.get(key)
    return value.strip() if isinstance(value, str) else ""


def read_date(data, key, label):
    if not data.get(key):
        return None, f"{label} is required"

    parsed = parse_date(data[key])
    if parsed is None:
        return None, f"{label} must be a valid date (YYYY-MM-DD)"

    return parsed, None


def validate_trip(data):
    if not isinstance(data, dict):
        return None, "Request body must be a JSON object"

    name = clean_text(data, "name")
    if not name:
        return None, "Name is required"

    # Support both the new multiple-destination format and older
    # clients that send a single "destination" string.
    raw_destinations = data.get("destinations")

    if raw_destinations is None:
        raw_destinations = [data.get("destination", "")]

    if not isinstance(raw_destinations, list) or not raw_destinations:
        return None, "Destination is required"

    destinations = []

    for item in raw_destinations:
        if not isinstance(item, str):
            return None, "Each destination must be a non-empty string"

        cleaned_destination = item.strip()

        if not cleaned_destination:
            # Preserve the existing API error for a missing single destination.
            if len(raw_destinations) == 1:
                return None, "Destination is required"

            return None, "Each destination must be a non-empty string"

        destinations.append(cleaned_destination)

    # Keep the first destination in the legacy field for compatibility.
    destination = destinations[0]

    start_date, error = read_date(data, "start_date", "Start date")
    if error:
        return None, error

    end_date, error = read_date(data, "end_date", "End date")
    if error:
        return None, error

    if end_date < start_date:
        return None, "End date cannot be before start date"

    budget = data.get("budget")

    if budget in (None, ""):
        budget = 0

    if (
        isinstance(budget, bool)
        or not isinstance(budget, (int, float))
        or not math.isfinite(budget)
    ):
        return None, "Budget must be a number"

    if budget < 0:
        return None, "Budget cannot be negative"

    if budget > MAX_BUDGET:
        return None, "Budget is too large"

    trip = {
        "name": name,
        "destination": destination,
        "destinations": destinations,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "budget": budget,
        "description": clean_text(data, "description"),
    }

    return trip, None


def validate_activity(data, trip):
    if not isinstance(data, dict):
        return None, "Request body must be a JSON object"

    title = clean_text(data, "title")
    if not title:
        return None, "Title is required"

    activity_date, error = read_date(data, "date", "Date")
    if error:
        return None, error

    trip_start = parse_date(trip["start_date"])
    trip_end = parse_date(trip["end_date"])

    if not trip_start <= activity_date <= trip_end:
        return None, "Activity date must be within the trip dates"

    time = clean_text(data, "time")

    if time:
        try:
            time = datetime.strptime(time, "%H:%M").strftime("%H:%M")
        except ValueError:
            return None, "Time must be in HH:MM format"

    activity = {
        "title": title,
        "date": activity_date.isoformat(),
        "time": time,
        "location": clean_text(data, "location"),
        "notes": clean_text(data, "notes"),
    }

    return activity, None
