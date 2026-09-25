import { useState, useEffect } from "react";
import { Heart, MapPin, Star, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { api } from "../axios";

interface WishlistItem {
    id: number;
    wishlist_id: number;
    name: string;
    location: string;
    category: string;
    rating: number;
    image: string;
    note: string;
}

const categoryColors: Record<string, string> = {
    Historical: "bg-indigo-50 text-indigo-700",
    Nature: "bg-emerald-50 text-emerald-700",
    Culture: "bg-purple-50 text-purple-700",
    Adventure: "bg-orange-50 text-orange-700",
    Heritage: "bg-rose-50 text-rose-700",
    Wildlife: "bg-amber-50 text-amber-700",
    Attraction: "bg-blue-50 text-blue-700",
};

export function Wishlist() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const { data } = await api.get("/api/wishlist");
            if (data.success) {
                setItems(data.items);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist", error);
        } finally {
            setIsLoading(false);
        }
    };

    const removeItem = async (destinationId: number) => {
        try {
            const { data } = await api.delete(`/api/wishlist/remove/${destinationId}`);
            if (data.success) {
                setItems((prev) => prev.filter((item) => item.id !== destinationId));
            }
        } catch (error) {
            console.error("Failed to remove item", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <p className="text-gray-500">Loading your wishlist...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                        My Wishlist
                    </h1>
                    <p className="text-gray-500">
                        Places you'd love to visit. {items.length} saved destinations.
                    </p>
                </div>
            </div>

            {/* Grid */}
            {items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item) => (
                        <Card
                            key={item.id}
                            className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                        >
                            {/* Image */}
                            <div className="relative h-44 overflow-hidden">
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                {/* Category badge */}
                                <Badge className={`absolute top-3 left-3 ${categoryColors[item.category] || "bg-gray-50 text-gray-700"} border-0 text-[10px] font-semibold`}>
                                    {item.category}
                                </Badge>

                                {/* Heart & remove */}
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm z-10"
                                    title="Remove from wishlist"
                                >
                                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                                </button>

                                {/* Rating */}
                                <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                    <span className="text-xs text-white font-medium">{item.rating}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-2.5">
                                <Link to={`/destinations/${item.id}`}>
                                    <h3 className="font-bold text-gray-900 hover:text-indigo-700 transition-colors cursor-pointer">
                                        {item.name}
                                    </h3>
                                </Link>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                    {item.location}
                                </div>
                                {item.note && (
                                    <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg line-clamp-2">
                                        "{item.note}"
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 space-y-4">
                    <Heart className="w-16 h-16 text-gray-200 mx-auto" />
                    <h3 className="text-xl font-semibold text-gray-400">Your wishlist is empty</h3>
                    <p className="text-gray-400">Start exploring destinations and save your favorites!</p>
                    <Link
                        to="/destinations"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-4"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Explore Destinations
                    </Link>
                </div>
            )}
        </div>
    );
}
