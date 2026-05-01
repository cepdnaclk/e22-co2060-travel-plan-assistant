import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { MapPin, Navigation, Sparkles, ChevronDown, CalendarDays, Check } from "lucide-react";
import { SriLankaMap } from "../components/SriLankaMap";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import { mockTrips, getTripById } from "../data/trips-data";
import {
  itineraryDestinations,
  routeSegments,
  type ItineraryDestination,
  type RouteSegment,
} from "../data/itinerary-data";

interface GeneratedTripState {
  generatedTrip?: {
    destinations?: ItineraryDestination[];
    routeSegments?: RouteSegment[];
    metadata?: {
      backend?: {
        totalDistance?: string;
        totalTime?: string;
      };
    };
  };
}

export function Itinerary() {
  const { tripId } = useParams<{ tripId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as GeneratedTripState | null;

  // Resolve the active trip: URL param → default (nearest upcoming)
  const initialTrip = getTripById(tripId);
  const [selectedTripId, setSelectedTripId] = useState(initialTrip.id);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Sync state when the URL changes (handles navbar navigation & back/forward)
  useEffect(() => {
    const resolved = getTripById(tripId);
    setSelectedTripId(resolved.id);
    setActiveDestination(undefined);
  }, [location.pathname]);

  const selectedTrip = getTripById(selectedTripId);

  // Use generated destinations if available, otherwise use default
  const selectedDestinations =
    state?.generatedTrip?.destinations && state.generatedTrip.destinations.length > 0
      ? state.generatedTrip.destinations
      : itineraryDestinations;

  const selectedRouteSegments =
    state?.generatedTrip?.routeSegments && state.generatedTrip.routeSegments.length > 0
      ? state.generatedTrip.routeSegments
      : routeSegments;

  const tripStats = state?.generatedTrip?.metadata?.backend;

  const [activeDestination, setActiveDestination] = useState<string | undefined>(undefined);

  const handleDestinationClick = (dest: ItineraryDestination) => {
    setActiveDestination((prev) => (prev === dest.id ? undefined : dest.id));
  };

  const handleTripSelect = (id: string) => {
    setSelectedTripId(id);
    setDropdownOpen(false);
    setActiveDestination(undefined);
    // Update URL to reflect the new trip
    navigate(`/itinerary/${id}`, { replace: true });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          <Navigation className="w-4 h-4" />
          Interactive Route Map
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Your {selectedTrip.title} Itinerary
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore your personalized travel route across the island. Click on any destination to highlight it on both the map and timeline.
        </p>
        {tripStats && (
          <p className="text-sm text-indigo-600 font-medium">
            Total Distance: {tripStats.totalDistance ?? "N/A"} km · Total Time: {tripStats.totalTime ?? "N/A"} hours
          </p>
        )}
      </div>

      {/* Trip Selector Dropdown */}
      <div className="flex justify-center">
        <div className="relative w-full max-w-md">
          <button
            type="button"
            id="trip-selector-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="w-full flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex-shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {selectedTrip.title}
                </p>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {selectedTrip.dates}
                </p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                dropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown panel */}
          {dropdownOpen && (
            <>
              {/* Backdrop to close on outside click */}
              <div
                className="fixed inset-0 z-[1100]"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-2 z-[1101] bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 space-y-1">
                  {mockTrips.map((trip) => {
                    const isSelected = trip.id === selectedTripId;
                    return (
                      <button
                        key={trip.id}
                        type="button"
                        onClick={() => handleTripSelect(trip.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Trip icon */}
                        <div className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 shadow-sm ${
                          isSelected
                            ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                            : "bg-gradient-to-br from-indigo-400 to-purple-500"
                        }`}>
                          <MapPin className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isSelected ? "text-indigo-700" : "text-gray-800"
                            }`}
                          >
                            {trip.title}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {trip.dates} · {trip.duration}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 flex-shrink-0">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Interactive Map Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">Route Overview</h2>
        </div>
        <SriLankaMap
          activeId={activeDestination}
          onDestinationClick={handleDestinationClick}
          destinations={selectedDestinations}
          routeSegments={selectedRouteSegments}
        />
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
            Suggested Stops
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      </div>

      {/* Timeline Section */}
      <section>
        <ItineraryTimeline
          activeId={activeDestination}
          onDestinationClick={handleDestinationClick}
          destinations={selectedDestinations}
          routeSegments={selectedRouteSegments}
        />
      </section>
    </div>
  );
}