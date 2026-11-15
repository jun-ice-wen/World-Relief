import React, { useRef, useState } from 'react';
import { Cloud, Download, HardDrive, Upload } from 'lucide-react';
import { PROFILES, VENUE_LABELS } from '../constants/profiles';
import type { CityLog, NewCityLogInput, VenueType } from '../types';
import { CrocodileEmblem, HamsterEmblem } from './Mascots';

interface UserSummary {
  totalLogs: number;
  uniqueCities: number;
  uniqueCountries: number;
  avgRating: number | null;
}

interface StatsViewProps {
  stats: {
    crocodile: UserSummary;
    hamster: UserSummary;
    combined: UserSummary;
    sharedCities: string[];
    topVenues: Array<{ venue: VenueType; count: number }>;
  };
  allLogs: CityLog[];
  isCloudSync: boolean;
  onFocusCityName: (cityCountryLabel: string) => void;
  onImportLogs: (entries: NewCityLogInput[]) => Promise<number>;
}

export const StatsView: React.FC<StatsViewProps> = ({
  stats,
  allLogs,
  isCloudSync,
  onFocusCityName,
  onImportLogs,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const maxVenueCount = stats.topVenues[0]?.count || 1;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(allLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relief-atlas-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        setImportMessage('Invalid backup file format.');
        return;
      }
      const valid: NewCityLogInput[] = parsed
        .filter(
          (item) =>
            item &&
            (item.userId === 'crocodile' || item.userId === 'hamster') &&
            typeof item.city === 'string' &&
            typeof item.country === 'string' &&
            typeof item.latitude === 'number' &&
            typeof item.longitude === 'number' &&
            typeof item.visitedAt === 'string'
        )
        .map((item) => ({
          userId: item.userId,
          city: item.city,
          country: item.country,
          countryCode: item.countryCode || '',
          latitude: item.latitude,
          longitude: item.longitude,
          visitedAt: item.visitedAt,
          venueType: item.venueType,
          rating: item.rating,
          notes: item.notes,
        }));

      if (valid.length === 0) {
        setImportMessage('No valid city stamps found in file.');
        return;
      }
      const count = await onImportLogs(valid);
      setImportMessage(`Imported ${count} city stamps.`);
    } catch {
      setImportMessage('Could not read JSON backup file.');
    } finally {
      e.target.value = '';
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#F7F3EA] px-4 py-5 pb-24 lg:pb-8 space-y-6">
      {/* Combined Passport Header */}
      <section className="rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] p-5">
        <h2 className="font-display text-xl font-bold text-[#1E2420]">World Relief Passport</h2>
        <p className="mt-1 text-xs text-[#5C665E]">
          Consolidated tally across the active date range.
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-[#EFE8D8]">
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#1E2420]">
              {stats.combined.uniqueCities}
            </div>
            <div className="text-xs text-[#5C665E]">Unique Cities</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#1E2420]">
              {stats.combined.uniqueCountries}
            </div>
            <div className="text-xs text-[#5C665E]">Countries</div>
          </div>
          <div>
            <div className="font-mono-tabular text-2xl font-bold text-[#1E2420]">
              {stats.combined.totalLogs}
            </div>
            <div className="text-xs text-[#5C665E]">Total Stamps</div>
          </div>
        </div>
      </section>

      {/* Side-by-Side Comparison */}
      <section className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#B6D3C3] p-4">
          <div className="flex items-center gap-2">
            <CrocodileEmblem size={28} />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#2B6E4F] truncate">
                {PROFILES.crocodile.name}
              </div>
              <div className="text-[11px] text-[#5C665E]">Traveler 01</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Cities</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.crocodile.uniqueCities}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Countries</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.crocodile.uniqueCountries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Stamps</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.crocodile.totalLogs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Avg Rating</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.crocodile.avgRating ? `${stats.crocodile.avgRating.toFixed(1)}/5` : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EFC9B3] p-4">
          <div className="flex items-center gap-2">
            <HamsterEmblem size={28} />
            <div className="min-w-0">
              <div className="text-xs font-bold text-[#D4652A] truncate">
                {PROFILES.hamster.name}
              </div>
              <div className="text-[11px] text-[#5C665E]">Traveler 02</div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Cities</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.hamster.uniqueCities}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Countries</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.hamster.uniqueCountries}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Stamps</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.hamster.totalLogs}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#5C665E]">Avg Rating</span>
              <span className="font-mono-tabular font-semibold text-[#1E2420]">
                {stats.hamster.avgRating ? `${stats.hamster.avgRating.toFixed(1)}/5` : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Cities Overlap */}
      <section className="rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-base font-semibold text-[#1E2420]">
            Shared Cities
          </h3>
          <span className="font-mono-tabular text-xs font-semibold text-[#44549E]">
            {stats.sharedCities.length} overlap
          </span>
        </div>
        {stats.sharedCities.length === 0 ? (
          <p className="mt-2 text-xs text-[#5C665E]">
            No cities visited by both Mr Crocodile and Ms Hamster yet in this timeframe.
          </p>
        ) : (
          <div className="mt-2.5 divide-y divide-[#EFE8D8]">
            {stats.sharedCities.map((cityLabel) => (
              <button
                key={cityLabel}
                type="button"
                onClick={() => onFocusCityName(cityLabel)}
                className="w-full min-h-[44px] py-2 text-left text-sm font-medium text-[#1E2420] hover:text-[#44549E] flex items-center justify-between transition-colors"
              >
                <span>{cityLabel}</span>
                <span className="text-xs text-[#5C665E]">View pin</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Top Venues */}
      {stats.topVenues.length > 0 && (
        <section className="rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] p-4">
          <h3 className="font-display text-base font-semibold text-[#1E2420]">
            Top Venue Types
          </h3>
          <div className="mt-3 space-y-2.5">
            {stats.topVenues.map((item) => {
              const widthPct = Math.max(12, Math.round((item.count / maxVenueCount) * 100));
              return (
                <div key={item.venue} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#1E2420]">{VENUE_LABELS[item.venue]}</span>
                    <span className="font-mono-tabular text-[#5C665E]">{item.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EFE8D8] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2B6E4F]"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Free Sync & JSON Backup */}
      <section className="rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1E2420]">
          {isCloudSync ? (
            <>
              <Cloud className="w-4 h-4 text-[#2B6E4F]" />
              <span>Supabase Cloud Sync Active</span>
            </>
          ) : (
            <>
              <HardDrive className="w-4 h-4 text-[#D4652A]" />
              <span>Saved on This Device (Local Mode)</span>
            </>
          )}
        </div>
        <p className="text-xs text-[#5C665E] leading-relaxed">
          {isCloudSync
            ? 'New pins sync live across both phones via your free Supabase Postgres database.'
            : 'Entries are saved in this browser. Follow the included README to link your free Supabase database and GitHub Pages for live two-phone sync.'}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleExport}
            disabled={allLogs.length === 0}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA] text-xs font-semibold text-[#1E2420] hover:bg-[#EFE8D8] disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 min-h-[44px] px-3 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA] text-xs font-semibold text-[#1E2420] hover:bg-[#EFE8D8] flex items-center justify-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={(e) => void handleFileChange(e)}
            className="hidden"
          />
        </div>

        {importMessage && (
          <p className="text-xs font-medium text-[#2B6E4F]">{importMessage}</p>
        )}
      </section>
    </div>
  );
};
