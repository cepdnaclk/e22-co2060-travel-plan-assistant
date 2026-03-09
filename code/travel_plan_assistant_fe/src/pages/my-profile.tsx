import { User, Mail, Calendar, MapPin, Edit3 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";

export function MyProfile() {
    const { user } = useAuth();

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="relative">
                {/* Cover */}
                <div className="h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRWMGgxdjM0aDI1djFIMzZ6TTAgMzVoMVYwaDJ2MzVIRHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-14 left-8 flex items-end gap-5">
                    <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white">
                        {user?.initials || "U"}
                    </div>
                    <div className="pb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{user?.name || "Traveler"}</h1>
                        <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {user?.email || "user@example.com"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12">
                {/* Personal Info */}
                <Card className="p-6 shadow-md border-0">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-500" />
                            Personal Information
                        </h2>
                        <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50 cursor-pointer">
                            <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Full Name", value: user?.name || "Traveler" },
                            { label: "Email", value: user?.email || "user@example.com" },
                            { label: "Phone", value: "+94 77 123 4567" },
                            { label: "Location", value: "Colombo, Sri Lanka" },
                        ].map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-500">{item.label}</span>
                                <span className="text-sm font-medium text-gray-800">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Travel Preferences */}
                <Card className="p-6 shadow-md border-0">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                        <MapPin className="w-5 h-5 text-indigo-500" />
                        Travel Preferences
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <span className="text-sm text-gray-500 block mb-2">Favorite Categories</span>
                            <div className="flex flex-wrap gap-2">
                                {["Culture", "Nature", "Adventure", "Heritage", "Wildlife"].map((cat) => (
                                    <Badge key={cat} className="bg-indigo-50 text-indigo-700 border-0 px-3 py-1">
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block mb-2">Travel Style</span>
                            <div className="flex flex-wrap gap-2">
                                {["Budget-Friendly", "Solo Traveler", "Photography"].map((style) => (
                                    <Badge key={style} className="bg-purple-50 text-purple-700 border-0 px-3 py-1">
                                        {style}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Preferred Transport</span>
                            <span className="text-sm font-medium text-gray-800">Train & Tuk-tuk</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Budget Range</span>
                            <span className="text-sm font-medium text-gray-800">$50 - $100 / day</span>
                        </div>
                    </div>
                </Card>

                {/* Stats */}
                <Card className="p-6 shadow-md border-0 md:col-span-2">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-5">
                        <Calendar className="w-5 h-5 text-indigo-500" />
                        Travel Stats
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Trips Planned", value: "3", icon: "🗺️" },
                            { label: "Places Visited", value: "12", icon: "📍" },
                            { label: "Photos Taken", value: "248", icon: "📸" },
                            { label: "Countries", value: "1", icon: "🌍" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/50">
                                <div className="text-2xl mb-1">{stat.icon}</div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
