import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Utensils,
  Hotel,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { api } from "../axios";
import {
  type ItineraryDestination,
  type RouteSegment,
  type ItineraryMilestone,
  type MilestonePlace,
  categoryColors,
} from "../data/itinerary-data";

interface ItineraryTimelineProps {
  sessionId?: number;
  activeId?: string;
  onDestinationClick?: (dest: ItineraryDestination) => void;
  destinations?: ItineraryDestination[];
  routeSegments?: RouteSegment[];
  startTime?: string;
  endTime?: string;
  milestones?: ItineraryMilestone[];
  onMilestoneUpdated?: (milestone: ItineraryMilestone) => void;
}

// Helper to convert "HH:MM" into minutes from midnight
function parseTimeToMinutes(timeStr?: string, defaultMinutes = 510): number {
  if (!timeStr) return defaultMinutes;
  const [hh, mm] = timeStr.split(":").map(Number);
  if (isNaN(hh)) return defaultMinutes;
  return hh * 60 + (isNaN(mm) ? 0 : mm);
}

// Helper to format minutes from midnight to "hh:mm AM/PM"
function formatMinutesToTime(totalMins: number): string {
  const normMins = ((Math.floor(totalMins) % 1440) + 1440) % 1440;
  const hours24 = Math.floor(normMins / 60);
  const mins = normMins % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minsPadded = mins < 10 ? `0${mins}` : mins;
  return `${hours12}:${minsPadded} ${period}`;
}

// Parse "X hr Y mins" into minutes
function parseDurationMinutes(durationStr?: string): number {
  if (!durationStr || durationStr === "Unknown") return 45; // default travel
  let mins = 0;
  const hrMatch = durationStr.match(/(\d+)\s*hr/i);
  const minMatch = durationStr.match(/(\d+)\s*min/i);
  if (hrMatch) mins += parseInt(hrMatch[1], 10) * 60;
  if (minMatch) mins += parseInt(minMatch[1], 10);
  return mins > 0 ? mins : 45;
}

export function ItineraryTimeline({
  sessionId,
  activeId,
  onDestinationClick,
  destinations = [],
  routeSegments = [],
  startTime = "08:30",
  endTime = "20:00",
  milestones = [],
  onMilestoneUpdated,
}: ItineraryTimelineProps) {
  const [expandedLunch, setExpandedLunch] = useState(false);
  const [expandedDinner, setExpandedDinner] = useState(false);
  const [expandedHotel, setExpandedHotel] = useState(false);
  const [nearbyRestaurants, setNearbyRestaurants] = useState<MilestonePlace[]>([]);
  const [nearbyDinnerRestaurants, setNearbyDinnerRestaurants] = useState<MilestonePlace[]>([]);
  const [nearbyHotels, setNearbyHotels] = useState<MilestonePlace[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [loadingDinnerRestaurants, setLoadingDinnerRestaurants] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(false);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Formatted destination list
  const formattedDestinations: ItineraryDestination[] = destinations.map(
    (dest, index) => ({
      ...dest,
      id: dest.id || dest.destinationID?.toString() || `dest-${index}`,
      description: dest.description || "No description available.",
      category:
        dest.category || (dest.tag && dest.tag[0]) || "Point of Interest",
      highlights: dest.highlights || dest.tag || [],
      day: dest.day || 1,
      district_name: dest.district_name || "Sri Lanka",
    })
  );

  const getRouteFromPrev = (destId: string): RouteSegment | undefined =>
    routeSegments.find((r) => r.to === destId);

  // Time calculations along the route
  const startMins = parseTimeToMinutes(startTime, 510);
  let currentMins = startMins;

  // Determine timetable for destinations
  const timeSchedule = formattedDestinations.map((dest, idx) => {
    if (idx > 0) {
      const prevRoute = getRouteFromPrev(dest.id);
      currentMins += parseDurationMinutes(prevRoute?.duration);
    }
    const arrivalMins = currentMins;
    const visitDuration = 90; // 1.5 hours per attraction
    currentMins += visitDuration;
    const departureMins = currentMins;

    return {
      arrival: formatMinutesToTime(arrivalMins),
      departure: formatMinutesToTime(departureMins),
      arrivalMins,
      departureMins,
    };
  });

  // Decide after which destination index the Lunch stop triggers
  // (Either closest to 12:30 PM (750 mins) or middle stop)
  let lunchStopIndex = 0;
  if (formattedDestinations.length > 1) {
    const middayMins = 750; // 12:30 PM
    let minDiff = Infinity;
    timeSchedule.forEach((sched, idx) => {
      const diff = Math.abs(sched.departureMins - middayMins);
      if (diff < minDiff && idx < formattedDestinations.length - 1) {
        minDiff = diff;
        lunchStopIndex = idx;
      }
    });
  }

  // Target coordinates for Lunch (near the midday stop)
  const lunchRefDest = formattedDestinations[lunchStopIndex];
  // Target coordinates for Dinner & Hotel (near the final stop of the day)
  const dinnerRefDest = formattedDestinations[formattedDestinations.length - 1];
  const hotelRefDest = formattedDestinations[formattedDestinations.length - 1];

  // Existing milestone decisions
  const lunchMilestone = milestones.find((m) => m.type === "lunch");
  const dinnerMilestone = milestones.find((m) => m.type === "dinner");
  const hotelMilestone = milestones.find((m) => m.type === "overnight");

  // Load nearby restaurants when lunch prompt is expanded
  useEffect(() => {
    if (expandedLunch && lunchRefDest?.lat && lunchRefDest?.lng) {
      const fetchRestaurants = async () => {
        try {
          setLoadingRestaurants(true);
          const res = await api.get<MilestonePlace[]>("/api/restaurants/nearby", {
            params: {
              lat: lunchRefDest.lat,
              lng: lunchRefDest.lng,
              radius: 20,
              limit: 4,
            },
          });
          setNearbyRestaurants(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error loading nearby restaurants:", err);
        } finally {
          setLoadingRestaurants(false);
        }
      };
      fetchRestaurants();
    }
  }, [expandedLunch, lunchRefDest?.lat, lunchRefDest?.lng]);

  // Load nearby hotels when hotel prompt is expanded
  useEffect(() => {
    if (expandedHotel && hotelRefDest?.lat && hotelRefDest?.lng) {
      const fetchHotels = async () => {
        try {
          setLoadingHotels(true);
          const res = await api.get<MilestonePlace[]>("/api/hotels/nearby", {
            params: {
              lat: hotelRefDest.lat,
              lng: hotelRefDest.lng,
              radius: 25,
              limit: 4,
            },
          });
          setNearbyHotels(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error loading nearby hotels:", err);
        } finally {
          setLoadingHotels(false);
        }
      };
      fetchHotels();
    }
  }, [expandedHotel, hotelRefDest?.lat, hotelRefDest?.lng]);

  // Load nearby restaurants when dinner prompt is expanded
  useEffect(() => {
    if (expandedDinner && dinnerRefDest?.lat && dinnerRefDest?.lng) {
      const fetchDinner = async () => {
        try {
          setLoadingDinnerRestaurants(true);
          const res = await api.get<MilestonePlace[]>("/api/restaurants/nearby", {
            params: {
              lat: dinnerRefDest.lat,
              lng: dinnerRefDest.lng,
              radius: 20,
              limit: 4,
            },
          });
          setNearbyDinnerRestaurants(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
          console.error("Error loading nearby dinner restaurants:", err);
        } finally {
          setLoadingDinnerRestaurants(false);
        }
      };
      fetchDinner();
    }
  }, [expandedDinner, dinnerRefDest?.lat, dinnerRefDest?.lng]);

  // Handler to persist milestone
  const handleSelectMilestone = async (
    type: "lunch" | "dinner" | "overnight",
    placeId: number | null,
    status: "selected" | "ignored"
  ) => {
    if (!sessionId) return;
    try {
      const res = await api.put<{ success: boolean; milestone: ItineraryMilestone }>(
        `/api/itinerary/${sessionId}/milestone`,
        {
          type,
          day: 1,
          placeId,
          status,
        }
      );
      if (res.data?.milestone) {
        onMilestoneUpdated?.(res.data.milestone);
      }
      if (type === "lunch") setExpandedLunch(false);
      if (type === "dinner") setExpandedDinner(false);
      if (type === "overnight") setExpandedHotel(false);
    } catch (err) {
      console.error(`Failed to save ${type} milestone:`, err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Trip Itinerary & Daily Schedule
            </h2>
            <p className="text-sm text-gray-500">
              Personalized timeline with lunch stops and overnight accommodations
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-semibold px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>Day: {startTime} – {endTime}</span>
        </div>
      </div>

      <div className="relative">
        {formattedDestinations.map((dest, index) => {
          const isActive = activeId === dest.id;
          const colors = categoryColors[dest.category] ?? {
            bg: "bg-gray-50",
            text: "text-gray-700",
            dot: "#6b7280",
          };
          const routeFromPrev = getRouteFromPrev(dest.id);
          const schedule = timeSchedule[index];
          const isLunchPoint = index === lunchStopIndex;
          const isLastDestination = index === formattedDestinations.length - 1;

          return (
            <div key={dest.id}>
              {/* Route segment connection */}
              {routeFromPrev && (
                <div className="flex items-stretch ml-5">
                  <div className="w-px bg-gradient-to-b from-indigo-200 to-purple-200 relative shrink-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-dashed border-indigo-300 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                  <div className="ml-6 my-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/60 border border-indigo-100">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700">
                      {routeFromPrev.duration}
                    </span>
                    <span className="text-xs text-indigo-500">
                      • {routeFromPrev.distance}
                    </span>
                  </div>
                </div>
              )}

              {/* Destination Timeline Node */}
              <div className="flex items-stretch gap-0">
                <div className="flex flex-col items-center shrink-0 w-10 self-stretch">
                  <div
                    className={`flex-1 w-px ${index === 0 ? "bg-transparent" : "bg-indigo-200"}`}
                  />
                  <div
                    className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] shadow-lg transition-all"
                    style={{
                      borderColor: colors.dot,
                      backgroundColor: isActive ? colors.dot : "white",
                    }}
                  >
                    <span
                      className="text-xs font-bold"
                      style={{ color: isActive ? "white" : colors.dot }}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>
                  </div>
                  <div className="flex-1 w-px bg-indigo-200" />
                </div>

                <div className="flex-1 ml-4 mb-4">
                  <Card
                    className={`overflow-hidden transition-all cursor-pointer group border-2 ${
                      isActive
                        ? "ring-2 shadow-xl"
                        : "shadow-sm hover:shadow-md border-gray-100"
                    }`}
                    style={{
                      borderColor: isActive ? colors.dot : "transparent",
                    }}
                    onClick={() => onDestinationClick?.(dest)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-44 h-36 overflow-hidden shrink-0 bg-gray-100">
                        <img
                          src={`${apiBaseUrl}/public/destinations/${dest.display_picture}`}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-1 p-4 space-y-2 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg group-hover:text-indigo-600 transition-colors">
                                {dest.name}
                              </h3>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                <MapPin
                                  className="w-3 h-3"
                                  style={{ color: colors.dot }}
                                />
                                {dest.district_name}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                className={`${colors.bg} ${colors.text} border-0 text-xs font-semibold`}
                              >
                                {dest.category}
                              </Badge>
                              {schedule && (
                                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                  {schedule.arrival} – {schedule.departure}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                            {dest.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* ========================================================= */}
              {/* LUNCH MILESTONE PROMPT OR CONFIRMED STOP */}
              {/* ========================================================= */}
              {isLunchPoint && (
                <div className="flex items-stretch gap-0 my-3">
                  <div className="flex flex-col items-center shrink-0 w-10 self-stretch">
                    <div className="flex-1 w-px bg-amber-300" />
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-amber-500 bg-amber-50 shadow-md">
                      <Utensils className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1 w-px bg-indigo-200" />
                  </div>

                  <div className="flex-1 ml-4 mb-4">
                    {/* CASE 1: LUNCH CHOSEN */}
                    {lunchMilestone?.status === "selected" && lunchMilestone.place ? (
                      <Card className="overflow-hidden border-2 border-amber-300 bg-gradient-to-r from-amber-50/50 to-orange-50/30 p-4 shadow-md rounded-2xl">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-amber-100">
                            <img
                              src={
                                lunchMilestone.place.display_picture
                                  ? `${apiBaseUrl}/public/restaurants/${lunchMilestone.place.display_picture}`
                                  : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400"
                              }
                              alt={lunchMilestone.place.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <Badge className="bg-amber-600 text-white text-[11px] font-bold">
                                  🍽️ Confirmed Lunch Stop (~12:30 PM)
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => setExpandedLunch((p) => !p)}
                                  className="text-xs text-amber-700 hover:underline font-semibold"
                                >
                                  Change
                                </button>
                              </div>
                              <h4 className="text-base font-bold text-gray-900 mt-1">
                                {lunchMilestone.place.name}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-amber-600" />
                                {lunchMilestone.place.address || lunchRefDest?.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                  ★ {lunchMilestone.place.rating || "4.5"}
                                </span>
                                <span>•</span>
                                <span>{lunchMilestone.place.cuisine_type || "Sri Lankan"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : lunchMilestone?.status === "ignored" ? (
                      /* CASE 2: LUNCH SKIPPED */
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-gray-400" />
                          <span>Lunch stop skipped near {lunchRefDest?.name}</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedLunch(true)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold h-7"
                        >
                          Pick a restaurant
                        </Button>
                      </div>
                    ) : (
                      /* CASE 3: LUNCH PENDING PROMPT */
                      <Card className="overflow-hidden border-2 border-dashed border-amber-400 bg-amber-50/40 p-4 rounded-2xl shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-semibold">
                                🍽️ Midday Milestone
                              </Badge>
                              <span className="text-xs text-gray-500 font-semibold">
                                ~12:30 PM (Midday)
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Time for lunch near {lunchRefDest?.name}!
                            </h4>
                            <p className="text-xs text-gray-600">
                              Choose a top-rated dining spot along your route or skip to continue.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => setExpandedLunch((prev) => !prev)}
                              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl h-9"
                            >
                              <Utensils className="w-3.5 h-3.5 mr-1.5" />
                              {expandedLunch ? "Hide Options" : "Choose Restaurant"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectMilestone("lunch", null, "ignored")}
                              className="text-xs text-gray-600 hover:bg-gray-100 rounded-xl h-9 border-gray-300"
                            >
                              Skip
                            </Button>
                          </div>
                        </div>

                        {/* Expandable options drawer */}
                        {expandedLunch && (
                          <div className="mt-4 pt-4 border-t border-amber-200 space-y-3 animate-in fade-in duration-200">
                            <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                              Recommended Restaurants Nearby
                            </p>
                            {loadingRestaurants ? (
                              <div className="p-6 text-center text-xs text-gray-500">
                                Finding the best restaurants near {lunchRefDest?.name}...
                              </div>
                            ) : nearbyRestaurants.length === 0 ? (
                              <div className="p-4 text-center text-xs text-gray-500">
                                No nearby restaurants found within 20km.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {nearbyRestaurants.map((rest) => (
                                  <div
                                    key={rest.restaurant_id}
                                    className="flex gap-3 p-2.5 rounded-xl bg-white border border-amber-100 shadow-xs hover:border-amber-400 transition-colors"
                                  >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                      <img
                                        src={
                                          rest.display_picture
                                            ? `${apiBaseUrl}/public/restaurants/${rest.display_picture}`
                                            : "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200"
                                        }
                                        alt={rest.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-bold text-xs text-gray-900 line-clamp-1">
                                          {rest.name}
                                        </h5>
                                        <div className="flex items-center gap-1 text-[11px] text-yellow-600 font-semibold">
                                          ★ {rest.rating}
                                          {rest.distance_km && (
                                            <span className="text-gray-400 font-normal">
                                              • {rest.distance_km} km away
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-1">
                                          {rest.cuisine_type}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSelectMilestone(
                                            "lunch",
                                            Number(rest.restaurant_id),
                                            "selected"
                                          )
                                        }
                                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold h-7 rounded-lg mt-1"
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* DINNER MILESTONE PROMPT OR CONFIRMED STOP */}
              {/* ========================================================= */}
              {isLastDestination && (
                <div className="flex items-stretch gap-0 my-3">
                  <div className="flex flex-col items-center shrink-0 w-10 self-stretch">
                    <div className="flex-1 w-px bg-orange-300" />
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-orange-500 bg-orange-50 shadow-md">
                      <Utensils className="w-4 h-4 text-orange-600" />
                    </div>
                    <div className="flex-1 w-px bg-purple-300" />
                  </div>

                  <div className="flex-1 ml-4 mb-4">
                    {/* CASE 1: DINNER CHOSEN */}
                    {dinnerMilestone?.status === "selected" && dinnerMilestone.place ? (
                      <Card className="overflow-hidden border-2 border-orange-300 bg-gradient-to-r from-orange-50/50 to-amber-50/30 p-4 shadow-md rounded-2xl">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-orange-100">
                            <img
                              src={
                                dinnerMilestone.place.display_picture
                                  ? `${apiBaseUrl}/public/restaurants/${dinnerMilestone.place.display_picture}`
                                  : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400"
                              }
                              alt={dinnerMilestone.place.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <Badge className="bg-orange-600 text-white text-[11px] font-bold">
                                  🍽️ Confirmed Dinner Stop (~19:30)
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => setExpandedDinner((p) => !p)}
                                  className="text-xs text-orange-700 hover:underline font-semibold"
                                >
                                  Change
                                </button>
                              </div>
                              <h4 className="text-base font-bold text-gray-900 mt-1">
                                {dinnerMilestone.place.name}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-orange-600" />
                                {dinnerMilestone.place.address || dinnerRefDest?.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                  ★ {dinnerMilestone.place.rating || "4.5"}
                                </span>
                                <span>•</span>
                                <span>{dinnerMilestone.place.cuisine_type || "Local Cuisine"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : dinnerMilestone?.status === "ignored" ? (
                      /* CASE 2: DINNER SKIPPED */
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-gray-400" />
                          <span>Dinner recommendation skipped</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedDinner(true)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold h-7"
                        >
                          Pick a restaurant
                        </Button>
                      </div>
                    ) : (
                      /* CASE 3: DINNER PENDING PROMPT */
                      <Card className="overflow-hidden border-2 border-dashed border-orange-400 bg-orange-50/40 p-4 rounded-2xl shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-semibold">
                                🍽️ Evening Dinner Milestone
                              </Badge>
                              <span className="text-xs text-gray-500 font-semibold">
                                ~19:30 (Dinner)
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Where would you like to have dinner near {dinnerRefDest?.name}?
                            </h4>
                            <p className="text-xs text-gray-600">
                              Choose a top-rated local dining spot before retiring for the night.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => setExpandedDinner((prev) => !prev)}
                              className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded-xl h-9"
                            >
                              <Utensils className="w-3.5 h-3.5 mr-1.5" />
                              {expandedDinner ? "Hide Options" : "Choose Restaurant"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectMilestone("dinner", null, "ignored")}
                              className="text-xs text-gray-600 hover:bg-gray-100 rounded-xl h-9 border-gray-300"
                            >
                              Skip
                            </Button>
                          </div>
                        </div>

                        {/* Expandable options drawer */}
                        {expandedDinner && (
                          <div className="mt-4 pt-4 border-t border-orange-200 space-y-3 animate-in fade-in duration-200">
                            <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">
                              Recommended Restaurants for Dinner Nearby
                            </p>
                            {loadingDinnerRestaurants ? (
                              <div className="p-6 text-center text-xs text-gray-500">
                                Finding the best dinner restaurants near {dinnerRefDest?.name}...
                              </div>
                            ) : nearbyDinnerRestaurants.length === 0 ? (
                              <div className="p-4 text-center text-xs text-gray-500">
                                No nearby restaurants found within 20km.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {nearbyDinnerRestaurants.map((r) => (
                                  <div
                                    key={r.restaurant_id}
                                    className="flex gap-3 p-2.5 rounded-xl bg-white border border-orange-100 shadow-xs hover:border-orange-400 transition-colors"
                                  >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                      <img
                                        src={
                                          r.display_picture
                                            ? `${apiBaseUrl}/public/restaurants/${r.display_picture}`
                                            : "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200"
                                        }
                                        alt={r.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-bold text-xs text-gray-900 line-clamp-1">
                                          {r.name}
                                        </h5>
                                        <div className="flex items-center gap-1 text-[11px] text-yellow-600 font-semibold">
                                          ★ {r.rating || "4.5"}
                                          {r.distance_km && (
                                            <span className="text-gray-400 font-normal">
                                              • {r.distance_km} km away
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-1">
                                          {r.cuisine_type || "Local Cuisine"}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSelectMilestone(
                                            "dinner",
                                            Number(r.restaurant_id),
                                            "selected"
                                          )
                                        }
                                        className="w-full bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold h-7 rounded-lg mt-1"
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* OVERNIGHT HOTEL MILESTONE (AFTER LAST DESTINATION) */}
              {/* ========================================================= */}
              {isLastDestination && (
                <div className="flex items-stretch gap-0 my-3">
                  <div className="flex flex-col items-center shrink-0 w-10 self-stretch">
                    <div className="flex-1 w-px bg-purple-300" />
                    <div className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-purple-600 bg-purple-50 shadow-md">
                      <Hotel className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 w-px bg-transparent" />
                  </div>

                  <div className="flex-1 ml-4 mb-4">
                    {/* CASE 1: HOTEL CHOSEN */}
                    {hotelMilestone?.status === "selected" && hotelMilestone.place ? (
                      <Card className="overflow-hidden border-2 border-purple-300 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 p-4 shadow-md rounded-2xl">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="sm:w-36 h-28 rounded-xl overflow-hidden shrink-0 bg-purple-100">
                            <img
                              src={
                                hotelMilestone.place.display_picture
                                  ? `${apiBaseUrl}/public/hotels/${hotelMilestone.place.display_picture}`
                                  : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400"
                              }
                              alt={hotelMilestone.place.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <Badge className="bg-purple-600 text-white text-[11px] font-bold">
                                  🏨 Confirmed Overnight Stay ({endTime})
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => setExpandedHotel((p) => !p)}
                                  className="text-xs text-purple-700 hover:underline font-semibold"
                                >
                                  Change
                                </button>
                              </div>
                              <h4 className="text-base font-bold text-gray-900 mt-1">
                                {hotelMilestone.place.name}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-purple-600" />
                                {hotelMilestone.place.address || hotelRefDest?.name}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-gray-600 pt-1">
                                <span className="flex items-center gap-1 text-yellow-600 font-bold">
                                  ★ {hotelMilestone.place.rating || "4.8"}
                                </span>
                                <span>•</span>
                                <span>{hotelMilestone.place.hotel_type || "Hotel & Resort"}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : hotelMilestone?.status === "ignored" ? (
                      /* CASE 2: HOTEL SKIPPED */
                      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs text-gray-500">
                        <span className="flex items-center gap-2">
                          <Hotel className="w-4 h-4 text-gray-400" />
                          <span>Overnight stay recommendation skipped</span>
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedHotel(true)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold h-7"
                        >
                          Pick a hotel
                        </Button>
                      </div>
                    ) : (
                      /* CASE 3: HOTEL PENDING PROMPT */
                      <Card className="overflow-hidden border-2 border-dashed border-purple-400 bg-purple-50/40 p-4 rounded-2xl shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
                                🏨 Overnight Milestone
                              </Badge>
                              <span className="text-xs text-gray-500 font-semibold">
                                ~{endTime} (End of Day)
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900">
                              Where would you like to stay tonight near {hotelRefDest?.name}?
                            </h4>
                            <p className="text-xs text-gray-600">
                              Select a comfortable hotel to conclude your day or skip.
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              size="sm"
                              onClick={() => setExpandedHotel((prev) => !prev)}
                              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl h-9"
                            >
                              <Hotel className="w-3.5 h-3.5 mr-1.5" />
                              {expandedHotel ? "Hide Options" : "Choose Hotel"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSelectMilestone("overnight", null, "ignored")}
                              className="text-xs text-gray-600 hover:bg-gray-100 rounded-xl h-9 border-gray-300"
                            >
                              Skip
                            </Button>
                          </div>
                        </div>

                        {/* Expandable options drawer */}
                        {expandedHotel && (
                          <div className="mt-4 pt-4 border-t border-purple-200 space-y-3 animate-in fade-in duration-200">
                            <p className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                              Recommended Hotels Nearby
                            </p>
                            {loadingHotels ? (
                              <div className="p-6 text-center text-xs text-gray-500">
                                Finding the best hotels near {hotelRefDest?.name}...
                              </div>
                            ) : nearbyHotels.length === 0 ? (
                              <div className="p-4 text-center text-xs text-gray-500">
                                No nearby hotels found within 25km.
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {nearbyHotels.map((h) => (
                                  <div
                                    key={h.hotel_id}
                                    className="flex gap-3 p-2.5 rounded-xl bg-white border border-purple-100 shadow-xs hover:border-purple-400 transition-colors"
                                  >
                                    <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                                      <img
                                        src={
                                          h.display_picture
                                            ? `${apiBaseUrl}/public/hotels/${h.display_picture}`
                                            : "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=200"
                                        }
                                        alt={h.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                      <div>
                                        <h5 className="font-bold text-xs text-gray-900 line-clamp-1">
                                          {h.name}
                                        </h5>
                                        <div className="flex items-center gap-1 text-[11px] text-yellow-600 font-semibold">
                                          ★ {h.rating}
                                          {h.distance_km && (
                                            <span className="text-gray-400 font-normal">
                                              • {h.distance_km} km away
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-[11px] text-gray-500 line-clamp-1">
                                          {h.hotel_type}
                                        </p>
                                      </div>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleSelectMilestone(
                                            "overnight",
                                            Number(h.hotel_id),
                                            "selected"
                                          )
                                        }
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold h-7 rounded-lg mt-1"
                                      >
                                        Select
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
