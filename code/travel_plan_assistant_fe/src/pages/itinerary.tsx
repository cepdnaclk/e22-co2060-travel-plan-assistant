import { useEffect, useState } from "react";
import { useLocation } from "react-router";
import { api } from "../axios";
import {
  MapPin,
  Navigation,
  ChevronDown,
  CalendarDays,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import DirectionsMap from "../components/DirectionsMap";
import { type ItineraryDestination, type RouteSegment } from "../data/itinerary-data";

export interface GeneratedTripSession {
  session_id: number;
  destinations: ItineraryDestination[];
  routeSegments?: RouteSegment[];
}

export function calculateTotalTripTime(routeSegments?: RouteSegment[]): string {
  if (!routeSegments || routeSegments.length === 0) return "0 mins";

  let totalMinutes = 0;
  let hasValidDuration = false;

  for (const seg of routeSegments) {
    if (!seg.duration || seg.duration === "Unknown") continue;

    let mins = 0;
    const hrMatch = seg.duration.match(/(\d+)\s*hr/i);
    const minMatch = seg.duration.match(/(\d+)\s*min/i);

    if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
    if (minMatch) mins += parseInt(minMatch[1], 10);

    if (hrMatch || minMatch) {
      totalMinutes += mins;
      hasValidDuration = true;
    }
  }

  if (!hasValidDuration) return "N/A";

  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  if (hrs > 0 && mins > 0) {
    return `${hrs} hr ${mins} mins`;
  } else if (hrs > 0) {
    return `${hrs} hr`;
  } else {
    return `${mins} mins`;
  }
}

export function Itinerary() {
  const location = useLocation();
  const warningMessage = location.state?.warning as string | undefined;

  const [trips, setTrips] = useState<GeneratedTripSession[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<GeneratedTripSession | null>(
    null,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeDestination, setActiveDestination] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function fetchGeneratedTrip() {
      try {
        const res = await api.post<GeneratedTripSession[]>("/api/itinerary");
        const tripList = Array.isArray(res.data) ? res.data : [];
        console.log(tripList);
        setTrips(tripList);
        if (tripList.length > 0) setSelectedTrip(tripList[0]);
      } catch (err) {
        console.error("Error fetching generated trip:", err);
      }
    }
    fetchGeneratedTrip();
  }, []);

  const handleTripSelect = (session_id: number) => {
    const found = trips.find((t) => t.session_id === session_id);
    if (found) {
      setSelectedTrip(found);
      setDropdownOpen(false);
      setActiveDestination(null);
    }
  };

  const handleDestinationClick = (dest: ItineraryDestination) => {
    setActiveDestination(dest.id || dest.destinationID?.toString() || null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {warningMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 shadow-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
          <p className="text-sm font-medium">{warningMessage}</p>
        </div>
      )}

      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          <Navigation className="w-4 h-4" />
          Interactive Route Map
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Your Travel Plan from {selectedTrip?.destinations[0]?.name || "Trip"}{" "}
          to{" "}
          {selectedTrip?.destinations[selectedTrip.destinations.length - 1]
            ?.name || "Destination"}
        </h1>
      </div>

      {/* TRIP SUMMARY STATS & DROPDOWN */}
      <div className="flex flex-col items-center gap-4">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-md">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Locations</p>
              <p className="text-lg font-bold text-gray-900">
                {selectedTrip?.destinations.length || 0}{" "}
                <span className="text-xs font-normal text-gray-500">
                  {selectedTrip?.destinations.length === 1 ? "location" : "locations"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/90 border border-gray-100 shadow-md">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Total Trip Time</p>
              <p className="text-lg font-bold text-gray-900">
                {calculateTotalTripTime(selectedTrip?.routeSegments)}
              </p>
            </div>
          </div>
        </div>

        {/* DROPDOWN */}
        <div className="relative w-full max-w-md">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/80 border shadow-lg hover:border-indigo-200 transition-colors"
          >
            <div className="text-left">
              <p className="font-bold text-sm">
                Trip #{selectedTrip?.session_id ?? "—"}{" "}
                {selectedTrip?.destinations[0]?.name && (
                  <span>
                    {selectedTrip.destinations[0].name} to{" "}
                    {
                      selectedTrip.destinations[
                        selectedTrip.destinations.length - 1
                      ].name
                    }
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-indigo-500" />
                  {selectedTrip?.destinations.length || 0} locations
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-purple-500" />
                  {calculateTotalTripTime(selectedTrip?.routeSegments)}
                </span>
              </p>
            </div>
            <ChevronDown
              className={`w-5 h-5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-50"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute z-60 w-full mt-2 bg-white rounded-xl shadow-xl border overflow-hidden">
                {trips.map((trip) => (
                  <button
                    key={trip.session_id}
                    onClick={() => handleTripSelect(trip.session_id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-sm">
                        Trip #{trip.session_id} - {trip.destinations[0]?.name} to{" "}
                        {trip.destinations[trip.destinations.length - 1]?.name}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
                        <span>{trip.destinations.length} locations</span>
                        <span>•</span>
                        <span>{calculateTotalTripTime(trip.routeSegments)}</span>
                      </p>
                    </div>
                    {selectedTrip?.session_id === trip.session_id && (
                      <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <section className="bg-white p-4 rounded-3xl shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold">Route Overview</h2>
        </div>
        {selectedTrip ? (
          <DirectionsMap
            destinations={selectedTrip.destinations}
            sessionId={selectedTrip.session_id}
          />
        ) : (
          <div className="h-96 bg-gray-50 flex items-center justify-center rounded-2xl border-2 border-dashed">
            <p className="text-gray-400">Select a trip to view the route</p>
          </div>
        )}
      </section>

      <section>
        <ItineraryTimeline
          activeId={activeDestination || undefined}
          onDestinationClick={handleDestinationClick}
          destinations={selectedTrip?.destinations || []}
          routeSegments={selectedTrip?.routeSegments || []}
        />
      </section>
    </div>
  );
}

