import { MapPin, Clock, Star, ChevronRight } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
    itineraryDestinations,
    routeSegments,
    categoryColors,
    type ItineraryDestination,
    type RouteSegment,
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
    destinations,
    routeSegments: segments,
}: ItineraryTimelineProps) {
    const selectedDestinations =
        destinations && destinations.length > 0 ? destinations : itineraryDestinations;
    const selectedSegments =
        segments && segments.length > 0 ? segments : routeSegments;

    const getRouteFromPrev = (destId: string) =>
        selectedSegments.find((r) => r.to === destId);

    /** Check if this is the first destination for its day */
    const isFirstOfDay = (index: number) => {
        if (index === 0) return true;
        return selectedDestinations[index].day !== selectedDestinations[index - 1].day;
    };

    /** Check if the next destination is on the same day */
    const isSameDayAsNext = (index: number) => {
        if (index >= selectedDestinations.length - 1) return false;
        return selectedDestinations[index].day === selectedDestinations[index + 1].day;
    };

    return (
        <div className="space-y-0">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200">
                    <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        AI-Suggested Itinerary
                    </h2>
                    <p className="text-sm text-gray-500">
                        Personalized route based on your preferences
                    </p>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {selectedDestinations.map((dest, index) => {
                    const isActive = activeId === dest.id;
                    const isLast = index === selectedDestinations.length - 1;
                    const colors = categoryColors[dest.category] ?? {
                        bg: "bg-gray-50",
                        text: "text-gray-700",
                        dot: "#6b7280",
                    };
                    const routeFromPrev = getRouteFromPrev(dest.id);
                    const firstOfDay = isFirstOfDay(index);
                    const sameDayNext = isSameDayAsNext(index);

                    return (
                        <div key={dest.id}>
                            {/* Travel connector (between destinations) */}
                            {routeFromPrev && (
                                <div className="flex items-stretch ml-5">
                                    {/* Timeline line */}
                                    <div className="w-px bg-gradient-to-b from-indigo-200 to-purple-200 relative flex-shrink-0">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 border-dashed border-indigo-300 flex items-center justify-center">
                                            <ChevronRight className="w-3 h-3 text-indigo-400" />
                                        </div>
                                    </div>
                                    {/* Travel info pill */}
                                    <div className="ml-6 my-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
                                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-xs font-semibold text-indigo-700">
                                            {routeFromPrev.duration}
                                        </span>
                                        <span className="text-xs text-indigo-400">·</span>
                                        <span className="text-xs text-indigo-500">
                                            {routeFromPrev.distance}
                                        </span>
                                        <span className="text-xs text-indigo-400">·</span>
                                        <span className="text-xs text-indigo-500">
                                            {routeFromPrev.transport}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Destination card row */}
                            <div className="flex items-stretch gap-0">
                                {/* Timeline dot + line */}
                                <div className="flex flex-col items-center flex-shrink-0 w-10">
                                    {!isLast && (
                                        <div
                                            className={`flex-1 w-px ${sameDayNext
                                                    ? "bg-gradient-to-b from-amber-300 to-amber-300"
                                                    : "bg-gradient-to-b from-indigo-200 to-purple-200"
                                                }`}
                                        />
                                    )}

                                    {firstOfDay ? (
                                        /* Day circle — shown for the first destination of each day */
                                        <div
                                            className="relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-[3px] shadow-lg transition-all duration-300"
                                            style={{
                                                borderColor: colors.dot,
                                                backgroundColor: isActive ? colors.dot : "white",
                                                boxShadow: isActive
                                                    ? `0 0 20px ${colors.dot}40`
                                                    : `0 2px 8px rgba(0,0,0,0.08)`,
                                            }}
                                        >
                                            <span
                                                className="text-xs font-bold"
                                                style={{
                                                    color: isActive ? "white" : colors.dot,
                                                }}
                                            >
                                                D{dest.day}
                                            </span>
                                        </div>
                                    ) : (
                                        /* Same-day "+" marker — shown for subsequent destinations within the same day */
                                        <div
                                            className="relative z-10 flex items-center justify-center w-7 h-7 rounded-full border-2 border-dashed shadow-md transition-all duration-300"
                                            style={{
                                                borderColor: colors.dot,
                                                backgroundColor: isActive ? colors.dot : "white",
                                                boxShadow: isActive
                                                    ? `0 0 16px ${colors.dot}40`
                                                    : `0 2px 6px rgba(0,0,0,0.06)`,
                                            }}
                                        >
                                            <span
                                                className="text-[10px] font-bold"
                                                style={{
                                                    color: isActive ? "white" : colors.dot,
                                                }}
                                            >
                                                +
                                            </span>
                                        </div>
                                    )}

                                    {!isLast && (
                                        <div
                                            className={`flex-1 w-px ${sameDayNext
                                                    ? "bg-gradient-to-b from-amber-300 to-amber-300"
                                                    : "bg-gradient-to-b from-purple-200 to-indigo-200"
                                                }`}
                                        />
                                    )}
                                </div>

                                {/* Destination card */}
                                <div className="flex-1 ml-4 mb-2">
                                    {/* Same-day badge */}
                                    {!firstOfDay && (
                                        <div className="mb-1.5">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-700">
                                                Same day as above
                                            </span>
                                        </div>
                                    )}
                                    <Card
                                        className={`overflow-hidden transition-all duration-300 cursor-pointer group hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-0.5 border-0 ${isActive
                                            ? "ring-2 shadow-xl shadow-indigo-100/50"
                                            : "shadow-md"
                                            }`}
                                        style={{
                                            ["--tw-ring-color" as string]: isActive ? colors.dot : undefined,
                                        }}
                                        onClick={() => onDestinationClick?.(dest)}
                                    >
                                        <div className="flex flex-col sm:flex-row">
                                            {/* Image */}
                                            <div className="sm:w-40 h-32 sm:h-auto overflow-hidden flex-shrink-0">
                                                <img
                                                    src={dest.image}
                                                    alt={dest.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 p-4 space-y-2.5">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-700 transition-colors">
                                                            {dest.name}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <MapPin
                                                                className="w-3.5 h-3.5"
                                                                style={{ color: colors.dot }}
                                                            />
                                                            <span className="text-xs text-gray-500">
                                                                {dest.district} District
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Badge
                                                        className={`${colors.bg} ${colors.text} border-0 text-[10px] font-semibold px-2.5 py-0.5`}
                                                    >
                                                        {dest.category}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                                    {dest.description}
                                                </p>

                                                {/* Highlights */}
                                                <div className="flex flex-wrap gap-1.5">
                                                    {dest.highlights.slice(0, 3).map((h) => (
                                                        <span
                                                            key={h}
                                                            className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-600 font-medium"
                                                        >
                                                            {h}
                                                        </span>
                                                    ))}
                                                    {dest.highlights.length > 3 && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-[11px] text-gray-400 font-medium">
                                                            +{dest.highlights.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
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

