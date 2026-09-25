import { useState, useEffect } from "react";
import { User, Mail, Calendar, MapPin, Edit3, Map, Camera, Globe, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router";
import { api } from "../axios";

type FormKey = "name" | "phone" | "location";

export function MyProfile() {
    const { user } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [subStatus, setSubStatus] = useState<{ isSubscribed: boolean; planCount: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        tripsPlanned: 0,
        placesVisited: 0,
        photosTaken: 0,
        countries: 1
    });

    const [preferences, setPreferences] = useState({
        favoriteCategories: ["Culture", "Nature", "Adventure", "Heritage", "Wildlife"],
        travelStyle: ["Budget-Friendly", "Solo Traveler", "Photography"],
        preferredTransport: "Train & Tuk-tuk",
        budgetRange: "$50 - $100 / day"
    });

    const [formData, setFormData] = useState({
        name: user?.name || "",
        phone: "",
        location: "",
    });

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const { data } = await api.get("/api/subscriptions/status");
                if (data.success) {
                    setSubStatus(data);
                }
            } catch (err) {
                console.error("Failed to fetch subscription status");
            }
        };

        const fetchProfile = async () => {
            try {
                const { data } = await api.get("/api/profile");
                if (data.success) {
                    setFormData({
                        name: data.profile.name,
                        phone: data.profile.phone,
                        location: data.profile.location
                    });
                    if (data.profile.preferences) {
                        setPreferences(data.profile.preferences);
                    }
                    if (data.stats) {
                        setStats(data.stats);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch profile");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
        fetchProfile();
    }, []);

    const fields: { label: string; name: FormKey }[] = [
        { label: "Full Name", name: "name" },
        { label: "Phone", name: "phone" },
        { label: "Location", name: "location" },
    ];
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        try {
            await api.put("/api/profile/update", {
                ...formData,
                preferences
            });
            console.log("Profile saved successfully");
        } catch (err) {
            console.error("Failed to update profile", err);
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="relative">
                {/* Cover */}
                <div className="h-48 rounded-2xl overflow-hidden bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRWMGgxdjM0aDI1djFIMzZ6TTAgMzVoMVYwaDJ2MzVIRHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-14 left-8 flex items-end gap-5">
                    <div className="w-28 h-28 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl border-4 border-white overflow-hidden relative">
                        {profileImage ? (
                            <img src={profileImage} className="w-full h-full object-cover" />
                        ) : (
                            user?.initials || "U"
                        )}

                        {isEditing && (
                            <label className="absolute bottom-0 bg-black/60 text-white text-xs w-full text-center cursor-pointer py-1">
                                Change
                                <input type="file" className="hidden" onChange={handleImageChange} />
                            </label>
                        )}
                    </div>
                    <div className="pb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{formData.name || "Traveler"}</h1>
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
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (isEditing) {
                                    handleSave();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                            className="text-indigo-600 hover:bg-indigo-50 cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5 mr-1" />
                            {isEditing ? "Save" : "Edit"}
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {fields.map((item) => (
                            <div key={item.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-sm text-gray-500">{item.label}</span>
                                {isEditing ? (
                                    <input
                                        name={item.name}
                                        value={formData[item.name]}
                                        onChange={handleChange}
                                        className="text-sm font-medium text-gray-800 border rounded px-2 py-1 text-right"
                                    />
                                ) : (
                                    <span className="text-sm font-medium text-gray-800">
                                        {formData[item.name] || "-"}
                                    </span>
                                )}
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
                            {isEditing ? (
                                <input
                                    value={preferences.favoriteCategories.join(", ")}
                                    onChange={(e) => setPreferences({ ...preferences, favoriteCategories: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                    className="text-sm font-medium text-gray-800 border rounded px-2 py-1 w-full"
                                    placeholder="Culture, Nature, Adventure..."
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {preferences.favoriteCategories.map((cat) => (
                                        <Badge key={cat} className="bg-indigo-50 text-indigo-700 border-0 px-3 py-1">
                                            {cat}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <span className="text-sm text-gray-500 block mb-2">Travel Style</span>
                            {isEditing ? (
                                <input
                                    value={preferences.travelStyle.join(", ")}
                                    onChange={(e) => setPreferences({ ...preferences, travelStyle: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                    className="text-sm font-medium text-gray-800 border rounded px-2 py-1 w-full"
                                    placeholder="Budget-Friendly, Solo..."
                                />
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {preferences.travelStyle.map((style) => (
                                        <Badge key={style} className="bg-purple-50 text-purple-700 border-0 px-3 py-1">
                                            {style}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-sm text-gray-500">Preferred Transport</span>
                            {isEditing ? (
                                <input
                                    value={preferences.preferredTransport}
                                    onChange={(e) => setPreferences({ ...preferences, preferredTransport: e.target.value })}
                                    className="text-sm font-medium text-gray-800 border rounded px-2 py-1 text-right"
                                />
                            ) : (
                                <span className="text-sm font-medium text-gray-800">{preferences.preferredTransport}</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-sm text-gray-500">Budget Range</span>
                            {isEditing ? (
                                <input
                                    value={preferences.budgetRange}
                                    onChange={(e) => setPreferences({ ...preferences, budgetRange: e.target.value })}
                                    className="text-sm font-medium text-gray-800 border rounded px-2 py-1 text-right"
                                />
                            ) : (
                                <span className="text-sm font-medium text-gray-800">{preferences.budgetRange}</span>
                            )}
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
                            { label: "Trips Planned", value: stats.tripsPlanned, icon: <Map className="w-7 h-7 text-indigo-500" /> },
                            { label: "Places Saved", value: stats.placesVisited, icon: <MapPin className="w-7 h-7 text-rose-500" /> },
                            { label: "Photos Taken", value: stats.photosTaken, icon: <Camera className="w-7 h-7 text-amber-500" /> },
                            { label: "Countries", value: stats.countries, icon: <Globe className="w-7 h-7 text-emerald-500" /> },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl bg-linear-to-br from-gray-50 to-indigo-50/50">
                                <div className="mb-2 flex justify-center">{stat.icon}</div>
                                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Subscription Status */}
                <Card className="p-6 shadow-md border-0 md:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-indigo-500" />
                            Subscription Plan
                        </h2>
                        {subStatus?.isSubscribed && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </Badge>
                        )}
                    </div>

                    <div className={`p-5 rounded-xl border ${subStatus?.isSubscribed ? 'bg-amber-50/50 border-amber-100' : 'bg-gray-50 border-gray-100'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
                        <div>
                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                {subStatus?.isSubscribed ? "Premium Member" : "Free Tier"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {subStatus?.isSubscribed
                                    ? "You have unlimited access to AI planning and all premium features."
                                    : `You have used ${subStatus?.planCount ?? 0} out of 3 free trips.`}
                            </p>
                            {!subStatus?.isSubscribed && (
                                <div className="mt-3 flex items-center gap-3">
                                    <div className="flex-1 w-full sm:w-50 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-indigo-500 rounded-full"
                                            style={{ width: `${Math.min(((subStatus?.planCount ?? 0) / 3) * 100, 100)}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500">{subStatus?.planCount ?? 0}/3</span>
                                </div>
                            )}
                        </div>
                        {!subStatus?.isSubscribed && (
                            <Link to="/subscription" className="w-full md:w-auto shrink-0 mt-2 md:mt-0">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
                                    Upgrade to Premium
                                </Button>
                            </Link>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
