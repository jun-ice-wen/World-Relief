import type { NewCityLogInput, ProfileId, VenueType } from '../types';

export interface ProfileMeta {
  id: ProfileId;
  name: string;
  shortName: string;
  accentHex: string;
  tintBg: string;
  borderHex: string;
  tagline: string;
}

export const PROFILES: Record<ProfileId, ProfileMeta> = {
  crocodile: {
    id: 'crocodile',
    name: 'Mr Crocodile',
    shortName: 'Croc',
    accentHex: '#2B6E4F',
    tintBg: '#E9F2EC',
    borderHex: '#B6D3C3',
    tagline: 'Swamp Surveyor',
  },
  hamster: {
    id: 'hamster',
    name: 'Ms Hamster',
    shortName: 'Hamster',
    accentHex: '#D4652A',
    tintBg: '#FBEDE4',
    borderHex: '#EFC9B3',
    tagline: 'Pocket Explorer',
  },
};

export const CONSOLIDATED_ACCENT = '#44549E';

export interface VenueOption {
  id: VenueType;
  label: string;
}

export const VENUE_OPTIONS: VenueOption[] = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'airport', label: 'Airport' },
  { id: 'public', label: 'Public' },
  { id: 'transit', label: 'Transit' },
  { id: 'nature', label: 'Nature' },
  { id: 'home', label: 'Home' },
  { id: 'other', label: 'Other' },
];

export const VENUE_LABELS: Record<VenueType, string> = {
  hotel: 'Hotel',
  cafe: 'Cafe',
  airport: 'Airport',
  public: 'Public',
  transit: 'Transit',
  nature: 'Nature',
  home: 'Home',
  other: 'Other',
};

export const STARTER_SAMPLE_LOGS: NewCityLogInput[] = [
  {
    userId: 'crocodile',
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    latitude: 38.7223,
    longitude: -9.1393,
    visitedAt: '2026-10-18',
    venueType: 'cafe',
    rating: 5,
    notes: 'Blue-tiled corner espresso bar near Alfama steps.',
  },
  {
    userId: 'hamster',
    city: 'Lisbon',
    country: 'Portugal',
    countryCode: 'PT',
    latitude: 38.7223,
    longitude: -9.1393,
    visitedAt: '2026-10-19',
    venueType: 'hotel',
    rating: 4,
    notes: 'Sunny courtyard suite before the tram ride.',
  },
  {
    userId: 'crocodile',
    city: 'Tokyo',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.6762,
    longitude: 139.6503,
    visitedAt: '2026-08-09',
    venueType: 'transit',
    rating: 5,
    notes: 'Shinkansen platform heated seat — peak engineering.',
  },
  {
    userId: 'hamster',
    city: 'Kyoto',
    country: 'Japan',
    countryCode: 'JP',
    latitude: 35.0116,
    longitude: 135.7681,
    visitedAt: '2026-08-12',
    venueType: 'cafe',
    rating: 5,
    notes: 'Quiet bamboo-garden matcha teahouse.',
  },
  {
    userId: 'hamster',
    city: 'Reykjavik',
    country: 'Iceland',
    countryCode: 'IS',
    latitude: 64.1466,
    longitude: -21.9426,
    visitedAt: '2025-11-22',
    venueType: 'public',
    rating: 4,
    notes: 'Spotless harbor visitor pavilion with warm floors.',
  },
  {
    userId: 'crocodile',
    city: 'Melbourne',
    country: 'Australia',
    countryCode: 'AU',
    latitude: -37.8136,
    longitude: 144.9631,
    visitedAt: '2025-04-03',
    venueType: 'airport',
    rating: 3,
    notes: 'Quick pre-boarding pitstop near Gate 14.',
  },
];
