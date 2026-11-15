import React, { useMemo, useState } from 'react';
import { BookOpen, MapPin, Search } from 'lucide-react';
import { PROFILES, VENUE_LABELS } from '../constants/profiles';
import type { CityLog } from '../types';
import { formatMonthYearHeading, formatReadableDate } from '../utils/date';
import { ProfileMascot } from './Mascots';

interface JournalViewProps {
  logs: CityLog[];
  onSelectLogCity: (log: CityLog) => void;
  onOpenNewLog: () => void;
}

export const JournalView: React.FC<JournalViewProps> = ({
  logs,
  onSelectLogCity,
  onOpenNewLog,
}) => {
  const [search, setSearch] = useState('');

  const visibleLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(
      (l) =>
        l.city.toLowerCase().includes(q) ||
        l.country.toLowerCase().includes(q) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        (l.venueType && VENUE_LABELS[l.venueType].toLowerCase().includes(q))
    );
  }, [logs, search]);

  const groupedByMonth = useMemo(() => {
    const groups: Array<{ monthKey: string; heading: string; items: CityLog[] }> = [];
    const lookup = new Map<string, number>();

    for (const log of visibleLogs) {
      const monthKey = log.visitedAt.slice(0, 7);
      const idx = lookup.get(monthKey);
      if (idx === undefined) {
        lookup.set(monthKey, groups.length);
        groups.push({
          monthKey,
          heading: formatMonthYearHeading(log.visitedAt),
          items: [log],
        });
      } else {
        groups[idx].items.push(log);
      }
    }

    return groups;
  }, [visibleLogs]);

  return (
    <div className="flex flex-col h-full bg-[#F7F3EA]">
      {/* Search Bar */}
      <div className="p-4 border-b border-[#E2D9C8] bg-[#FFFDF9]/80 shrink-0">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5C665E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by city, country, venue, or note..."
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E2D9C8] bg-[#F7F3EA] text-sm text-[#1E2420] placeholder:text-[#5C665E]/70 focus:outline-none focus:border-[#2B6E4F]"
          />
        </div>
      </div>

      {/* Grouped Entries */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 lg:pb-8 space-y-6">
        {groupedByMonth.length === 0 ? (
          <div className="py-16 text-center max-w-xs mx-auto">
            <BookOpen className="w-8 h-8 text-[#5C665E]/60 mx-auto mb-3" />
            <h3 className="font-display text-lg font-semibold text-[#1E2420]">
              {logs.length === 0 ? 'No Field Notes Yet' : 'No Matching Stamps'}
            </h3>
            <p className="mt-1 text-xs text-[#5C665E]">
              {logs.length === 0
                ? 'Start recording cities visited by Mr Crocodile and Ms Hamster.'
                : 'Try adjusting your search query or date filter.'}
            </p>
            {logs.length === 0 && (
              <button
                type="button"
                onClick={onOpenNewLog}
                className="mt-4 h-11 px-5 rounded-xl bg-[#1E2420] text-[#FFFDF9] text-xs font-semibold hover:bg-[#2F3732]"
              >
                + Log First City
              </button>
            )}
          </div>
        ) : (
          groupedByMonth.map((group) => (
            <section key={group.monthKey}>
              <h3 className="font-display text-sm font-semibold text-[#5C665E] tracking-wide mb-2 px-1">
                {group.heading}
              </h3>
              <div className="rounded-2xl bg-[#FFFDF9] border border-[#E2D9C8] divide-y divide-[#EFE8D8] overflow-hidden">
                {group.items.map((log) => {
                  const profile = PROFILES[log.userId];
                  return (
                    <button
                      key={log.id}
                      type="button"
                      onClick={() => onSelectLogCity(log)}
                      className="w-full min-h-[64px] px-4 py-3.5 text-left hover:bg-[#F7F3EA]/70 active:bg-[#EFE8D8]/60 transition-colors flex items-start gap-3"
                    >
                      <ProfileMascot userId={log.userId} size={32} className="mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-semibold text-sm text-[#1E2420] truncate">
                            {log.city}, {log.country}
                          </span>
                          <MapPin className="w-3.5 h-3.5 text-[#5C665E] shrink-0 translate-y-0.5" />
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-[#5C665E]">
                          <span>{profile.name}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-tabular">{formatReadableDate(log.visitedAt)}</span>
                          {log.venueType && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{VENUE_LABELS[log.venueType]}</span>
                            </>
                          )}
                          {log.rating && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono-tabular text-[#D4652A] font-medium">
                                {log.rating}/5 ★
                              </span>
                            </>
                          )}
                        </div>
                        {log.notes && (
                          <p className="mt-1.5 text-xs text-[#1E2420]/85 line-clamp-2 leading-relaxed">
                            {log.notes}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};
