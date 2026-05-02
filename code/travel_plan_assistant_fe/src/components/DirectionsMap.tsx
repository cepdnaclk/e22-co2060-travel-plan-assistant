import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { ItineraryDestination } from "../pages/itinerary";


interface DirectionsMapProps {
  destinations: ItineraryDestination[];
  sessionId: number;
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({ destinations, sessionId }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      // 1. Setup Map & Renderer
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 7,
      });

      const renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      rendererRef.current = renderer;

      // 2. Check Cache
      const cacheKey = `route_cache_${sessionId}`;
      const cachedResponse = localStorage.getItem(cacheKey);

      if (cachedResponse) {
        console.log("Loading route from cache...");
        renderer.setDirections(JSON.parse(cachedResponse));
        return; // Stop here, no need to call Google Service
      }

      // 3. If no cache, call Directions Service
      const directionsService = new google.maps.DirectionsService();
      
      const origin = { lat: parseFloat(destinations[0].lat), lng: parseFloat(destinations[0].lng) };
      const destination = { lat: parseFloat(destinations[destinations.length - 1].lat), lng: parseFloat(destinations[destinations.length - 1].lng) };
      const waypoints = destinations.slice(1, -1).map(d => ({
        location: { lat: parseFloat(d.lat), lng: parseFloat(d.lng) },
        stopover: true
      }));

      directionsService.route({
        origin,
        destination,
        waypoints,
        travelMode: google.maps.TravelMode.DRIVING,
      }, (result, status) => {
        if (status === "OK" && result) {
          renderer.setDirections(result);
          // Save to localStorage for next time
          localStorage.setItem(cacheKey, JSON.stringify(result));
        }
      });
    });
  }, [destinations, sessionId]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
    </div>
  );
};

export default DirectionsMap;
