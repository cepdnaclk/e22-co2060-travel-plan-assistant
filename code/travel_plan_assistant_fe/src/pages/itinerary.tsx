import { useEffect, useState } from "react";
import { api } from "../axios";
import {
  MapPin,
  Navigation,
  ChevronDown,
  CalendarDays,
  Check,
  CloudCog,
} from "lucide-react";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import DirectionsMap from "../components/DirectionsMap";
import { type ItineraryDestination, type RouteSegment } from "../data/itinerary-data";

export interface GeneratedTripSession {
  session_id: number;
  destinations: ItineraryDestination[];
  routeSegments?: RouteSegment[];
}

export function Itinerary() {
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

      {/* DROPDOWN */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <button
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl bg-white/80 border shadow-lg"
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
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {selectedTrip?.destinations.length || 0} destinations
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
              <div className="absolute z-60 w-full mt-2 bg-white rounded-xl shadow-xl border">
                {trips.map((trip) => (
                  <button
                    key={trip.session_id}
                    onClick={() => handleTripSelect(trip.session_id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <p className="font-semibold text-sm">
                      Trip #{trip.session_id} - {trip.destinations[0]?.name}
                    </p>
                    {selectedTrip?.session_id === trip.session_id && (
                      <Check className="w-4 h-4 text-indigo-600" />
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
