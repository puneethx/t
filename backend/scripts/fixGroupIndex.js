const mongoose = require('mongoose');
require('dotenv').config();

async function fixGroupIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove');
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Try to drop the problematic slug index
    try {
      await db.collection('groups').dropIndex('slug_1');
      console.log('Dropped slug_1 index');
    } catch (error) {
      console.log('Index slug_1 not found or already dropped');
    }
    
    // Remove any documents with null slug
    const result = await db.collection('groups').deleteMany({ slug: null });
    console.log(`Removed ${result.deletedCount} documents with null slug`);
    
    console.log('Group index fix completed');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing group index:', error);
    process.exit(1);
  }
}

fixGroupIndex();
