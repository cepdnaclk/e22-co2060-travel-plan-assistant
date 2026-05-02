import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
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
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { cn } from "../components/ui/utils";
import {
  itineraryDestinations as fallbackDestinations,
  type ItineraryDestination,
  type RouteSegment,
} from "../data/itinerary-data";

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

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal, setPendingAction } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [showStartLocationDropdown, setShowStartLocationDropdown] = useState(false);
  const [showEndLocationDropdown, setShowEndLocationDropdown] = useState(false);
  const [showPlaceDropdown, setShowPlaceDropdown] = useState(false);

  const apiBaseUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:5000";
  // Date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const tripDays =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from) + 1
      : 0;

  // Budget - disabled for now
  const [budget] = useState([1500]);

  // Transport - default to car
  const [transport, setTransport] = useState<string>("car");

  // Location inputs
  const [startLocation, setStartLocation] = useState("");
  const [endLocation, setEndLocation] = useState("");

  // Validation
  const [validationError, setValidationError] = useState("");

  // Auto-dismiss validation error after 5 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => setValidationError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Load destinations from API
  useEffect(() => {
    const loadDestinations = async () => {
      try {
        setIsLoadingDestinations(true);
        const response = await axios.get(`${apiBaseUrl}/api/destinations`);
        const destinationList = Array.isArray(response.data) ? response.data : [];
        
        const mappedDestinations: DestinationOption[] = destinationList.map((dest: any) => ({
          id: dest.destinationID || dest.id,
          name: dest.name || "Unknown Destination",
        }));
        
        setDestinations(mappedDestinations);
      } catch (error) {
        console.error("Failed to load destinations:", error);
        setDestinations([]);
      } finally {
        setIsLoadingDestinations(false);
      }
    };

    void loadDestinations();
  }, [apiBaseUrl]);

  // Must-visit places
  const [placeInput, setPlaceInput] = useState("");
  const [places, setPlaces] = useState<string[]>([]);

  // Filter destinations based on input
  const getFilteredDestinations = (input: string): DestinationOption[] => {
    if (!input.trim()) return destinations;
    return destinations.filter((dest) =>
      dest.name.toLowerCase().includes(input.toLowerCase())
    );
  };

  const addPlace = () => {
    const trimmed = placeInput.trim();
    const destinationExists = destinations.some(
      (dest) => dest.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (!destinationExists) {
      setValidationError(`"${trimmed}" is not in our available destinations. Please select from the list.`);
      return;
    }

    if (trimmed && !places.includes(trimmed)) {
      setPlaces((prev) => [...prev, trimmed]);
      setPlaceInput("");
      setShowPlaceDropdown(false);
    }
  };

  const removePlace = (place: string) => {
    setPlaces((prev) => prev.filter((p) => p !== place));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addPlace();
    }
  };

  const handleSelectStartLocation = (destName: string) => {
    setStartLocation(destName);
    setShowStartLocationDropdown(false);
  };

  const handleSelectEndLocation = (destName: string) => {
    setEndLocation(destName);
    setShowEndLocationDropdown(false);
  };

  const handleSelectPlace = (destName: string) => {
    setPlaceInput(destName);
    setShowPlaceDropdown(false);
  };

  const buildGeneratedDestinations = useCallback(
    (path: string[]): ItineraryDestination[] => {
      const byName = new Map(
        fallbackDestinations.map((d) => [d.name.toLowerCase(), d])
      );

      return path.map((name, index) => {
        const matched = byName.get(name.toLowerCase());
        const generatedId = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index + 1}`;

        if (matched) {
          return {
            ...matched,
            id: generatedId,
            day: index + 1,
          };
        }

        return {
          id: generatedId,
          name,
          district: "Sri Lanka",
          lat: 7.8731,
          lng: 80.7718,
          day: index + 1,
          description: "AI generated stop for your custom route.",
          category: "Custom",
          highlights: ["Generated itinerary stop"],
          image:
            "https://images.unsplash.com/photo-1573225935973-40799471a5e0?auto=format&fit=crop&q=80&w=600",
        };
      });
    },
    []
  );

  const buildGeneratedSegments = useCallback(
    (destinations: ItineraryDestination[]): RouteSegment[] => {
      if (destinations.length < 2) return [];

      return destinations.slice(1).map((destination, index) => ({
        from: destinations[index].id,
        to: destination.id,
        duration: "Calculated",
        distance: "Calculated",
        transport: transport || "Car",
      }));
    },
    [transport]
  );

  const handlePlanTrip = useCallback(() => {
    // Validation: at least one condition must be met
    const hasLocations = startLocation.trim() !== "" && endLocation.trim() !== "";
    const hasPlaces = places.length > 0;

    if (!hasLocations && !hasPlaces) {
      setValidationError(
        "Please provide either a Starting and End Location, or add at least one Must-Visit Place."
      );
      return;
    }

    // Validate that locations are from available destinations
    if (startLocation.trim() !== "") {
      const isValidStart = destinations.some(
        (d) => d.name.toLowerCase() === startLocation.toLowerCase()
      );
      if (!isValidStart) {
        setValidationError("Starting location must be from available destinations.");
        return;
      }
    }

    if (endLocation.trim() !== "") {
      const isValidEnd = destinations.some(
        (d) => d.name.toLowerCase() === endLocation.toLowerCase()
      );
      if (!isValidEnd) {
        setValidationError("End location must be from available destinations.");
        return;
      }
    }

    setValidationError("");

    const submitTrip = async () => {
      setGenerationError(null);

      const startPlace = startLocation || places[0];
      const desiredPlaces = [
        ...places.filter((p) => p !== startPlace),
        ...(endLocation ? [endLocation] : []),
      ];

      if (!startPlace) {
        setGenerationError("Select a starting location or add a place to start planning.");
        return;
      }

      if (tripDays <= 0) {
        setGenerationError("Please select your travel dates before generating the itinerary.");
        return;
      }

      if (desiredPlaces.length === 0) {
        setGenerationError("Add at least one additional stop to generate a route.");
        return;
      }

      try {
        setIsGenerating(true);

        const response = await axios.post(`${apiBaseUrl}/api/trips/generate`, {
          startPlace,
          desiredPlaces,
          availableTime: tripDays * 24 * 60, // Convert days to minutes
        });

        const payload = response.data;
        const generatedPath = payload?.data?.path;

        if (!Array.isArray(generatedPath) || generatedPath.length === 0) {
          throw new Error("Trip generation returned an empty route.");
        }

        const generatedDestinations = buildGeneratedDestinations(generatedPath);
        const generatedRouteSegments = buildGeneratedSegments(generatedDestinations);

        navigate("/itinerary", {
          state: {
            generatedTrip: {
              destinations: generatedDestinations,
              routeSegments: generatedRouteSegments,
              metadata: {
                budget: budget[0],
                transport,
                dateRange,
                backend: payload.data,
              },
            },
          },
        });
      } catch (error) {
        const message =
          axios.isAxiosError(error)
            ? error.response?.data?.error ||
              error.message ||
              "Failed to generate itinerary."
            : error instanceof Error
              ? error.message
              : "Could not generate itinerary right now.";
        setGenerationError(message);
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
    apiBaseUrl,
    budget,
    buildGeneratedDestinations,
    buildGeneratedSegments,
    dateRange,
    isAuthenticated,
    navigate,
    places,
    setPendingAction,
    setShowLoginModal,
    transport,
    tripDays,
    startLocation,
    endLocation,
    destinations,
  ]);

  console.log(tripDays)
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      {/* Hero */}
      <div className="text-center space-y-3 py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium mb-2">
          <MapPin className="w-4 h-4" />
          Sri Lanka
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
          Plan Your Sri Lanka Adventure
        </h1>
        <p className="text-gray-600 max-w-xl mx-auto text-lg">
          From misty hill country to golden beaches — craft your perfect
          itinerary across the Pearl of the Indian Ocean.
        </p>
      </div>

      {/* Form Card */}
      <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm space-y-10">
        {/* ── 1. Trip Duration ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-500" />
            Trip Duration
          </Label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date-range-picker"
                  variant="outline"
                  className={cn(
                    "w-full sm:w-[320px] justify-start text-left font-normal h-11",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} –{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    "Select travel dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" style={{ maxWidth: "none" }}>
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
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </span>
            )}
          </div>
        </section>

        {/* ── 2. Planned Budget ── */}
        <section className="space-y-4 opacity-60 pointer-events-none">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Planned Budget
            </Label>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              ${budget[0].toLocaleString()}
            </span>
          </div>
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">Budget planning will be implemented soon</p>
          </div>
        </section>

        {/* ── 3. Mode of Transport ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Plane className="w-5 h-5 text-sky-500" />
            Mode of Transport
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {transportModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = transport === mode.id;
              const isCarMode = mode.id === "car";
              return (
                <button
                  key={mode.id}
                  type="button"
                  id={`transport-${mode.id}`}
                  disabled={!isCarMode}
                  onClick={() => {
                    if (isCarMode) setTransport(mode.id);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                    isCarMode ? "cursor-pointer" : "cursor-not-allowed opacity-50",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 scale-[1.03]"
                      : isCarMode
                        ? "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        : "border-gray-200 bg-gray-100"
                  )}
                  title={!isCarMode ? "Only Car mode is available currently" : ""}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6 transition-colors",
                      isSelected ? "text-indigo-600" : "text-gray-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isSelected ? "text-indigo-700" : "text-gray-600"
                    )}
                  >
                    {mode.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── 4. Starting & End Location ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-rose-500" />
            Route
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 relative">
              <label
                htmlFor="start-location"
                className="text-sm font-medium text-gray-600"
              >
                Starting Location
              </label>
              <Input
                id="start-location"
                placeholder="Search destinations..."
                value={startLocation}
                onChange={(e) => setStartLocation(e.target.value)}
                onFocus={() => setShowStartLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowStartLocationDropdown(false), 200)}
                className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
                autoComplete="off"
              />
              {showStartLocationDropdown && startLocation && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(startLocation).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectStartLocation(dest.name)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5 relative">
              <label
                htmlFor="end-location"
                className="text-sm font-medium text-gray-600"
              >
                End Location
              </label>
              <Input
                id="end-location"
                placeholder="Search destinations..."
                value={endLocation}
                onChange={(e) => setEndLocation(e.target.value)}
                onFocus={() => setShowEndLocationDropdown(true)}
                onBlur={() => setTimeout(() => setShowEndLocationDropdown(false), 200)}
                className="h-11 bg-gray-50 border-gray-200 rounded-xl focus:bg-white transition-colors"
                autoComplete="off"
              />
              {showEndLocationDropdown && endLocation && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(endLocation).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectEndLocation(dest.name)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 5. Must-Visit Places ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Must-Visit Places
          </Label>
          <div className="flex gap-2 relative">
            <div className="flex-1 relative">
              <Input
                id="place-input"
                placeholder="Search destinations..."
                value={placeInput}
                onChange={(e) => setPlaceInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowPlaceDropdown(true)}
                onBlur={() => setTimeout(() => setShowPlaceDropdown(false), 200)}
                className="h-11 flex-1"
                autoComplete="off"
              />
              {showPlaceDropdown && placeInput && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {getFilteredDestinations(placeInput).map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => handleSelectPlace(dest.name)}
                      className="w-full text-left px-4 py-2 hover:bg-indigo-50 transition-colors text-sm"
                    >
                      {dest.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button
              id="add-place-btn"
              type="button"
              onClick={addPlace}
              disabled={!placeInput.trim() || isLoadingDestinations}
              className="h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          {places.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {places.map((place) => (
                <Badge
                  key={place}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                >
                  {place}
                  <button
                    type="button"
                    onClick={() => removePlace(place)}
                    className="ml-0.5 rounded-full hover:bg-indigo-200 p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* ── Validation Error Toast ── */}
        {validationError && (
          <div
            className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 animate-in fade-in slide-in-from-top-2 duration-300"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium">{validationError}</p>
            </div>
            <button
              type="button"
              onClick={() => setValidationError("")}
              className="shrink-0 rounded-full p-1 hover:bg-red-100 transition-colors cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Plan Trip Button ── */}
        <Button
          id="plan-trip-btn"
          type="button"
          size="lg"
          onClick={handlePlanTrip}
          disabled={isGenerating}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.01] cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Itinerary...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Plan Trip
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
