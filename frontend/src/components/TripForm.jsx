
import { useState } from "react";
import { Link } from "react-router-dom";

const emptyTrip = {
  name: "",
  destination: "",
  destinations: [""],
  start_date: "",
  end_date: "",
  budget: "",
  description: "",
};

const inputClass =
  "mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2";

export default function TripForm({
  initialTrip = emptyTrip,
  submitLabel,
  onSubmit,
  cancelTo,
}) {
  const [trip, setTrip] = useState(() => {
    const existingDestinations = Array.isArray(initialTrip.destinations)
      ? initialTrip.destinations
      : [];

    const destinations =
      existingDestinations.length > 0
        ? existingDestinations
        : [initialTrip.destination || ""];

    return {
      ...emptyTrip,
      ...initialTrip,
      destinations,
      destination: destinations[0] || "",
    };
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(event) {
    setTrip((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleDestinationChange(index, value) {
    setTrip((current) => {
      const destinations = [...current.destinations];
      destinations[index] = value;

      return {
        ...current,
        destinations,
        destination: destinations[0] || "",
      };
    });
  }

  function addDestination() {
    setTrip((current) => ({
      ...current,
      destinations: [...current.destinations, ""],
    }));
  }

  function removeDestination(index) {
    setTrip((current) => {
      const destinations = current.destinations.filter(
        (_, destinationIndex) => destinationIndex !== index,
      );

      return {
        ...current,
        destinations: destinations.length > 0 ? destinations : [""],
        destination:
          destinations.length > 0 ? destinations[0] : "",
      };
    });
  }

  function moveDestination(index, direction) {
    setTrip((current) => {
      const destinations = [...current.destinations];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= destinations.length) {
        return current;
      }

      [destinations[index], destinations[targetIndex]] = [
        destinations[targetIndex],
        destinations[index],
      ];

      return {
        ...current,
        destinations,
        destination: destinations[0] || "",
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const destinations = trip.destinations.map((destination) =>
      destination.trim(),
    );

    if (destinations.some((destination) => !destination)) {
      setError("Please fill in every destination or remove empty entries.");
      return;
    }

    setSaving(true);

    try {
      await onSubmit({
        ...trip,
        destination: destinations[0],
        destinations,
        budget: trip.budget === "" ? 0 : Number(trip.budget),
      });
    } catch (err) {
      setError(err.message || "Unable to save the trip.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p
          role="alert"
          className="rounded bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <label className="block text-sm font-medium">
        Trip name
        <input
          name="name"
          value={trip.name}
          onChange={handleChange}
          required
          className={inputClass}
        />
      </label>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Destinations</legend>

        <p className="text-sm text-gray-600">
          Add every place on your trip. Use the arrows to set the travel order.
        </p>

        {trip.destinations.map((destination, index) => (
          <div
            key={index}
            className="rounded border border-gray-200 p-3"
          >
            <label className="block text-sm font-medium">
              Destination {index + 1}
              <input
                name={`destination-${index}`}
                value={destination}
                onChange={(event) =>
                  handleDestinationChange(index, event.target.value)
                }
                required
                aria-label={index === 0 ? "Destination" : `Destination ${index + 1}`}
                className={inputClass}
                placeholder="e.g. Hyderabad"
              />
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveDestination(index, -1)}
                disabled={index === 0}
                aria-label={`Move destination ${index + 1} up`}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Move up
              </button>

              <button
                type="button"
                onClick={() => moveDestination(index, 1)}
                disabled={index === trip.destinations.length - 1}
                aria-label={`Move destination ${index + 1} down`}
                className="rounded border border-gray-300 px-3 py-1 text-sm disabled:opacity-40"
              >
                Move down
              </button>

              <button
                type="button"
                onClick={() => removeDestination(index)}
                disabled={trip.destinations.length === 1}
                aria-label={`Remove destination ${index + 1}`}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 disabled:opacity-40"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addDestination}
          className="rounded border border-blue-600 px-3 py-2 text-sm text-blue-700 hover:bg-blue-50"
        >
          + Add destination
        </button>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Start date
          <input
            type="date"
            name="start_date"
            value={trip.start_date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </label>

        <label className="block text-sm font-medium">
          End date
          <input
            type="date"
            name="end_date"
            value={trip.end_date}
            onChange={handleChange}
            min={trip.start_date}
            required
            className={inputClass}
          />
        </label>
      </div>

      <label className="block text-sm font-medium">
        Budget (₹)
        <input
          type="number"
          name="budget"
          value={trip.budget}
          onChange={handleChange}
          min="0"
          className={inputClass}
        />
      </label>

      <label className="block text-sm font-medium">
        Description
        <textarea
          name="description"
          value={trip.description}
          onChange={handleChange}
          rows="3"
          className={inputClass}
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : submitLabel}
        </button>

        <Link
          to={cancelTo}
          className="rounded border border-gray-300 px-4 py-2 text-sm"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
