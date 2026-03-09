import { useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, Star, MapPin, DollarSign, Calendar, Camera } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { destinations } from "../data/destinations";
import { ImageViewer } from "../components/ImageViewer";

export function DestinationDetails() {
    const { id } = useParams();
    const destination = destinations.find((d) => d.id === Number(id));
    const [viewerIndex, setViewerIndex] = useState<number | null>(null);

    if (!destination) {
        return (
            <div className="text-center py-20 space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Destination not found</h2>
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
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl group">
                <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 text-white">
                    <Badge className="mb-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md">
                        {destination.category}
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold mb-2">{destination.name}</h1>
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
                            {destination.longDescription}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Top Activities</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {destination.activities.map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span className="font-medium text-gray-700">{activity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Camera className="w-6 h-6" />
                            Gallery
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            {destination.images.map((img, idx) => (
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

                    {/* Image Viewer Lightbox */}
                    {viewerIndex !== null && (
                        <ImageViewer
                            images={destination.images}
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
                                <span className="text-gray-500">Price Range</span>
                                <span className="font-bold text-xl text-green-600 flex items-center gap-1">
                                    <DollarSign className="w-5 h-5" />
                                    {destination.price}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                                <span className="text-gray-500">Rating</span>
                                <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-md">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-yellow-700">{destination.rating}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-gray-900 font-semibold mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Best Time to Visit
                                </h3>
                                <p className="text-gray-600 bg-blue-50 p-3 rounded-lg text-sm">
                                    {destination.bestTimeToVisit}
                                </p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
