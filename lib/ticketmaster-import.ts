import mongoose from 'mongoose';
import Venue, { IVenue } from '../models/Venue';
import Event, { EventStatus } from '../models/Event';
import {
  getVenueEvents,
  getDateRange,
  TicketmasterEvent,
} from './ticketmaster';

export interface ImportResult {
  venueId: string;
  venueName: string;
  eventsImported: number;
  eventsUpdated: number;
  errors: string[];
}

/**
 * Extract time from Ticketmaster date string
 * Returns time in HH:MM format or defaults
 */
function extractTime(dateTime?: string, localTime?: string): string {
  if (localTime) {
    // localTime might be in format "19:00:00" or "19:00", normalize to HH:MM
    const parts = localTime.split(':');
    if (parts.length >= 2) {
      return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return localTime;
  }

  if (dateTime) {
    // Extract time from ISO 8601 dateTime string (e.g., "2025-01-15T19:00:00Z")
    const timeMatch = dateTime.match(/T(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1]}:${timeMatch[2]}`;
    }

    // Fallback to parsing as Date
    const date = new Date(dateTime);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // Default to 20:00 (8 PM) if no time available
  return '20:00';
}

/**
 * Calculate end time based on start time
 * Assumes typical 4-hour event duration
 */
function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endHours = (hours + 4) % 24;
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Convert Ticketmaster event to our Event model data
 */
function mapTicketmasterEvent(
  tmEvent: TicketmasterEvent,
  venue: IVenue
): Partial<Event> {
  const localDate = tmEvent.dates?.start?.localDate;
  const dateTime = tmEvent.dates?.start?.dateTime;
  const localTime = tmEvent.dates?.start?.localTime;

  // Parse date
  let eventDate: Date;
  if (dateTime) {
    eventDate = new Date(dateTime);
  } else if (localDate) {
    eventDate = new Date(localDate);
  } else {
    throw new Error(`Event ${tmEvent.id} has no valid date`);
  }

  // Extract times
  const startTime = extractTime(dateTime, localTime);
  const endTime = tmEvent.dates?.end?.localTime
    ? extractTime(tmEvent.dates.end.dateTime, tmEvent.dates.end.localTime)
    : calculateEndTime(startTime);

  // Get best image (prefer 16:9 ratio, larger size)
  const image = tmEvent.images
    ?.filter((img) => !img.fallback)
    .sort((a, b) => {
      // Prefer 16_9 ratio
      if (a.ratio === '16_9' && b.ratio !== '16_9') return -1;
      if (b.ratio === '16_9' && a.ratio !== '16_9') return 1;
      // Then by size
      return b.width * b.height - a.width * a.height;
    })[0];

  // Map Ticketmaster data to our Event model
  return {
    name: tmEvent.name,
    venueId: venue._id as mongoose.Types.ObjectId,
    date: eventDate,
    startTime,
    endTime,
    description: tmEvent.info || tmEvent.pleaseNote,
    status: EventStatus.IMPORTED,
    imageUrl: image?.url,
    ticketUrl: tmEvent.url,
    externalIds: {
      ticketmaster: tmEvent.id,
    },
    externalSource: 'ticketmaster',
    externalUrl: tmEvent.url,
    lastSyncedAt: new Date(),
    ticketmasterData: {
      status: tmEvent.dates?.status?.code,
      priceRanges: tmEvent.priceRanges?.map((pr) => ({
        type: pr.type,
        currency: pr.currency,
        min: pr.min,
        max: pr.max,
      })),
      salesDates: tmEvent.sales
        ? {
            public: tmEvent.sales.public
              ? {
                  startDateTime: new Date(tmEvent.sales.public.startDateTime),
                  endDateTime: new Date(tmEvent.sales.public.endDateTime),
                }
              : undefined,
            presales: tmEvent.sales.presales?.map((ps) => ({
              name: ps.name,
              startDateTime: new Date(ps.startDateTime),
              endDateTime: new Date(ps.endDateTime),
            })),
          }
        : undefined,
      images: tmEvent.images?.map((img) => ({
        url: img.url,
        width: img.width,
        height: img.height,
        ratio: img.ratio,
      })),
      genre: tmEvent.classifications?.[0]?.genre,
      subGenre: tmEvent.classifications?.[0]?.subGenre,
      promoter: tmEvent.promoter || tmEvent.promoters?.[0],
      ageRestrictions: tmEvent.ageRestrictions?.legalAgeEnforced
        ? 'Legal age enforced'
        : undefined,
      accessibility: tmEvent.accessibility,
      seatmap: tmEvent.seatmap,
    },
    isImported: true,
    importSource: 'ticketmaster',
  };
}

/**
 * Check if an event matches an existing manually created event
 * Matches on: venue, date, and approximate time (within 2 hours)
 */
async function findMatchingManualEvent(
  venueId: mongoose.Types.ObjectId,
  eventDate: Date,
  startTime: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;

  // Find events on the same day at the same venue
  const startOfDay = new Date(eventDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(eventDate);
  endOfDay.setHours(23, 59, 59, 999);

  const manualEvents = await Event.find({
    venueId,
    date: { $gte: startOfDay, $lte: endOfDay },
    externalSource: 'manual',
    $or: [{ 'externalIds.ticketmaster': { $exists: false } }, { 'externalIds.ticketmaster': null }],
  });

  // Check if any match within 2 hours
  for (const manualEvent of manualEvents) {
    const [manualHours, manualMinutes] = manualEvent.startTime
      .split(':')
      .map(Number);
    const manualStartMinutes = manualHours * 60 + manualMinutes;
    const timeDiff = Math.abs(startMinutes - manualStartMinutes);

    if (timeDiff <= 120) {
      // Within 2 hours
      return manualEvent;
    }
  }

  return null;
}

/**
 * Import events for a single venue
 */
export async function importVenueEvents(
  venue: IVenue,
  daysAhead: number = 90
): Promise<Omit<ImportResult, 'venueId' | 'venueName'>> {
  const result = {
    eventsImported: 0,
    eventsUpdated: 0,
    errors: [] as string[],
  };

  try {
    const ticketmasterId = venue.externalIds?.ticketmaster;
    if (!ticketmasterId) {
      result.errors.push('No Ticketmaster venue ID found');
      return result;
    }

    // Get date range for import
    const { startDateTime, endDateTime } = getDateRange(daysAhead);

    // Fetch events from Ticketmaster
    const { events: tmEvents } = await getVenueEvents({
      venueId: ticketmasterId,
      startDateTime,
      endDateTime,
      size: 200, // Max events per page
      sort: 'date,asc',
    });

    console.log(`  Found ${tmEvents.length} events on Ticketmaster`);

    // Process each Ticketmaster event
    for (const tmEvent of tmEvents) {
      try {
        // Check if event already exists by Ticketmaster ID
        const existingEvent = await Event.findOne({
          'externalIds.ticketmaster': tmEvent.id,
        });

        if (existingEvent) {
          // Update existing event with latest data
          const mappedData = mapTicketmasterEvent(tmEvent, venue);
          await Event.findByIdAndUpdate(existingEvent._id, {
            $set: {
              ...mappedData,
              // Preserve status if it's further along in the workflow
              status:
                existingEvent.status !== EventStatus.IMPORTED
                  ? existingEvent.status
                  : EventStatus.IMPORTED,
            },
          });
          result.eventsUpdated++;
        } else {
          // Check if there's a matching manual event
          const mappedData = mapTicketmasterEvent(tmEvent, venue);
          const manualEvent = await findMatchingManualEvent(
            venue._id as mongoose.Types.ObjectId,
            mappedData.date!,
            mappedData.startTime!
          );

          if (manualEvent) {
            // Link manual event with Ticketmaster data
            await Event.findByIdAndUpdate(manualEvent._id, {
              $set: {
                ...mappedData,
                // Preserve manual event status
                status: manualEvent.status,
              },
            });
            result.eventsUpdated++;
          } else {
            // Create new event
            await Event.create(mappedData);
            result.eventsImported++;
          }
        }
      } catch (error) {
        result.errors.push(
          `Error processing event ${tmEvent.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Update venue's last import date
    await Venue.findByIdAndUpdate(venue._id, {
      $set: { lastImportDate: new Date() },
    });
  } catch (error) {
    result.errors.push(
      `Error fetching events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Import events for all venues with auto-import enabled
 */
export async function importAllVenueEvents(
  daysAhead: number = 90
): Promise<ImportResult[]> {
  const results: ImportResult[] = [];

  try {
    // Find all venues with auto-import enabled and Ticketmaster configured
    const venues = await Venue.find({
      autoImportEnabled: true,
      'externalIds.ticketmaster': { $exists: true, $ne: null },
    });

    console.log(`🔄 Starting import for ${venues.length} venues...`);

    for (const venue of venues) {
      console.log(`\n📍 Importing events for: ${venue.name}`);

      const result = await importVenueEvents(venue, daysAhead);

      results.push({
        venueId: venue._id.toString(),
        venueName: venue.name,
        ...result,
      });

      console.log(
        `  ✅ Imported: ${result.eventsImported}, Updated: ${result.eventsUpdated}`
      );
      if (result.errors.length > 0) {
        console.log(`  ⚠️  Errors: ${result.errors.length}`);
        result.errors.forEach((err) => console.log(`     - ${err}`));
      }

      // Rate limiting - wait 500ms between venues
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    const totalImported = results.reduce(
      (sum, r) => sum + r.eventsImported,
      0
    );
    const totalUpdated = results.reduce((sum, r) => sum + r.eventsUpdated, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log(`\n🎉 Import complete!`);
    console.log(`   📊 Total imported: ${totalImported}`);
    console.log(`   🔄 Total updated: ${totalUpdated}`);
    if (totalErrors > 0) {
      console.log(`   ⚠️  Total errors: ${totalErrors}`);
    }
  } catch (error) {
    console.error('❌ Error during import:', error);
    throw error;
  }

  return results;
}
