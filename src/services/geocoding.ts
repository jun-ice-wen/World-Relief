import type { CitySuggestion } from '../types';

const FALLBACK_CITIES: CitySuggestion[] = [
  { city: 'Tokyo', country: 'Japan', countryCode: 'JP', latitude: 35.6762, longitude: 139.6503, label: 'Tokyo, Japan' },
  { city: 'Kyoto', country: 'Japan', countryCode: 'JP', latitude: 35.0116, longitude: 135.7681, label: 'Kyoto, Japan' },
  { city: 'Singapore', country: 'Singapore', countryCode: 'SG', latitude: 1.3521, longitude: 103.8198, label: 'Singapore, Singapore' },
  { city: 'London', country: 'United Kingdom', countryCode: 'GB', latitude: 51.5072, longitude: -0.1276, label: 'London, United Kingdom' },
  { city: 'Paris', country: 'France', countryCode: 'FR', latitude: 48.8566, longitude: 2.3522, label: 'Paris, France' },
  { city: 'Lisbon', country: 'Portugal', countryCode: 'PT', latitude: 38.7223, longitude: -9.1393, label: 'Lisbon, Portugal' },
  { city: 'New York', country: 'United States', countryCode: 'US', latitude: 40.7128, longitude: -74.006, label: 'New York, United States' },
  { city: 'San Francisco', country: 'United States', countryCode: 'US', latitude: 37.7749, longitude: -122.4194, label: 'San Francisco, United States' },
  { city: 'Seoul', country: 'South Korea', countryCode: 'KR', latitude: 37.5665, longitude: 126.978, label: 'Seoul, South Korea' },
  { city: 'Taipei', country: 'Taiwan', countryCode: 'TW', latitude: 25.033, longitude: 121.5654, label: 'Taipei, Taiwan' },
  { city: 'Bangkok', country: 'Thailand', countryCode: 'TH', latitude: 13.7563, longitude: 100.5018, label: 'Bangkok, Thailand' },
  { city: 'Melbourne', country: 'Australia', countryCode: 'AU', latitude: -37.8136, longitude: 144.9631, label: 'Melbourne, Australia' },
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', latitude: -33.8688, longitude: 151.2093, label: 'Sydney, Australia' },
  { city: 'Reykjavik', country: 'Iceland', countryCode: 'IS', latitude: 64.1466, longitude: -21.9426, label: 'Reykjavik, Iceland' },
  { city: 'Barcelona', country: 'Spain', countryCode: 'ES', latitude: 41.3874, longitude: 2.1686, label: 'Barcelona, Spain' },
  { city: 'Rome', country: 'Italy', countryCode: 'IT', latitude: 41.9028, longitude: 12.4964, label: 'Rome, Italy' },
];

interface PhotonFeature {
  geometry?: {
    coordinates?: [number, number];
  };
  properties?: {
    name?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    countrycode?: string;
    osm_value?: string;
    type?: string;
  };
}

export async function searchCities(query: string, signal?: AbortSignal): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  try {
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=10&lang=en`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`Geocoder error: ${response.status}`);
    }
    const data = (await response.json()) as { features?: PhotonFeature[] };
    const features = data.features ?? [];

    const seen = new Set<string>();
    const results: CitySuggestion[] = [];

    for (const feature of features) {
      const coords = feature.geometry?.coordinates;
      const props = feature.properties;
      if (!coords || !props) continue;

      const city = props.city || props.town || props.village || props.name;
      const country = props.country;
      if (!city || !country) continue;

      const dedupeKey = `${city.toLowerCase()}|${country.toLowerCase()}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const statePart = props.state && props.state !== city ? `, ${props.state}` : '';
      results.push({
        city,
        country,
        countryCode: (props.countrycode || '').toUpperCase(),
        state: props.state,
        latitude: Number(coords[1].toFixed(4)),
        longitude: Number(coords[0].toFixed(4)),
        label: `${city}${statePart}, ${country}`,
      });

      if (results.length >= 6) break;
    }

    if (results.length > 0) {
      return results;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    // Fall back to curated city matches if offline or rate-limited
  }

  const lower = trimmed.toLowerCase();
  return FALLBACK_CITIES.filter(
    (c) => c.city.toLowerCase().includes(lower) || c.country.toLowerCase().includes(lower)
  ).slice(0, 6);
}

interface NominatimReverseResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export async function reverseGeocode(latitude: number, longitude: number): Promise<CitySuggestion> {
  const lat = Number(latitude.toFixed(4));
  const lon = Number(longitude.toFixed(4));

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&accept-language=en`;
    const response = await fetch(url);
    if (response.ok) {
      const data = (await response.json()) as NominatimReverseResponse;
      const addr = data.address;
      if (addr) {
        const city =
          addr.city ||
          addr.town ||
          addr.village ||
          addr.municipality ||
          addr.county ||
          addr.state ||
          'Pinned Spot';
        const country = addr.country || 'Unknown Country';
        return {
          city,
          country,
          countryCode: (addr.country_code || '').toUpperCase(),
          state: addr.state,
          latitude: lat,
          longitude: lon,
          label: `${city}, ${country}`,
        };
      }
    }
  } catch {
    // Graceful coordinate fallback below
  }

  return {
    city: `Spot (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
    country: 'Coordinates',
    countryCode: '',
    latitude: lat,
    longitude: lon,
    label: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
  };
}
