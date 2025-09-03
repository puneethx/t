const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, DestinationGuide, TripItinerary, Review, Group, Favorite } = require('../models');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

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
        createdBy: admin._id
      },
      {
        title: 'Paris City of Lights',
        summary: 'Experience the romance and elegance of Paris with its iconic landmarks, world-class museums, and exquisite cuisine.',
        description: 'Paris, the capital of France, is renowned for its art, fashion, gastronomy, and culture. From the iconic Eiffel Tower to the world-famous Louvre Museum, Paris offers countless attractions and experiences.',
        location: {
          country: 'France',
          city: 'Paris',
          coordinates: {
            latitude: 48.8566,
            longitude: 2.3522
          }
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800',
            caption: 'Eiffel Tower at sunset',
            isPrimary: true
          }
        ],
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
          lodging: [
            {
              name: 'Hotel Plaza Athénée',
              type: 'hotel',
              priceRange: 'luxury',
              description: 'Iconic luxury hotel with Eiffel Tower views',
              website: 'https://plaza-athenee-paris.com'
            }
          ],
          dining: [
            {
              name: 'Le Comptoir du Relais',
              cuisine: 'French',
              priceRange: 'mid-range',
              description: 'Traditional French bistro with authentic atmosphere',
              address: '9 Carrefour de l\'Odéon, Paris'
            }
          ],
          activities: [
            {
              name: 'Seine River Cruise',
              category: 'cultural',
              duration: '2 hours',
              difficulty: 'easy',
              description: 'Scenic boat tour along the Seine River',
              cost: '$20-30'
            }
          ]
        },
        tags: ['city', 'culture', 'art', 'romance', 'museums'],
        isPublished: true,
        createdBy: admin._id
      },
      {
        title: 'Tokyo Modern Metropolis',
        summary: 'Explore the fascinating blend of traditional and modern culture in Japan\'s bustling capital city.',
        description: 'Tokyo is a city where ancient traditions meet cutting-edge technology. From serene temples to neon-lit districts, Tokyo offers an incredible diversity of experiences.',
        location: {
          country: 'Japan',
          city: 'Tokyo',
          coordinates: {
            latitude: 35.6762,
            longitude: 139.6503
          }
        },
        photos: [
          {
            url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
            caption: 'Tokyo skyline at night',
            isPrimary: true
          }
        ],
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
          lodging: [
            {
              name: 'Park Hyatt Tokyo',
              type: 'hotel',
              priceRange: 'luxury',
              description: 'Luxury hotel with panoramic city views',
              website: 'https://tokyo.park.hyatt.com'
            }
          ],
          dining: [
            {
              name: 'Sukiyabashi Jiro',
              cuisine: 'Japanese Sushi',
              priceRange: 'fine-dining',
              description: 'World-renowned sushi restaurant',
              address: 'Ginza, Tokyo'
            }
          ],
          activities: [
            {
              name: 'Traditional Tea Ceremony',
              category: 'cultural',
              duration: '2 hours',
              difficulty: 'easy',
              description: 'Experience authentic Japanese tea ceremony',
              cost: '$40-60'
            }
          ]
        },
        tags: ['city', 'technology', 'tradition', 'food', 'culture'],
        isPublished: true,
        createdBy: admin._id
      }
    ]);

    console.log('Seed data created successfully!');
    console.log(`Created ${destinations.length} destination guides`);
    console.log(`Admin user: puneethreddyt2004@gmail.com / admin@123`);
    console.log(`Sample users created with password: password123`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

connectDB().then(() => {
  seedData();
});
