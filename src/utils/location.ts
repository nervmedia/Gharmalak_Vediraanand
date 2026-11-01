export const SUPPORTED_CITIES = [
  'Amravati',
  'Wardha',
  'Nagpur',
  'Pune',
  'Chhatrapati Sambhajinagar',
  'Nashik',
  'Chandrapur',
] as const;

export type SupportedCity = (typeof SUPPORTED_CITIES)[number];

export const LOCATION_POPUP_DELAY_MS = 18_000;
export const STORAGE_KEY_SELECTED_CITY = 'gharmalak_selected_city';
export const STORAGE_KEY_POPUP_DISMISSED = 'gharmalak_location_popup_dismissed';

interface CityMetadata {
  name: SupportedCity;
  lat: number;
  lon: number;
  aliases: string[];
}

export const CITY_METADATA: readonly CityMetadata[] = [
  {
    name: 'Amravati',
    lat: 20.932,
    lon: 77.7523,
    aliases: ['amravati', 'amaravati', 'amrawati'],
  },
  {
    name: 'Wardha',
    lat: 20.7453,
    lon: 78.6022,
    aliases: ['wardha', 'vardha'],
  },
  {
    name: 'Nagpur',
    lat: 21.1458,
    lon: 79.0882,
    aliases: ['nagpur'],
  },
  {
    name: 'Pune',
    lat: 18.5204,
    lon: 73.8567,
    aliases: ['pune', 'poona', 'pimpri', 'chinchwad', 'pimpri-chinchwad'],
  },
  {
    name: 'Chhatrapati Sambhajinagar',
    lat: 19.8762,
    lon: 75.3433,
    aliases: [
      'chhatrapati sambhajinagar',
      'chhatrapati sambhaji nagar',
      'sambhajinagar',
      'sambhaji nagar',
      'aurangabad',
    ],
  },
  {
    name: 'Nashik',
    lat: 19.9975,
    lon: 73.7898,
    aliases: ['nashik', 'nasik'],
  },
  {
    name: 'Chandrapur',
    lat: 19.9615,
    lon: 79.2961,
    aliases: ['chandrapur', 'chanda'],
  },
] as const;

export function isSupportedCity(value: unknown): value is SupportedCity {
  return (
    typeof value === 'string' &&
    (SUPPORTED_CITIES as readonly string[]).includes(value)
  );
}

/**
 * Matches a raw city/district/locality string or list of candidate strings
 * against our 7 supported cities (including well-known official aliases such as
 * Aurangabad -> Chhatrapati Sambhajinagar).
 */
export function matchSupportedCityFromText(
  candidates: Array<string | undefined | null>
): SupportedCity | null {
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    const normalized = raw.trim().toLowerCase();
    if (!normalized) continue;

    for (const city of CITY_METADATA) {
      for (const alias of city.aliases) {
        const pattern = new RegExp(`(^|[^a-z])${alias.replace(/\s+/g, '\\s+')}([^a-z]|$)`, 'i');
        if (pattern.test(normalized)) {
          return city.name;
        }
      }
    }
  }
  return null;
}

/**
 * Calculates Haversine distance in kilometers between two coordinates.
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Checks if coordinates fall within a reasonable metro radius (default 35 km)
 * of one of the 7 supported cities.
 */
export function matchSupportedCityByCoordinates(
  lat: number,
  lon: number,
  maxRadiusKm = 35
): SupportedCity | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  let closest: { name: SupportedCity; distance: number } | null = null;

  for (const city of CITY_METADATA) {
    const distance = haversineDistanceKm(lat, lon, city.lat, city.lon);
    if (distance <= maxRadiusKm && (!closest || distance < closest.distance)) {
      closest = { name: city.name, distance };
    }
  }

  return closest ? closest.name : null;
}

export interface ReverseGeocodeResult {
  detectedCityName: string | null;
  matchedCity: SupportedCity | null;
}

/**
 * Reverse geocodes browser coordinates to identify the visitor's city.
 * Uses OpenStreetMap Nominatim and BigDataCloud free reverse-geocoding endpoints,
 * with coordinate proximity fallback only when within a supported city's metro boundary.
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lon: number,
  fetchImpl: typeof fetch = fetch
): Promise<ReverseGeocodeResult> {
  // 1. Try BigDataCloud client reverse geocoding (fast, CORS-friendly, no key required)
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(
      lat
    )}&longitude=${encodeURIComponent(lon)}&localityLanguage=en`;
    const res = await fetchImpl(bdcUrl, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        city?: string;
        locality?: string;
        principalSubdivision?: string;
        localityInfo?: { administrative?: Array<{ name?: string }> };
      };
      const adminNames = (data.localityInfo?.administrative ?? []).map((a) => a.name);
      const candidates = [data.city, data.locality, ...adminNames];
      const matched = matchSupportedCityFromText(candidates);
      const detectedName =
        matched ||
        data.city?.trim() ||
        data.locality?.trim() ||
        adminNames.find((n) => Boolean(n && n.trim()))?.trim() ||
        null;
      if (detectedName) {
        return {
          detectedCityName: detectedName,
          matchedCity: matched ?? matchSupportedCityByCoordinates(lat, lon),
        };
      }
    }
  } catch {
    // Fall through to Nominatim
  }

  // 2. Try OpenStreetMap Nominatim reverse geocoding
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1`;
    const res = await fetchImpl(nomUrl, {
      headers: { Accept: 'application/json', 'Accept-Language': 'en' },
    });
    if (res.ok) {
      const data = (await res.json()) as {
        name?: string;
        display_name?: string;
        address?: {
          city?: string;
          town?: string;
          municipality?: string;
          county?: string;
          state_district?: string;
        };
      };
      const addr = data.address ?? {};
      const candidates = [
        addr.city,
        addr.town,
        addr.municipality,
        addr.state_district,
        addr.county,
        data.name,
        data.display_name,
      ];
      const matched = matchSupportedCityFromText(candidates);
      const detectedName =
        matched ||
        addr.city?.trim() ||
        addr.town?.trim() ||
        addr.municipality?.trim() ||
        addr.state_district?.trim() ||
        data.name?.trim() ||
        null;
      if (detectedName) {
        return {
          detectedCityName: detectedName,
          matchedCity: matched ?? matchSupportedCityByCoordinates(lat, lon),
        };
      }
    }
  } catch {
    // Fall through to coordinate check
  }

  // 3. Coordinate proximity check if network geocoders are unreachable
  const coordMatch = matchSupportedCityByCoordinates(lat, lon);
  if (coordMatch) {
    return {
      detectedCityName: coordMatch,
      matchedCity: coordMatch,
    };
  }

  return {
    detectedCityName: null,
    matchedCity: null,
  };
}

export function getSavedCity(storage: Pick<Storage, 'getItem'> | undefined = typeof window !== 'undefined' ? window.localStorage : undefined): SupportedCity | null {
  try {
    const raw = storage?.getItem(STORAGE_KEY_SELECTED_CITY);
    return isSupportedCity(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function saveSelectedCity(
  city: SupportedCity,
  localStore: Pick<Storage, 'setItem'> | undefined = typeof window !== 'undefined' ? window.localStorage : undefined,
  sessionStore: Pick<Storage, 'setItem'> | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined
): void {
  try {
    localStore?.setItem(STORAGE_KEY_SELECTED_CITY, city);
    sessionStore?.setItem(STORAGE_KEY_POPUP_DISMISSED, '1');
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}

export function isPopupDismissed(
  sessionStore: Pick<Storage, 'getItem'> | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined,
  localStore: Pick<Storage, 'getItem'> | undefined = typeof window !== 'undefined' ? window.localStorage : undefined
): boolean {
  try {
    if (getSavedCity(localStore)) return true;
    return (
      sessionStore?.getItem(STORAGE_KEY_POPUP_DISMISSED) === '1' ||
      localStore?.getItem(STORAGE_KEY_POPUP_DISMISSED) === '1'
    );
  } catch {
    return false;
  }
}

export function markPopupDismissed(
  sessionStore: Pick<Storage, 'setItem'> | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined,
  localStore: Pick<Storage, 'setItem'> | undefined = typeof window !== 'undefined' ? window.localStorage : undefined
): void {
  try {
    sessionStore?.setItem(STORAGE_KEY_POPUP_DISMISSED, '1');
    localStore?.setItem(STORAGE_KEY_POPUP_DISMISSED, '1');
  } catch {
    // Ignore storage errors
  }
}

export function shouldAutoScheduleLocationPopup(
  sessionStore: Pick<Storage, 'getItem'> | undefined = typeof window !== 'undefined' ? window.sessionStorage : undefined,
  localStore: Pick<Storage, 'getItem'> | undefined = typeof window !== 'undefined' ? window.localStorage : undefined
): boolean {
  return !getSavedCity(localStore) && !isPopupDismissed(sessionStore, localStore);
}
