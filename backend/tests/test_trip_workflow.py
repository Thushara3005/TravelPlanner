
def test_complete_trip_workflow(client):
    # 1. Create a trip.
    trip_response = client.post(
        "/api/trips",
        json={
            "name": "Integration Test Trip",
            "destination": "Goa",
            "start_date": "2026-11-10",
            "end_date": "2026-11-14",
            "budget": 20000,
            "description": "Trip workflow integration test",
        },
    )
    assert trip_response.status_code == 201
    trip = trip_response.get_json()
    trip_id = trip["id"]

    # 2. Retrieve the created trip.
    response = client.get(f"/api/trips/{trip_id}")
    assert response.status_code == 200
    assert response.get_json()["name"] == "Integration Test Trip"

    # 3. Add an activity.
    activities_url = f"/api/trips/{trip_id}/activities"
    activity_response = client.post(
        activities_url,
        json={
            "title": "Visit Baga Beach",
            "date": "2026-11-10",
            "time": "10:00",
            "location": "Baga Beach",
            "notes": "Morning visit",
        },
    )
    assert activity_response.status_code == 201
    activity = activity_response.get_json()
    activity_id = activity["id"]
    assert activity["trip_id"] == trip_id

    # 4. Retrieve the trip activities.
    response = client.get(activities_url)
    assert response.status_code == 200
    activities = response.get_json()
    assert len(activities) == 1
    assert activities[0]["id"] == activity_id

    # 5. Update the activity and verify persistence.
    response = client.put(
        f"/api/activities/{activity_id}",
        json={
            "title": "Sunset at Baga Beach",
            "date": "2026-11-12",
            "time": "17:30",
            "location": "Baga Beach",
            "notes": "Watch the sunset",
        },
    )
    assert response.status_code == 200
    assert response.get_json()["title"] == "Sunset at Baga Beach"

    response = client.get(activities_url)
    assert response.status_code == 200
    assert response.get_json()[0]["date"] == "2026-11-12"

    # 6. Update the trip and verify persistence.
    response = client.put(
        f"/api/trips/{trip_id}",
        json={
            "name": "Updated Goa Trip",
            "destination": "North Goa",
            "start_date": "2026-11-10",
            "end_date": "2026-11-14",
            "budget": 25000,
            "description": "Updated integration test trip",
        },
    )
    assert response.status_code == 200
    assert response.get_json()["name"] == "Updated Goa Trip"

    response = client.get(f"/api/trips/{trip_id}")
    assert response.status_code == 200
    assert response.get_json()["destination"] == "North Goa"
    assert response.get_json()["budget"] == 25000

    # 7. Delete the activity.
    response = client.delete(f"/api/activities/{activity_id}")
    assert response.status_code == 200

    response = client.get(activities_url)
    assert response.status_code == 200
    assert response.get_json() == []

    # 8. Delete the trip.
    response = client.delete(f"/api/trips/{trip_id}")
    assert response.status_code == 200

    # 9. Verify the trip no longer exists.
    response = client.get(f"/api/trips/{trip_id}")
    assert response.status_code == 404
    assert response.get_json() == {"error": "Trip not found"}
