const mongoose = require('mongoose');
const { DestinationGuide } = require('../models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove';

async function testSearch() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const searchTests = [
      'beach destinations',
      'beach',
      'cultural cities',
      'adventure',
      'romance',
      'food',
      'temple',
      'mountain',
      'island',
      'city'
    ];

    console.log('\n🔍 Testing Search Functionality:\n');

    for (const searchTerm of searchTests) {
      console.log(`\n📝 Searching for: "${searchTerm}"`);
      
      const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
      
      const searchConditions = searchTerms.map(term => ({
        $or: [
          { title: { $regex: term, $options: 'i' } },
          { summary: { $regex: term, $options: 'i' } },
          { 'location.country': { $regex: term, $options: 'i' } },
          { 'location.city': { $regex: term, $options: 'i' } },
          { tags: { $regex: term, $options: 'i' } },
          { 'content.attractions': { $regex: term, $options: 'i' } },
          { 'recommendations.activities.category': { $regex: term, $options: 'i' } }
        ]
      }));

      let searchCriteria = { isPublished: true };

      if (searchConditions.length > 1) {
        searchCriteria.$and = searchConditions;
      } else if (searchConditions.length === 1) {
        searchCriteria.$or = searchConditions[0].$or;
      }

      const results = await DestinationGuide.find(searchCriteria)
        .select('title location tags summary')
        .limit(5);

      console.log(`   Found ${results.length} destinations:`);
      
      results.forEach((dest, index) => {
        console.log(`   ${index + 1}. ${dest.title} - ${dest.location.city}, ${dest.location.country}`);
        console.log(`      Tags: ${dest.tags?.join(', ') || 'None'}`);
        console.log(`      Summary: ${dest.summary?.substring(0, 80)}...`);
      });

      if (results.length === 0) {
        console.log('   ❌ No results found');
      }
    }

    console.log('\n✅ Search functionality test completed!');

  } catch (error) {
    console.error('❌ Error testing search:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the test
if (require.main === module) {
  testSearch();
}

module.exports = { testSearch };
