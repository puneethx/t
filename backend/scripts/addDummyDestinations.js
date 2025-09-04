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
      attractions: ["Baga Beach", "Basilica of Bom Jesus", "Fort Aguada", "Dudhsagar Falls", "Anjuna Flea Market"],
      climate: "Tropical",
      language: ["English", "Hindi", "Konkani"],
      currency: "INR"
    },
    tags: ["beach", "nightlife", "heritage", "relaxation"],
    recommendations: {
      activities: [
        { name: "Beach hopping", category: "relaxation", duration: "Full day", difficulty: "easy", description: "Visit multiple beaches", cost: "Free" },
        { name: "Water sports", category: "adventure", duration: "2-3 hours", difficulty: "moderate", description: "Parasailing, jet skiing", cost: "₹2000-5000" },
        { name: "Spice plantation tour", category: "cultural", duration: "Half day", difficulty: "easy", description: "Learn about spice cultivation", cost: "₹800-1200" }
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
      state: "Kerala",
      city: "Alleppey",
      coordinates: { lat: 9.4981, lng: 76.3388 }
    },
    photos: [
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800"
    ],
    bestTimeToVisit: "October to March",
    duration: "4-6 days",
    budgetRange: { min: 12000, max: 35000 },
    tags: ["backwaters", "houseboat", "nature", "cultural"],
    recommendations: {
      activities: ["Houseboat cruise", "Village walks", "Ayurvedic spa", "Kathakali performance", "Spice garden visit"],
      attractions: ["Alleppey Backwaters", "Kumarakom Bird Sanctuary", "Vembanad Lake", "Chinese Fishing Nets", "Tea plantations"],
      restaurants: ["Thaff Restaurant", "Mushroom Restaurant", "Cassia Restaurant", "Harbour Restaurant"],
      accommodation: ["Luxury houseboats", "Lake resorts", "Heritage hotels", "Eco-friendly stays"]
    },
    travelStyle: "cultural",
    isPublished: true
  },
  {
    title: "Rajasthan Royal Heritage",
    summary: "Explore magnificent palaces, desert landscapes, and royal culture in the Land of Kings",
    description: "Rajasthan showcases India's royal heritage through majestic forts, opulent palaces, colorful markets, and the vast Thar Desert.",
    location: {
      country: "India",
      state: "Rajasthan",
      city: "Jaipur",
      coordinates: { lat: 26.9124, lng: 75.7873 }
    },
    photos: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800"
    ],
    bestTimeToVisit: "October to March",
    duration: "7-10 days",
    budgetRange: { min: 15000, max: 50000 },
    tags: ["heritage", "palaces", "desert", "culture", "royal"],
    recommendations: {
      activities: ["Palace tours", "Camel safari", "Desert camping", "Folk performances", "Shopping in bazaars"],
      attractions: ["Amber Fort", "City Palace", "Hawa Mahal", "Jaisalmer Fort", "Mehrangarh Fort"],
      restaurants: ["Chokhi Dhani", "1135 AD", "Ambrai Restaurant", "Spice Court"],
      accommodation: ["Heritage hotels", "Palace hotels", "Desert camps", "Luxury resorts"]
    },
    travelStyle: "cultural",
    isPublished: true
  },
  {
    title: "Himachal Mountain Retreat",
    summary: "Discover snow-capped peaks, hill stations, and adventure sports in the Himalayas",
    description: "Himachal Pradesh offers breathtaking mountain views, adventure activities, colonial hill stations, and spiritual experiences.",
    location: {
      country: "India",
      state: "Himachal Pradesh",
      city: "Manali",
      coordinates: { lat: 32.2396, lng: 77.1887 }
    },
    photos: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=800"
    ],
    bestTimeToVisit: "March to June, September to November",
    duration: "5-7 days",
    budgetRange: { min: 10000, max: 30000 },
    tags: ["mountains", "adventure", "trekking", "snow", "nature"],
    recommendations: {
      activities: ["Trekking", "Paragliding", "River rafting", "Skiing", "Temple visits"],
      attractions: ["Rohtang Pass", "Solang Valley", "Hadimba Temple", "Great Himalayan National Park", "Kheer Ganga"],
      restaurants: ["Johnson's Cafe", "Cafe 1947", "The Lazy Dog", "Dylan's Toasted & Roasted"],
      accommodation: ["Mountain resorts", "Boutique hotels", "Budget guesthouses", "Camping sites"]
    },
    travelStyle: "adventure",
    isPublished: true
  },
  {
    title: "Tamil Nadu Temple Trail",
    summary: "Journey through ancient temples, classical architecture, and rich cultural traditions",
    description: "Tamil Nadu showcases magnificent Dravidian architecture, ancient temples, classical arts, and diverse landscapes from beaches to hills.",
    location: {
      country: "India",
      state: "Tamil Nadu",
      city: "Chennai",
      coordinates: { lat: 13.0827, lng: 80.2707 }
    },
    photos: [
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"
    ],
    bestTimeToVisit: "November to March",
    duration: "6-8 days",
    budgetRange: { min: 12000, max: 35000 },
    tags: ["temples", "heritage", "culture", "architecture", "spiritual"],
    recommendations: {
      activities: ["Temple visits", "Classical dance shows", "Heritage walks", "Beach activities", "Hill station visits"],
      attractions: ["Meenakshi Temple", "Brihadeeswarar Temple", "Mahabalipuram", "Ooty", "Marina Beach"],
      restaurants: ["Saravana Bhavan", "Murugan Idli Shop", "Dakshin", "Peshawri"],
      accommodation: ["Heritage hotels", "Temple guesthouses", "Beach resorts", "Hill station hotels"]
    },
    travelStyle: "cultural",
    isPublished: true
  },
  {
    title: "Maharashtra Wine Country",
    summary: "Explore vineyards, hill stations, and caves in India's wine capital",
    description: "Maharashtra offers diverse experiences from wine tasting in Nashik to exploring ancient caves in Ajanta and Ellora.",
    location: {
      country: "India",
      state: "Maharashtra",
      city: "Nashik",
      coordinates: { lat: 19.9975, lng: 73.7898 }
    },
    photos: [
      "https://images.unsplash.com/photo-1586370434639-0fe43b2d32d6?w=800",
      "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800"
    ],
    bestTimeToVisit: "October to March",
    duration: "4-6 days",
    budgetRange: { min: 10000, max: 28000 },
    tags: ["wine", "heritage", "caves", "hills", "spiritual"],
    recommendations: {
      activities: ["Wine tasting", "Vineyard tours", "Cave exploration", "Temple visits", "Trekking"],
      attractions: ["Sula Vineyards", "Ajanta Caves", "Ellora Caves", "Trimbakeshwar Temple", "Pandavleni Caves"],
      restaurants: ["Sula Tasting Room", "Little Italy", "Sadhana Restaurant", "Hotel Panchavati"],
      accommodation: ["Vineyard resorts", "Heritage hotels", "Budget hotels", "Eco-resorts"]
    },
    travelStyle: "cultural",
    isPublished: true
  },
  {
    title: "Uttarakhand Spiritual Journey",
    summary: "Experience spiritual awakening in the land of gods with yoga, meditation, and sacred rivers",
    description: "Uttarakhand offers spiritual experiences in Rishikesh, adventure in the Himalayas, and serene hill stations.",
    location: {
      country: "India",
      state: "Uttarakhand",
      city: "Rishikesh",
      coordinates: { lat: 30.0869, lng: 78.2676 }
    },
    photos: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"
    ],
    bestTimeToVisit: "March to June, September to November",
    duration: "5-7 days",
    budgetRange: { min: 8000, max: 25000 },
    tags: ["spiritual", "yoga", "adventure", "mountains", "rivers"],
    recommendations: {
      activities: ["Yoga classes", "River rafting", "Meditation", "Trekking", "Temple visits"],
      attractions: ["Laxman Jhula", "Ram Jhula", "Triveni Ghat", "Beatles Ashram", "Neelkanth Mahadev"],
      restaurants: ["Chotiwala Restaurant", "Little Buddha Cafe", "Ganga Beach Restaurant", "Pyramid Cafe"],
      accommodation: ["Ashrams", "Yoga retreats", "Riverside hotels", "Budget guesthouses"]
    },
    travelStyle: "adventure",
    isPublished: true
  },
  {
    title: "Karnataka Cultural Mosaic",
    summary: "Discover ancient ruins, royal palaces, and diverse landscapes from Bangalore to Hampi",
    description: "Karnataka showcases a rich tapestry of history, culture, and nature from the ruins of Hampi to the gardens of Mysore.",
    location: {
      country: "India",
      state: "Karnataka",
      city: "Bangalore",
      coordinates: { lat: 12.9716, lng: 77.5946 }
    },
    photos: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
    ],
    bestTimeToVisit: "October to March",
    duration: "6-8 days",
    budgetRange: { min: 12000, max: 32000 },
    tags: ["heritage", "palaces", "ruins", "gardens", "culture"],
    recommendations: {
      activities: ["Palace tours", "Heritage walks", "Garden visits", "Rock climbing", "Cultural shows"],
      attractions: ["Mysore Palace", "Hampi Ruins", "Coorg Coffee Plantations", "Bangalore Palace", "Belur Halebidu"],
      restaurants: ["MTR", "Koshy's", "The Only Place", "Karavalli"],
      accommodation: ["Heritage hotels", "Palace hotels", "Coffee estate stays", "City hotels"]
    },
    travelStyle: "cultural",
    isPublished: true
  },
  {
    title: "Andhra Pradesh Coastal Delights",
    summary: "Explore ancient Buddhist sites, coastal beauty, and spicy cuisine along the Bay of Bengal",
    description: "Andhra Pradesh offers a blend of Buddhist heritage, beautiful coastline, and renowned cuisine with temples and beaches.",
    location: {
      country: "India",
      state: "Andhra Pradesh",
      city: "Visakhapatnam",
      coordinates: { lat: 17.6868, lng: 83.2185 }
    },
    photos: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800",
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800"
    ],
    bestTimeToVisit: "October to March",
    duration: "4-6 days",
    budgetRange: { min: 9000, max: 24000 },
    tags: ["coastal", "buddhist", "temples", "cuisine", "beaches"],
    recommendations: {
      activities: ["Beach activities", "Temple visits", "Food tours", "Boat rides", "Cultural performances"],
      attractions: ["Araku Valley", "Borra Caves", "Rushikonda Beach", "Simhachalam Temple", "Amaravati"],
      restaurants: ["Dharani", "Rayalaseema Ruchulu", "Ulavacharu", "Sea Inn"],
      accommodation: ["Beach resorts", "Heritage hotels", "Budget hotels", "Hill station stays"]
    },
    travelStyle: "relaxation",
    isPublished: true
  },
  {
    title: "Gujarat Heritage Circuit",
    summary: "Experience the vibrant culture, handicrafts, and architectural marvels of the western frontier",
    description: "Gujarat showcases diverse attractions from the white desert of Kutch to the lions of Gir and the heritage of Ahmedabad.",
    location: {
      country: "India",
      state: "Gujarat",
      city: "Ahmedabad",
      coordinates: { lat: 23.0225, lng: 72.5714 }
    },
    photos: [
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800",
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800"
    ],
    bestTimeToVisit: "November to February",
    duration: "6-8 days",
    budgetRange: { min: 13000, max: 35000 },
    tags: ["heritage", "desert", "wildlife", "handicrafts", "culture"],
    recommendations: {
      activities: ["Heritage walks", "Desert safari", "Wildlife safari", "Handicraft shopping", "Cultural shows"],
      attractions: ["Rann of Kutch", "Gir National Park", "Somnath Temple", "Dwarkadhish Temple", "Sabarmati Ashram"],
      restaurants: ["Agashiye", "Gordhan Thal", "Swati Snacks", "Vishalla"],
      accommodation: ["Heritage hotels", "Desert camps", "Wildlife lodges", "City hotels"]
    },
    travelStyle: "cultural",
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

    // Clear existing destinations (optional)
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
