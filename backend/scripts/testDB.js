const mongoose = require('mongoose');
require('dotenv').config();

const { User, DestinationGuide, TripItinerary, Review, Group, Favorite } = require('../models');

const testDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove');
    console.log('✅ Connected to MongoDB');

    // Check collections
    const userCount = await User.countDocuments();
    const destinationCount = await DestinationGuide.countDocuments();
    const itineraryCount = await TripItinerary.countDocuments();
    const reviewCount = await Review.countDocuments();
    const groupCount = await Group.countDocuments();
    const favoriteCount = await Favorite.countDocuments();

    console.log('\n📊 Database Statistics:');
    console.log(`Users: ${userCount}`);
    console.log(`Destinations: ${destinationCount}`);
    console.log(`Itineraries: ${itineraryCount}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log(`Groups: ${groupCount}`);
    console.log(`Favorites: ${favoriteCount}`);

    // Check admin user specifically
    const adminUser = await User.findOne({ email: 'puneethreddyt2004@gmail.com' });
    if (adminUser) {
      console.log('\n👤 Admin User Found:');
      console.log(`Name: ${adminUser.firstName} ${adminUser.lastName}`);
      console.log(`Email: ${adminUser.email}`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`Active: ${adminUser.isActive}`);
      console.log(`Created: ${adminUser.createdAt}`);
    } else {
      console.log('\n❌ Admin user not found!');
    }

    // Check a sample regular user
    const sampleUser = await User.findOne({ role: 'user' });
    if (sampleUser) {
      console.log('\n👥 Sample User:');
      console.log(`Name: ${sampleUser.firstName} ${sampleUser.lastName}`);
      console.log(`Email: ${sampleUser.email}`);
      console.log(`Role: ${sampleUser.role}`);
      console.log(`Active: ${sampleUser.isActive}`);
      console.log(`Created: ${sampleUser.createdAt}`);
    }

  } catch (error) {
    console.error('❌ Database test error:', error);
  } finally {
    mongoose.connection.close();
  }
};

testDB();
