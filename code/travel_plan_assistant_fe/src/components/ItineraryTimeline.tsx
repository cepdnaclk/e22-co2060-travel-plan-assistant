import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Utensils,
  Hotel,
  ArrowLeftRight,
  Trash2,
  Edit3,
  Plus,
  Minus,
  Check,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { api } from "../axios";
import {
  type ItineraryDestination,
  type RouteSegment,
  type ItineraryMilestone,
  type MilestonePlace,
  type NearbyCandidatePlace,
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
  onTripUpdated?: (updatedTrip: any) => void;
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

// Format duration minutes to friendly string e.g. "1h 30m" or "45m"
function formatDurationLabel(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
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
  onTripUpdated,
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

  // Edit itinerary state
  const [expandedEditId, setExpandedEditId] = useState<string | null>(null);
  const [selectedDestForReplace, setSelectedDestForReplace] = useState<ItineraryDestination | null>(null);
  const [nearbyAlternatives, setNearbyAlternatives] = useState<NearbyCandidatePlace[]>([]);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [loadingDurationId, setLoadingDurationId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (actionFeedback) {
      const timer = setTimeout(() => setActionFeedback(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [actionFeedback]);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  // Formatted destination list with custom or default visit durations
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
      visitDuration: dest.visitDuration || 90,
    })
  );

  const getRouteFromPrev = (destId: string): RouteSegment | undefined =>
    routeSegments.find((r) => r.to === destId);

  // Time calculations along the route with customized visit duration
  const startMins = parseTimeToMinutes(startTime, 510);
  let currentMins = startMins;

  // Determine timetable for destinations
  const timeSchedule = formattedDestinations.map((dest, idx) => {
    if (idx > 0) {
      const prevRoute = getRouteFromPrev(dest.id);
      currentMins += parseDurationMinutes(prevRoute?.duration);
    }
    const arrivalMins = currentMins;
    const visitDuration = dest.visitDuration || 90;
    currentMins += visitDuration;
    const departureMins = currentMins;

    return {
      arrival: formatMinutesToTime(arrivalMins),
      departure: formatMinutesToTime(departureMins),
      arrivalMins,
      departureMins,
      visitDuration,
    };
  });

  // Handler: Open Replace Modal and fetch nearby attractions
  const handleOpenReplaceModal = async (dest: ItineraryDestination) => {
    if (!dest.destinationID) return;
    setSelectedDestForReplace(dest);
    setNearbyAlternatives([]);
    setLoadingAlternatives(true);

    try {
      const currentIds = destinations
        .map((d) => d.destinationID)
        .filter(Boolean)
        .join(",");

      const res = await api.get<NearbyCandidatePlace[]>(
        `/api/destinations/${dest.destinationID}/nearby`,
        {
          params: {
            radius: 35,
            limit: 8,
            exclude: currentIds,
          },
        }
      );
      setNearbyAlternatives(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error("Error fetching nearby attractions:", err);
      setActionFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to load nearby places.",
      });
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Handler: Confirm Replace Place
  const handleConfirmReplace = async (candidate: NearbyCandidatePlace) => {
    if (!sessionId || !selectedDestForReplace?.destinationID) return;
    setIsReplacing(true);
    try {
      const res = await api.put<{ success: boolean; trip: any }>(
        `/api/itinerary/${sessionId}/replace`,
        {
          oldPlaceId: selectedDestForReplace.destinationID,
          newPlaceId: candidate.destinationID,
        }
      );
      if (res.data?.trip) {
        onTripUpdated?.(res.data.trip);
      }
      setSelectedDestForReplace(null);
      setActionFeedback({
        type: "success",
        text: `Replaced "${selectedDestForReplace.name}" with "${candidate.name}". Route and timings recalculated.`,
      });
    } catch (err: any) {
      console.error("Failed to replace destination:", err);
      setActionFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to replace destination.",
      });
    } finally {
      setIsReplacing(false);
    }
  };

  // Handler: Confirm Remove Place
  const handleRemovePlace = async (dest: ItineraryDestination) => {
    if (!sessionId || !dest.destinationID) return;
    setIsRemoving(true);
    try {
      const res = await api.delete<{ success: boolean; trip: any }>(
        `/api/itinerary/${sessionId}/place/${dest.destinationID}`
      );
      if (res.data?.trip) {
        onTripUpdated?.(res.data.trip);
      }
      setConfirmDeleteId(null);
      setActionFeedback({
        type: "success",
        text: `Removed "${dest.name}" from itinerary. Route and timings recalculated.`,
      });
    } catch (err: any) {
      console.error("Failed to remove destination:", err);
      setActionFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to remove destination.",
      });
    } finally {
      setIsRemoving(false);
    }
  };

  // Handler: Update Stay Duration
  const handleUpdateDuration = async (dest: ItineraryDestination, newMinutes: number) => {
    if (!sessionId || !dest.destinationID) return;
    if (newMinutes <= 0) return;
    setLoadingDurationId(dest.id);
    try {
      const res = await api.put<{ success: boolean; trip: any }>(
        `/api/itinerary/${sessionId}/place/${dest.destinationID}/duration`,
        { duration: newMinutes }
      );
      if (res.data?.trip) {
        onTripUpdated?.(res.data.trip);
      }
      setActionFeedback({
        type: "success",
        text: `Updated visit time at "${dest.name}" to ${formatDurationLabel(newMinutes)}. Timings recalculated.`,
      });
    } catch (err: any) {
      console.error("Failed to update duration:", err);
      setActionFeedback({
        type: "error",
        text: err.response?.data?.error || "Failed to update duration.",
      });
    } finally {
      setLoadingDurationId(null);
    }
  };

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

      {actionFeedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            actionFeedback.type === "success"
              ? "bg-emerald-50/90 border-emerald-200 text-emerald-800"
              : "bg-rose-50/90 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2.5 text-sm font-medium">
            {actionFeedback.type === "success" ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{actionFeedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                    onClick={() => {
                      onDestinationClick?.(dest);
                      setExpandedEditId((curr) => (curr === dest.id ? null : dest.id));
                    }}
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
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <Badge
                                  className={`${colors.bg} ${colors.text} border-0 text-xs font-semibold`}
                                >
                                  {dest.category}
                                </Badge>
                                <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-purple-500" />
                                  {formatDurationLabel(dest.visitDuration || 90)} stay
                                </span>
                              </div>
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

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[11px] text-gray-400 font-medium">
                            {expandedEditId === dest.id ? "Editing stop settings" : "Click card to customize stop"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedEditId((curr) => (curr === dest.id ? null : dest.id));
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                              expandedEditId === dest.id
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            {expandedEditId === dest.id ? "Close Settings" : "Edit Stop"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED EDIT STOP TRAY */}
                    {expandedEditId === dest.id && (
                      <div
                        className="border-t border-indigo-100/80 bg-slate-50/60 p-4 space-y-3.5 animate-in fade-in duration-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700">
                              <Clock className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-gray-800">
                              Visit Duration ({dest.visitDuration || 90} mins)
                            </span>
                          </div>
                          {loadingDurationId === dest.id && (
                            <span className="text-xs text-indigo-600 flex items-center gap-1 font-medium">
                              <Loader2 className="w-3 h-3 animate-spin" /> Updating...
                            </span>
                          )}
                        </div>

                        {/* Quick Presets & Steppers */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {[30, 45, 60, 90, 120, 150, 180].map((mins) => {
                            const isCurrent = (dest.visitDuration || 90) === mins;
                            return (
                              <button
                                key={mins}
                                type="button"
                                disabled={loadingDurationId === dest.id}
                                onClick={() => handleUpdateDuration(dest, mins)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                  isCurrent
                                    ? "bg-indigo-600 text-white shadow-xs scale-102"
                                    : "bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                              >
                                {formatDurationLabel(mins)}
                              </button>
                            );
                          })}

                          <div className="flex items-center gap-1 sm:ml-auto">
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              disabled={
                                loadingDurationId === dest.id ||
                                (dest.visitDuration || 90) <= 15
                              }
                              onClick={() =>
                                handleUpdateDuration(
                                  dest,
                                  Math.max(15, (dest.visitDuration || 90) - 15)
                                )
                              }
                              className="h-7 w-7 p-0 rounded-lg border-gray-200 bg-white hover:bg-gray-100"
                              title="Minus 15 minutes"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              type="button"
                              disabled={
                                loadingDurationId === dest.id ||
                                (dest.visitDuration || 90) >= 480
                              }
                              onClick={() =>
                                handleUpdateDuration(
                                  dest,
                                  Math.min(480, (dest.visitDuration || 90) + 15)
                                )
                              }
                              className="h-7 w-7 p-0 rounded-lg border-gray-200 bg-white hover:bg-gray-100"
                              title="Add 15 minutes"
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                          <Button
                            size="sm"
                            type="button"
                            onClick={() => handleOpenReplaceModal(dest)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl h-8.5 px-3.5 shadow-xs"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                            Replace with Nearby Place
                          </Button>

                          <Button
                            size="sm"
                            type="button"
                            variant="outline"
                            disabled={formattedDestinations.length <= 2}
                            onClick={() =>
                              setConfirmDeleteId((curr) => (curr === dest.id ? null : dest.id))
                            }
                            className={`text-xs font-semibold rounded-xl h-8.5 px-3.5 transition-all ${
                              formattedDestinations.length <= 2
                                ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400"
                                : "border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300"
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            Remove Stop
                          </Button>
                        </div>

                        {formattedDestinations.length <= 2 && (
                          <p className="text-[11px] text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/50">
                            ⚠️ An itinerary must contain at least 2 destinations (start and destination).
                          </p>
                        )}

                        {confirmDeleteId === dest.id && (
                          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in duration-150">
                            <p className="text-xs text-rose-900 font-medium">
                              Are you sure you want to remove <strong>{dest.name}</strong> from your itinerary? Route times and map will automatically recalculate.
                            </p>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                type="button"
                                disabled={isRemoving}
                                onClick={() => handleRemovePlace(dest)}
                                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-7.5 px-3 rounded-lg"
                              >
                                {isRemoving ? (
                                  <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                                ) : (
                                  <Trash2 className="w-3 h-3 mr-1.5" />
                                )}
                                Yes, Remove Stop
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                variant="ghost"
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs h-7.5 px-3 text-gray-600 rounded-lg hover:bg-rose-100/50"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

      {/* REPLACE PLACE MODAL */}
      <Dialog
        open={!!selectedDestForReplace}
        onOpenChange={(open) => {
          if (!open) setSelectedDestForReplace(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6 bg-white shadow-2xl border">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 shadow-xs">
                <ArrowLeftRight className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Replace Stop
                </DialogTitle>
                <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                  Currently: {selectedDestForReplace?.name}
                </p>
              </div>
            </div>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Select an alternative nearby attraction to replace this stop. Driving routes, travel times, and arrival/departure schedules will automatically recalculate.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {loadingAlternatives ? (
              <div className="py-14 text-center text-gray-500 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                <p className="text-sm font-medium text-gray-700">Finding nearby attractions in database...</p>
                <p className="text-xs text-gray-400">Scanning destinations within travel range</p>
              </div>
            ) : nearbyAlternatives.length === 0 ? (
              <div className="py-10 text-center text-gray-500 space-y-1">
                <p className="text-sm font-bold text-gray-800">No nearby alternative attractions found</p>
                <p className="text-xs text-gray-500">
                  There are no other attractions registered nearby that are not already part of your itinerary.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
                {nearbyAlternatives.map((candidate) => (
                  <div
                    key={candidate.destinationID}
                    className="flex flex-col justify-between p-3.5 rounded-2xl bg-white border border-gray-100 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-2.5">
                      <div className="w-full h-32 rounded-xl overflow-hidden bg-gray-100 relative">
                        <img
                          src={
                            candidate.display_picture
                              ? `${apiBaseUrl}/public/destinations/${candidate.display_picture}`
                              : "https://images.unsplash.com/photo-1546708973-b339540b5162?auto=format&fit=crop&q=80&w=400"
                          }
                          alt={candidate.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {candidate.distance_km != null && (
                          <span className="absolute bottom-2 left-2 text-[11px] font-bold text-white bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded-md">
                            📍 {candidate.distance_km} km away
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                            {candidate.name}
                          </h4>
                          {candidate.rating && (
                            <span className="text-xs font-bold text-yellow-600 shrink-0">
                              ★ {candidate.rating}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                          <span className="line-clamp-1">{candidate.district_name || "Sri Lanka"}</span>
                          {candidate.category && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-medium">{candidate.category}</span>
                            </>
                          )}
                        </div>
                        {candidate.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 mt-1.5 leading-relaxed">
                            {candidate.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      type="button"
                      disabled={isReplacing}
                      onClick={() => handleConfirmReplace(candidate)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl h-8 mt-3 shadow-xs transition-all"
                    >
                      {isReplacing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Select & Replace
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
