import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { api } from "../axios";
import axios from "axios";
import {
  Star,
  MapPin,
  Search,
  ChevronLeft,
  ChevronRight,
  Compass,
  Hotel,
  Utensils,
  Layers,
  Phone,
  Globe,
  X,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

type UserReview = {
  text: string;
  author: string;
  rating: number;
};

type PlaceType = "all" | "attraction" | "hotel" | "restaurant";

type DestinationCardItem = {
  id: string;
  numericId?: number;
  name: string;
  country: string;
  description: string;
  fullDescription?: string;
  userReviews?: UserReview[];
  category: string;
  type: "attraction" | "hotel" | "restaurant";
  image: string;
  rating: number;
  price?: string;
  address?: string;
  phone?: string;
  website?: string;
  openingHours?: string[];
  districtName?: string;
};

export function Destinations() {
  const ITEMS_PER_PAGE = 9;
  const [activeTab, setActiveTab] = useState<PlaceType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [places, setPlaces] = useState<DestinationCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDetailPlace, setSelectedDetailPlace] = useState<DestinationCardItem | null>(null);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000";

  useEffect(() => {
    const loadAllPlaces = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch all places directly from destinations table
        const response = await api.get("/api/destinations");
        const data = Array.isArray(response.data) ? response.data : [];

        const allMapped: DestinationCardItem[] = data.map((item: any) => {
          const destinationId = item.destinationID ?? item.id;
          const rating = Number(item.rating);
          const type: "attraction" | "hotel" | "restaurant" =
            item.type === "hotel"
              ? "hotel"
              : item.type === "restaurant"
              ? "restaurant"
              : "attraction";

          const tags = Array.isArray(item.tag)
            ? item.tag.filter((v: any): v is string => typeof v === "string")
            : typeof item.tag === "string"
              ? [item.tag]
              : [];

          const primaryTag =
            tags.find((t: string) => t.toLowerCase() !== "establishment") ||
            tags[0] ||
            (type === "hotel" ? "Hotel" : type === "restaurant" ? "Restaurant" : "Attraction");

          const category =
            type === "hotel"
              ? item.hotel_type || "Hotel"
              : type === "restaurant"
              ? item.cuisine_type || "Restaurant"
              : primaryTag
                  .split("_")
                  .map((p: string) => p.charAt(0).toUpperCase() + p.slice(1))
                  .join(" ");

          const priceLevel =
            item.hotel_price_level ?? item.restaurant_price_level ?? null;
          const priceStr = priceLevel ? "$".repeat(priceLevel) : undefined;

          const imageUrl = item.display_picture
            ? `${apiBaseUrl}/public/destinations/${item.display_picture}`
            : type === "hotel"
            ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800"
            : type === "restaurant"
            ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800"
            : "https://images.unsplash.com/photo-1572451479139-6a308211d8be?auto=format&fit=crop&q=80&w=800";

          return {
            id: `dest-${destinationId}`,
            numericId: Number(destinationId),
            name: item.name?.trim() || "Unknown Place",
            country: item.district_name || "Sri Lanka",
            description: item.description?.trim() || "Place in Sri Lanka",
            fullDescription: item.description?.trim(),
            userReviews: item.user_reviews || [],
            category,
            type,
            image: imageUrl,
            rating: Number.isFinite(rating) ? rating : 0,
            price: priceStr,
            address: item.address,
            phone: item.hotel_phone || item.restaurant_phone,
            website: item.hotel_website || item.restaurant_website,
            openingHours: item.opening_hours,
            districtName: item.district_name,
          };
        });

        setPlaces(allMapped);
      } catch (error) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message ||
            error.message ||
            "Failed to fetch destinations"
          : error instanceof Error
            ? error.message
            : "Could not load places.";
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAllPlaces();
  }, [apiBaseUrl]);

  // Filter by Main Type tab
  const placesByTab = useMemo(() => {
    if (activeTab === "all") return places;
    return places.filter((p) => p.type === activeTab);
  }, [places, activeTab]);

  // Sub-categories based on active tab
  const subCategories = useMemo(() => {
    const unique = Array.from(new Set(placesByTab.map((d) => d.category)));
    return ["All", ...unique];
  }, [placesByTab]);

  // Final filtered list
  const filteredPlaces = useMemo(() => {
    return placesByTab.filter((place) => {
      const matchesSearch =
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSubCategory =
        selectedSubCategory === "All" || place.category === selectedSubCategory;

      return matchesSearch && matchesSubCategory;
    });
  }, [placesByTab, searchQuery, selectedSubCategory]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedSubCategory("All");
  }, [activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSubCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE)
  );
  const paginatedPlaces = filteredPlaces.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const startResult =
    filteredPlaces.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult = Math.min(
    currentPage * ITEMS_PER_PAGE,
    filteredPlaces.length
  );

  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);
    if (windowStart > 2) items.push("ellipsis-left");
    for (let page = windowStart; page <= windowEnd; page += 1) items.push(page);
    if (windowEnd < totalPages - 1) items.push("ellipsis-right");
    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  const tabCounts = useMemo(() => {
    return {
      all: places.length,
      attraction: places.filter((p) => p.type === "attraction").length,
      hotel: places.filter((p) => p.type === "hotel").length,
      restaurant: places.filter((p) => p.type === "restaurant").length,
    };
  }, [places]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Explore Sri Lanka
        </h1>
        <p className="text-gray-600">
          Discover top attractions, luxury hotels, and authentic culinary dining spots
        </p>
      </div>

      {/* Primary Category Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "all"
              ? "bg-white text-indigo-600 shadow-md scale-[1.02]"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Places</span>
          <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold">
            {tabCounts.all}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("attraction")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "attraction"
              ? "bg-white text-blue-600 shadow-md scale-[1.02]"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Attractions</span>
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
            {tabCounts.attraction}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hotel")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "hotel"
              ? "bg-white text-purple-600 shadow-md scale-[1.02]"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <Hotel className="w-4 h-4" />
          <span>Hotels & Stays</span>
          <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold">
            {tabCounts.hotel}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("restaurant")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            activeTab === "restaurant"
              ? "bg-white text-amber-600 shadow-md scale-[1.02]"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
          }`}
        >
          <Utensils className="w-4 h-4" />
          <span>Restaurants & Dining</span>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
            {tabCounts.restaurant}
          </span>
        </button>
      </div>

      {/* Search and Secondary Sub-Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder={`Search ${activeTab === "all" ? "destinations, hotels, restaurants" : activeTab + "s"}...`}
            className="pl-10 h-12 bg-white rounded-xl shadow-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {subCategories.length > 2 && (
          <div className="flex gap-2 flex-wrap">
            {subCategories.map((category) => (
              <Badge
                key={category}
                variant={selectedSubCategory === category ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-xs font-medium transition-all ${
                  selectedSubCategory === category
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200"
                }`}
                onClick={() => setSelectedSubCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Places Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 bg-gray-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl">
          {fetchError}
        </div>
      ) : filteredPlaces.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl">
          No {activeTab === "all" ? "places" : activeTab + "s"} found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedPlaces.map((place) => {
            const isAttraction = place.type === "attraction";

            const CardContent = (
              <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group border-gray-100 rounded-2xl">
                <div className="relative h-52 overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  />

                  {/* Rating Badge */}
                  {place.rating > 0 && (
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-800">
                        {place.rating}
                      </span>
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`text-xs font-semibold px-2.5 py-1 shadow-sm backdrop-blur-xs ${
                        place.type === "hotel"
                          ? "bg-purple-600/90 text-white"
                          : place.type === "restaurant"
                          ? "bg-amber-600/90 text-white"
                          : "bg-blue-600/90 text-white"
                      }`}
                    >
                      {place.type === "hotel"
                        ? "🏨 Hotel"
                        : place.type === "restaurant"
                        ? "🍽️ Restaurant"
                        : "🏛️ Attraction"}
                    </Badge>
                  </div>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-gray-500 text-xs font-medium">
                      <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="line-clamp-1">{place.address || place.country}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 pt-1">
                      {place.fullDescription || place.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {place.category}
                    </Badge>
                    {place.price && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {place.price}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );

            if (isAttraction && place.numericId) {
              return (
                <Link
                  to={`/destinations/${place.numericId}`}
                  key={place.id}
                  className="block group h-full"
                >
                  {CardContent}
                </Link>
              );
            }

            return (
              <div
                key={place.id}
                onClick={() => setSelectedDetailPlace(place)}
                className="cursor-pointer group h-full"
              >
                {CardContent}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !fetchError && filteredPlaces.length > 0 && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-4">
          <p className="text-sm font-medium text-slate-700">
            Showing {startResult} to {endResult} of {filteredPlaces.length} places
          </p>

          <div className="inline-flex w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
            <button
              type="button"
              aria-label="Go to previous page"
              className="h-10 w-10 border-r border-gray-200 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mx-auto h-4 w-4" />
            </button>

            {pageItems.map((item, index) => {
              if (typeof item !== "number") {
                return (
                  <span
                    key={`${item}-${index}`}
                    className="flex h-10 w-10 items-center justify-center border-r border-gray-200 text-slate-400 text-sm"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={item}
                  type="button"
                  className={`h-10 w-10 border-r border-gray-200 text-sm font-medium transition ${
                    currentPage === item
                      ? "bg-indigo-600 text-white font-bold"
                      : "text-slate-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setCurrentPage(item)}
                >
                  {item}
                </button>
              );
            })}

            <button
              type="button"
              aria-label="Go to next page"
              className="h-10 w-10 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="mx-auto h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Hotel & Restaurant Detail Modal */}
      {selectedDetailPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setSelectedDetailPlace(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-64 shrink-0 bg-gray-100">
              <img
                src={selectedDetailPlace.image}
                alt={selectedDetailPlace.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-xs text-white px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-bold">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <span>{selectedDetailPlace.rating}</span>
                {selectedDetailPlace.price && (
                  <span className="ml-2 text-emerald-300">
                    • {selectedDetailPlace.price}
                  </span>
                )}
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={
                      selectedDetailPlace.type === "hotel"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {selectedDetailPlace.category}
                  </Badge>
                  {selectedDetailPlace.districtName && (
                    <Badge variant="outline">{selectedDetailPlace.districtName}</Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedDetailPlace.name}
                </h2>
                {selectedDetailPlace.address && (
                  <p className="flex items-center gap-1.5 text-gray-500 text-sm mt-1">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{selectedDetailPlace.address}</span>
                  </p>
                )}
              </div>

              {selectedDetailPlace.fullDescription && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-1">
                    About
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedDetailPlace.fullDescription}
                  </p>
                </div>
              )}

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                {selectedDetailPlace.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Phone className="w-4 h-4 text-indigo-500 shrink-0" />
                    <a
                      href={`tel:${selectedDetailPlace.phone}`}
                      className="hover:underline text-indigo-600"
                    >
                      {selectedDetailPlace.phone}
                    </a>
                  </div>
                )}
                {selectedDetailPlace.website && (
                  <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <a
                      href={selectedDetailPlace.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-indigo-600 truncate"
                    >
                      Visit Official Website
                    </a>
                  </div>
                )}
              </div>

              {/* Reviews preview */}
              {selectedDetailPlace.userReviews && selectedDetailPlace.userReviews.length > 0 && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                    Guest Reviews
                  </h4>
                  <div className="space-y-2">
                    {selectedDetailPlace.userReviews.slice(0, 2).map((rev, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-xs font-semibold text-gray-800">
                          <span>{rev.author}</span>
                          <span className="flex items-center gap-1 text-yellow-600">
                            ★ {rev.rating}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 italic line-clamp-2">
                          "{rev.text}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3">
                <Button
                  onClick={() => setSelectedDetailPlace(null)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
