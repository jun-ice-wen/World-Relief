import React, { useEffect, useRef, useState } from 'react';
import { Loader2, LocateFixed, MapPin, Search, Star, X } from 'lucide-react';
import { PROFILES, VENUE_OPTIONS } from '../constants/profiles';
import { reverseGeocode, searchCities } from '../services/geocoding';
import type {
  CityLog,
  CitySuggestion,
  NewCityLogInput,
  ProfileId,
  VenueType,
} from '../types';
import { getOffsetIsoDate, getTodayIsoDate } from '../utils/date';
import { CrocodileEmblem, HamsterEmblem } from './Mascots';

interface LogSheetProps {
  isOpen: boolean;
  defaultLogger: ProfileId;
  initialLog?: CityLog | null;
  prefillCity?: CitySuggestion | null;
  triggerGpsOnOpen?: boolean;
  onClose: () => void;
  onSubmit: (input: NewCityLogInput, editId?: string) => Promise<void>;
}

export const LogSheet: React.FC<LogSheetProps> = ({
  isOpen,
  defaultLogger,
  initialLog,
  prefillCity,
  triggerGpsOnOpen = false,
  onClose,
  onSubmit,
}) => {
  const [userId, setUserId] = useState<ProfileId>(defaultLogger);
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<CitySuggestion | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [visitedAt, setVisitedAt] = useState(getTodayIsoDate());
  const [venueType, setVenueType] = useState<VenueType | undefined>(undefined);
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsError(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const result = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          setSelectedCity(result);
          setQuery(result.label);
          setSuggestions([]);
          setFormError(null);
        } catch {
          setGpsError('Could not look up city name. Try searching manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Search for your city above instead.');
        } else {
          setGpsError('Unable to detect GPS position. Search for your city above.');
        }
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    setFormError(null);
    setGpsError(null);
    setSuggestions([]);

    if (initialLog) {
      setUserId(initialLog.userId);
      const cityObj: CitySuggestion = {
        city: initialLog.city,
        country: initialLog.country,
        countryCode: initialLog.countryCode,
        latitude: initialLog.latitude,
        longitude: initialLog.longitude,
        label: `${initialLog.city}, ${initialLog.country}`,
      };
      setSelectedCity(cityObj);
      setQuery(cityObj.label);
      setVisitedAt(initialLog.visitedAt);
      setVenueType(initialLog.venueType);
      setRating(initialLog.rating);
      setNotes(initialLog.notes || '');
      return;
    }

    setUserId(defaultLogger);
    setVisitedAt(getTodayIsoDate());
    setVenueType(undefined);
    setRating(undefined);
    setNotes('');

    if (prefillCity) {
      setSelectedCity(prefillCity);
      setQuery(prefillCity.label);
    } else {
      setSelectedCity(null);
      setQuery('');
      if (triggerGpsOnOpen) {
        handleLocateMe();
      }
    }
  }, [isOpen, initialLog, prefillCity, defaultLogger, triggerGpsOnOpen]);

  // Debounced city autocomplete search
  useEffect(() => {
    if (!isOpen) return;
    if (selectedCity && query === selectedCity.label) {
      setSuggestions([]);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = window.setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const results = await searchCities(trimmed, controller.signal);
        setSuggestions(results);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === 'AbortError')) {
          setSuggestions([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      window.clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [query, selectedCity, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) {
      setFormError('Please pick a city from the search suggestions or tap GPS.');
      return;
    }
    if (!visitedAt) {
      setFormError('Please select a date.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    try {
      await onSubmit(
        {
          userId,
          city: selectedCity.city,
          country: selectedCity.country,
          countryCode: selectedCity.countryCode,
          latitude: selectedCity.latitude,
          longitude: selectedCity.longitude,
          visitedAt,
          venueType,
          rating,
          notes: notes.trim() || undefined,
        },
        initialLog?.id
      );
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to save entry.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-end sm:items-center justify-center bg-[#1E2420]/50 backdrop-blur-xs sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg max-h-[92dvh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#FFFDF9] border border-[#E2D9C8] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle + Header */}
        <div className="px-5 pt-3 pb-3 border-b border-[#E2D9C8] shrink-0">
          <div className="w-10 h-1.5 rounded-full bg-[#E2D9C8] mx-auto mb-2.5 sm:hidden" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-[#1E2420]">
              {initialLog ? 'Edit City Stamp' : 'New Field Stamp'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center rounded-full text-[#5C665E] hover:bg-[#F7F3EA]"
              aria-label="Close form"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Who is logging */}
          <div>
            <span className="block text-xs font-semibold text-[#5C665E] mb-2">
              Who dropped this pin?
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setUserId('crocodile')}
                className={`min-h-[48px] px-3 py-2 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  userId === 'crocodile'
                    ? 'bg-[#E9F2EC] border-[#2B6E4F] text-[#1E2420] shadow-xs'
                    : 'bg-[#F7F3EA]/60 border-[#E2D9C8] text-[#5C665E] hover:text-[#1E2420]'
                }`}
              >
                <CrocodileEmblem size={28} />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">{PROFILES.crocodile.name}</div>
                  <div className="text-[11px] text-[#5C665E] leading-tight">Swamp Emerald</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserId('hamster')}
                className={`min-h-[48px] px-3 py-2 rounded-2xl border flex items-center gap-2.5 transition-all ${
                  userId === 'hamster'
                    ? 'bg-[#FBEDE4] border-[#D4652A] text-[#1E2420] shadow-xs'
                    : 'bg-[#F7F3EA]/60 border-[#E2D9C8] text-[#5C665E] hover:text-[#1E2420]'
                }`}
              >
                <HamsterEmblem size={28} />
                <div className="text-left">
                  <div className="text-xs font-bold leading-tight">{PROFILES.hamster.name}</div>
                  <div className="text-[11px] text-[#5C665E] leading-tight">Terracotta</div>
                </div>
              </button>
            </div>
          </div>

          {/* City Search + GPS Quick Pin */}
          <div className="relative">
            <label htmlFor="city-search-input" className="block text-xs font-semibold text-[#5C665E] mb-1.5">
              City / Location
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#5C665E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="city-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    if (selectedCity && e.target.value !== selectedCity.label) {
                      setSelectedCity(null);
                    }
                  }}
                  placeholder="Search city (e.g. Lisbon, Tokyo)..."
                  className="w-full h-11 pl-9 pr-8 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA]/60 text-sm text-[#1E2420] placeholder:text-[#5C665E]/70 focus:outline-none focus:border-[#2B6E4F]"
                  autoComplete="off"
                />
                {isSearching && (
                  <Loader2 className="w-4 h-4 animate-spin text-[#5C665E] absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              <button
                type="button"
                onClick={handleLocateMe}
                disabled={isLocating}
                className="min-h-[44px] px-3.5 rounded-xl border border-[#B6D3C3] bg-[#E9F2EC] text-[#2B6E4F] text-xs font-semibold hover:bg-[#DCECE1] active:scale-[0.97] transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-60"
                title="Use current GPS coordinates"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LocateFixed className="w-4 h-4" />
                )}
                <span>GPS</span>
              </button>
            </div>

            {gpsError && <p className="mt-1.5 text-xs text-[#B83B2A]">{gpsError}</p>}

            {selectedCity && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[#2B6E4F]">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium">{selectedCity.label}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular text-[#5C665E]">
                  {selectedCity.latitude.toFixed(2)}°, {selectedCity.longitude.toFixed(2)}°
                </span>
              </div>
            )}

            {/* Autocomplete Results */}
            {suggestions.length > 0 && (
              <ul className="mt-1.5 rounded-2xl border border-[#E2D9C8] bg-[#FFFDF9] shadow-lg divide-y divide-[#EFE8D8] max-h-48 overflow-y-auto">
                {suggestions.map((item) => (
                  <li key={`${item.city}-${item.country}-${item.latitude}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCity(item);
                        setQuery(item.label);
                        setSuggestions([]);
                        setFormError(null);
                      }}
                      className="w-full min-h-[44px] px-3.5 py-2 text-left hover:bg-[#F7F3EA] flex items-center justify-between gap-2 transition-colors"
                    >
                      <span className="text-sm font-medium text-[#1E2420] truncate">
                        {item.label}
                      </span>
                      <span className="font-mono-tabular text-[11px] text-[#5C665E] shrink-0">
                        {item.countryCode || 'CITY'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Date Picker + Quick Shortcuts */}
          <div>
            <label htmlFor="visit-date-input" className="block text-xs font-semibold text-[#5C665E] mb-1.5">
              Date
            </label>
            <div className="flex items-center gap-2">
              <input
                id="visit-date-input"
                type="date"
                value={visitedAt}
                max={getTodayIsoDate()}
                onChange={(e) => setVisitedAt(e.target.value)}
                className="flex-1 h-11 px-3 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA]/60 font-mono-tabular text-sm text-[#1E2420] focus:outline-none focus:border-[#2B6E4F]"
              />
              <button
                type="button"
                onClick={() => setVisitedAt(getTodayIsoDate())}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium transition-colors ${
                  visitedAt === getTodayIsoDate()
                    ? 'bg-[#1E2420] text-[#FFFDF9] border-[#1E2420]'
                    : 'bg-[#F7F3EA] text-[#1E2420] border-[#E2D9C8]'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setVisitedAt(getOffsetIsoDate(-1))}
                className={`min-h-[44px] px-3 rounded-xl border text-xs font-medium transition-colors ${
                  visitedAt === getOffsetIsoDate(-1)
                    ? 'bg-[#1E2420] text-[#FFFDF9] border-[#1E2420]'
                    : 'bg-[#F7F3EA] text-[#1E2420] border-[#E2D9C8]'
                }`}
              >
                Yesterday
              </button>
            </div>
          </div>

          {/* Optional Venue Type */}
          <div>
            <span className="block text-xs font-semibold text-[#5C665E] mb-1.5">
              Venue Type <span className="font-normal">(optional)</span>
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {VENUE_OPTIONS.map((v) => {
                const active = venueType === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVenueType(active ? undefined : v.id)}
                    className={`min-h-[40px] px-2 rounded-xl border text-xs font-medium transition-colors ${
                      active
                        ? 'bg-[#1E2420] text-[#FFFDF9] border-[#1E2420]'
                        : 'bg-[#F7F3EA]/60 text-[#5C665E] border-[#E2D9C8] hover:text-[#1E2420]'
                    }`}
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional 1-5 Rating */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[#5C665E]">
                Comfort Rating <span className="font-normal">(optional)</span>
              </span>
              {rating ? (
                <span className="font-mono-tabular text-xs font-medium text-[#1E2420]">
                  {rating}/5
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const filled = (rating ?? 0) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? undefined : star)}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all ${
                      filled
                        ? 'bg-[#FBEDE4] border-[#D4652A] text-[#D4652A]'
                        : 'bg-[#F7F3EA]/60 border-[#E2D9C8] text-[#5C665E]/50 hover:text-[#5C665E]'
                    }`}
                    aria-label={`Rate ${star} out of 5`}
                  >
                    <Star className={`w-5 h-5 ${filled ? 'fill-current' : ''}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Field Notes */}
          <div>
            <label htmlFor="field-notes-input" className="block text-xs font-semibold text-[#5C665E] mb-1.5">
              Field Notes <span className="font-normal">(optional)</span>
            </label>
            <textarea
              id="field-notes-input"
              rows={2}
              maxLength={240}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bidet quality, quirky tiles, scenic view..."
              className="w-full p-3 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA]/60 text-sm text-[#1E2420] placeholder:text-[#5C665E]/70 focus:outline-none focus:border-[#2B6E4F] resize-none"
            />
          </div>

          {formError && (
            <p className="text-xs font-medium text-[#B83B2A] bg-[#FDECEC] border border-[#F5C6C1] rounded-xl px-3 py-2">
              {formError}
            </p>
          )}

          {/* Bottom Sticky Action */}
          <div className="pt-1 pb-safe">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 rounded-2xl bg-[#1E2420] text-[#FFFDF9] text-sm font-semibold hover:bg-[#2F3732] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{initialLog ? 'Update City Stamp' : 'Save City Stamp'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
