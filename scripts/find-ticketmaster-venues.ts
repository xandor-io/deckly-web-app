import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

async function findTicketmasterVenues() {
  try {
    console.log('🔍 Starting Ticketmaster venue discovery...\n');

    // Connect to MongoDB first
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import dependencies after MongoDB connection
    const { default: Venue } = await import('../models/Venue');
    const { searchVenues } = await import('../lib/ticketmaster');

    // Get all venues from database
    const venues = await Venue.find({ isActive: true });
    console.log(`📍 Found ${venues.length} active venues in database\n`);

    let foundCount = 0;
    let notFoundCount = 0;

    // Search for each venue on Ticketmaster
    for (const venue of venues) {
      console.log(`Searching for: ${venue.name} (${venue.city}, ${venue.state})`);

      try {
        // Search Ticketmaster API
        const results = await searchVenues({
          keyword: venue.name,
          city: venue.city,
          stateCode: venue.state,
          countryCode: 'US',
          size: 5, // Get top 5 results
        });

        if (results.length === 0) {
          console.log(`  ❌ No results found\n`);
          notFoundCount++;
          continue;
        }

        // Try to find best match
        let bestMatch = null;
        let bestScore = 0;

        for (const result of results) {
          let score = 0;

          // Exact name match
          if (
            result.name.toLowerCase() === venue.name.toLowerCase() ||
            result.name.toLowerCase().includes(venue.name.toLowerCase()) ||
            venue.name.toLowerCase().includes(result.name.toLowerCase())
          ) {
            score += 50;
          }

          // City match
          if (result.city?.name.toLowerCase() === venue.city.toLowerCase()) {
            score += 30;
          }

          // State match
          if (result.state?.stateCode === venue.state) {
            score += 20;
          }

          if (score > bestScore) {
            bestScore = score;
            bestMatch = result;
          }
        }

        if (bestMatch && bestScore >= 50) {
          console.log(`  ✅ Found match: ${bestMatch.name} (ID: ${bestMatch.id})`);
          console.log(`     Match score: ${bestScore}/100`);
          console.log(`     Address: ${bestMatch.address?.line1}, ${bestMatch.city?.name}, ${bestMatch.state?.stateCode}`);

          // Update venue in database
          await Venue.findByIdAndUpdate(venue._id, {
            $set: {
              'externalIds.ticketmaster': bestMatch.id,
              autoImportEnabled: true,
              autoImportSources: ['ticketmaster'],
            },
          });

          console.log(`  💾 Updated database with Ticketmaster ID\n`);
          foundCount++;
        } else {
          console.log(`  ⚠️  Found ${results.length} results but no confident match (best score: ${bestScore}/100)`);
          console.log(`     Top result: ${results[0].name} (${results[0].city?.name}, ${results[0].state?.stateCode})`);
          console.log(`     Please verify manually if needed\n`);
          notFoundCount++;
        }

        // Rate limiting - wait 200ms between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.log(`  ❌ Error searching: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        notFoundCount++;
      }
    }

    console.log('\n🎉 Venue discovery complete!');
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Found and linked: ${foundCount} venues`);
    console.log(`   ❌ Not found or low confidence: ${notFoundCount} venues`);

    if (foundCount > 0) {
      console.log(`\n💡 Next steps:`);
      console.log(`   1. Review the matched venues in your database`);
      console.log(`   2. Manually verify any venues with low match scores`);
      console.log(`   3. Run the event import script to fetch events`);
    }
  } catch (error) {
    console.error('❌ Error during venue discovery:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

findTicketmasterVenues();
