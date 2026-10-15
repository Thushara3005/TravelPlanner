import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTrips } from "../services/api.js";
import { formatBudget, formatDate } from "../format.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const limit = 10;

  useEffect(() => {
    let ignore = false;

    setLoading(true);

    getTrips({ search, status, page, limit })
      .then((data) => {
        if (ignore) return;

        setTrips(data.trips);
        setTotalPages(data.total_pages);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        if (ignore) return;

        setError(err.message);
        setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [search, status, page]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Trips</h1>

        <Link
          to="/trips/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Add Trip
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          placeholder="Search by name or destination"
          aria-label="Search trips"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          className="w-full rounded border border-gray-300 bg-white px-3 py-2"
        />

        <select
          aria-label="Filter by status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="rounded border border-gray-300 bg-white px-3 py-2"
        >
          <option value="">All trips</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-gray-500">Loading...</p>}

      {!loading && !error && trips.length === 0 && (
        <p className="text-gray-500">No trips found.</p>
      )}

      {!loading && !error && trips.length > 0 && (
        <>
          <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  to={`/trips/${trip.id}`}
                  className="flex flex-col gap-2 p-4 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{trip.name}</p>
                    <p className="text-sm text-gray-600">
                      {trip.destination}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      {formatDate(trip.start_date)} –{" "}
                      {formatDate(trip.end_date)}
                    </span>
                    <span>{formatBudget(trip.budget)}</span>
                    <StatusBadge status={trip.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPage((current) => current - 1)}
              disabled={page <= 1}
              className="rounded border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={page >= totalPages}
              className="rounded border border-gray-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
