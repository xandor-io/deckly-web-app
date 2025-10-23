import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { importAllVenueEvents } from '@/lib/ticketmaster-import';

/**
 * Cron endpoint for automated Ticketmaster event imports
 * Protected by CRON_SECRET to prevent unauthorized access
 *
 * Usage:
 * - Locally: curl http://localhost:3000/api/cron/import-events -H "Authorization: Bearer YOUR_CRON_SECRET"
 * - Vercel: Automatically called by Vercel Cron Jobs (secret is auto-injected)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('CRON_SECRET is not configured');
      return NextResponse.json(
        { error: 'Cron job is not configured' },
        { status: 500 }
      );
    }

    // Check authorization header
    const token = authHeader?.replace('Bearer ', '');
    if (token !== cronSecret) {
      console.error('Unauthorized cron job attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🕐 Cron job started: Ticketmaster event import');
    const startTime = Date.now();

    // Connect to MongoDB
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
      console.log('✅ Connected to MongoDB');
    }

    // Import events for all venues (90 days ahead)
    const results = await importAllVenueEvents(90);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Calculate totals
    const totalImported = results.reduce((sum, r) => sum + r.eventsImported, 0);
    const totalUpdated = results.reduce((sum, r) => sum + r.eventsUpdated, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      summary: {
        venuesProcessed: results.length,
        eventsImported: totalImported,
        eventsUpdated: totalUpdated,
        errors: totalErrors,
      },
      venues: results.map((r) => ({
        venueId: r.venueId,
        venueName: r.venueName,
        imported: r.eventsImported,
        updated: r.eventsUpdated,
        errors: r.errors.length > 0 ? r.errors : undefined,
      })),
    };

    console.log('✅ Cron job completed successfully');
    console.log(`📊 Summary: ${totalImported} imported, ${totalUpdated} updated`);
    if (totalErrors > 0) {
      console.log(`⚠️  Errors: ${totalErrors}`);
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('❌ Cron job failed:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
