import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Polyline,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  itineraryDestinations,
  routeSegments,
  categoryColors,
  type ItineraryDestination,
  type RouteSegment,
} from "../data/itinerary-data";

// Sri Lanka center & zoom
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const DEFAULT_ZOOM = 8;

interface SriLankaMapProps {
  activeId?: number;
  onDestinationClick?: (dest: ItineraryDestination) => void;
  destinations?: ItineraryDestination[];
  routeSegments?: RouteSegment[];
  routeCoords?: [number, number][];
}

/** Smoothly fly to active destination */
function FlyToActive({
  activeId,
  destinations,
}: {
  activeId?: number;
  destinations: ItineraryDestination[];
}) {
  const map = useMap();
  useEffect(() => {
    if (activeId) {
      const dest = destinations.find((d) => d.destinationID === activeId);
      if (dest) {
        map.flyTo([dest.lat, dest.lng], 10, { duration: 0.8 });
      }
    } else {
      map.flyTo(SRI_LANKA_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
    }
  }, [activeId, destinations, map]);
  return null;
}

export function SriLankaMap({
  activeId,
  onDestinationClick,
  destinations,
  routeSegments: segments,
  routeCoords,
}: SriLankaMapProps) {
  const selectedDestinations =
    destinations && destinations.length > 0
      ? destinations
      : itineraryDestinations;
  const selectedSegments =
    segments && segments.length > 0 ? segments : routeSegments;

  const getDestById = (id: string) =>
    selectedDestinations.find((d) => d.id === id);

  return (
    <div className="relative w-full">
      {/* Map container with styled wrapper */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-white/10">
        {/* Title overlay */}
        <div className="absolute top-4 left-4 z-10 pointer-events-none">
          <div className="bg-slate-900/80 backdrop-blur-md rounded-xl px-4 py-2.5 border border-white/10 shadow-lg">
            <h3 className="text-white/90 text-sm font-medium tracking-widest uppercase">
              Your Route
            </h3>
            <p className="text-white/50 text-xs mt-0.5">
              {selectedDestinations.length} destinations ·{" "}
              {selectedSegments.length} routes
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-1.5 pointer-events-none">
          {Object.entries(categoryColors).map(([cat, colors]) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-white/10 text-[10px] text-white/70 font-medium shadow-md"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors.dot }}
              />
              {cat}
            </span>
          ))}
        </div>

        <div className="relative z-0">
          <MapContainer
            center={SRI_LANKA_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            style={{ height: "520px", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <FlyToActive
              activeId={activeId}
              destinations={selectedDestinations}
            />

            {/* Route lines */}
            {routeCoords && routeCoords.length > 0 && (
              <Polyline
                positions={routeCoords}
                pathOptions={{
                  color: "#4f46e5",
                  weight: 4,
                  opacity: 0.9,
                }}
              />
            )}

            {/* Destination markers */}
            {selectedDestinations.map((dest) => {
              const isActive = activeId === dest.id;
              const color = categoryColors[dest.category]?.dot ?? "#6366f1";

              return (
                <CircleMarker
                  key={dest.id}
                  center={[dest.lat, dest.lng]}
                  radius={isActive ? 12 : 8}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: isActive ? 1 : 0.85,
                    color: isActive ? "#ffffff" : color,
                    weight: isActive ? 3 : 2,
                    opacity: 1,
                  }}
                  eventHandlers={{
                    click: () => onDestinationClick?.(dest),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -10]}
                    className="destination-tooltip"
                  >
                    <div className="min-w-[180px]">
                      <p className="font-bold text-gray-900 text-sm">
                        {dest.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Day {dest.day} · {dest.district}
                      </p>
                      <p className="text-[11px] text-gray-600 mt-1.5 line-clamp-2">
                        {dest.description}
                      </p>
                    </div>
                  </Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Custom styles for Leaflet tooltips */}
      <style>{`
                .route-duration-tooltip {
                    background: rgba(30, 27, 75, 0.9) !important;
                    border: 1px solid rgba(99, 102, 241, 0.5) !important;
                    border-radius: 12px !important;
                    color: #c7d2fe !important;
                    padding: 3px 10px !important;
                    font-size: 10px !important;
                    font-weight: 600 !important;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
                    white-space: nowrap !important;
                }
                .route-duration-tooltip::before {
                    display: none !important;
                }
                .destination-tooltip {
                    border-radius: 12px !important;
                    padding: 10px 14px !important;
                    box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important;
                    border: 1px solid rgba(0,0,0,0.08) !important;
                }
                .destination-tooltip::before {
                    border-top-color: white !important;
                }
                .leaflet-container {
                    border-radius: 16px;
                    font-family: system-ui, -apple-system, sans-serif;
                }
            `}</style>
    </div>
  );
}
