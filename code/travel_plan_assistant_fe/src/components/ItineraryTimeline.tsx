import { MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  type ItineraryDestination,
  type RouteSegment,
  categoryColors,
} from "../data/itinerary-data";

interface ItineraryTimelineProps {
  activeId?: string;
  onDestinationClick?: (dest: ItineraryDestination) => void;
  destinations?: ItineraryDestination[];
  routeSegments?: RouteSegment[];
}

export function ItineraryTimeline({
  activeId,
  onDestinationClick,
  destinations = [],
  routeSegments = [],
}: ItineraryTimelineProps) {
  // Internal mapping to ensure UI format
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
    }),
  );

  const getRouteFromPrev = (destId: string): RouteSegment | undefined =>
    routeSegments.find((r) => r.to === destId);

  const isSameDayAsNext = (index: number) => {
    if (index >= formattedDestinations.length - 1) return false;
    return (
      formattedDestinations[index].day === formattedDestinations[index + 1].day
    );
  };

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  return (
    <div className="space-y-0">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Destination Details
          </h2>
          <p className="text-sm text-gray-500">
            Your personalized route breakdown
          </p>
        </div>
      </div>

      <div className="relative">
        {formattedDestinations.map((dest, index) => {
          const isActive = activeId === dest.id;
          const isLast = index === formattedDestinations.length - 1;
          const colors = categoryColors[dest.category] ?? {
            bg: "bg-gray-50",
            text: "text-gray-700",
            dot: "#6b7280",
          };
          const routeFromPrev = getRouteFromPrev(dest.id);

          return (
            <div key={dest.id}>
              {routeFromPrev && (
                <div className="flex items-stretch ml-5">
                  <div className="w-px bg-gradient-to-b from-indigo-200 to-purple-200 relative shrink-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-dashed border-indigo-300 flex items-center justify-center">
                      <ChevronRight className="w-3 h-3 text-indigo-400" />
                    </div>
                  </div>
                  <div className="ml-6 my-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50/50 border border-indigo-100">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700">
                      {routeFromPrev.duration}
                    </span>
                    <span className="text-xs text-indigo-500">
                      {routeFromPrev.distance}
                    </span>
                  </div>
                </div>
              )}

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
                  <div
                    className={`flex-1 w-px ${isLast ? "bg-transparent" : "bg-indigo-200"}`}
                  />
                </div>

                <div className="flex-1 ml-4 mb-4">
                  <Card
                    className={`overflow-hidden transition-all cursor-pointer group border-2 ${isActive
                        ? "ring-2 shadow-xl"
                        : "shadow-md border-transparent"
                      }`}
                    style={{
                      borderColor: isActive ? colors.dot : "transparent",
                    }}
                    onClick={() => onDestinationClick?.(dest)}
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-40 h-32 overflow-hidden shrink-0">
                        <img
                          src={`${apiBaseUrl}/public/destinations/${dest.display_picture}`}
                          alt={dest.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-duration-500"
                        // onError={(e) => {
                        //   (e.target as HTMLImageElement).src =
                        //     "https://via.placeholder.com/400x300?text=No+Image";
                        // }}
                        />
                      </div>
                      <div className="flex-1 p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">
                              {dest.name}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <MapPin
                                className="w-3 h-3"
                                style={{ color: colors.dot }}
                              />
                              {dest.district_name}
                            </div>
                          </div>
                          <Badge
                            className={`${colors.bg} ${colors.text} border-0 text-[10px]`}
                          >
                            {dest.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {dest.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
