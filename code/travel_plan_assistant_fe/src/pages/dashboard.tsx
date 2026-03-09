import { Link } from "react-router";
import {
    Map,
    CalendarDays,
    MapPin,
    TrendingUp,
    ArrowRight,
    Clock,
    Sparkles,
    Globe,
    Phone,
    Mail,
    Shield,
    Compass,
    Heart,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";

// Destination images
import ellaImg from "../assets/destinations/ella.png";
import galleImg from "../assets/destinations/galle-fort.png";
import sigiriyaImg from "../assets/destinations/sigiriya.png";
import kandyImg from "../assets/destinations/kandy.png";
import mirissaImg from "../assets/destinations/mirissa.png";
import nuwaraEliyaImg from "../assets/destinations/nuwara-eliya.png";

/* ───────────── Mock Data ───────────── */

const stats = [
    {
        label: "Total Trips Planned",
        value: "12",
        icon: Map,
        color: "text-indigo-500",
        bg: "bg-indigo-50",
        accent: "from-indigo-500 to-indigo-600",
    },
    {
        label: "Ongoing / Upcoming",
        value: "1",
        icon: CalendarDays,
        color: "text-emerald-500",
        bg: "bg-emerald-50",
        accent: "from-emerald-500 to-teal-500",
    },
    {
        label: "Districts Explored",
        value: "5 / 25",
        icon: MapPin,
        color: "text-rose-500",
        bg: "bg-rose-50",
        accent: "from-rose-500 to-pink-500",
    },
];

const upcomingTrip = {
    destination: "Ella & Hill Country",
    dates: "Feb 27 – Mar 2, 2026",
    daysUntil: 3,
    highlights: ["Nine Arches Bridge", "Little Adam's Peak", "Tea Plantations"],
};

const trendingPlaces = [
    { name: "Ella", tag: "Trending", tagColor: "bg-amber-500", image: ellaImg },
    {
        name: "Galle Fort",
        tag: "Highly Rated",
        tagColor: "bg-emerald-500",
        image: galleImg,
    },
    {
        name: "Sigiriya",
        tag: "Must Visit",
        tagColor: "bg-indigo-500",
        image: sigiriyaImg,
    },
    {
        name: "Kandy",
        tag: "Cultural",
        tagColor: "bg-purple-500",
        image: kandyImg,
    },
    {
        name: "Mirissa",
        tag: "Hidden Gem",
        tagColor: "bg-sky-500",
        image: mirissaImg,
    },
    {
        name: "Nuwara Eliya",
        tag: "Scenic",
        tagColor: "bg-teal-500",
        image: nuwaraEliyaImg,
    },
];

const features = [
    {
        icon: Compass,
        title: "Smart Itineraries",
        description:
            "AI-powered trip planning that crafts the perfect route across Sri Lanka's 25 districts.",
    },
    {
        icon: Map,
        title: "Interactive Maps",
        description:
            "Visualize your journey with detailed maps showing routes, distances, and travel times.",
    },
    {
        icon: Shield,
        title: "Budget Tracking",
        description:
            "Keep your spending on track with built-in budget tools and local price estimates.",
    },
    {
        icon: Heart,
        title: "Curated Experiences",
        description:
            "Discover hidden gems and local favorites handpicked by our Sri Lanka travel experts.",
    },
];

/* ───────────── Component ───────────── */

export function Dashboard() {
    const { isAuthenticated, user } = useAuth();

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-16">
            {/* ── 1. Welcome Header ── */}
            <section className="text-center space-y-3 pt-2">
                <p className="text-3xl">🙏</p>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent leading-tight">
                    {isAuthenticated && user
                        ? `Welcome back, ${user.name}!`
                        : "Ayubowan!"}
                </h1>
                <p className="text-lg text-gray-600 max-w-xl mx-auto">
                    {isAuthenticated
                        ? "Here's your travel dashboard — plan, explore, and track your Sri Lanka adventures."
                        : "Your gateway to unforgettable adventures across the Pearl of the Indian Ocean."}
                </p>
                {isAuthenticated && (
                    <Link to="/plan">
                        <Button
                            size="lg"
                            className="mt-3 h-14 px-8 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                        >
                            <Sparkles className="w-5 h-5 mr-2" />
                            Start Planning Your Trip
                        </Button>
                    </Link>
                )}
            </section>

            {/* ── Logged-in: User Stats + Upcoming Trip (additional) ── */}
            {isAuthenticated && (
                <>
                    {/* Quick Stats Row */}
                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <Card
                                    key={stat.label}
                                    className="relative overflow-hidden p-6 bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                                >
                                    <div
                                        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.accent} opacity-80`}
                                    />
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-500">
                                                {stat.label}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                {stat.value}
                                            </p>
                                        </div>
                                        <div
                                            className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                                        >
                                            <Icon className={`w-6 h-6 ${stat.color}`} />
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </section>

                    {/* Upcoming Trip */}
                    <section>
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-indigo-500" />
                            Your Upcoming Trip
                        </h2>
                        <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
                            <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-sm" />
                            <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/10 rounded-full blur-sm" />
                            <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-pink-200" />
                                        <h3 className="text-2xl md:text-3xl font-bold">
                                            {upcomingTrip.destination}
                                        </h3>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-white/90">
                                        <span className="flex items-center gap-1.5 text-sm">
                                            <CalendarDays className="w-4 h-4" />
                                            {upcomingTrip.dates}
                                        </span>
                                        <span className="flex items-center gap-1.5 text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                                            <Clock className="w-4 h-4" />
                                            Starts in {upcomingTrip.daysUntil} days
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {upcomingTrip.highlights.map((h) => (
                                            <Badge
                                                key={h}
                                                className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs px-3 py-1"
                                            >
                                                {h}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <Link to="/itinerary">
                                    <Button
                                        size="lg"
                                        className="bg-white text-indigo-700 hover:bg-white/90 shadow-lg font-semibold gap-2 cursor-pointer whitespace-nowrap"
                                    >
                                        View Itinerary
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </section>
                </>
            )}


            {/* ── Website Overview (always visible) ── */}


            {/* Features Grid */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    Why Choose TravelPlan?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {features.map((feat) => {
                        const Icon = feat.icon;
                        return (
                            <Card
                                key={feat.title}
                                className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                            >
                                <div className="flex gap-4">
                                    <div className="bg-indigo-50 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shrink-0 h-fit">
                                        <Icon className="w-6 h-6 text-indigo-500" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {feat.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 leading-relaxed">
                                            {feat.description}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* About / Overview */}
            <section>
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-semibold text-gray-800">
                            About TravelPlan
                        </h2>
                    </div>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        TravelPlan is your all-in-one companion for exploring Sri Lanka.
                        Whether you're chasing waterfalls in the hill country, diving
                        into the vibrant culture of Kandy, or soaking up the sun on
                        Mirissa's golden beaches — we help you plan every detail of your
                        journey.
                    </p>
                    <p className="text-gray-600 leading-relaxed">
                        With AI-powered itinerary generation, interactive maps, budget
                        tracking, and curated local experiences, you'll spend less time
                        planning and more time exploring the Pearl of the Indian Ocean.
                    </p>
                </Card>
            </section>

            {/* Contact Details */}
            <section>
                <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-5">
                        Get in Touch
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-emerald-50 p-2.5 rounded-lg shrink-0">
                                <Mail className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Email</p>
                                <p className="text-sm text-gray-500">
                                    hello@travelplan.lk
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-sky-50 p-2.5 rounded-lg shrink-0">
                                <Phone className="w-5 h-5 text-sky-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Phone</p>
                                <p className="text-sm text-gray-500">+94 11 234 5678</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-50 p-2.5 rounded-lg shrink-0">
                                <MapPin className="w-5 h-5 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-800">Office</p>
                                <p className="text-sm text-gray-500">
                                    42 Galle Road, Colombo 03
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            </section>

            {/* ── Trending Places (always visible) ── */}
            <section>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                    Trending Destinations
                </h2>
                <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
                    {trendingPlaces.map((place) => (
                        <div
                            key={place.name}
                            className="flex-shrink-0 w-[280px] md:w-auto snap-start"
                        >
                            <Card className="group relative h-72 overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-1">
                                <img
                                    src={place.image}
                                    alt={place.name}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute top-4 left-4">
                                    <Badge
                                        className={`${place.tagColor} text-white border-0 text-xs font-semibold px-3 py-1 shadow-lg`}
                                    >
                                        <Sparkles className="w-3 h-3 mr-1" />
                                        {place.tag}
                                    </Badge>
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <h3 className="text-xl font-bold text-white drop-shadow-lg">
                                        {place.name}
                                    </h3>
                                    <p className="text-white/70 text-sm mt-1 flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        Sri Lanka
                                    </p>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
