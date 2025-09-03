const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, DestinationGuide, TripItinerary, Review, Group, Favorite } = require('../models');

const seedData = async () => {
  try {
    console.log('Starting seed process...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await DestinationGuide.deleteMany({});
    await TripItinerary.deleteMany({});
    await Review.deleteMany({});
    await Group.deleteMany({});
    await Favorite.deleteMany({});

    console.log('Cleared existing data');

    // Create 10 users (including admin)
    const hashedPassword = await bcrypt.hash('password123', 12);
    const adminHashedPassword = await bcrypt.hash('admin@123', 12);

    const users = [];
    
    // Admin user
    const adminUser = await User.create({
      firstName: 'Puneet',
      lastName: 'Reddy',
      email: 'puneethreddyt2004@gmail.com',
      password: adminHashedPassword,
      role: 'admin',
      isActive: true,
      preferences: {
        travelStyle: 'adventure',
        budgetRange: 'luxury',
        interests: ['culture', 'adventure', 'nature']
      }
    });
    users.push(adminUser);

    // Regular users
    const userNames = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
      { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
      { firstName: 'Mike', lastName: 'Johnson', email: 'mike.johnson@example.com' },
      { firstName: 'Sarah', lastName: 'Wilson', email: 'sarah.wilson@example.com' },
      { firstName: 'David', lastName: 'Brown', email: 'david.brown@example.com' },
      { firstName: 'Emma', lastName: 'Davis', email: 'emma.davis@example.com' },
      { firstName: 'Chris', lastName: 'Miller', email: 'chris.miller@example.com' },
      { firstName: 'Lisa', lastName: 'Garcia', email: 'lisa.garcia@example.com' },
      { firstName: 'Tom', lastName: 'Anderson', email: 'tom.anderson@example.com' }
    ];

    for (const userData of userNames) {
      const user = await User.create({
        ...userData,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        preferences: {
          travelStyle: ['adventure', 'cultural', 'relaxation'][Math.floor(Math.random() * 3)],
          budgetRange: ['budget', 'mid-range', 'luxury'][Math.floor(Math.random() * 3)],
          interests: ['culture', 'adventure', 'nature', 'food', 'history'].slice(0, Math.floor(Math.random() * 3) + 1)
        }
      });
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create 10 destination guides
    const destinations = await DestinationGuide.create([
      {
        title: 'Bali Paradise Island',
        summary: 'Discover the tropical paradise of Bali with its stunning beaches, ancient temples, and vibrant culture.',
        description: 'Bali offers an incredible mix of natural beauty, spiritual culture, and modern amenities.',
        location: {
          country: 'Indonesia',
          city: 'Bali',
          coordinates: { latitude: -8.3405, longitude: 115.0920 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800',
          caption: 'Bali rice terraces',
          isPrimary: true
        }],
        content: {
          history: 'Bali has a rich Hindu culture dating back over 1000 years.',
          culture: 'Balinese Hindu culture with traditional ceremonies and art.',
          attractions: ['Tanah Lot Temple', 'Ubud Rice Terraces', 'Mount Batur', 'Seminyak Beach'],
          bestTimeToVisit: 'April to October',
          climate: 'Tropical climate',
          language: ['Indonesian', 'Balinese'],
          currency: 'Indonesian Rupiah (IDR)'
        },
        recommendations: {
          lodging: [{
            name: 'Four Seasons Resort Bali',
            type: 'resort',
            priceRange: 'luxury',
            description: 'Luxury resort with stunning views'
          }],
          dining: [{
            name: 'Locavore',
            cuisine: 'Modern Indonesian',
            priceRange: 'fine-dining',
            description: 'Award-winning restaurant in Ubud'
          }],
          activities: [{
            name: 'Sunrise Trek Mount Batur',
            category: 'adventure',
            duration: '6 hours',
            difficulty: 'moderate',
            description: 'Hike to see sunrise from volcanic peak'
          }]
        },
        tags: ['tropical', 'culture', 'beaches', 'temples'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Paris City of Lights',
        summary: 'Experience the romance and elegance of Paris with its iconic landmarks and world-class museums.',
        description: 'Paris, the capital of France, is renowned for its art, fashion, gastronomy, and culture.',
        location: {
          country: 'France',
          city: 'Paris',
          coordinates: { latitude: 48.8566, longitude: 2.3522 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
          caption: 'Eiffel Tower at sunset',
          isPrimary: true
        }],
        content: {
          history: 'Paris has over 2,000 years of history as a major European city.',
          culture: 'French culture with emphasis on art, literature, and culinary excellence.',
          attractions: ['Eiffel Tower', 'Louvre Museum', 'Notre-Dame Cathedral', 'Arc de Triomphe'],
          bestTimeToVisit: 'April to June and September to October',
          climate: 'Temperate oceanic climate',
          language: ['French'],
          currency: 'Euro (EUR)'
        },
        recommendations: {
          lodging: [{
            name: 'Hotel Plaza Athénée',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Iconic luxury hotel with Eiffel Tower views'
          }],
          dining: [{
            name: 'Le Comptoir du Relais',
            cuisine: 'French',
            priceRange: 'mid-range',
            description: 'Traditional French bistro with authentic atmosphere'
          }],
          activities: [{
            name: 'Seine River Cruise',
            category: 'cultural',
            duration: '2 hours',
            difficulty: 'easy',
            description: 'Scenic boat tour along the Seine River'
          }]
        },
        tags: ['city', 'culture', 'art', 'romance', 'museums'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Tokyo Modern Metropolis',
        summary: 'Explore the fascinating blend of traditional and modern culture in Japan\'s bustling capital.',
        description: 'Tokyo is a city where ancient traditions meet cutting-edge technology.',
        location: {
          country: 'Japan',
          city: 'Tokyo',
          coordinates: { latitude: 35.6762, longitude: 139.6503 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
          caption: 'Tokyo skyline at night',
          isPrimary: true
        }],
        content: {
          history: 'Tokyo has been Japan\'s capital since 1868, formerly known as Edo.',
          culture: 'Unique blend of traditional Japanese culture and modern innovation.',
          attractions: ['Senso-ji Temple', 'Tokyo Skytree', 'Shibuya Crossing', 'Meiji Shrine'],
          bestTimeToVisit: 'March to May and September to November',
          climate: 'Humid subtropical climate',
          language: ['Japanese'],
          currency: 'Japanese Yen (JPY)'
        },
        recommendations: {
          lodging: [{
            name: 'Park Hyatt Tokyo',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Luxury hotel with panoramic city views'
          }],
          dining: [{
            name: 'Sukiyabashi Jiro',
            cuisine: 'Japanese Sushi',
            priceRange: 'fine-dining',
            description: 'World-renowned sushi restaurant'
          }],
          activities: [{
            name: 'Traditional Tea Ceremony',
            category: 'cultural',
            duration: '2 hours',
            difficulty: 'easy',
            description: 'Experience authentic Japanese tea ceremony'
          }]
        },
        tags: ['city', 'technology', 'tradition', 'food', 'culture'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'New York City Big Apple',
        summary: 'Experience the energy and diversity of America\'s most iconic city.',
        description: 'New York City offers world-class attractions, Broadway shows, and incredible dining.',
        location: {
          country: 'United States',
          city: 'New York',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800',
          caption: 'Manhattan skyline',
          isPrimary: true
        }],
        content: {
          history: 'Founded as New Amsterdam in 1624, became New York in 1664.',
          culture: 'Melting pot of cultures with world-class arts and entertainment.',
          attractions: ['Statue of Liberty', 'Central Park', 'Times Square', 'Brooklyn Bridge'],
          bestTimeToVisit: 'April to June and September to November',
          climate: 'Humid continental climate',
          language: ['English'],
          currency: 'US Dollar (USD)'
        },
        recommendations: {
          lodging: [{
            name: 'The Plaza Hotel',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Iconic luxury hotel overlooking Central Park'
          }],
          dining: [{
            name: 'Katz\'s Delicatessen',
            cuisine: 'American Deli',
            priceRange: 'budget',
            description: 'Famous for pastrami sandwiches since 1888'
          }],
          activities: [{
            name: 'Broadway Show',
            category: 'entertainment',
            duration: '3 hours',
            difficulty: 'easy',
            description: 'World-class theater performances'
          }]
        },
        tags: ['city', 'culture', 'entertainment', 'shopping', 'food'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'London Historic Capital',
        summary: 'Discover the rich history and modern vibrancy of England\'s capital city.',
        description: 'London combines centuries of history with cutting-edge culture and cuisine.',
        location: {
          country: 'United Kingdom',
          city: 'London',
          coordinates: { latitude: 51.5074, longitude: -0.1278 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
          caption: 'Big Ben and Parliament',
          isPrimary: true
        }],
        content: {
          history: 'Founded by Romans as Londinium around 47 AD.',
          culture: 'Rich royal heritage with modern multicultural influences.',
          attractions: ['Big Ben', 'Tower of London', 'British Museum', 'London Eye'],
          bestTimeToVisit: 'May to September',
          climate: 'Temperate oceanic climate',
          language: ['English'],
          currency: 'British Pound (GBP)'
        },
        recommendations: {
          lodging: [{
            name: 'The Savoy',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Historic luxury hotel on the Strand'
          }],
          dining: [{
            name: 'Dishoom',
            cuisine: 'Indian',
            priceRange: 'mid-range',
            description: 'Bombay-style cafe with excellent atmosphere'
          }],
          activities: [{
            name: 'Thames River Cruise',
            category: 'sightseeing',
            duration: '1.5 hours',
            difficulty: 'easy',
            description: 'See London\'s landmarks from the river'
          }]
        },
        tags: ['city', 'history', 'culture', 'museums', 'royal'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Rome Eternal City',
        summary: 'Walk through history in the ancient capital of the Roman Empire.',
        description: 'Rome offers unparalleled historical sites, incredible art, and amazing Italian cuisine.',
        location: {
          country: 'Italy',
          city: 'Rome',
          coordinates: { latitude: 41.9028, longitude: 12.4964 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
          caption: 'Colosseum at sunset',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 753 BC, capital of Roman Empire for over 500 years.',
          culture: 'Ancient Roman heritage with Renaissance and Baroque influences.',
          attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain', 'Roman Forum'],
          bestTimeToVisit: 'April to June and September to October',
          climate: 'Mediterranean climate',
          language: ['Italian'],
          currency: 'Euro (EUR)'
        },
        recommendations: {
          lodging: [{
            name: 'Hotel de Russie',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Elegant hotel near Piazza del Popolo'
          }],
          dining: [{
            name: 'Da Enzo al 29',
            cuisine: 'Italian',
            priceRange: 'mid-range',
            description: 'Authentic Roman trattoria'
          }],
          activities: [{
            name: 'Vatican Museums Tour',
            category: 'cultural',
            duration: '4 hours',
            difficulty: 'moderate',
            description: 'Explore world-famous art collections'
          }]
        },
        tags: ['city', 'history', 'art', 'religion', 'ancient'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Barcelona Catalonian Gem',
        summary: 'Experience Gaudí\'s architectural wonders and vibrant Mediterranean culture.',
        description: 'Barcelona combines stunning architecture, beautiful beaches, and incredible food scene.',
        location: {
          country: 'Spain',
          city: 'Barcelona',
          coordinates: { latitude: 41.3851, longitude: 2.1734 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
          caption: 'Sagrada Familia basilica',
          isPrimary: true
        }],
        content: {
          history: 'Founded by Romans, became major Mediterranean trading port.',
          culture: 'Catalonian culture with strong artistic and architectural heritage.',
          attractions: ['Sagrada Familia', 'Park Güell', 'Las Ramblas', 'Gothic Quarter'],
          bestTimeToVisit: 'May to June and September to October',
          climate: 'Mediterranean climate',
          language: ['Spanish', 'Catalan'],
          currency: 'Euro (EUR)'
        },
        recommendations: {
          lodging: [{
            name: 'Hotel Casa Fuster',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Modernist hotel on Passeig de Gràcia'
          }],
          dining: [{
            name: 'Cal Pep',
            cuisine: 'Spanish Tapas',
            priceRange: 'mid-range',
            description: 'Famous tapas bar in El Born'
          }],
          activities: [{
            name: 'Gaudí Architecture Tour',
            category: 'cultural',
            duration: '3 hours',
            difficulty: 'easy',
            description: 'Explore unique modernist architecture'
          }]
        },
        tags: ['city', 'architecture', 'beaches', 'art', 'food'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Sydney Harbor City',
        summary: 'Discover Australia\'s most iconic city with its stunning harbor and beaches.',
        description: 'Sydney offers world-famous landmarks, beautiful beaches, and vibrant culture.',
        location: {
          country: 'Australia',
          city: 'Sydney',
          coordinates: { latitude: -33.8688, longitude: 151.2093 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          caption: 'Sydney Opera House and Harbor Bridge',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 1788 as British penal colony, now Australia\'s largest city.',
          culture: 'Multicultural society with strong beach and outdoor culture.',
          attractions: ['Sydney Opera House', 'Harbor Bridge', 'Bondi Beach', 'The Rocks'],
          bestTimeToVisit: 'September to November and March to May',
          climate: 'Humid subtropical climate',
          language: ['English'],
          currency: 'Australian Dollar (AUD)'
        },
        recommendations: {
          lodging: [{
            name: 'Park Hyatt Sydney',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Luxury hotel with harbor views'
          }],
          dining: [{
            name: 'Bennelong',
            cuisine: 'Modern Australian',
            priceRange: 'fine-dining',
            description: 'Fine dining in the Opera House'
          }],
          activities: [{
            name: 'Harbor Bridge Climb',
            category: 'adventure',
            duration: '3.5 hours',
            difficulty: 'moderate',
            description: 'Climb the iconic harbor bridge'
          }]
        },
        tags: ['city', 'beaches', 'harbor', 'outdoor', 'iconic'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Dubai Modern Oasis',
        summary: 'Experience luxury and innovation in this futuristic desert metropolis.',
        description: 'Dubai combines traditional Arabian culture with ultra-modern architecture and luxury.',
        location: {
          country: 'United Arab Emirates',
          city: 'Dubai',
          coordinates: { latitude: 25.2048, longitude: 55.2708 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
          caption: 'Burj Khalifa and Dubai skyline',
          isPrimary: true
        }],
        content: {
          history: 'Transformed from fishing village to global city in just decades.',
          culture: 'Blend of traditional Emirati culture with international influences.',
          attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Fountain'],
          bestTimeToVisit: 'November to March',
          climate: 'Desert climate',
          language: ['Arabic', 'English'],
          currency: 'UAE Dirham (AED)'
        },
        recommendations: {
          lodging: [{
            name: 'Burj Al Arab',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Iconic sail-shaped luxury hotel'
          }],
          dining: [{
            name: 'Al Hadheerah',
            cuisine: 'Middle Eastern',
            priceRange: 'mid-range',
            description: 'Desert dining experience with entertainment'
          }],
          activities: [{
            name: 'Desert Safari',
            category: 'adventure',
            duration: '6 hours',
            difficulty: 'easy',
            description: 'Dune bashing and Bedouin camp experience'
          }]
        },
        tags: ['city', 'luxury', 'modern', 'desert', 'shopping'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Cape Town Mother City',
        summary: 'Discover South Africa\'s stunning coastal city with dramatic mountain backdrop.',
        description: 'Cape Town offers incredible natural beauty, wine regions, and rich cultural heritage.',
        location: {
          country: 'South Africa',
          city: 'Cape Town',
          coordinates: { latitude: -33.9249, longitude: 18.4241 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
          caption: 'Table Mountain and city bowl',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 1652 as supply station, rich colonial and apartheid history.',
          culture: 'Rainbow nation with diverse African, European, and Asian influences.',
          attractions: ['Table Mountain', 'Robben Island', 'V&A Waterfront', 'Cape Point'],
          bestTimeToVisit: 'October to April',
          climate: 'Mediterranean climate',
          language: ['English', 'Afrikaans', 'Xhosa'],
          currency: 'South African Rand (ZAR)'
        },
        recommendations: {
          lodging: [{
            name: 'One&Only Cape Town',
            type: 'hotel',
            priceRange: 'luxury',
            description: 'Luxury resort on private island'
          }],
          dining: [{
            name: 'The Test Kitchen',
            cuisine: 'Contemporary',
            priceRange: 'fine-dining',
            description: 'Award-winning restaurant with innovative cuisine'
          }],
          activities: [{
            name: 'Wine Tasting in Stellenbosch',
            category: 'cultural',
            duration: '8 hours',
            difficulty: 'easy',
            description: 'Explore world-renowned wine regions'
          }]
        },
        tags: ['city', 'nature', 'wine', 'beaches', 'mountains'],
        isPublished: true,
        createdBy: adminUser._id
      }
    ]);

    console.log(`Created ${destinations.length} destination guides`);

    // Create sample reviews for destinations
    const reviews = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      
      reviews.push({
        user: randomUser._id,
        destinationGuide: randomDestination._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        title: `Amazing experience in ${randomDestination.title}`,
        content: `Had a wonderful time visiting ${randomDestination.location.city}. The culture, food, and attractions were incredible. Highly recommend!`,
        isVerified: Math.random() > 0.5
      });
    }
    
    await Review.create(reviews);
    console.log(`Created ${reviews.length} reviews`);

    // Create sample favorites
    const favorites = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      
      // Avoid duplicates
      const existingFavorite = favorites.find(f => 
        f.user.toString() === randomUser._id.toString() && 
        f.destinationGuide.toString() === randomDestination._id.toString()
      );
      
      if (!existingFavorite) {
        favorites.push({
          user: randomUser._id,
          destinationGuide: randomDestination._id
        });
      }
    }
    
    await Favorite.create(favorites);
    console.log(`Created ${favorites.length} favorites`);

    // Create sample groups
    const groups = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      
      groups.push({
        name: `${randomDestination.location.city} Adventure Group ${i + 1}`,
        description: `Join us for an amazing trip to ${randomDestination.location.city}! We're planning to explore all the best attractions and hidden gems.`,
        destination: randomDestination.location.city,
        maxMembers: Math.floor(Math.random() * 10) + 5, // 5-15 members
        isPublic: Math.random() > 0.3, // 70% public
        createdBy: randomUser._id,
        members: [randomUser._id],
        posts: [{
          author: randomUser._id,
          content: `Welcome to our ${randomDestination.location.city} travel group! Looking forward to planning an amazing trip together.`,
          createdAt: new Date()
        }]
      });
    }
    
    await Group.create(groups);
    console.log(`Created ${groups.length} groups`);

    // Create sample itineraries
    const itineraries = [];
    for (let i = 0; i < 10; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomDestination = destinations[Math.floor(Math.random() * destinations.length)];
      
      itineraries.push({
        title: `${Math.floor(Math.random() * 7) + 3} Days in ${randomDestination.location.city}`,
        description: `A carefully planned itinerary to explore the best of ${randomDestination.location.city} in ${Math.floor(Math.random() * 7) + 3} days.`,
        destination: randomDestination.location.city,
        duration: Math.floor(Math.random() * 7) + 3, // 3-10 days
        budget: {
          min: Math.floor(Math.random() * 1000) + 500,
          max: Math.floor(Math.random() * 2000) + 1500,
          currency: randomDestination.content.currency.split(' ')[0]
        },
        travelStyle: ['adventure', 'cultural', 'relaxation', 'luxury'][Math.floor(Math.random() * 4)],
        isPublic: Math.random() > 0.2, // 80% public
        createdBy: randomUser._id,
        days: [
          {
            dayNumber: 1,
            title: 'Arrival and City Exploration',
            activities: [
              {
                time: '09:00',
                title: 'Airport Transfer',
                description: 'Arrive and transfer to hotel',
                location: 'Airport',
                duration: 60,
                cost: 50
              },
              {
                time: '14:00',
                title: 'City Walking Tour',
                description: 'Explore the main attractions',
                location: 'City Center',
                duration: 180,
                cost: 30
              }
            ]
          },
          {
            dayNumber: 2,
            title: 'Cultural Immersion',
            activities: [
              {
                time: '10:00',
                title: 'Museum Visit',
                description: 'Visit local museums and cultural sites',
                location: 'Museum District',
                duration: 240,
                cost: 25
              },
              {
                time: '19:00',
                title: 'Traditional Dinner',
                description: 'Experience local cuisine',
                location: 'Local Restaurant',
                duration: 120,
                cost: 60
              }
            ]
          }
        ]
      });
    }
    
    await TripItinerary.create(itineraries);
    console.log(`Created ${itineraries.length} trip itineraries`);

    console.log('\n=== SEED DATA CREATED SUCCESSFULLY! ===');
    console.log(`✅ ${users.length} users created`);
    console.log(`✅ ${destinations.length} destination guides created`);
    console.log(`✅ ${reviews.length} reviews created`);
    console.log(`✅ ${favorites.length} favorites created`);
    console.log(`✅ ${groups.length} groups created`);
    console.log(`✅ ${itineraries.length} trip itineraries created`);
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: puneethreddyt2004@gmail.com / admin@123');
    console.log('Users: [any user email] / password123');
    console.log('\nDatabase is ready for testing! 🚀');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();
