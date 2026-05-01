import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Star, MapPin, DollarSign, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";

type ApiDestination = {
  destinationID?: number | string;
  id?: number | string;
  name?: string;
  rating?: number | string | null;
  tag?: string[] | string | null;
};

type DestinationCardItem = {
  id: string;
  name: string;
  country: string;
  description: string;
  category: string;
  image: string;
  rating: number;
  price: string;
};

export function Destinations() {
  const ITEMS_PER_PAGE = 9;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [destinations, setDestinations] = useState<DestinationCardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000";

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch(`${apiBaseUrl}/api/destinations`);
        const payload: ApiDestination[] = await response.json();

        if (!response.ok) {
          throw new Error("Failed to fetch destinations");
        }

        const mappedDestinations = (Array.isArray(payload) ? payload : []).map((item) => {
          const destinationId = item.destinationID ?? item.id;
          const rating = Number(item.rating);
          const tags = Array.isArray(item.tag)
            ? item.tag.filter((value): value is string => typeof value === "string")
            : typeof item.tag === "string"
              ? [item.tag]
              : [];
          const primaryTag =
            tags.find((tag) => tag.toLowerCase() !== "establishment") ||
            tags[0] ||
            "General";

          return {
            id: String(destinationId ?? ""),
            name: item.name?.trim() || "Unknown Destination",
            country: "Sri Lanka",
            description: "Discover this destination in Sri Lanka.",
            category: primaryTag
              .split("_")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join(" "),
            image:
              "https://images.unsplash.com/photo-1572451479139-6a308211d8be?auto=format&fit=crop&q=80&w=1200",
            rating: Number.isFinite(rating) ? rating : 0,
            price: "N/A",
          } as DestinationCardItem;
        });

        setDestinations(mappedDestinations.filter((item) => item.id));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Could not load destinations.";
        setFetchError(message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDestinations();
  }, [apiBaseUrl]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(destinations.map((d) => d.category)));
    return ["All", ...unique];
  }, [destinations]);

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || dest.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, destinations]);

  const totalPages = Math.max(1, Math.ceil(filteredDestinations.length / ITEMS_PER_PAGE));
  const paginatedDestinations = filteredDestinations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const startResult = filteredDestinations.length === 0
    ? 0
    : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endResult = Math.min(currentPage * ITEMS_PER_PAGE, filteredDestinations.length);

  const pageItems = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const items: Array<number | "ellipsis-left" | "ellipsis-right"> = [1];
    const windowStart = Math.max(2, currentPage - 1);
    const windowEnd = Math.min(totalPages - 1, currentPage + 1);

    if (windowStart > 2) {
      items.push("ellipsis-left");
    }

    for (let page = windowStart; page <= windowEnd; page += 1) {
      items.push(page);
    }

    if (windowEnd < totalPages - 1) {
      items.push("ellipsis-right");
    }

    items.push(totalPages);
    return items;
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Destinations</h1>
        <p className="text-gray-600">Discover amazing places for your next adventure</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search destinations..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDestinations.map((destination) => (
          <Link to={`/destinations/${destination.id}`} key={destination.id} className="block group">
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-medium">{destination.rating}</span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {destination.name}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                    <MapPin className="w-4 h-4" />
                    <span>{destination.country}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{destination.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{destination.category}</Badge>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">{destination.price}</span>
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {!isLoading && !fetchError && filteredDestinations.length > 0 && (
        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-100 px-8 py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-medium text-slate-700">
              Showing {startResult} to {endResult} of {filteredDestinations.length} results
            </p>

            <div className="inline-flex w-fit items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
              <button
                type="button"
                aria-label="Go to previous page"
                className="h-10 w-10 border-r border-gray-300 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
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
                      className="flex h-10 w-10 items-center justify-center border-r border-gray-300 text-slate-500"
                    >
                      ...
                    </span>
                  );
                }

                const page = item;
                const isActive = page === currentPage;

                return (
                  <button
                    key={page}
                    type="button"
                    className={`h-10 min-w-12 border-r border-gray-300 px-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-800 hover:bg-gray-50"
                    }`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
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
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading destinations...</p>
        </div>
      )}

      {fetchError && (
        <div className="text-center py-12">
          <p className="text-red-600">{fetchError}</p>
        </div>
      )}

      {!isLoading && !fetchError && filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No destinations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
