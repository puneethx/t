const mongoose = require('mongoose');
const { DestinationGuide } = require('../models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove';

async function updateDestinationTags() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Update destination tags to improve search functionality
    const updates = [
      {
        title: "Bali - Island of the Gods",
        newTags: ["beach", "culture", "temple", "nature", "adventure", "spa", "yoga", "island", "tropical", "spiritual"]
      },
      {
        title: "Paris - City of Light",
        newTags: ["art", "culture", "romance", "food", "history", "architecture", "fashion", "city", "museums", "europe"]
      },
      {
        title: "Tokyo - Where Tradition Meets Innovation",
        newTags: ["technology", "culture", "food", "shopping", "temple", "modern", "traditional", "city", "asia", "futuristic"]
      },
      {
        title: "New York City - The Big Apple",
        newTags: ["city", "culture", "food", "shopping", "art", "music", "diversity", "urban", "america", "entertainment"]
      },
      {
        title: "Santorini - Mediterranean Paradise",
        newTags: ["island", "beach", "romance", "sunset", "wine", "culture", "volcano", "mediterranean", "greece", "scenic"]
      }
    ];

    console.log('\n🔄 Updating destination tags...\n');

    for (const update of updates) {
      const result = await DestinationGuide.updateOne(
        { title: update.title },
        { $set: { tags: update.newTags } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✅ Updated tags for: ${update.title}`);
        console.log(`   New tags: ${update.newTags.join(', ')}`);
      } else {
        console.log(`❌ No update for: ${update.title}`);
      }
    }

    console.log('\n✅ Destination tags updated successfully!');

  } catch (error) {
    console.error('❌ Error updating destination tags:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  updateDestinationTags();
}

module.exports = { updateDestinationTags };
