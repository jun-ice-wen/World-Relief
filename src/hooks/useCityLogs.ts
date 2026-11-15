import { useCallback, useEffect, useMemo, useState } from 'react';
import { STARTER_SAMPLE_LOGS } from '../constants/profiles';
import {
  bulkInsertLogs,
  createCityLog,
  fetchAllLogs,
  isSupabaseConfigured,
  removeCityLog,
  subscribeToRemoteLogs,
  updateCityLog,
} from '../services/storage';
import type {
  CityCluster,
  CityLog,
  DateFilterState,
  NewCityLogInput,
  ProfileId,
  VenueType,
  ViewMode,
} from '../types';

export function useCityLogs() {
  const [logs, setLogs] = useState<CityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('both');
  const [activeLogger, setActiveLogger] = useState<ProfileId>('crocodile');
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ mode: 'all' });

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchAllLogs();
      setLogs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load city logs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const unsubscribe = subscribeToRemoteLogs(() => {
      void refresh();
    });
    return unsubscribe;
  }, [refresh]);

  const handleSetViewMode = useCallback((nextView: ViewMode) => {
    setViewMode(nextView);
    if (nextView === 'crocodile' || nextView === 'hamster') {
      setActiveLogger(nextView);
    }
  }, []);

  const addLog = useCallback(async (input: NewCityLogInput) => {
    const created = await createCityLog(input);
    setLogs((prev) => [created, ...prev]);
    return created;
  }, []);

  const editLog = useCallback(async (id: string, patch: Partial<NewCityLogInput>) => {
    const updated = await updateCityLog(id, patch);
    setLogs((prev) => prev.map((item) => (item.id === id ? updated : item)));
    return updated;
  }, []);

  const deleteLog = useCallback(async (id: string) => {
    await removeCityLog(id);
    setLogs((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const seedSampleStops = useCallback(async () => {
    const inserted = await bulkInsertLogs(STARTER_SAMPLE_LOGS);
    setLogs((prev) =>
      [...inserted, ...prev].sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    );
  }, []);

  const importLogs = useCallback(async (entries: NewCityLogInput[]) => {
    const inserted = await bulkInsertLogs(entries);
    setLogs((prev) =>
      [...inserted, ...prev].sort((a, b) => b.visitedAt.localeCompare(a.visitedAt))
    );
    return inserted.length;
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    for (const log of logs) {
      const y = Number(log.visitedAt.slice(0, 4));
      if (!Number.isNaN(y) && y > 1900) {
        years.add(y);
      }
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [logs]);

  const dateFilteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (dateFilter.mode === 'year' && dateFilter.year) {
        return log.visitedAt.startsWith(String(dateFilter.year));
      }
      if (dateFilter.mode === 'range') {
        if (dateFilter.startDate && log.visitedAt < dateFilter.startDate) return false;
        if (dateFilter.endDate && log.visitedAt > dateFilter.endDate) return false;
      }
      return true;
    });
  }, [logs, dateFilter]);

  const filteredLogs = useMemo(() => {
    return dateFilteredLogs
      .filter((log) => (viewMode === 'both' ? true : log.userId === viewMode))
      .sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
  }, [dateFilteredLogs, viewMode]);

  const clusters = useMemo<CityCluster[]>(() => {
    const map = new Map<string, CityCluster>();

    for (const log of filteredLogs) {
      const key = `${log.city.trim().toLowerCase()}|${log.country.trim().toLowerCase()}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          city: log.city,
          country: log.country,
          countryCode: log.countryCode,
          latitude: log.latitude,
          longitude: log.longitude,
          logs: [log],
          hasCrocodile: log.userId === 'crocodile',
          hasHamster: log.userId === 'hamster',
          latestDate: log.visitedAt,
        });
      } else {
        existing.logs.push(log);
        if (log.userId === 'crocodile') existing.hasCrocodile = true;
        if (log.userId === 'hamster') existing.hasHamster = true;
        if (log.visitedAt > existing.latestDate) existing.latestDate = log.visitedAt;
      }
    }

    return Array.from(map.values());
  }, [filteredLogs]);

  const stats = useMemo(() => {
    const computeUserStats = (uid?: ProfileId) => {
      const subset = uid ? dateFilteredLogs.filter((l) => l.userId === uid) : dateFilteredLogs;
      const cityKeys = new Set(subset.map((l) => `${l.city.toLowerCase()}|${l.country.toLowerCase()}`));
      const countries = new Set(subset.map((l) => l.country.toLowerCase()));
      const rated = subset.filter((l) => typeof l.rating === 'number');
      const avgRating =
        rated.length > 0
          ? rated.reduce((sum, l) => sum + (l.rating || 0), 0) / rated.length
          : null;
      return {
        totalLogs: subset.length,
        uniqueCities: cityKeys.size,
        uniqueCountries: countries.size,
        avgRating,
        cityKeys,
      };
    };

    const crocodile = computeUserStats('crocodile');
    const hamster = computeUserStats('hamster');
    const combined = computeUserStats();

    const sharedCityNames: string[] = [];
    const seenShared = new Set<string>();
    for (const log of dateFilteredLogs) {
      const key = `${log.city.toLowerCase()}|${log.country.toLowerCase()}`;
      if (crocodile.cityKeys.has(key) && hamster.cityKeys.has(key) && !seenShared.has(key)) {
        seenShared.add(key);
        sharedCityNames.push(`${log.city}, ${log.country}`);
      }
    }

    const venueCounts = new Map<VenueType, number>();
    for (const log of filteredLogs) {
      if (log.venueType) {
        venueCounts.set(log.venueType, (venueCounts.get(log.venueType) || 0) + 1);
      }
    }
    const topVenues = Array.from(venueCounts.entries())
      .map(([venue, count]) => ({ venue, count }))
      .sort((a, b) => b.count - a.count);

    return {
      crocodile,
      hamster,
      combined,
      sharedCities: sharedCityNames.sort(),
      topVenues,
    };
  }, [dateFilteredLogs, filteredLogs]);

  return {
    logs,
    filteredLogs,
    clusters,
    availableYears,
    stats,
    isLoading,
    error,
    isCloudSync: isSupabaseConfigured(),
    viewMode,
    setViewMode: handleSetViewMode,
    activeLogger,
    setActiveLogger,
    dateFilter,
    setDateFilter,
    addLog,
    editLog,
    deleteLog,
    seedSampleStops,
    importLogs,
    refresh,
  };
}
