import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { format, differenceInDays } from "date-fns";
import type { DateRange } from "react-day-picker";
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
  Check,
  ChevronsUpDown,
  Sparkles,
} from "lucide-react";

import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Slider } from "../components/ui/slider";
import { Badge } from "../components/ui/badge";
import { Calendar } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../components/ui/command";
import { cn } from "../components/ui/utils";
import { sriLankaDistricts } from "../data/districts";

const transportModes = [
  { id: "flight", label: "Flight", icon: Plane },
  { id: "train", label: "Train", icon: Train },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "car", label: "Car", icon: Car },
  { id: "tuktuk", label: "Tuk-Tuk", icon: Car },
] as const;

export function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, setShowLoginModal, setPendingAction } = useAuth();
  // Date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const tripDays =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from) + 1
      : 0;

  // Budget
  const [budget, setBudget] = useState([1500]);

  // Transport
  const [transport, setTransport] = useState<string>("");

  // District combobox
  const [districtOpen, setDistrictOpen] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);

  // Must-visit places
  const [placeInput, setPlaceInput] = useState("");
  const [places, setPlaces] = useState<string[]>([]);

  const addPlace = () => {
    const trimmed = placeInput.trim();
    if (trimmed && !places.includes(trimmed)) {
      setPlaces((prev) => [...prev, trimmed]);
      setPlaceInput("");
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

  const handlePlanTrip = useCallback(() => {
    const submitTrip = () => {
      // Form data is preserved in component state via closure
      navigate("/itinerary");
    };

    if (isAuthenticated) {
      submitTrip();
    } else {
      setPendingAction(() => submitTrip);
      setShowLoginModal(true);
    }
  }, [isAuthenticated, navigate, setPendingAction, setShowLoginModal]);

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
              <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
                {tripDays} {tripDays === 1 ? "day" : "days"}
              </span>
            )}
          </div>
        </section>

        {/* ── 2. Planned Budget ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              Planned Budget
            </Label>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              ${budget[0].toLocaleString()}
            </span>
          </div>
          <Slider
            id="budget-slider"
            value={budget}
            onValueChange={setBudget}
            min={100}
            max={10000}
            step={50}
            className="[&_[data-slot=slider-track]]:h-3 [&_[data-slot=slider-range]]:bg-gradient-to-r [&_[data-slot=slider-range]]:from-emerald-400 [&_[data-slot=slider-range]]:to-teal-500 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-emerald-500"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>$100</span>
            <span>$10,000</span>
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
              return (
                <button
                  key={mode.id}
                  type="button"
                  id={`transport-${mode.id}`}
                  onClick={() => setTransport(mode.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100 scale-[1.03]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  )}
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

        {/* ── 4. Districts (multi-select) ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-500" />
            Districts
          </Label>
          <Popover open={districtOpen} onOpenChange={setDistrictOpen}>
            <PopoverTrigger asChild>
              <Button
                id="district-selector"
                variant="outline"
                role="combobox"
                aria-expanded={districtOpen}
                className="w-full sm:w-[320px] justify-between h-11 font-normal"
              >
                {districts.length > 0
                  ? `${districts.length} district${districts.length > 1 ? "s" : ""} selected`
                  : "Search and select districts…"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <Command>
                <CommandInput placeholder="Search districts…" />
                <CommandList>
                  <CommandEmpty>No district found.</CommandEmpty>
                  <CommandGroup>
                    {sriLankaDistricts.map((d) => (
                      <CommandItem
                        key={d}
                        value={d}
                        onSelect={(val) => {
                          setDistricts((prev) =>
                            prev.includes(val)
                              ? prev.filter((item) => item !== val)
                              : [...prev, val]
                          );
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            districts.includes(d) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {d}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {districts.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {districts.map((d) => (
                <Badge
                  key={d}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
                >
                  {d}
                  <button
                    type="button"
                    onClick={() =>
                      setDistricts((prev) => prev.filter((item) => item !== d))
                    }
                    className="ml-0.5 rounded-full hover:bg-rose-200 p-0.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </section>

        {/* ── 5. Must-Visit Places ── */}
        <section className="space-y-3">
          <Label className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Must-Visit Places
          </Label>
          <div className="flex gap-2">
            <Input
              id="place-input"
              placeholder="e.g. Sigiriya Rock Fortress"
              value={placeInput}
              onChange={(e) => setPlaceInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-11"
            />
            <Button
              id="add-place-btn"
              type="button"
              onClick={addPlace}
              disabled={!placeInput.trim()}
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

        {/* ── Plan Trip Button ── */}
        <Button
          id="plan-trip-btn"
          type="button"
          size="lg"
          onClick={handlePlanTrip}
          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-600 text-white shadow-lg shadow-indigo-200 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-300 hover:scale-[1.01] cursor-pointer"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Plan Trip
        </Button>
      </Card>
    </div>
  );
}
