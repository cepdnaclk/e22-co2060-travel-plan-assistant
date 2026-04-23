export interface ItineraryDestination {
    id: string;
    name: string;
    district: string;
    /** Real GPS latitude */
    lat: number;
    /** Real GPS longitude */
    lng: number;
    day: number;
    description: string;
    category: string;
    highlights: string[];
    image: string;
}

export interface RouteSegment {
    from: string; // destination id
    to: string;   // destination id
    duration: string;
    distance: string;
    transport: string;
}

// Real GPS coordinates for Sri Lanka destinations
// Some days include multiple nearby destinations
export const itineraryDestinations: ItineraryDestination[] = [
    {
        id: "colombo",
        name: "Colombo",
        district: "Colombo",
        lat: 6.9271,
        lng: 79.8612,
        day: 1,
        description:
            "Start your adventure in Sri Lanka's vibrant capital city. Explore colonial architecture, bustling markets, and waterfront promenades.",
        category: "City",
        highlights: [
            "Gangaramaya Temple",
            "Galle Face Green",
            "Colombo National Museum",
            "Pettah Market",
        ],
        image:
            "https://images.unsplash.com/photo-1552055569-1df9bd7b0a4e?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "pinnawala",
        name: "Pinnawala",
        district: "Kegalle",
        lat: 7.3006,
        lng: 80.3880,
        day: 2,
        description:
            "Visit the famous elephant orphanage, home to the largest herd of captive elephants in the world. Watch them bathe in the river.",
        category: "Wildlife",
        highlights: [
            "Elephant Orphanage",
            "River Bathing",
            "Elephant Museum",
            "Souvenir Shops",
        ],
        image:
            "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "kandy",
        name: "Kandy",
        district: "Kandy",
        lat: 7.2906,
        lng: 80.6337,
        day: 2,
        description:
            "Discover the cultural heart of Sri Lanka, home to the sacred Temple of the Tooth and surrounded by lush green hills.",
        category: "Culture",
        highlights: [
            "Temple of the Tooth Relic",
            "Royal Botanic Gardens",
            "Kandy Lake",
            "Cultural Dance Show",
        ],
        image:
            "https://images.unsplash.com/photo-1590123575938-254aaa2cbb07?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "nuwara-eliya",
        name: "Nuwara Eliya",
        district: "Nuwara Eliya",
        lat: 6.9497,
        lng: 80.7891,
        day: 3,
        description:
            "Experience 'Little England' — misty tea plantations, rolling hills, and cool mountain air at 1,868m elevation.",
        category: "Nature",
        highlights: [
            "Tea Plantation Tour",
            "Horton Plains National Park",
            "Gregory Lake",
            "Hakgala Botanical Garden",
        ],
        image:
            "https://images.unsplash.com/photo-1566766189268-43e138f01e56?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "ella",
        name: "Ella",
        district: "Badulla",
        lat: 6.8667,
        lng: 81.0466,
        day: 3,
        description:
            "A charming hill town famous for its scenic train ride, iconic bridges, and breathtaking viewpoints.",
        category: "Adventure",
        highlights: [
            "Nine Arches Bridge",
            "Ella Rock Hike",
            "Little Adam's Peak",
            "Ravana Falls",
        ],
        image:
            "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "yala",
        name: "Yala",
        district: "Hambantota",
        lat: 6.3728,
        lng: 81.5168,
        day: 4,
        description:
            "Embark on a wildlife safari in Sri Lanka's most famous national park, home to leopards, elephants, and hundreds of bird species.",
        category: "Wildlife",
        highlights: [
            "Leopard Safari",
            "Elephant Watching",
            "Bird Watching",
            "Coastal Lagoons",
        ],
        image:
            "https://images.unsplash.com/photo-1581337204873-ef36aa186caa?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "galle",
        name: "Galle",
        district: "Galle",
        lat: 6.0535,
        lng: 80.2210,
        day: 5,
        description:
            "Wander through the UNESCO World Heritage Galle Fort, with its colonial streets, ocean views, and artisan boutiques.",
        category: "Heritage",
        highlights: [
            "Galle Fort",
            "Dutch Reformed Church",
            "Lighthouse",
            "Unawatuna Beach",
        ],
        image:
            "https://images.unsplash.com/photo-1573225935973-40799471a5e0?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "mirissa",
        name: "Mirissa",
        district: "Matara",
        lat: 5.9483,
        lng: 80.4528,
        day: 5,
        description:
            "Relax on golden beaches, go whale watching, and enjoy fresh seafood at this charming coastal town on the southern tip.",
        category: "Nature",
        highlights: [
            "Whale Watching",
            "Mirissa Beach",
            "Coconut Tree Hill",
            "Secret Beach",
        ],
        image:
            "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "dambulla",
        name: "Dambulla",
        district: "Matale",
        lat: 7.8675,
        lng: 80.6517,
        day: 6,
        description:
            "Explore the magnificent cave temple complex, a UNESCO World Heritage site featuring 153 Buddha statues and ancient frescoes.",
        category: "Heritage",
        highlights: [
            "Cave Temple",
            "Golden Temple",
            "Buddha Statues",
            "Ancient Frescoes",
        ],
        image:
            "https://images.unsplash.com/photo-1588598198321-9735fd52090c?auto=format&fit=crop&q=80&w=600",
    },
    {
        id: "sigiriya",
        name: "Sigiriya",
        district: "Matale",
        lat: 7.9570,
        lng: 80.7603,
        day: 6,
        description:
            "Climb the ancient rock fortress rising 200m above the jungle — one of the most dramatic sights in all of Asia.",
        category: "Historical",
        highlights: [
            "Sigiriya Rock Fortress",
            "Pidurangala Rock",
            "Sigiriya Museum",
            "Village Tour",
        ],
        image:
            "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
    },
];

export const routeSegments: RouteSegment[] = [
    {
        from: "colombo",
        to: "pinnawala",
        duration: "1h 45m",
        distance: "82 km",
        transport: "Car",
    },
    {
        from: "pinnawala",
        to: "kandy",
        duration: "1h 30m",
        distance: "42 km",
        transport: "Car",
    },
    {
        from: "kandy",
        to: "nuwara-eliya",
        duration: "2h 45m",
        distance: "77 km",
        transport: "Train",
    },
    {
        from: "nuwara-eliya",
        to: "ella",
        duration: "2h 30m",
        distance: "58 km",
        transport: "Train",
    },
    {
        from: "ella",
        to: "yala",
        duration: "2h 45m",
        distance: "130 km",
        transport: "Car",
    },
    {
        from: "yala",
        to: "galle",
        duration: "3h 15m",
        distance: "180 km",
        transport: "Car",
    },
    {
        from: "galle",
        to: "mirissa",
        duration: "0h 40m",
        distance: "30 km",
        transport: "Tuk-tuk",
    },
    {
        from: "mirissa",
        to: "dambulla",
        duration: "4h 30m",
        distance: "220 km",
        transport: "Car",
    },
    {
        from: "dambulla",
        to: "sigiriya",
        duration: "0h 30m",
        distance: "17 km",
        transport: "Tuk-tuk",
    },
];

/** Category → tailwind color class mapping */
export const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
    City: { bg: "bg-blue-50", text: "text-blue-700", dot: "#3b82f6" },
    Culture: { bg: "bg-purple-50", text: "text-purple-700", dot: "#a855f7" },
    Nature: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "#10b981" },
    Adventure: { bg: "bg-orange-50", text: "text-orange-700", dot: "#f97316" },
    Wildlife: { bg: "bg-amber-50", text: "text-amber-700", dot: "#f59e0b" },
    Heritage: { bg: "bg-rose-50", text: "text-rose-700", dot: "#f43f5e" },
    Historical: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "#6366f1" },
};
