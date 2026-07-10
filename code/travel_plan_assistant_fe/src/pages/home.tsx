import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../axios";
import { useAuth } from "../context/AuthContext";
import { format, differenceInDays } from "date-fns";
import type { DateRange } from "../components/ui/calendar";
import {
  CalendarDays,
  DollarSign,
  MapPin,
  Plane,
  Train,
  Bus,
  Car,
  Plus,
  X,
  Sparkles,
  Loader2,
  AlertCircle,
  Navigation,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn } from "../components/ui/utils";

const transportModes = [
  { id: "flight", label: "Flight", icon: Plane },
  { id: "train", label: "Train", icon: Train },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "car", label: "Car", icon: Car },
  { id: "tuktuk", label: "Tuk-Tuk", icon: Car },
] as const;

type DestinationOption = {
  id: string | number;
  name: string;
};

// Interface for the API response
interface ApiDestination {
  destinationID?: number;
  id?: string | number;
  name: string;
}

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal, setPendingAction } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);

  const [showStartLocationDropdown, setShowStartLocationDropdown] =
    useState(false);
  const [showEndLocationDropdown, setShowEndLocationDropdown] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const tripDays =
    dateRange?.from
      ? dateRange.to
        ? differenceInDays(dateRange.to, dateRange.from) + 1
        : 1
      : 0;

  const [budget] = useState([1500]);
  const [transport, setTransport] = useState<string>("car");
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");
  const [validationError, setValidationError] = useState("");
  const [placeInput, setPlaceInput] = useState("");
  const [places, setPlaces] = useState<string[]>([]);

  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => setValidationError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const response = await api.get<ApiDestination[]>("/api/destinations");
        const destinationList = Array.isArray(response.data)
          ? response.data
          : [];

        const mappedDestinations: DestinationOption[] = destinationList.map(
          (dest) => ({
            id: dest.destinationID || dest.id || Math.random(),
            name: dest.name || "Unknown Destination",
          }),
        );

        setDestinations(mappedDestinations);
      } catch (error) {
        console.error("Failed to load destinations:", error);
        setDestinations([]);
      } finally {
      }
    };

    void loadDestinations();
  }, []);

  const getFilteredDestinations = (input: string): DestinationOption[] => {
    if (!input.trim()) return destinations;
    return destinations.filter((dest) =>
      dest.name.toLowerCase().includes(input.toLowerCase()),
    );
  };

  const addPlace = () => {
    const trimmed = placeInput.trim();
    const destinationExists = destinations.some(
      (dest) => dest.name.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!destinationExists) {
      setValidationError(`"${trimmed}" is not in our available destinations.`);
      return;
    }

    if (trimmed && !places.includes(trimmed)) {
      setPlaces((prev) => [...prev, trimmed]);
      setPlaceInput("");
      setShowPlaceDropdown(false);
    }
  };

  const handlePlanTrip = useCallback(() => {
    const hasLocations =
      startLocation.trim() !== "" && endLocation.trim() !== "";
    const hasPlaces = places.length > 0;

    if (!hasLocations && !hasPlaces) {
      setValidationError(
        "Please provide a Start/End location or add Must-Visit places.",
      );
      return;
    }

    if (tripDays <= 0) {
      setValidationError("Please select your travel dates.");
      return;
    }

    const submitTrip = async () => {
      setGenerationError(null);
      setIsGenerating(true);

      try {
        const intermediateStops = places.filter(
          (p) =>
            p.toLowerCase() !== startLocation.toLowerCase() &&
            p.toLowerCase() !== endLocation.toLowerCase(),
        );

        await api.post("/api/trips/generate", {
          startPlace: startLocation,
          endPlace: endLocation,
          desiredPlaces: intermediateStops,
          availableTime: tripDays * 24 * 60,
        });

        navigate("/itinerary");
      } catch (error: any) {
        setGenerationError(
          error.response?.data?.error || "Failed to generate itinerary.",
        );
      } finally {
        setIsGenerating(false);
      }
    };

    if (isAuthenticated) {
      void submitTrip();
    } else {
      setPendingAction(() => {
        void submitTrip();
      });
      setShowLoginModal(true);
    }
  }, [
    dateRange,
    isAuthenticated,
    navigate,
    places,
    setPendingAction,
    setShowLoginModal,
    tripDays,
    startLocation,
    endLocation,
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" /> Sri Lanka
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Plan Your Sri Lanka Adventure
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          Craft your perfect itinerary across the Pearl of the Indian Ocean.
        </p>
      </div>

      <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm space-y-10">
        {/* 1. Trip Duration */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" /> Trip Duration
          </Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[320px] justify-start text-left h-11",
                    !dateRange?.from && "text-muted-foreground",
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from
                    ? dateRange.to && differenceInDays(dateRange.to, dateRange.from) !== 0
                      ? `${format(dateRange.from, "MMM dd, yyyy")} – ${format(dateRange.to, "MMM dd, yyyy")}`
                      : format(dateRange.from, "MMM dd, yyyy")
                    : "Select travel dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
            {tripDays > 0 && (
              <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
                {tripDays} days
              </span>
            )}
          </div>
        </section>

        {/* 2. Budget (Implementation Soon) */}
        <section className="space-y-4 opacity-60 pointer-events-none">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Planned Budget
            </Label>
            <span className="text-2xl font-bold bg-linear-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              ${budget[0].toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Budget planning will be implemented soon
            </p>
          </div>
        </section>

        {/* 3. Transport */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-500" /> Transport
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {transportModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                disabled={mode.id !== "car"}
                onClick={() => setTransport(mode.id)}
                className={cn(
                  "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                  transport === mode.id
                    ? "border-indigo-500 bg-indigo-50 scale-[1.03]"
                    : "border-gray-200 bg-white opacity-50 cursor-not-allowed",
                  mode.id === "car" && "opacity-100 cursor-pointer",
                )}
              >
                <mode.icon
                  className={cn(
                    "w-6 h-6",
                    transport === mode.id ? "text-indigo-600" : "text-gray-500",
                  )}
                />
                <span className="text-xs font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 4. Route */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-rose-500" /> Route
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Input
                placeholder="Starting Location"
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                onFocus={() => setShowStartLocationDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowStartLocationDropdown(false), 200)
                }
                className="h-11"
              />
              {showStartLocationDropdown && startLocation && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(startLocation).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setStartLocation(dest.name);
                        setShowStartLocationDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm cursor-pointer"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                placeholder="End Location"
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                onFocus={() => setShowEndLocationDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowEndLocationDropdown(false), 200)
                }
                className="h-11"
              />
              {showEndLocationDropdown && endLocation && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(endLocation).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setEndLocation(dest.name);
                        setShowEndLocationDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm cursor-pointer"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 5. Must-Visit */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" /> Must-Visit Places
          </Label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                placeholder="Search destinations..."
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                onFocus={() => setShowPlaceDropdown(true)}
                onBlur={() =>
                  setTimeout(() => setShowPlaceDropdown(false), 200)
                }
                className="h-11"
              />
              {showPlaceDropdown && placeInput && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(placeInput).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setPlaceInput(dest.name);
                        setShowPlaceDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 text-sm cursor-pointer"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              onClick={addPlace}
              disabled={!placeInput.trim()}
              className="h-11 bg-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {places.map((place) => (
              <Badge
                key={place}
                variant="secondary"
                className="px-3 py-1.5 text-sm gap-1.5 bg-indigo-50 text-indigo-700"
              >
                {place}
                <button
                  type="button"
                  onClick={() => setPlaces(places.filter((p) => p !== place))}
                  className="rounded-full hover:bg-indigo-100 p-0.5 transition-colors cursor-pointer flex items-center justify-center"
                  aria-label={`Remove ${place}`}
                >
                  <X className="w-3.5 h-3.5 text-indigo-500 hover:text-indigo-700" />
                </button>
              </Badge>
            ))}
          </div>
        </section>

        {validationError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{validationError}</p>
          </div>
        )}

        <Button
          onClick={handlePlanTrip}
          disabled={isGenerating}
          className="w-full h-14 text-lg font-semibold bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" /> Plan Trip
            </>
          )}
        </Button>

        {generationError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
            {generationError}
          </p>
        )}
      </Card>
    </div>
  );
}
