import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables first
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to MongoDB first
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models AFTER connecting to database
    const { default: Venue } = await import('../models/Venue');
    const { default: DJ, DJGenre } = await import('../models/DJ');
    const { default: Event, EventStatus } = await import('../models/Event');
    const {
      default: RunOfShow,
      SlotType,
      BookingStatus,
    } = await import('../models/RunOfShow');
    const { default: User, UserRole } = await import('../models/User');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      Venue.deleteMany({}),
      DJ.deleteMany({}),
      Event.deleteMany({}),
      RunOfShow.deleteMany({}),
      User.deleteMany({}),
    ]);
    console.log('✅ Cleared existing data');

    // Create Venues
    console.log('🏢 Creating venues...');
    const venues = await Venue.create([
      {
        name: 'The Grand Club',
        address: '123 Main St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        capacity: 500,
        description: 'Premier nightclub in downtown Miami',
        contactEmail: 'contact@grandclub.com',
        contactPhone: '305-555-0100',
        eventSourceUrl:
          'https://www.ticketmaster.com/the-grand-club-tickets-miami/venue/123456',
        autoImportEnabled: true,
        isActive: true,
      },
      {
        name: 'Skyline Lounge',
        address: '456 Beach Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
        capacity: 300,
        description: 'Rooftop venue with stunning city views',
        contactEmail: 'info@skylinelounge.com',
        contactPhone: '310-555-0200',
        eventSourceUrl: 'https://posh.vip/skyline-lounge',
        autoImportEnabled: false,
        isActive: true,
      },
      {
        name: 'Underground',
        address: '789 Downtown Ave',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        capacity: 800,
        description: 'Legendary underground techno venue',
        contactEmail: 'bookings@underground.nyc',
        contactPhone: '212-555-0300',
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${venues.length} venues`);

    // Create DJs
    console.log('🎧 Creating DJs...');
    const djs = await DJ.create([
      {
        name: 'DJ Nova',
        email: 'dj.nova@example.com',
        genres: [DJGenre.HOUSE, DJGenre.DEEP_HOUSE],
        bio: 'House music specialist with 10 years of experience',
        phone: '555-0101',
        bookingCount: 15,
        isActive: true,
        rating: 4.8,
      },
      {
        name: 'MC Thunder',
        email: 'mc.thunder@example.com',
        genres: [DJGenre.TECH, DJGenre.TECHNO],
        bio: 'Techno enthusiast bringing high energy sets',
        phone: '555-0102',
        bookingCount: 8,
        isActive: true,
        rating: 4.5,
      },
      {
        name: 'DJ Rhythm',
        email: 'dj.rhythm@example.com',
        genres: [DJGenre.AFROHOUSE],
        bio: 'Afrohouse specialist creating unique sonic experiences',
        phone: '555-0103',
        bookingCount: 12,
        isActive: true,
        rating: 4.9,
      },
      {
        name: 'DJ Velocity',
        email: 'dj.velocity@example.com',
        genres: [DJGenre.OPEN_FORMAT, DJGenre.HIP_HOP, DJGenre.RNB],
        bio: 'Open format DJ playing all the hits',
        phone: '555-0104',
        bookingCount: 25,
        isActive: true,
        rating: 4.7,
      },
      {
        name: 'DJ Eclipse',
        email: 'dj.eclipse@example.com',
        genres: [DJGenre.PROGRESSIVE, DJGenre.HOUSE],
        bio: 'Progressive house master with international experience',
        phone: '555-0105',
        bookingCount: 5,
        isActive: true,
        rating: 4.6,
      },
      {
        name: 'DJ Phoenix',
        email: 'dj.phoenix@example.com',
        genres: [DJGenre.OPEN_FORMAT],
        bio: 'Versatile DJ ready for any crowd',
        phone: '555-0106',
        bookingCount: 3,
        isActive: true,
        rating: 4.4,
      },
      {
        name: 'DJ Solstice',
        email: 'dj.solstice@example.com',
        genres: [DJGenre.DEEP_HOUSE, DJGenre.TECH],
        bio: 'Creating deep and melodic journeys',
        phone: '555-0107',
        bookingCount: 10,
        isActive: true,
        rating: 4.8,
      },
      {
        name: 'DJ Catalyst',
        email: 'dj.catalyst@example.com',
        genres: [DJGenre.BASS, DJGenre.TECHNO],
        bio: 'Bass-heavy sets that move the crowd',
        phone: '555-0108',
        bookingCount: 7,
        isActive: true,
        rating: 4.5,
      },
    ]);
    console.log(`✅ Created ${djs.length} DJs`);

    // Create Users (Admin and DJ users)
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        email: 'hello@xandor.io',
        auth0Id: 'auth0|68f0595ee1505ccb23846720',
        role: UserRole.ADMIN,
        name: 'Admin User',
      },
    ]);
    console.log(`✅ Created ${users.length} users`);

    // Create Events
    console.log('📅 Creating events...');
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);

    const events = await Event.create([
      {
        name: 'House Night',
        venueId: venues[0]._id,
        date: nextWeek,
        startTime: '22:00',
        endTime: '04:00',
        description: 'All night house music celebration',
        status: EventStatus.SCHEDULED,
        ticketUrl: 'https://tickets.example.com/house-night',
      },
      {
        name: 'Techno Tuesday',
        venueId: venues[2]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '23:00',
        endTime: '05:00',
        description: 'Underground techno experience',
        status: EventStatus.SCHEDULED,
      },
      {
        name: 'Weekend Vibes',
        venueId: venues[1]._id,
        date: nextMonth,
        startTime: '21:00',
        endTime: '03:00',
        description: 'Rooftop party with multiple DJs',
        status: EventStatus.DRAFT,
      },
      {
        name: 'Afrohouse Festival',
        venueId: venues[0]._id,
        date: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000),
        startTime: '20:00',
        endTime: '04:00',
        description: 'Celebrating Afrohouse music and culture',
        status: EventStatus.SCHEDULED,
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // Create Run of Shows
    console.log('🎵 Creating run of shows...');
    const runOfShows = await RunOfShow.create([
      {
        eventId: events[0]._id,
        timeSlots: [
          {
            slotName: 'Opening Set',
            slotType: SlotType.OPENER,
            startTime: '22:00',
            endTime: '23:30',
            djAssignments: [
              {
                djId: djs[5]._id, // DJ Phoenix
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
            ],
          },
          {
            slotName: 'Prime Time',
            slotType: SlotType.MAIN,
            startTime: '23:30',
            endTime: '02:00',
            djAssignments: [
              {
                djId: djs[0]._id, // DJ Nova
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
            ],
          },
          {
            slotName: 'Closing Set',
            slotType: SlotType.CLOSER,
            startTime: '02:00',
            endTime: '04:00',
            djAssignments: [
              {
                djId: djs[6]._id, // DJ Solstice
                status: BookingStatus.PENDING,
                notificationSent: true,
                notificationSentAt: new Date(),
              },
            ],
          },
        ],
      },
      {
        eventId: events[1]._id,
        timeSlots: [
          {
            slotName: 'Warm Up',
            slotType: SlotType.OPENER,
            startTime: '23:00',
            endTime: '01:00',
            djAssignments: [
              {
                djId: djs[7]._id, // DJ Catalyst
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
            ],
          },
          {
            slotName: 'Main Event',
            slotType: SlotType.MAIN,
            startTime: '01:00',
            endTime: '05:00',
            djAssignments: [
              {
                djId: djs[1]._id, // MC Thunder
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
            ],
          },
        ],
      },
      {
        eventId: events[3]._id,
        timeSlots: [
          {
            slotName: 'Early Night - Dual Openers',
            slotType: SlotType.OPENER,
            startTime: '20:00',
            endTime: '22:00',
            maxDJs: 2,
            djAssignments: [
              {
                djId: djs[3]._id, // DJ Velocity
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
              {
                djId: djs[5]._id, // DJ Phoenix
                status: BookingStatus.PENDING,
                notificationSent: true,
                notificationSentAt: new Date(),
              },
            ],
          },
          {
            slotName: 'Afrohouse Headliner',
            slotType: SlotType.MAIN,
            startTime: '22:00',
            endTime: '04:00',
            djAssignments: [
              {
                djId: djs[2]._id, // DJ Rhythm
                status: BookingStatus.CONFIRMED,
                notificationSent: true,
                notificationSentAt: new Date(),
                confirmedAt: new Date(),
              },
            ],
          },
        ],
      },
    ]);
    console.log(`✅ Created ${runOfShows.length} run of shows`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${venues.length} venues`);
    console.log(`   - ${djs.length} DJs`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${events.length} events`);
    console.log(`   - ${runOfShows.length} run of shows`);
    console.log('\n👤 Admin credentials:');
    console.log(`   Email: hello@xandor.io`);
    console.log(`   Auth0 ID: auth0|admin123`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
