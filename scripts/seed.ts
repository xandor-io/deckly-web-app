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
    const { default: DJ } = await import('../models/DJ');
    const { DJGenre } = await import('../types/dj');
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

    // Create Venues - All Big Night Entertainment venues
    console.log('🏢 Creating venues...');
    const venues = await Venue.create([
      {
        name: 'Big Night Live',
        address: '100 Causeway St, Suite 1120',
        city: 'Boston',
        state: 'MA',
        zipCode: '02114',
        capacity: 2000,
        description:
          '40,000 square foot premier music venue at The Hub on Causeway',
        contactEmail: 'info@bignightlive.com',
        contactPhone: '617-800-0000',
        isActive: true,
      },
      {
        name: 'The Grand',
        address: '58 Seaport Blvd, Suite 300',
        city: 'Boston',
        state: 'MA',
        zipCode: '02210',
        capacity: 800,
        description: '12,000 square foot nightclub in the Seaport District',
        contactEmail: 'info@thegrandboston.com',
        contactPhone: '617-695-9463',
        isActive: true,
      },
      {
        name: 'Empire',
        address: '1 Marina Park Dr',
        city: 'Boston',
        state: 'MA',
        zipCode: '02210',
        capacity: 600,
        description: '14,000 square foot restaurant and lounge in the Seaport',
        contactEmail: 'info@empireboston.com',
        contactPhone: '617-295-0001',
        isActive: true,
      },
      {
        name: 'Scorpion Bar',
        address: '58 Seaport Blvd, Suite 200',
        city: 'Boston',
        state: 'MA',
        zipCode: '02210',
        capacity: 400,
        description: 'Upscale tequila bar above The Grand in the Seaport',
        contactEmail: 'info@scorpionbarboston.com',
        contactPhone: '617-322-0200',
        isActive: true,
      },
      {
        name: 'Scorpion Bar Foxwoods',
        address: '350 Trolley Line Blvd',
        city: 'Mashantucket',
        state: 'CT',
        zipCode: '06338',
        capacity: 300,
        description:
          '5,000 square foot tequila bar featuring over 100 tequilas',
        contactEmail: 'info@scorpionbarfoxwoods.com',
        contactPhone: '860-312-3000',
        isActive: true,
      },
      {
        name: 'Scorpion Bar Patriots Place',
        address: '253 Patriot Place',
        city: 'Foxborough',
        state: 'MA',
        zipCode: '02035',
        capacity: 420,
        description: '7,800 square foot venue with 200" HDTV and 50-foot bar',
        contactEmail: 'info@scorpionbarpatriotsplace.com',
        contactPhone: '508-698-9000',
        isActive: true,
      },
      {
        name: 'Mystique',
        address: '1 Broadway',
        city: 'Everett',
        state: 'MA',
        zipCode: '02149',
        capacity: 450,
        description: '16,400 square foot nightclub at Encore Boston Harbor',
        contactEmail: 'info@mystiqueboston.com',
        contactPhone: '857-770-3000',
        isActive: true,
      },
      {
        name: 'Mémoire',
        address: '1 Broadway',
        city: 'Everett',
        state: 'MA',
        zipCode: '02149',
        capacity: 650,
        description:
          '8,000 square foot nightclub with Funktion One sound system at Encore Boston Harbor',
        contactEmail: 'info@memoireboston.com',
        contactPhone: '857-770-7000',
        isActive: true,
      },
      {
        name: 'PLAY',
        address: '110 Causeway Street',
        city: 'Boston',
        state: 'MA',
        zipCode: '02114',
        capacity: 300,
        description:
          'Interactive entertainment venue combining arcade, sports bar, and nightlife at The Hub on Causeway',
        contactEmail: 'info@playboston.com',
        contactPhone: '617-807-7529',
        isActive: true,
      },
    ]);
    console.log(`✅ Created ${venues.length} venues`);

    // Create DJs from Big Night Resident Schedule
    console.log('🎧 Creating DJs...');
    const djNames = [
      'BREAKBOMB',
      'RIVAS',
      'AYEOO',
      'KAREEM',
      'SCREW',
      'PRIZ',
      'SWEETLK',
      'BONES',
      'ZAY WILSON',
      'DON DAFT',
      'CARLUCCI',
      'LAFLAMME',
      'DARYUS COSTA',
      'CERTIFIED',
      'ZAC RICHARDS',
      'SPLANN',
      'MCDONOUGH',
      'KLOPP',
      'KYLE GILMAN',
      'TY FOLEY',
      'SJOTIME',
      'CUTTA',
      'KINGS FOR THE WEEKEND',
      'BOBBY LOMBARDI',
      'CRIBB',
      'EVN',
      'BRETTY V',
      'JAKEZ',
      'SIDEFX',
      'MAYSON BRANCO',
      'PALEY',
      'PETTI',
      'CHARLEY BLACKER',
      'RYAN NICHOLS',
      'CAMILLA FABB',
      'VO',
      'JUJU',
      'JAKE JORDAN',
      'DEW GALVIN',
      'XANDOR',
      'AVDREY',
      'FRIZZLE',
      'JUTT',
      'JAXX',
      'FORTUNE',
      'SHANE DOUGHERTY',
      'JUSTGAV',
      'FLEURY',
      'JOESPRESSO',
      'EM',
      'MILESHIGH',
      'ROOSTER',
      'MAV',
    ];

    // Assign varied genres to DJs
    const genreOptions = [
      [DJGenre.HOUSE, DJGenre.DEEP_HOUSE],
      [DJGenre.TECH, DJGenre.TECHNO],
      [DJGenre.PROGRESSIVE, DJGenre.HOUSE],
      [DJGenre.OPEN_FORMAT],
      [DJGenre.AFROHOUSE],
      [DJGenre.BASS, DJGenre.TECHNO],
      [DJGenre.HIP_HOP, DJGenre.RNB],
      [DJGenre.DEEP_HOUSE, DJGenre.TECH],
    ];

    const djs = await DJ.create(
      djNames.map((name, index) => ({
        name,
        email: `${name.toLowerCase().replace(/\s+/g, '.')}@bignight.com`,
        genres: genreOptions[index % genreOptions.length],
        bio: `Resident DJ at Big Night Entertainment`,
        phone: `555-${String(index + 1000).slice(-4)}`,
        bookingCount: Math.floor(Math.random() * 30),
        isActive: true,
        rating: Number((4.0 + Math.random() * 1.0).toFixed(1)),
      }))
    );
    console.log(`✅ Created ${djs.length} DJs`);

    // Create Users (Admin and DJ users)
    console.log('👥 Creating users...');
    const users = await User.create([
      {
        email: 'hello@xandor.io',
        auth0Id: 'auth0|68f0595ee1505ccb23846720',
        role: UserRole.ADMIN,
        name: 'Xandor Xicay',
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
        status: EventStatus.CONFIRMED,
        ticketUrl: 'https://tickets.example.com/house-night',
      },
      {
        name: 'Techno Tuesday',
        venueId: venues[2]._id,
        date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        startTime: '23:00',
        endTime: '05:00',
        description: 'Underground techno experience',
        status: EventStatus.CONFIRMED,
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
        status: EventStatus.CONFIRMED,
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
