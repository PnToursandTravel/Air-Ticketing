"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plane, Search, X, Check } from "lucide-react";
import { Airport } from "@/types";
import { searchAirports, AIRPORTS } from "@/lib/data/airports";
import { cn } from "@/lib/utils";

interface AirportAutocompleteProps {
  label: string;
  value: string; // airport code, e.g. "EBB"
  onChange: (airport: Airport) => void;
  placeholder?: string;
  excludeCode?: string;
  error?: string;
  variant?: "standard" | "segmented";
  className?: string;
  inputPaddingClass?: string;
}

export const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search airport or city",
  excludeCode,
  error,
  variant = "standard",
  className,
  inputPaddingClass,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedAirport = searchAirports(value).find((a) => a.code === value);

  const getDisplayCity = (city?: string) => {
    if (!city) return "";
    if (city.includes("/")) return city.split("/")[0].trim();
    return city;
  };

  const formatAirportDisplay = (airport?: Airport) => {
    if (!airport) return "";
    return `${getDisplayCity(airport.city)} (${airport.code})`;
  };

  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(formatAirportDisplay(selectedAirport));
  const [searchQuery, setSearchQuery] = useState("");

  // Sync displayed input value when external value changes
  useEffect(() => {
    if (!open) {
      setInputValue(formatAirportDisplay(selectedAirport));
    }
  }, [value, selectedAirport, open]);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearchQuery("");
        setInputValue(formatAirportDisplay(selectedAirport));
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        setSearchQuery("");
        setInputValue(formatAirportDisplay(selectedAirport));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedAirport]);

  // Compute matching results based on search query or default recommendations
  const results = searchQuery.trim()
    ? searchAirports(searchQuery).filter((a) => a.code !== excludeCode)
    : AIRPORTS.filter((a) => a.code !== excludeCode).slice(0, 8);

  const handleSelectAirport = (airport: Airport) => {
    onChange(airport);
    setInputValue(formatAirportDisplay(airport));
    setSearchQuery("");
    setOpen(false);
  };

  // Segmented Variant (for the unified search bar)
  if (variant === "segmented") {
    return (
      <div ref={containerRef} className={cn("relative w-full", className)}>
        {/* Main Input Box */}
        <div
          onClick={() => {
            setOpen(true);
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
          className={cn(
            "w-full h-[74px] bg-white rounded-xl transition-all duration-150 flex flex-col justify-between px-4 py-2.5 cursor-text relative shadow-sm border border-transparent",
            open ? "ring-2 ring-primary/50 border-primary bg-white shadow-md z-30" : "hover:border-slate-300",
            error && "ring-2 ring-semantic-down",
            inputPaddingClass
          )}
        >
          {/* Top Label */}
          <div className="flex items-center justify-between w-full pointer-events-none select-none">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {label}
            </span>
            {selectedAirport && !open && (
              <span className="font-mono text-[11px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded">
                {selectedAirport.code}
              </span>
            )}
          </div>

          {/* Direct Text Input */}
          <div className="flex items-center justify-between w-full">
            <input
              ref={inputRef}
              type="text"
              value={open ? (searchQuery !== "" ? searchQuery : inputValue) : inputValue}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setInputValue(e.target.value);
                if (!open) setOpen(true);
              }}
              onFocus={() => {
                setOpen(true);
                // Pre-select text so user can immediately type a new city
                inputRef.current?.select();
              }}
              placeholder={placeholder}
              className="w-full bg-transparent text-sm sm:text-base font-bold text-ink outline-none placeholder:text-slate-400 placeholder:font-normal truncate leading-tight"
            />

            {open && (searchQuery || inputValue) && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                  setInputValue("");
                  inputRef.current?.focus();
                }}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 transition-colors ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <span className="absolute -bottom-5 left-2 text-[10px] text-semantic-down font-medium">
            {error}
          </span>
        )}

        {/* Floating Dropdown Results Menu */}
        {open && (
          <div className="absolute top-[78px] left-0 w-full min-w-[280px] sm:min-w-[340px] bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150 ring-1 ring-black/5">
            {/* Header info */}
            <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <span>{searchQuery ? "Matching Destinations" : "Popular Destinations"}</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">
                {results.length} airports
              </span>
            </div>

            {/* List of Airports */}
            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 touch-scroll" role="listbox">
              {results.length === 0 ? (
                <div className="p-5 text-center text-xs text-slate-400">
                  No airports found for &quot;{searchQuery}&quot;. Try typing city name or 3-letter IATA code.
                </div>
              ) : (
                results.map((airport) => {
                  const isSelected = airport.code === value;
                  return (
                    <button
                      type="button"
                      key={airport.code}
                      onClick={() => handleSelectAirport(airport)}
                      className={cn(
                        "w-full text-left px-3.5 py-2.5 hover:bg-primary/5 transition-colors flex items-center justify-between group cursor-pointer",
                        isSelected && "bg-primary/10"
                      )}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        {/* IATA Code Pill */}
                        <span
                          className={cn(
                            "font-mono font-bold text-xs px-2 py-1 rounded-md flex-shrink-0 transition-colors",
                            isSelected
                              ? "bg-primary text-on-primary"
                              : "bg-slate-100 text-ink group-hover:bg-primary group-hover:text-on-primary"
                          )}
                        >
                          {airport.code}
                        </span>

                        {/* City, Country & Name */}
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-ink group-hover:text-primary transition-colors truncate">
                            {airport.city}, {airport.country}
                          </span>
                          <span className="text-[10px] text-slate-400 truncate max-w-[210px]">
                            {airport.name}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Standard Variant (fallback for modals/other views)
  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
        {label}
      </label>

      {/* Trigger Box */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          "w-full h-14 px-4 py-2 bg-surface-soft text-left rounded-md border border-hairline transition-all duration-150 flex items-center justify-between group hover:border-primary min-h-[56px]",
          open && "border-primary ring-2 ring-primary/20",
          error && "border-semantic-down"
        )}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-pill bg-surface-card flex items-center justify-center flex-shrink-0 text-muted group-hover:text-primary transition-colors">
            <Plane className="w-4 h-4" />
          </div>
          <div className="flex flex-col truncate">
            {selectedAirport ? (
              <>
                <div className="flex items-center space-x-1.5">
                  <span className="font-mono font-bold text-sm text-ink">{selectedAirport.code}</span>
                  <span className="text-xs text-body font-medium truncate">{selectedAirport.city}</span>
                </div>
                <span className="text-[11px] text-muted truncate">{selectedAirport.name}</span>
              </>
            ) : (
              <span className="text-sm text-muted">{placeholder}</span>
            )}
          </div>
        </div>
      </button>

      {error && <span className="text-xs text-semantic-down font-medium mt-1">{error}</span>}

      {/* Popover list */}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-full max-w-[calc(100vw-2rem)] sm:w-80 bg-surface-card rounded-xl border border-hairline shadow-2xl z-50 overflow-hidden">
          <div className="p-3 border-b border-hairline bg-surface-soft flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type city, country or 3-letter IATA..."
              className="w-full bg-transparent text-xs text-ink placeholder:text-muted outline-none h-8"
              aria-label="Filter airports by city or code"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-hairline touch-scroll" role="listbox">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted">No airports found</div>
            ) : (
              results.map((airport) => (
                <button
                  type="button"
                  key={airport.code}
                  onClick={() => handleSelectAirport(airport)}
                  className={cn(
                    "w-full text-left p-3 hover:bg-surface-soft transition-colors flex items-center justify-between group min-h-[44px]",
                    airport.code === value && "bg-surface-soft"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-xs bg-surface-strong px-2 py-1 rounded text-ink group-hover:bg-primary group-hover:text-on-primary transition-colors flex-shrink-0">
                      {airport.code}
                    </span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-semibold text-ink group-hover:text-primary truncate">
                        {airport.city}, {airport.country}
                      </span>
                      <span className="text-[10px] text-muted truncate max-w-[180px]">
                        {airport.name}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
