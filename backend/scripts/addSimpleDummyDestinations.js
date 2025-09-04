const mongoose = require('mongoose');
const DestinationGuide = require('../models/DestinationGuide');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dummyDestinations = [
  {
    title: "Goa Beach Paradise",
    summary: "Experience the golden beaches, vibrant nightlife, and Portuguese heritage of Goa",
    description: "Goa offers pristine beaches, historic churches, spice plantations, and a laid-back atmosphere perfect for relaxation and adventure.",
    location: {
      country: "India",
      city: "Panaji",
      coordinates: { latitude: 15.2993, longitude: 74.1240 }
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800", caption: "Goa Beach", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", caption: "Portuguese Architecture" }
    ],
    content: {
      bestTimeToVisit: "November to March",
      attractions: ["Baga Beach", "Basilica of Bom Jesus", "Fort Aguada", "Dudhsagar Falls"],
      climate: "Tropical",
      language: ["English", "Hindi", "Konkani"],
      currency: "INR"
    },
    tags: ["beach", "nightlife", "heritage", "relaxation"],
    recommendations: {
      activities: [
        { name: "Beach hopping", category: "relaxation", duration: "Full day", difficulty: "easy", description: "Visit multiple beaches", cost: "Free" },
        { name: "Water sports", category: "adventure", duration: "2-3 hours", difficulty: "moderate", description: "Parasailing, jet skiing", cost: "₹2000-5000" }
      ],
      dining: [
        { name: "Thalassa", cuisine: "Mediterranean", priceRange: "mid-range", description: "Beachside dining", address: "Vagator Beach" },
        { name: "Fisherman's Wharf", cuisine: "Goan", priceRange: "mid-range", description: "Traditional Goan cuisine", address: "Cavelossim" }
      ],
      lodging: [
        { name: "Beach Resort Goa", type: "resort", priceRange: "luxury", description: "Luxury beachfront resort" },
        { name: "Heritage Villa", type: "villa", priceRange: "mid-range", description: "Portuguese style villa" }
      ]
    },
    isPublished: true
  },
  {
    title: "Kerala Backwaters Adventure",
    summary: "Navigate through serene backwaters, lush greenery, and traditional houseboats in God's Own Country",
    description: "Kerala's backwaters offer a unique experience of floating through coconut groves, paddy fields, and traditional villages on traditional houseboats.",
    location: {
      country: "India",
      city: "Alleppey",
      coordinates: { latitude: 9.4981, longitude: 76.3388 }
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800", caption: "Kerala Backwaters", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800", caption: "Houseboat" }
    ],
    content: {
      bestTimeToVisit: "October to March",
      attractions: ["Alleppey Backwaters", "Kumarakom Bird Sanctuary", "Vembanad Lake"],
      climate: "Tropical",
      language: ["English", "Hindi", "Malayalam"],
      currency: "INR"
    },
    tags: ["backwaters", "houseboat", "nature", "cultural"],
    recommendations: {
      activities: [
        { name: "Houseboat cruise", category: "relaxation", duration: "1-2 days", difficulty: "easy", description: "Overnight cruise through backwaters", cost: "₹8000-15000" },
        { name: "Village walks", category: "cultural", duration: "2-3 hours", difficulty: "easy", description: "Explore local villages", cost: "₹500-1000" }
      ],
      dining: [
        { name: "Thaff Restaurant", cuisine: "Kerala", priceRange: "budget", description: "Authentic Kerala cuisine", address: "Alleppey" },
        { name: "Mushroom Restaurant", cuisine: "Multi-cuisine", priceRange: "mid-range", description: "Popular restaurant", address: "Kumrakom" }
      ],
      lodging: [
        { name: "Luxury Houseboat", type: "villa", priceRange: "luxury", description: "Premium houseboat experience" },
        { name: "Lake Resort", type: "resort", priceRange: "mid-range", description: "Lakeside resort with modern amenities" }
      ]
    },
    isPublished: true
  },
  {
    title: "Rajasthan Royal Heritage",
    summary: "Explore magnificent palaces, desert landscapes, and royal culture in the Land of Kings",
    description: "Rajasthan showcases India's royal heritage through majestic forts, opulent palaces, colorful markets, and the vast Thar Desert.",
    location: {
      country: "India",
      city: "Jaipur",
      coordinates: { latitude: 26.9124, longitude: 75.7873 }
    },
    photos: [
      { url: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800", caption: "Rajasthan Palace", isPrimary: true },
      { url: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800", caption: "Desert Landscape" }
    ],
    content: {
      bestTimeToVisit: "October to March",
      attractions: ["Amber Fort", "City Palace", "Hawa Mahal", "Jaisalmer Fort"],
      climate: "Arid",
      language: ["English", "Hindi", "Rajasthani"],
      currency: "INR"
    },
    tags: ["heritage", "palaces", "desert", "culture", "royal"],
    recommendations: {
      activities: [
        { name: "Palace tours", category: "cultural", duration: "Half day", difficulty: "easy", description: "Guided tours of royal palaces", cost: "₹500-2000" },
        { name: "Camel safari", category: "adventure", duration: "2-3 hours", difficulty: "moderate", description: "Desert camel ride", cost: "₹1500-3000" }
      ],
      dining: [
        { name: "Chokhi Dhani", cuisine: "Rajasthani", priceRange: "mid-range", description: "Traditional Rajasthani village experience", address: "Jaipur" },
        { name: "1135 AD", cuisine: "Indian", priceRange: "fine-dining", description: "Heritage restaurant in Amber Fort", address: "Amber" }
      ],
      lodging: [
        { name: "Heritage Palace Hotel", type: "hotel", priceRange: "luxury", description: "Converted royal palace" },
        { name: "Desert Camp", type: "guesthouse", priceRange: "mid-range", description: "Traditional desert camping experience" }
      ]
    },
    isPublished: true
  }
];

async function addDummyDestinations() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      return;
    }

    // Add createdBy field to each destination
    const destinationsWithCreator = dummyDestinations.map(dest => ({
      ...dest,
      createdBy: adminUser._id
    }));

    // Clear existing destinations to avoid duplicate key errors
    await DestinationGuide.deleteMany({});
    console.log('Cleared existing destinations');

    // Insert dummy destinations
    const result = await DestinationGuide.insertMany(destinationsWithCreator);
    console.log(`Successfully added ${result.length} dummy destinations`);

    console.log('Dummy destinations added successfully!');
  } catch (error) {
    console.error('Error adding dummy destinations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addDummyDestinations();
