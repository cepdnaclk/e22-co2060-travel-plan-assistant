import React, { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import type { ItineraryDestination } from "../data/itinerary-data";

interface DirectionsMapProps {
  destinations: ItineraryDestination[];
  sessionId?: number;
}

const DirectionsMap: React.FC<DirectionsMapProps> = ({ destinations }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    if (!destinations || destinations.length < 2) return;

    const validDestinations = destinations.filter(
      (d) =>
        d &&
        d.lat != null &&
        d.lng != null &&
        !isNaN(parseFloat(d.lat)) &&
        !isNaN(parseFloat(d.lng))
    );

    if (validDestinations.length < 2) return;

    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    loader.load().then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 7,
      });

      const renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      rendererRef.current = renderer;

      const directionsService = new google.maps.DirectionsService();

      const origin = {
        lat: parseFloat(validDestinations[0].lat!),
        lng: parseFloat(validDestinations[0].lng!),
      };
      const destination = {
        lat: parseFloat(validDestinations[validDestinations.length - 1].lat!),
        lng: parseFloat(validDestinations[validDestinations.length - 1].lng!),
      };
      const waypoints = validDestinations.slice(1, -1).map((d) => ({
        location: { lat: parseFloat(d.lat!), lng: parseFloat(d.lng!) },
        stopover: true,
      }));

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            renderer.setDirections(result);
          } else {
            console.error("Directions request failed with status:", status);
          }
        }
      );
    });
  }, [destinations]);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200">
      <div ref={mapRef} style={{ height: "600px", width: "100%" }} />
    </div>
  );
};

export default DirectionsMap;

