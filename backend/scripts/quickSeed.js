const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const DestinationGuide = require('../models/DestinationGuide');

const quickSeed = async () => {
  try {
    console.log('🌱 Quick seed starting...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove');
    console.log('✅ Connected to MongoDB');

    // Clear existing users and destinations
    await User.deleteMany({});
    await DestinationGuide.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin@123', 12);
    const adminUser = await User.create({
      firstName: 'Puneet',
      lastName: 'Reddy',
      email: 'puneethreddyt2004@gmail.com',
      password: adminPassword,
      role: 'admin',
      isActive: true,
      preferences: {
        travelStyle: 'adventure',
        budgetRange: 'luxury',
        interests: ['culture', 'adventure', 'nature']
      }
    });
    console.log('👑 Admin user created');

    // Create 9 regular users
    const userPassword = await bcrypt.hash('password123', 12);
    const users = [
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

    for (const userData of users) {
      await User.create({
        ...userData,
        password: userPassword,
        role: 'user',
        isActive: true,
        preferences: {
          travelStyle: ['adventure', 'cultural', 'relaxation'][Math.floor(Math.random() * 3)],
          budgetRange: ['budget', 'mid-range', 'luxury'][Math.floor(Math.random() * 3)],
          interests: ['culture', 'adventure', 'nature', 'food', 'history'].slice(0, Math.floor(Math.random() * 3) + 1)
        }
      });
    }
    console.log('👥 Regular users created');

    // Create 10 destinations
    const destinations = [
      {
        title: 'Bali Paradise Island',
        summary: 'Discover the tropical paradise of Bali with its stunning beaches, ancient temples, and vibrant culture.',
        description: 'Bali offers an incredible mix of natural beauty, spiritual culture, and modern amenities. From rice terraces to volcanic mountains, this Indonesian island has something for every traveler.',
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
          lodging: [{ name: 'Four Seasons Resort Bali', type: 'resort', priceRange: 'luxury', description: 'Luxury resort with stunning views' }],
          dining: [{ name: 'Locavore', cuisine: 'Modern Indonesian', priceRange: 'fine-dining', description: 'Award-winning restaurant in Ubud' }],
          activities: [{ name: 'Sunrise Trek Mount Batur', category: 'adventure', duration: '6 hours', difficulty: 'moderate', description: 'Hike to see sunrise from volcanic peak' }]
        },
        tags: ['tropical', 'culture', 'beaches', 'temples'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Paris City of Lights',
        summary: 'Experience the romance and elegance of Paris with its iconic landmarks and world-class museums.',
        description: 'Paris, the capital of France, is renowned for its art, fashion, gastronomy, and culture. From the iconic Eiffel Tower to the world-famous Louvre Museum, Paris offers countless attractions and experiences.',
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
          lodging: [{ name: 'Hotel Plaza Athénée', type: 'hotel', priceRange: 'luxury', description: 'Iconic luxury hotel with Eiffel Tower views' }],
          dining: [{ name: 'Le Comptoir du Relais', cuisine: 'French', priceRange: 'mid-range', description: 'Traditional French bistro with authentic atmosphere' }],
          activities: [{ name: 'Seine River Cruise', category: 'cultural', duration: '2 hours', difficulty: 'easy', description: 'Scenic boat tour along the Seine River' }]
        },
        tags: ['city', 'culture', 'art', 'romance', 'museums'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Tokyo Modern Metropolis',
        summary: 'Explore the fascinating blend of traditional and modern culture in Japan\'s bustling capital.',
        description: 'Tokyo is a city where ancient traditions meet cutting-edge technology. From serene temples to neon-lit districts, Tokyo offers an incredible diversity of experiences.',
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
          lodging: [{ name: 'Park Hyatt Tokyo', type: 'hotel', priceRange: 'luxury', description: 'Luxury hotel with panoramic city views' }],
          dining: [{ name: 'Sukiyabashi Jiro', cuisine: 'Japanese Sushi', priceRange: 'fine-dining', description: 'World-renowned sushi restaurant' }],
          activities: [{ name: 'Traditional Tea Ceremony', category: 'cultural', duration: '2 hours', difficulty: 'easy', description: 'Experience authentic Japanese tea ceremony' }]
        },
        tags: ['city', 'technology', 'tradition', 'food', 'culture'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'New York City',
        summary: 'Experience the energy of the city that never sleeps.',
        description: 'NYC offers world-class attractions, Broadway shows, and incredible dining.',
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
          history: 'Founded as New Amsterdam in 1624.',
          culture: 'Melting pot of cultures.',
          attractions: ['Statue of Liberty', 'Central Park', 'Times Square'],
          bestTimeToVisit: 'April to June',
          climate: 'Continental',
          language: ['English'],
          currency: 'US Dollar (USD)'
        },
        recommendations: {
          lodging: [{ name: 'The Plaza', type: 'hotel', priceRange: 'luxury', description: 'Iconic luxury hotel' }],
          dining: [{ name: 'Katz\'s Deli', cuisine: 'American', priceRange: 'budget', description: 'Famous pastrami' }],
          activities: [{ name: 'Broadway Show', category: 'entertainment', duration: '3 hours', difficulty: 'easy', description: 'Theater performance' }]
        },
        tags: ['city', 'culture', 'entertainment'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'London Historic Capital',
        summary: 'Discover the rich history of England\'s capital.',
        description: 'London combines centuries of history with modern culture.',
        location: {
          country: 'United Kingdom',
          city: 'London',
          coordinates: { latitude: 51.5074, longitude: -0.1278 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800',
          caption: 'Big Ben',
          isPrimary: true
        }],
        content: {
          history: 'Founded by Romans as Londinium.',
          culture: 'Royal heritage with multicultural influences.',
          attractions: ['Big Ben', 'Tower of London', 'British Museum'],
          bestTimeToVisit: 'May to September',
          climate: 'Temperate oceanic',
          language: ['English'],
          currency: 'British Pound (GBP)'
        },
        recommendations: {
          lodging: [{ name: 'The Savoy', type: 'hotel', priceRange: 'luxury', description: 'Historic luxury hotel' }],
          dining: [{ name: 'Dishoom', cuisine: 'Indian', priceRange: 'mid-range', description: 'Bombay-style cafe' }],
          activities: [{ name: 'Thames Cruise', category: 'sightseeing', duration: '1.5 hours', difficulty: 'easy', description: 'River tour' }]
        },
        tags: ['city', 'history', 'culture'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Rome Eternal City',
        summary: 'Walk through ancient Roman history.',
        description: 'Rome offers unparalleled historical sites and Italian cuisine.',
        location: {
          country: 'Italy',
          city: 'Rome',
          coordinates: { latitude: 41.9028, longitude: 12.4964 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800',
          caption: 'Colosseum',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 753 BC, capital of Roman Empire.',
          culture: 'Ancient Roman heritage with Renaissance influences.',
          attractions: ['Colosseum', 'Vatican City', 'Trevi Fountain'],
          bestTimeToVisit: 'April to June',
          climate: 'Mediterranean',
          language: ['Italian'],
          currency: 'Euro (EUR)'
        },
        recommendations: {
          lodging: [{ name: 'Hotel de Russie', type: 'hotel', priceRange: 'luxury', description: 'Elegant hotel' }],
          dining: [{ name: 'Da Enzo al 29', cuisine: 'Italian', priceRange: 'mid-range', description: 'Authentic Roman trattoria' }],
          activities: [{ name: 'Vatican Tour', category: 'cultural', duration: '4 hours', difficulty: 'moderate', description: 'Art collections' }]
        },
        tags: ['city', 'history', 'art'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Barcelona Catalonian Gem',
        summary: 'Experience Gaudí\'s architectural wonders.',
        description: 'Barcelona combines stunning architecture with Mediterranean culture.',
        location: {
          country: 'Spain',
          city: 'Barcelona',
          coordinates: { latitude: 41.3851, longitude: 2.1734 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800',
          caption: 'Sagrada Familia',
          isPrimary: true
        }],
        content: {
          history: 'Founded by Romans, major Mediterranean port.',
          culture: 'Catalonian culture with artistic heritage.',
          attractions: ['Sagrada Familia', 'Park Güell', 'Las Ramblas'],
          bestTimeToVisit: 'May to June',
          climate: 'Mediterranean',
          language: ['Spanish', 'Catalan'],
          currency: 'Euro (EUR)'
        },
        recommendations: {
          lodging: [{ name: 'Hotel Casa Fuster', type: 'hotel', priceRange: 'luxury', description: 'Modernist hotel' }],
          dining: [{ name: 'Cal Pep', cuisine: 'Spanish Tapas', priceRange: 'mid-range', description: 'Famous tapas bar' }],
          activities: [{ name: 'Gaudí Tour', category: 'cultural', duration: '3 hours', difficulty: 'easy', description: 'Architecture tour' }]
        },
        tags: ['city', 'architecture', 'beaches'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Sydney Harbor City',
        summary: 'Discover Australia\'s iconic harbor city.',
        description: 'Sydney offers world-famous landmarks and beautiful beaches.',
        location: {
          country: 'Australia',
          city: 'Sydney',
          coordinates: { latitude: -33.8688, longitude: 151.2093 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          caption: 'Opera House',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 1788 as British colony.',
          culture: 'Multicultural with beach culture.',
          attractions: ['Opera House', 'Harbor Bridge', 'Bondi Beach'],
          bestTimeToVisit: 'September to November',
          climate: 'Humid subtropical',
          language: ['English'],
          currency: 'Australian Dollar (AUD)'
        },
        recommendations: {
          lodging: [{ name: 'Park Hyatt Sydney', type: 'hotel', priceRange: 'luxury', description: 'Harbor views' }],
          dining: [{ name: 'Bennelong', cuisine: 'Modern Australian', priceRange: 'fine-dining', description: 'Opera House dining' }],
          activities: [{ name: 'Bridge Climb', category: 'adventure', duration: '3.5 hours', difficulty: 'moderate', description: 'Climb harbor bridge' }]
        },
        tags: ['city', 'beaches', 'harbor'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Dubai Modern Oasis',
        summary: 'Experience luxury in the desert metropolis.',
        description: 'Dubai combines traditional culture with ultra-modern architecture.',
        location: {
          country: 'United Arab Emirates',
          city: 'Dubai',
          coordinates: { latitude: 25.2048, longitude: 55.2708 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800',
          caption: 'Burj Khalifa',
          isPrimary: true
        }],
        content: {
          history: 'Transformed from fishing village to global city.',
          culture: 'Emirati culture with international influences.',
          attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah'],
          bestTimeToVisit: 'November to March',
          climate: 'Desert',
          language: ['Arabic', 'English'],
          currency: 'UAE Dirham (AED)'
        },
        recommendations: {
          lodging: [{ name: 'Burj Al Arab', type: 'hotel', priceRange: 'luxury', description: 'Iconic sail-shaped hotel' }],
          dining: [{ name: 'Al Hadheerah', cuisine: 'Middle Eastern', priceRange: 'mid-range', description: 'Desert dining' }],
          activities: [{ name: 'Desert Safari', category: 'adventure', duration: '6 hours', difficulty: 'easy', description: 'Dune bashing' }]
        },
        tags: ['city', 'luxury', 'modern'],
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: 'Cape Town Mother City',
        summary: 'Discover South Africa\'s stunning coastal city.',
        description: 'Cape Town offers natural beauty and rich cultural heritage.',
        location: {
          country: 'South Africa',
          city: 'Cape Town',
          coordinates: { latitude: -33.9249, longitude: 18.4241 }
        },
        photos: [{
          url: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
          caption: 'Table Mountain',
          isPrimary: true
        }],
        content: {
          history: 'Founded in 1652 as supply station.',
          culture: 'Rainbow nation with diverse influences.',
          attractions: ['Table Mountain', 'Robben Island', 'V&A Waterfront'],
          bestTimeToVisit: 'October to April',
          climate: 'Mediterranean',
          language: ['English', 'Afrikaans', 'Xhosa'],
          currency: 'South African Rand (ZAR)'
        },
        recommendations: {
          lodging: [{ name: 'One&Only Cape Town', type: 'hotel', priceRange: 'luxury', description: 'Private island resort' }],
          dining: [{ name: 'The Test Kitchen', cuisine: 'Contemporary', priceRange: 'fine-dining', description: 'Award-winning restaurant' }],
          activities: [{ name: 'Wine Tasting', category: 'cultural', duration: '8 hours', difficulty: 'easy', description: 'Stellenbosch wine tour' }]
        },
        tags: ['city', 'nature', 'wine'],
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    await DestinationGuide.create(destinations);
    console.log('🏖️ Destinations created');

    // Verify data
    const userCount = await User.countDocuments();
    const destCount = await DestinationGuide.countDocuments();
    const adminCount = await User.countDocuments({ role: 'admin' });

    console.log('\n📊 Seed Results:');
    console.log(`Users: ${userCount} (${adminCount} admin)`);
    console.log(`Destinations: ${destCount}`);

    console.log('\n🔑 Login Credentials:');
    console.log('Admin: puneethreddyt2004@gmail.com / admin@123');
    console.log('Users: [any user email] / password123');

    console.log('\n✅ Quick seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    mongoose.connection.close();
  }
};

quickSeed();
