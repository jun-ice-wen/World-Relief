import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { CityLog, NewCityLogInput, ProfileId, VenueType } from '../types';

const LOCAL_STORAGE_KEY = 'relief_atlas_city_logs_v1';

const rawSupabaseUrl = ((import.meta.env.VITE_SUPABASE_URL as string | undefined) || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');
const supabaseAnonKey = ((import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '')
  .trim()
  .replace(/^['"]|['"]$/g, '');

let supabaseUrl = '';
let supabaseConfigError: string | null = null;

if (rawSupabaseUrl) {
  try {
    const parsed = new URL(rawSupabaseUrl);
    if (parsed.hostname === 'supabase.com' || parsed.hostname === 'www.supabase.com') {
      supabaseConfigError =
        'VITE_SUPABASE_URL points to supabase.com dashboard. Replace it in GitHub Secrets with your Project API URL (https://<project-ref>.supabase.co) from Project Settings -> Data API.';
    } else {
      // Strip any accidental extra path (e.g. /rest/v1) so createClient always gets the clean origin
      supabaseUrl = parsed.origin;
    }
  } catch {
    supabaseConfigError =
      'VITE_SUPABASE_URL is not a valid URL. Expected https://<project-ref>.supabase.co.';
  }
}

let supabaseClient: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey && !supabaseConfigError) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
}

export function isSupabaseConfigured(): boolean {
  return supabaseClient !== null;
}

export function getSupabaseConfigError(): string | null {
  return supabaseConfigError;
}

interface SupabaseRow {
  id: string;
  user_id: ProfileId;
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
  visited_at: string;
  venue_type: VenueType | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
}

function mapRowToLog(row: SupabaseRow): CityLog {
  return {
    id: row.id,
    userId: row.user_id,
    city: row.city,
    country: row.country,
    countryCode: row.country_code || '',
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    visitedAt: row.visited_at,
    venueType: row.venue_type ?? undefined,
    rating: row.rating ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

function readLocalLogs(): CityLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CityLog[]) : [];
  } catch {
    return [];
  }
}

function writeLocalLogs(logs: CityLog[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Ignore quota errors
  }
}

function createUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export async function fetchAllLogs(): Promise<CityLog[]> {
  if (!supabaseClient) {
    return readLocalLogs().sort((a, b) => b.visitedAt.localeCompare(a.visitedAt));
  }

  const { data, error } = await supabaseClient
    .from('city_logs')
    .select('*')
    .order('visited_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as SupabaseRow[]).map(mapRowToLog);
}

export async function createCityLog(input: NewCityLogInput): Promise<CityLog> {
  if (!supabaseClient) {
    const newLog: CityLog = {
      ...input,
      id: createUuid(),
      createdAt: new Date().toISOString(),
    };
    const next = [newLog, ...readLocalLogs()];
    writeLocalLogs(next);
    return newLog;
  }

  const payload = {
    user_id: input.userId,
    city: input.city,
    country: input.country,
    country_code: input.countryCode,
    latitude: input.latitude,
    longitude: input.longitude,
    visited_at: input.visitedAt,
    venue_type: input.venueType ?? null,
    rating: input.rating ?? null,
    notes: input.notes?.trim() || null,
  };

  const { data, error } = await supabaseClient
    .from('city_logs')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToLog(data as SupabaseRow);
}

export async function updateCityLog(id: string, patch: Partial<NewCityLogInput>): Promise<CityLog> {
  if (!supabaseClient) {
    const existing = readLocalLogs();
    let updated: CityLog | null = null;
    const next = existing.map((item) => {
      if (item.id !== id) return item;
      updated = { ...item, ...patch };
      return updated;
    });
    if (!updated) {
      throw new Error('Entry not found.');
    }
    writeLocalLogs(next);
    return updated;
  }

  const payload: Record<string, unknown> = {};
  if (patch.userId !== undefined) payload.user_id = patch.userId;
  if (patch.city !== undefined) payload.city = patch.city;
  if (patch.country !== undefined) payload.country = patch.country;
  if (patch.countryCode !== undefined) payload.country_code = patch.countryCode;
  if (patch.latitude !== undefined) payload.latitude = patch.latitude;
  if (patch.longitude !== undefined) payload.longitude = patch.longitude;
  if (patch.visitedAt !== undefined) payload.visited_at = patch.visitedAt;
  if (patch.venueType !== undefined) payload.venue_type = patch.venueType ?? null;
  if (patch.rating !== undefined) payload.rating = patch.rating ?? null;
  if (patch.notes !== undefined) payload.notes = patch.notes?.trim() || null;

  const { data, error } = await supabaseClient
    .from('city_logs')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToLog(data as SupabaseRow);
}

export async function removeCityLog(id: string): Promise<void> {
  if (!supabaseClient) {
    const next = readLocalLogs().filter((item) => item.id !== id);
    writeLocalLogs(next);
    return;
  }

  const { error } = await supabaseClient.from('city_logs').delete().eq('id', id);
  if (error) {
    throw new Error(error.message);
  }
}

export async function bulkInsertLogs(inputs: NewCityLogInput[]): Promise<CityLog[]> {
  if (!supabaseClient) {
    const now = new Date().toISOString();
    const created: CityLog[] = inputs.map((item) => ({
      ...item,
      id: createUuid(),
      createdAt: now,
    }));
    const next = [...created, ...readLocalLogs()];
    writeLocalLogs(next);
    return created;
  }

  const payload = inputs.map((input) => ({
    user_id: input.userId,
    city: input.city,
    country: input.country,
    country_code: input.countryCode,
    latitude: input.latitude,
    longitude: input.longitude,
    visited_at: input.visitedAt,
    venue_type: input.venueType ?? null,
    rating: input.rating ?? null,
    notes: input.notes?.trim() || null,
  }));

  const { data, error } = await supabaseClient.from('city_logs').insert(payload).select();
  if (error) {
    throw new Error(error.message);
  }

  return ((data || []) as SupabaseRow[]).map(mapRowToLog);
}

export function subscribeToRemoteLogs(onChange: () => void): () => void {
  if (!supabaseClient) return () => {};

  const client = supabaseClient;
  const channel = client
    .channel('city_logs_realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'city_logs' },
      () => {
        onChange();
      }
    )
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}
