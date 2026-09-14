"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plane, Search } from "lucide-react";
import { Airport } from "@/types";
import { searchAirports } from "@/lib/data/airports";
import { cn } from "@/lib/utils";

interface AirportAutocompleteProps {
  label: string;
  value: string; // airport code, e.g. "EBB"
  onChange: (airport: Airport) => void;
  placeholder?: string;
  excludeCode?: string;
  error?: string;
}

export const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  label,
  value,
  onChange,
  placeholder = "Search airport or city",
  excludeCode,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const results = searchAirports(searchQuery).filter((a) => a.code !== excludeCode);
  const selectedAirport = searchAirports(value).find((a) => a.code === value);

  return (
    <div ref={containerRef} className="relative w-full">
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
          "w-full h-14 px-4 py-2 bg-canvas text-left rounded-md border border-hairline transition-all duration-150 flex items-center justify-between group hover:border-muted min-h-[56px]",
          open && "border-primary ring-2 ring-primary/20",
          error && "border-semantic-down"
        )}
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-8 h-8 rounded-pill bg-surface-strong flex items-center justify-center flex-shrink-0 text-muted group-hover:text-primary transition-colors">
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
        <div className="absolute top-full left-0 mt-1 w-full max-w-[calc(100vw-2rem)] sm:w-80 bg-canvas rounded-xl border border-hairline shadow-2xl z-50 overflow-hidden">
          {/* Search input header */}
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

          {/* Results list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-hairline-soft touch-scroll" role="listbox">
            {results.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted">No airports found</div>
            ) : (
              results.map((airport) => (
                <button
                  type="button"
                  key={airport.code}
                  onClick={() => {
                    onChange(airport);
                    setOpen(false);
                    setSearchQuery("");
                  }}
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
