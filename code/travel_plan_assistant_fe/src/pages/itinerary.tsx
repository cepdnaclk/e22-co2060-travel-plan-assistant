import { useState } from "react";
import { MapPin, Navigation, Sparkles } from "lucide-react";
import { SriLankaMap } from "../components/SriLankaMap";
import { ItineraryTimeline } from "../components/ItineraryTimeline";
import type { ItineraryDestination } from "../data/itinerary-data";

export function Itinerary() {
  const [activeDestination, setActiveDestination] = useState<string | undefined>(undefined);

  const handleDestinationClick = (dest: ItineraryDestination) => {
    setActiveDestination((prev) => (prev === dest.id ? undefined : dest.id));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Page Header */}
      <div className="text-center space-y-3 py-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          <Navigation className="w-4 h-4" />
          Interactive Route Map
        </div>
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Your Sri Lanka Itinerary
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Explore your personalized travel route across the island. Click on any destination to highlight it on both the map and timeline.
        </p>
      </div>

      {/* Interactive Map Section */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-800">Route Overview</h2>
        </div>
        <SriLankaMap
          activeId={activeDestination}
          onDestinationClick={handleDestinationClick}
        />
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-semibold text-indigo-700 tracking-wide uppercase">
            Suggested Stops
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent" />
      </div>

      {/* Timeline Section */}
      <section>
        <ItineraryTimeline
          activeId={activeDestination}
          onDestinationClick={handleDestinationClick}
        />
      </section>
    </div>
  );
}