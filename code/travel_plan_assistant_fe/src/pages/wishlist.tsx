import { useState } from "react";
import { Heart, MapPin, Star, ExternalLink } from "lucide-react";
import { Link } from "react-router";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

interface WishlistItem {
    id: number;
    name: string;
    location: string;
    category: string;
    rating: number;
    image: string;
    note: string;
}

const initialWishlist: WishlistItem[] = [
    {
        id: 1,
        name: "Sigiriya Rock Fortress",
        location: "Matale, Sri Lanka",
        category: "Historical",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
        note: "Must visit at sunrise for the best views",
    },
    {
        id: 2,
        name: "Mirissa Beach",
        location: "Matara, Sri Lanka",
        category: "Nature",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=600",
        note: "Whale watching season Dec–Apr",
    },
    {
        id: 3,
        name: "Temple of the Tooth",
        location: "Kandy, Sri Lanka",
        category: "Culture",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1590123575938-254aaa2cbb07?auto=format&fit=crop&q=80&w=600",
        note: "Evening puja ceremony is unforgettable",
    },
    {
        id: 4,
        name: "Nine Arches Bridge",
        location: "Ella, Sri Lanka",
        category: "Adventure",
        rating: 4.6,
        image: "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
        note: "Best with the morning train passing through",
    },
    {
        id: 5,
        name: "Galle Fort",
        location: "Galle, Sri Lanka",
        category: "Heritage",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1573225935973-40799471a5e0?auto=format&fit=crop&q=80&w=600",
        note: "Get lost in the colonial streets at sunset",
    },
    {
        id: 6,
        name: "Yala National Park",
        location: "Hambantota, Sri Lanka",
        category: "Wildlife",
        rating: 4.7,
        image: "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?auto=format&fit=crop&q=80&w=600",
        note: "Leopard safari — early morning is best",
    },
];

const categoryColors: Record<string, string> = {
    Historical: "bg-indigo-50 text-indigo-700",
    Nature: "bg-emerald-50 text-emerald-700",
    Culture: "bg-purple-50 text-purple-700",
    Adventure: "bg-orange-50 text-orange-700",
    Heritage: "bg-rose-50 text-rose-700",
    Wildlife: "bg-amber-50 text-amber-700",
};

export function Wishlist() {
    const [items, setItems] = useState(initialWishlist);

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

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
                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-red-50 flex items-center justify-center transition-colors shadow-sm"
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
                                <h3 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                    {item.name}
                                </h3>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                                    {item.location}
                                </div>
                                <p className="text-xs text-gray-400 italic bg-gray-50 px-3 py-2 rounded-lg">
                                    "{item.note}"
                                </p>
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
