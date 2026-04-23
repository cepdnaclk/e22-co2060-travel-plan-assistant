export interface Destination {
    id: number;
    name: string;
    country: string;
    image: string;
    rating: number;
    price: string;
    category: string;
    description: string;
    longDescription: string;
    activities: string[];
    bestTimeToVisit: string;
    images: string[];
}

export const destinations: Destination[] = [
    {
        id: 1,
        name: "Maldives",
        country: "Maldives",
        image: "https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzcxNDE5NTk3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.9,
        price: "$$$",
        category: "Beach",
        description: "Crystal clear waters and pristine beaches",
        longDescription: "The Maldives is a tropical nation in the Indian Ocean composed of 26 ring-shaped atolls, which are made up of more than 1,000 coral islands. It's known for its beaches, blue lagoons and extensive reefs.",
        activities: ["Snorkeling", "Scuba Diving", "Island Hopping", "Sunset Cruise"],
        bestTimeToVisit: "November to April",
        images: [
            "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1540206395-ea122bb398d2?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 2,
        name: "Paris",
        country: "France",
        image: "https://images.unsplash.com/photo-1431274172761-fca41d930114?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGVpZmZlbCUyMHRvd2VyfGVufDF8fHx8MTc3MTQzOTcyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.8,
        price: "$$$",
        category: "City",
        description: "The city of lights and romance",
        longDescription: "Paris, France's capital, is a major European city and a global center for art, fashion, gastronomy and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine.",
        activities: ["Eiffel Tower Visit", "Louvre Museum", "Seine River Cruise", "Montmartre Walk"],
        bestTimeToVisit: "June to August and September to October",
        images: [
            "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1499856871940-a09627c6d7db?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 3,
        name: "Tokyo",
        country: "Japan",
        image: "https://images.unsplash.com/photo-1585085007341-a5aadf6e48e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMGNpdHlzY2FwZSUyMG5pZ2h0fGVufDF8fHx8MTc3MTQ3OTM0Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.7,
        price: "$$",
        category: "City",
        description: "Modern metropolis meets ancient tradition",
        longDescription: "Tokyo, Japan’s busy capital, mixes the ultramodern and the traditional, from neon-lit skyscrapers to historic temples. The opulent Meiji Shinto Shrine is known for its towering gate and surrounding woods.",
        activities: ["Shibuya Crossing", "Sensō-ji Temple", "Tokyo Skytree", "Tsukiji Outer Market"],
        bestTimeToVisit: "March to May and October to November",
        images: [
            "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 4,
        name: "New York",
        country: "USA",
        image: "https://images.unsplash.com/photo-1570304816841-906a17d7b067?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwc2t5bGluZXxlbnwxfHx8fDE3NzE0MjI5NjV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.6,
        price: "$$$",
        category: "City",
        description: "The city that never sleeps",
        longDescription: "New York City comprises 5 boroughs sitting where the Hudson River meets the Atlantic Ocean. At its core is Manhattan, a densely populated borough that’s among the world’s major commercial, financial and cultural centers.",
        activities: ["Times Square", "Central Park", "Statue of Liberty", "Empire State Building"],
        bestTimeToVisit: "April to June and September to November",
        images: [
            "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1499092346589-b9b66a77c2b7?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 5,
        name: "Swiss Alps",
        country: "Switzerland",
        image: "https://images.unsplash.com/photo-1668900016730-75a72135f96d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbnMlMjBsYW5kc2NhcGUlMjBzY2VuaWN8ZW58MXx8fHwxNzcxNTE1NjkxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.9,
        price: "$$$",
        category: "Mountain",
        description: "Breathtaking mountain scenery",
        longDescription: "The Swiss Alps are famous for their dramatic peaks, including the Matterhorn, and for their extensive glaciers, lakes, and alpine villages. It's a premier destination for hiking, skiing, and mountaineering.",
        activities: ["Skiing", "Hiking", "Matterhorn Sightseeing", "Scenic Train Rides"],
        bestTimeToVisit: "December to March (Skiing) or June to September (Hiking)",
        images: [
            "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 6,
        name: "Rome",
        country: "Italy",
        image: "https://images.unsplash.com/photo-1662898290891-a6c7f022e851?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21lJTIwY29sb3NzZXVtJTIwYW5jaWVudHxlbnwxfHx8fDE3NzE0MjI5Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.8,
        price: "$$",
        category: "Historical",
        description: "Ancient history and stunning architecture",
        longDescription: "Rome, Italy’s capital, is a sprawling, cosmopolitan city with nearly 3,000 years of globally influential art, architecture and culture on display. Ancient ruins such as the Forum and the Colosseum evoke the power of the former Roman Empire.",
        activities: ["Colosseum Tour", "Vatican Museums", "Trevi Fountain", "Pantheon"],
        bestTimeToVisit: "mid-April to mid-June and September to early November",
        images: [
            "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&q=80&w=1000"
        ]
    },
    {
        id: 7,
        name: "Barcelona",
        country: "Spain",
        image: "https://images.unsplash.com/photo-1741304787559-a392853b613b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXJjZWxvbmElMjBhcmNoaXRlY3R1cmUlMjBnYXVkaXxlbnwxfHx8fDE3NzE0MzA2MDN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        rating: 4.7,
        price: "$$",
        category: "City",
        description: "Gaudi's masterpieces and Mediterranean charm",
        longDescription: "Barcelona, the cosmopolitan capital of Spain’s Catalonia region, is known for its art and architecture. The fantastical Sagrada Família church and other modernist landmarks designed by Antoni Gaudí dot the city.",
        activities: ["Sagrada Família", "Park Güell", "La Rambla", "Gothic Quarter"],
        bestTimeToVisit: "May to June and September to October",
        images: [
            "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1563212711-ab2c0316d97c?auto=format&fit=crop&q=80&w=1000"
        ]
    },
];
