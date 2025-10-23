import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

async function importEvents() {
  try {
    console.log('🎫 Starting Ticketmaster event import...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import after database connection
    const { importAllVenueEvents } = await import('../lib/ticketmaster-import');

    // Import events for next 90 days
    await importAllVenueEvents(90);
  } catch (error) {
    console.error('❌ Error during import:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

importEvents();
