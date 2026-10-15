async function request(method, url, body) {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "Something went wrong");
  }
  return data;
}


export function getTrips({
  search = "",
  status = "",
  page,
  limit,
} = {}) {
  const params = new URLSearchParams();

  if (search) params.set("search", search);
  if (status) params.set("status", status);

  if (page !== undefined) params.set("page", String(page));
  if (limit !== undefined) params.set("limit", String(limit));

  return request("GET", `/api/trips?${params}`);
}


export function getTrip(id) {
  return request("GET", `/api/trips/${id}`);
}

export function createTrip(trip) {
  return request("POST", "/api/trips", trip);
}

export function updateTrip(id, trip) {
  return request("PUT", `/api/trips/${id}`, trip);
}

export function deleteTrip(id) {
  return request("DELETE", `/api/trips/${id}`);
}

export function getActivities(tripId) {
  return request("GET", `/api/trips/${tripId}/activities`);
}

export function createActivity(tripId, activity) {
  return request("POST", `/api/trips/${tripId}/activities`, activity);
}

export function updateActivity(id, activity) {
  return request("PUT", `/api/activities/${id}`, activity);
}

export function deleteActivity(id) {
  return request("DELETE", `/api/activities/${id}`);
}
