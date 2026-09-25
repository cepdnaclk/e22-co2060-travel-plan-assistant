import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, ChevronRight, Plane, Briefcase, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../axios";
import { type GeneratedTripSession, calculateTotalTripDuration } from "./itinerary";

const statusColors: Record<string, { bg: string; text: string }> = {
    upcoming: { bg: "bg-blue-50", text: "text-blue-700" },
    completed: { bg: "bg-green-50", text: "text-green-700" },
    "in-progress": { bg: "bg-amber-50", text: "text-amber-700" },
};

export function MyTrips() {
    const [trips, setTrips] = useState<GeneratedTripSession[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchTrips() {
            try {
                const res = await api.post<GeneratedTripSession[]>("/api/itinerary");
                const tripList = Array.isArray(res.data) ? res.data : [];
                setTrips(tripList);
            } catch (err) {
                console.error("Error fetching trips:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchTrips();
    }, []);

    const formatTripDate = (dateString?: string) => {
        if (!dateString) return "Upcoming";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    My Trips
                </h1>
                <p className="text-gray-500">
                    Track and manage all your planned and completed journeys across Sri Lanka.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Trips", value: trips.length, icon: <Briefcase className="w-8 h-8 text-indigo-500" /> },
                    { label: "Upcoming", value: trips.length, icon: <Plane className="w-8 h-8 text-blue-500" /> },
                    { label: "Completed", value: 0, icon: <CheckCircle className="w-8 h-8 text-emerald-500" /> },
                ].map((stat) => (
                    <Card key={stat.label} className="p-4 text-center border-0 shadow-md">
                        <div className="mb-2 flex justify-center">{stat.icon}</div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Trip list */}
            {loading ? (
                <div className="text-center py-12 text-gray-400">Loading your trips...</div>
            ) : trips.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">You haven't generated any trips yet.</p>
                    <Link
                        to="/plan"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plane className="w-4 h-4" />
                        Plan a New Trip
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {trips.map((trip) => {
                        const sc = statusColors["upcoming"];
                        const defaultImage = "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600";
                        const displayImage = trip.destinations?.[0]?.display_picture || defaultImage;
                        const destNames = trip.destinations?.map(d => d.name) || [];
                        const budget = trip.estimatedCost ? `Rs. ${trip.estimatedCost.toLocaleString()}` : "N/A";
                        const durationStr = calculateTotalTripDuration(trip.destinations, trip.routeSegments);

                        return (
                            <Card
                                key={trip.session_id}
                                onClick={() => navigate("/itinerary", { state: { sessionId: trip.session_id } })}
                                className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                            >
                                <div className="flex flex-col sm:flex-row">
                                    {/* Image */}
                                    <div className="sm:w-48 h-40 sm:h-auto overflow-hidden shrink-0">
                                        <img
                                            src={displayImage}
                                            alt={destNames[0] || "Destination"}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => { (e.target as HTMLImageElement).src = defaultImage }}
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between gap-3">
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                                                    {destNames.length > 0 ? `${destNames[0]} to ${destNames[destNames.length - 1]}` : `Trip #${trip.session_id}`}
                                                </h3>
                                                <Badge className={`${sc.bg} ${sc.text} border-0 text-[10px] font-semibold capitalize px-2.5 py-0.5 shrink-0`}>
                                                    Upcoming
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                                                <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                                <div className="truncate max-w-50 sm:max-w-sm">{destNames.join(" → ")}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {formatTripDate(trip.created_at)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {durationStr}
                                                </span>
                                                <span className="font-semibold text-indigo-600">{budget}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {trips.length > 0 && (
                <div className="text-center py-6">
                    <Link
                        to="/plan"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <Plane className="w-4 h-4" />
                        Plan a New Trip
                    </Link>
                </div>
            )}
        </div>
    );
}
