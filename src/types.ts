export type ProfileId = 'crocodile' | 'hamster';

export type ViewMode = ProfileId | 'both';

export type VenueType =
  | 'hotel'
  | 'cafe'
  | 'airport'
  | 'public'
  | 'nature'
  | 'home'
  | 'transit'
  | 'other';

export interface CityLog {
  id: string;
  userId: ProfileId;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  visitedAt: string; // YYYY-MM-DD
  venueType?: VenueType;
  rating?: number; // 1-5
  notes?: string;
  createdAt: string;
}

export interface NewCityLogInput {
  userId: ProfileId;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  visitedAt: string;
  venueType?: VenueType;
  rating?: number;
  notes?: string;
}

export interface CityCluster {
  key: string;
  city: string;
  country: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  logs: CityLog[];
  hasCrocodile: boolean;
  hasHamster: boolean;
  latestDate: string;
}

export type DateFilterMode = 'all' | 'year' | 'range';

export interface DateFilterState {
  mode: DateFilterMode;
  year?: number;
  startDate?: string;
  endDate?: string;
}

export interface CitySuggestion {
  city: string;
  country: string;
  countryCode: string;
  state?: string;
  latitude: number;
  longitude: number;
  label: string;
}

export type MobileTab = 'map' | 'journal' | 'stats';
