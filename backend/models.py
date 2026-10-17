from datetime import date

from database import get_db

TRIP_STATUSES = ("upcoming", "ongoing", "completed")


def get_trip_status(start_date, end_date):
    today = date.today().isoformat()
    if today < start_date:
        return "upcoming"
    if today > end_date:
        return "completed"
    return "ongoing"


def trip_to_dict(row):
    trip = dict(row)
    db = get_db()

    destinations = db.execute(
        """
        SELECT destination
        FROM trip_destinations
        WHERE trip_id = ?
        ORDER BY position, id
        """,
        (trip["id"],),
    ).fetchall()

    trip["destinations"] = [row["destination"] for row in destinations]

    # Keep the legacy field available for existing clients.
    if trip["destinations"]:
        trip["destination"] = trip["destinations"][0]

    trip["status"] = get_trip_status(trip["start_date"], trip["end_date"])
    return trip


def find_trip(trip_id):
    return get_db().execute(
        "SELECT * FROM trips WHERE id = ?", (trip_id,)
    ).fetchone()


def find_activity(activity_id):
    return get_db().execute(
        "SELECT * FROM activities WHERE id = ?", (activity_id,)
    ).fetchone()