import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { api } from "../axios";
import axios from "axios";
import { ArrowLeft, Star, MapPin, Camera } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ImageViewer } from "../components/ImageViewer";

type UserReview = {
  text: string;
  author: string;
  rating: number;
};

type ApiDestination = {
  destinationID?: number | string;
  name?: string;
  rating?: number | string;
  tag?: string[] | string;
  description?: string;
  user_reviews?: UserReview[];
  display_picture?: string;
};

type DestinationDetailsItem = {
  id: string;
  name: string;
  country: string;
  description: string;
  fullDescription: string;
  category: string;
  image: string;
  rating: number;
  userReviews: UserReview[];
  activities?: string[];
  images?: string[];
  price?: string;
  bestTimeToVisit?: string;
};

export function DestinationDetails() {
  const { id } = useParams();
  const [destination, setDestination] = useState<DestinationDetailsItem | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000";

  useEffect(() => {
    const loadDestination = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get<ApiDestination>(
          `/api/destinations/${id}`,
        );

        const data = response.data;

        const mappedDestination: DestinationDetailsItem = {
          id: String(data.destinationID || id || ""),
          name: data.name?.trim() || "Unknown Destination",
          country: "Sri Lanka",
          description:
            data.description?.trim() ||
            "Discover this destination in Sri Lanka.",
          fullDescription: data.description?.trim() || "",
          userReviews: data.user_reviews || [],
          category: Array.isArray(data.tag)
            ? data.tag
                .find((t) => t?.toLowerCase() !== "establishment")
                ?.split("_")
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" ") || "General"
            : typeof data.tag === "string"
              ? data.tag
                  .split("_")
                  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                  .join(" ")
              : "General",
          image: data.display_picture
            ? `${apiBaseUrl}/public/destinations/${data.display_picture}`
            : "https://images.unsplash.com/photo-1572451479139-6a308211d8be?auto=format&fit=crop&q=80&w=1200",
          rating: Number(data.rating) || 0,
          images: [
            data.display_picture
              ? `${apiBaseUrl}/public/destinations/${data.display_picture}`
              : "",
          ],
          price: "N/A",
          bestTimeToVisit: "November to April",
        };

        setDestination(mappedDestination);
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.error ||
            err.message ||
            "Failed to fetch destination"
          : err instanceof Error
            ? err.message
            : "Could not load destination.";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      void loadDestination();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-gray-500">Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {error ? "Error loading destination" : "Destination not found"}
        </h2>
        {error && <p className="text-red-600">{error}</p>}
        <Link to="/destinations">
          <Button>Back to Destinations</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Navigation */}
      <Link
        to="/destinations"
        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Destinations
      </Link>

      {/* Hero Section */}
      <div className="relative h-100 rounded-2xl overflow-hidden shadow-2xl group">
        <img
          src={destination.image}
          alt={destination.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-8 text-white">
          <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
            {destination.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            {destination.name}
          </h1>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{destination.country}</span>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {destination.fullDescription}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-6 h-6" />
              Gallery
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {destination.images?.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-video rounded-xl overflow-hidden shadow-sm cursor-pointer group/img relative"
                  onClick={() => setViewerIndex(idx)}
                >
                  <img
                    src={img}
                    alt={`${destination.name} ${idx + 1}`}
                    className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-white opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 drop-shadow-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews Section */}
          {destination.userReviews && destination.userReviews.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Visitor Reviews ({destination.userReviews.length})
              </h2>
              <div className="space-y-4">
                {destination.userReviews.map((review, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-100 rounded-lg hover:border-indigo-200 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-gray-900">
                        {review.author}
                      </p>
                      <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm font-medium text-yellow-700">
                          {review.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Viewer Lightbox */}
          {viewerIndex !== null && (
            <ImageViewer
              images={destination.images ?? []}
              initialIndex={viewerIndex}
              alt={destination.name}
              onClose={() => setViewerIndex(null)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <span className="text-gray-500">Rating</span>
                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-yellow-700">
                    {destination.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
