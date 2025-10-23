/**
 * Ticketmaster Discovery API Service
 * Documentation: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/
 */

const TICKETMASTER_API_BASE = 'https://app.ticketmaster.com/discovery/v2';
const API_KEY = process.env.TICKETMASTER_API_KEY;

if (!API_KEY) {
  console.warn('TICKETMASTER_API_KEY is not set in environment variables');
}

export interface TicketmasterVenue {
  id: string;
  name: string;
  type: string;
  url?: string;
  locale?: string;
  postalCode?: string;
  timezone?: string;
  city?: {
    name: string;
  };
  state?: {
    name: string;
    stateCode: string;
  };
  country?: {
    name: string;
    countryCode: string;
  };
  address?: {
    line1: string;
    line2?: string;
  };
  location?: {
    longitude: string;
    latitude: string;
  };
  markets?: Array<{
    id: string;
    name: string;
  }>;
  dmas?: Array<{
    id: number;
  }>;
}

export interface TicketmasterEvent {
  id: string;
  name: string;
  type: string;
  url: string;
  locale: string;
  images?: Array<{
    ratio: string;
    url: string;
    width: number;
    height: number;
    fallback: boolean;
  }>;
  sales?: {
    public?: {
      startDateTime: string;
      startTBD: boolean;
      startTBA: boolean;
      endDateTime: string;
    };
    presales?: Array<{
      startDateTime: string;
      endDateTime: string;
      name: string;
    }>;
  };
  dates?: {
    start?: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
      dateTBD: boolean;
      dateTBA: boolean;
      timeTBA: boolean;
      noSpecificTime: boolean;
    };
    end?: {
      localDate: string;
      localTime?: string;
      dateTime?: string;
      approximate: boolean;
    };
    timezone?: string;
    status?: {
      code: string;
    };
  };
  classifications?: Array<{
    primary: boolean;
    segment?: {
      id: string;
      name: string;
    };
    genre?: {
      id: string;
      name: string;
    };
    subGenre?: {
      id: string;
      name: string;
    };
  }>;
  promoter?: {
    id: string;
    name: string;
    description: string;
  };
  promoters?: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  info?: string;
  pleaseNote?: string;
  priceRanges?: Array<{
    type: string;
    currency: string;
    min: number;
    max: number;
  }>;
  products?: Array<{
    id: string;
    url: string;
    type: string;
    name: string;
  }>;
  seatmap?: {
    staticUrl: string;
  };
  accessibility?: {
    info?: string;
  };
  ticketLimit?: {
    info: string;
  };
  ageRestrictions?: {
    legalAgeEnforced: boolean;
  };
  _embedded?: {
    venues?: TicketmasterVenue[];
  };
}

export interface TicketmasterSearchResponse {
  _embedded?: {
    events?: TicketmasterEvent[];
    venues?: TicketmasterVenue[];
  };
  _links?: {
    self: { href: string };
    next?: { href: string };
  };
  page?: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

/**
 * Search for venues by name and location
 */
export async function searchVenues(params: {
  keyword?: string;
  city?: string;
  stateCode?: string;
  countryCode?: string;
  postalCode?: string;
  radius?: number;
  unit?: 'miles' | 'km';
  size?: number;
}): Promise<TicketmasterVenue[]> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key is not configured');
  }

  const searchParams = new URLSearchParams({
    apikey: API_KEY,
    ...(params.keyword && { keyword: params.keyword }),
    ...(params.city && { city: params.city }),
    ...(params.stateCode && { stateCode: params.stateCode }),
    ...(params.countryCode && { countryCode: params.countryCode }),
    ...(params.postalCode && { postalCode: params.postalCode }),
    ...(params.radius && { radius: params.radius.toString() }),
    ...(params.unit && { unit: params.unit }),
    ...(params.size && { size: params.size.toString() }),
  });

  const url = `${TICKETMASTER_API_BASE}/venues.json?${searchParams}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ticketmaster API error: ${response.status} - ${error}`);
    }

    const data: TicketmasterSearchResponse = await response.json();
    return data._embedded?.venues || [];
  } catch (error) {
    console.error('Error searching Ticketmaster venues:', error);
    throw error;
  }
}

/**
 * Get events for a specific venue
 */
export async function getVenueEvents(params: {
  venueId: string;
  startDateTime?: string; // ISO 8601 format: YYYY-MM-DDTHH:mm:ssZ
  endDateTime?: string;
  size?: number;
  page?: number;
  sort?: string; // e.g., 'date,asc' or 'name,desc'
}): Promise<{ events: TicketmasterEvent[]; totalPages: number; totalElements: number }> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key is not configured');
  }

  const searchParams = new URLSearchParams({
    apikey: API_KEY,
    venueId: params.venueId,
    ...(params.startDateTime && { startDateTime: params.startDateTime }),
    ...(params.endDateTime && { endDateTime: params.endDateTime }),
    ...(params.size && { size: params.size.toString() }),
    ...(params.page && { page: params.page.toString() }),
    ...(params.sort && { sort: params.sort }),
  });

  const url = `${TICKETMASTER_API_BASE}/events.json?${searchParams}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Ticketmaster API error: ${response.status} - ${error}`);
    }

    const data: TicketmasterSearchResponse = await response.json();
    return {
      events: data._embedded?.events || [],
      totalPages: data.page?.totalPages || 0,
      totalElements: data.page?.totalElements || 0,
    };
  } catch (error) {
    console.error('Error fetching Ticketmaster events:', error);
    throw error;
  }
}

/**
 * Get a single event by ID
 */
export async function getEventById(eventId: string): Promise<TicketmasterEvent | null> {
  if (!API_KEY) {
    throw new Error('Ticketmaster API key is not configured');
  }

  const url = `${TICKETMASTER_API_BASE}/events/${eventId}.json?apikey=${API_KEY}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.text();
      throw new Error(`Ticketmaster API error: ${response.status} - ${error}`);
    }

    const event: TicketmasterEvent = await response.json();
    return event;
  } catch (error) {
    console.error('Error fetching Ticketmaster event:', error);
    throw error;
  }
}

/**
 * Helper to format dates for Ticketmaster API (ISO 8601)
 * Format: YYYY-MM-DDTHH:mm:ssZ (without milliseconds)
 */
export function formatDateForTicketmaster(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Helper to get date range for next N days
 */
export function getDateRange(days: number = 90): { startDateTime: string; endDateTime: string } {
  const now = new Date();
  const future = new Date();
  future.setDate(now.getDate() + days);

  return {
    startDateTime: formatDateForTicketmaster(now),
    endDateTime: formatDateForTicketmaster(future),
  };
}
