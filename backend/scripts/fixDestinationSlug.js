const mongoose = require('mongoose');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove';

async function fixDestinationSlug() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Try to drop the problematic slug index
    try {
      await db.collection('destinationguides').dropIndex('slug_1');
      console.log('Dropped slug_1 index');
    } catch (error) {
      console.log('Index slug_1 not found or already dropped');
    }

    // Remove any documents with null slug
    const result = await db.collection('destinationguides').deleteMany({ slug: null });
    console.log(`Removed ${result.deletedCount} documents with null slug`);

    console.log('✅ Slug issue fixed');
  } catch (error) {
    console.error('Error fixing slug issue:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  fixDestinationSlug();
}

module.exports = { fixDestinationSlug };
