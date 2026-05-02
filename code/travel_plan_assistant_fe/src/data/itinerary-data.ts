export interface ItineraryDestination {
  id: string;
  destinationID?: number; // From API
  name: string;
  description: string;
  lat?: string;
  lng?: string;
  tag?: string[]; // From API
  category: string;
  highlights: string[];
  day: number;
  display_picture: string;
  district_name: string;
}

export interface RouteSegment {
  from: string;
  to: string;
  duration: string;
  distance: string;
  transport: string;
}

export const categoryColors: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  City: { bg: "bg-blue-50", text: "text-blue-700", dot: "#3b82f6" },
  Culture: { bg: "bg-purple-50", text: "text-purple-700", dot: "#a855f7" },
  Nature: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "#10b981" },
  Adventure: { bg: "bg-orange-50", text: "text-orange-700", dot: "#f97316" },
  Wildlife: { bg: "bg-amber-50", text: "text-amber-700", dot: "#f59e0b" },
  Heritage: { bg: "bg-rose-50", text: "text-rose-700", dot: "#f43f5e" },
  Historical: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "#6366f1" },
};
