const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { User, DestinationGuide, TripItinerary, Review, Group, Favorite } = require('../models');

const fixIssues = async () => {
  try {
    console.log('🔧 Starting fix process...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove');
    console.log('✅ Connected to MongoDB');

    // Check current state
    const userCount = await User.countDocuments();
    console.log(`Current users in DB: ${userCount}`);

    // If no users, run full seed
    if (userCount === 0) {
      console.log('🌱 No users found, running full seed...');
      
      // Create admin user with proper password hashing
      const adminHashedPassword = await bcrypt.hash('admin@123', 12);
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
      console.log('✅ Admin user created');

      // Create regular users
      const hashedPassword = await bcrypt.hash('password123', 12);
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
        await User.create({
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
      }
      console.log('✅ Regular users created');

      // Create sample destinations
      const destinations = [];
      const destinationData = [
        {
          title: 'Bali Paradise Island',
          summary: 'Discover the tropical paradise of Bali with its stunning beaches, ancient temples, and vibrant culture.',
          description: 'Bali offers an incredible mix of natural beauty, spiritual culture, and modern amenities.',
          location: { country: 'Indonesia', city: 'Bali', coordinates: { latitude: -8.3405, longitude: 115.0920 } },
          photos: [{ url: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800', caption: 'Bali rice terraces', isPrimary: true }],
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
          description: 'Paris, the capital of France, is renowned for its art, fashion, gastronomy, and culture.',
          location: { country: 'France', city: 'Paris', coordinates: { latitude: 48.8566, longitude: 2.3522 } },
          photos: [{ url: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=800', caption: 'Eiffel Tower at sunset', isPrimary: true }],
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
        }
      ];

      for (const destData of destinationData) {
        const dest = await DestinationGuide.create(destData);
        destinations.push(dest);
      }
      console.log('✅ Sample destinations created');

    } else {
      // Fix existing users
      console.log('🔧 Fixing existing users...');
      
      // Ensure all users are active
      await User.updateMany({}, { isActive: true });
      
      // Check admin user
      const adminUser = await User.findOne({ email: 'puneethreddyt2004@gmail.com' });
      if (!adminUser) {
        const adminHashedPassword = await bcrypt.hash('admin@123', 12);
        await User.create({
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
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user exists');
      }
    }

    // Final verification
    const finalUserCount = await User.countDocuments();
    const activeUserCount = await User.countDocuments({ isActive: true });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const destCount = await DestinationGuide.countDocuments();

    console.log('\n📊 Final Database State:');
    console.log(`Total Users: ${finalUserCount}`);
    console.log(`Active Users: ${activeUserCount}`);
    console.log(`Admin Users: ${adminCount}`);
    console.log(`Destinations: ${destCount}`);

    // Test admin login
    const adminUser = await User.findOne({ email: 'puneethreddyt2004@gmail.com' }).select('+password');
    if (adminUser) {
      const isPasswordValid = await adminUser.comparePassword('admin@123');
      console.log(`\n🔐 Admin Login Test: ${isPasswordValid ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`Admin Active Status: ${adminUser.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`Admin Role: ${adminUser.role}`);
      console.log(`Admin Created: ${adminUser.createdAt}`);
    }

    console.log('\n🎉 Fix process completed successfully!');
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: puneethreddyt2004@gmail.com / admin@123');
    console.log('Users: [any user email] / password123');

  } catch (error) {
    console.error('❌ Fix process error:', error);
  } finally {
    mongoose.connection.close();
  }
};

fixIssues();
