import { Calendar, MapPin, Clock, ChevronRight, Plane } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface Trip {
    id: string;
    title: string;
    destinations: string[];
    dates: string;
    duration: string;
    status: "upcoming" | "completed" | "in-progress";
    image: string;
    budget: string;
}

const trips: Trip[] = [
    {
        id: "1",
        title: "Cultural Triangle Explorer",
        destinations: ["Colombo", "Kandy", "Sigiriya", "Dambulla"],
        dates: "Mar 15 – Mar 21, 2026",
        duration: "7 days",
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
        budget: "$850",
    },
    {
        id: "2",
        title: "Southern Coast Adventure",
        destinations: ["Galle", "Mirissa", "Yala"],
        dates: "Feb 1 – Feb 5, 2026",
        duration: "5 days",
        status: "completed",
        image: "https://images.unsplash.com/photo-1573225935973-40799471a5e0?auto=format&fit=crop&q=80&w=600",
        budget: "$620",
    },
    {
        id: "3",
        title: "Hill Country Train Journey",
        destinations: ["Kandy", "Nuwara Eliya", "Ella"],
        dates: "Apr 10 – Apr 14, 2026",
        duration: "5 days",
        status: "upcoming",
        image: "https://images.unsplash.com/photo-1590123575938-254aaa2cbb07?auto=format&fit=crop&q=80&w=600",
        budget: "$480",
    },
];

const statusColors: Record<string, { bg: string; text: string }> = {
    upcoming: { bg: "bg-blue-50", text: "text-blue-700" },
    completed: { bg: "bg-green-50", text: "text-green-700" },
    "in-progress": { bg: "bg-amber-50", text: "text-amber-700" },
};

export function MyTrips() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                    My Trips
                </h1>
                <p className="text-gray-500">
                    Track and manage all your planned and completed journeys across Sri Lanka.
                </p>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Trips", value: trips.length, emoji: "🧳" },
                    { label: "Upcoming", value: trips.filter((t) => t.status === "upcoming").length, emoji: "✈️" },
                    { label: "Completed", value: trips.filter((t) => t.status === "completed").length, emoji: "✅" },
                ].map((stat) => (
                    <Card key={stat.label} className="p-4 text-center border-0 shadow-md">
                        <div className="text-2xl mb-1">{stat.emoji}</div>
                        <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                        <div className="text-xs text-gray-500">{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Trip list */}
            <div className="space-y-4">
                {trips.map((trip) => {
                    const sc = statusColors[trip.status];
                    return (
                        <Card
                            key={trip.id}
                            className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                        >
                            <div className="flex flex-col sm:flex-row">
                                {/* Image */}
                                <div className="sm:w-48 h-40 sm:h-auto overflow-hidden flex-shrink-0">
                                    <img
                                        src={trip.image}
                                        alt={trip.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between gap-3">
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                {trip.title}
                                            </h3>
                                            <Badge className={`${sc.bg} ${sc.text} border-0 text-[10px] font-semibold capitalize px-2.5 py-0.5 flex-shrink-0`}>
                                                {trip.status}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
                                            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                            {trip.destinations.join(" → ")}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {trip.dates}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                {trip.duration}
                                            </span>
                                            <span className="font-semibold text-indigo-600">{trip.budget}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Empty state CTA */}
            <div className="text-center py-6">
                <Link
                    to="/plan"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                    <Plane className="w-4 h-4" />
                    Plan a New Trip
                </Link>
            </div>
        </div>
    );
}
