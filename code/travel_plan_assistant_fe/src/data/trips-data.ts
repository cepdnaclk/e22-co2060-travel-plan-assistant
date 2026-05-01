export interface Trip {
  id: string;
  title: string;
  destinations: string[];
  dates: string;
  startDate: Date;
  daysUntil: number;
  duration: string;
  status: "upcoming" | "in-progress";
  tags: string[];
  image: string;
}

/**
 * Mock trips array — shared across Dashboard and Itinerary pages.
 * Sorted by startDate (most imminent first).
 */
export const mockTrips: Trip[] = [
  {
    id: "1",
    title: "Ella & Hill Country",
    destinations: ["Kandy", "Nuwara Eliya", "Ella"],
    dates: "May 10 – May 14, 2026",
    startDate: new Date("2026-05-10"),
    daysUntil: 12,
    duration: "5 days",
    status: "upcoming",
    tags: ["Nine Arches Bridge", "Little Adam's Peak", "Tea Plantations"],
    image:
      "https://images.unsplash.com/photo-1586613835650-9077e4931573?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "2",
    title: "Cultural Triangle Explorer",
    destinations: ["Colombo", "Dambulla", "Sigiriya", "Kandy"],
    dates: "Jun 1 – Jun 7, 2026",
    startDate: new Date("2026-06-01"),
    daysUntil: 34,
    duration: "7 days",
    status: "upcoming",
    tags: ["Sigiriya Rock", "Cave Temple", "Temple of the Tooth"],
    image:
      "https://images.unsplash.com/photo-1588598198321-9735fd52090c?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: "3",
    title: "Southern Coast Adventure",
    destinations: ["Galle", "Mirissa", "Yala"],
    dates: "Jul 15 – Jul 20, 2026",
    startDate: new Date("2026-07-15"),
    daysUntil: 78,
    duration: "6 days",
    status: "upcoming",
    tags: ["Galle Fort", "Whale Watching", "Safari"],
    image:
      "https://images.unsplash.com/photo-1573225935973-40799471a5e0?auto=format&fit=crop&q=80&w=600",
  },
];

/** Return the trip nearest to today (first in the sorted list). */
export function getDefaultTrip(): Trip {
  return mockTrips[0];
}

/** Find a trip by its id, or fall back to the default. */
export function getTripById(id: string | undefined): Trip {
  return mockTrips.find((t) => t.id === id) ?? getDefaultTrip();
}
