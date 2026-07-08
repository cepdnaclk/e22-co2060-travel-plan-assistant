import { Link } from "react-router";
import { mockTrips } from "../data/trips-data";
import { useState, useEffect } from "react";
import { api } from "../axios";
import {
  Map,
  CalendarDays,
  MapPin,
  TrendingUp,
  Sparkles,
  Globe,
  Phone,
  Mail,
  Shield,
  Compass,
  Heart,
  Star,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../context/AuthContext";
import heroBg from "../assets/hero-bg.png";

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
    value: String(mockTrips.length),
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
  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const [trendingDestinations, setTrendingDestinations] = useState<any[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrendingDestinations = async () => {
      try {
        setLoadingTrending(true);
        const response = await api.get("/api/destinations/trending");
        // Ensure we have an array
        const destinationList = Array.isArray(response.data)
          ? response.data
          : [];
        setTrendingDestinations(destinationList);
      } catch (error) {
        console.error("Failed to fetch trending destinations:", error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingDestinations();
  }, []);

  return (
    <div>
      {/* ── Hero Section with Background Image ── */}
      <section
        className="relative flex items-center justify-center bg-cover bg-center bg-no-repeat w-full"
        style={{ backgroundImage: `url(${heroBg})`, minHeight: "100vh" }}
      >
        {/* Dark gradient overlay for text readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 40%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%)",
          }}
        />

        {/* Hero Content — directly on the image, no box */}
        <div className="relative z-10 flex flex-col items-center text-center px-6 py-24 w-full max-w-3xl mx-auto">
          {/* Praying hands emoji */}
          <p
            className="text-5xl mb-4"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
              animation: "heroFadeUp 0.8s ease-out both",
            }}
          >
            🙏
          </p>

          {/* Greeting Text */}
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-4"
            style={{
              animation: "heroFadeUp 0.8s ease-out 0.15s both",
            }}
          >
            {isAuthenticated && user ? (
              <>
                <span className="text-white drop-shadow-lg">
                  Welcome back,{" "}
                </span>
                <span
                  className="bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent"
                  style={{
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
                  }}
                >
                  {user.name}!
                </span>
              </>
            ) : (
              <span
                className="bg-linear-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent font-amsHiru md:text-9xl text-6xl"
                style={{
                  filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
                }}
              >
                wdhqfndajka<span className="font-sans italic">!</span>
              </span>
            )}
          </h1>

          {/* Sub-text */}
          <p
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto font-medium mb-8"
            style={{
              animation: "heroFadeUp 0.8s ease-out 0.3s both",
              textShadow: "0 1px 6px rgba(0,0,0,0.5)",
            }}
          >
            {isAuthenticated
              ? "Here's your travel dashboard — plan, explore, and track your Sri Lanka adventures."
              : "Your gateway to unforgettable adventures across the Pearl of the Indian Ocean."}
          </p>

          {/* CTA Button */}
          <div
            style={{
              animation: "heroFadeUp 0.8s ease-out 0.45s both",
            }}
          >
            <Link to="/plan">
              <Button
                id="hero-start-planning-btn"
                size="lg"
                className="h-14 px-10 text-lg font-semibold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white shadow-2xl shadow-indigo-900/30 transition-all duration-300 hover:shadow-indigo-500/40 hover:scale-[1.04] cursor-pointer border border-white/20"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Planning Your Trip
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Below-hero content: solid background ── */}
      <div className="bg-slate-50 px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* ── Logged-in: User Stats + Upcoming Trip ── */}
          {isAuthenticated && (
            <>
              {/* Quick Stats Row */}
              {/* <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <Card
                      key={stat.label}
                      className="relative overflow-hidden p-6 bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                    >
                      <div
                        className={`absolute top-0 left-0 right-0 h-1 bg-linear-to-r ${stat.accent} opacity-80`}
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
              </section> */}
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
                    className="p-6 bg-white border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
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
            <Card className="p-8 bg-white border-0 shadow-md">
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
            <Card className="p-8 bg-white border-0 shadow-md">
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
                    <p className="text-sm text-gray-500">hello@travelplan.lk</p>
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
            {loadingTrending ? (
              <div className="flex justify-center items-center h-80 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">
                  Loading trending destinations...
                </p>
              </div>
            ) : (
              <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none scrollbar-hide">
                {trendingDestinations.map((place) => (
                  <Link
                    key={place.destinationID}
                    to={`/destinations/${place.destinationID}`}
                    className="shrink-0 w-70 md:w-auto snap-start"
                  >
                    <Card className="group relative h-72 overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer hover:-translate-y-1">
                      <img
                        src={`${apiBaseUrl}/public/destinations/${place.display_picture}`}
                        alt={place.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-amber-500 text-white border-0 text-xs font-semibold px-3 py-1 shadow-lg">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          {place.rating}
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
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
