const mongoose = require('mongoose');
const DestinationGuide = require('../models/DestinationGuide');
const User = require('../models/User');

const addFiveDestinations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/traveltrove');
    console.log('Connected to MongoDB');

    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log(`Found admin user: ${adminUser.firstName} ${adminUser.lastName}`);

    const destinations = [
      {
        title: "Santorini, Greece",
        summary: "A stunning Greek island known for its white-washed buildings, blue-domed churches, and breathtaking sunsets over the Aegean Sea.",
        description: "Santorini is one of the most photographed destinations in the world, famous for its dramatic cliffs, volcanic beaches, and romantic atmosphere. The island offers a perfect blend of ancient history, stunning architecture, and modern luxury.",
        location: {
          country: "Greece",
          city: "Santorini"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&h=600&fit=crop",
            caption: "Iconic blue domes of Santorini",
            isPrimary: true
          }
        ],
        content: {
          history: "Santorini was shaped by one of the largest volcanic eruptions in recorded history, around 1600 BC.",
          culture: "Greek island culture with strong maritime traditions and traditional Cycladic architecture.",
          attractions: ["Oia Village", "Red Beach", "Akrotiri Archaeological Site", "Fira Town", "Santo Wines Winery"],
          bestTimeToVisit: "April to October, with May-June and September-October being ideal",
          climate: "Mediterranean climate with hot, dry summers and mild winters",
          language: ["Greek", "English"],
          currency: "Euro (EUR)"
        },
        recommendations: {
          lodging: [
            {
              name: "Canaves Oia Suites",
              type: "resort",
              priceRange: "luxury",
              description: "Luxury resort with infinity pools and caldera views"
            }
          ],
          dining: [
            {
              name: "Ambrosia Restaurant",
              cuisine: "Mediterranean",
              priceRange: "fine-dining",
              description: "Fine dining with caldera views and creative Greek cuisine",
              address: "Oia, Santorini"
            }
          ],
          activities: [
            {
              name: "Sunset Sailing Tour",
              category: "relaxation",
              duration: "5 hours",
              difficulty: "easy",
              description: "Catamaran cruise around the caldera with dinner and sunset views",
              cost: "€80-120"
            }
          ]
        },
        tags: ["beach", "romantic", "sunset", "volcanic", "wine", "luxury", "island", "mediterranean"],
        averageRating: 4.8,
        totalReviews: 2847,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: "Bali, Indonesia",
        summary: "A tropical paradise offering pristine beaches, ancient temples, lush rice terraces, and vibrant culture in Southeast Asia.",
        description: "Bali combines spiritual tranquility with natural beauty, featuring emerald rice paddies, volcanic mountains, and world-class beaches.",
        location: {
          country: "Indonesia",
          city: "Denpasar"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop",
            caption: "Tegallalang Rice Terraces",
            isPrimary: true
          }
        ],
        content: {
          history: "Bali has been inhabited since 2000 BC with rich Hindu-Buddhist heritage.",
          culture: "Predominantly Hindu culture with daily temple ceremonies and traditional arts.",
          attractions: ["Tanah Lot Temple", "Ubud Monkey Forest", "Mount Batur", "Sekumpul Waterfall", "Uluwatu Temple"],
          bestTimeToVisit: "April to October during the dry season",
          climate: "Tropical climate with wet and dry seasons",
          language: ["Indonesian", "Balinese", "English"],
          currency: "Indonesian Rupiah (IDR)"
        },
        recommendations: {
          lodging: [
            {
              name: "COMO Shambhala Estate",
              type: "resort",
              priceRange: "luxury",
              description: "Luxury wellness retreat in the jungle"
            }
          ],
          dining: [
            {
              name: "Locavore",
              cuisine: "Modern Indonesian",
              priceRange: "fine-dining",
              description: "Award-winning restaurant with innovative Indonesian cuisine",
              address: "Ubud, Bali"
            }
          ],
          activities: [
            {
              name: "Mount Batur Sunrise Trek",
              category: "adventure",
              duration: "6 hours",
              difficulty: "moderate",
              description: "Early morning hike to see sunrise from volcanic crater",
              cost: "$35-50"
            }
          ]
        },
        tags: ["tropical", "beach", "temple", "yoga", "rice terraces", "volcano", "spiritual", "adventure"],
        averageRating: 4.7,
        totalReviews: 3521,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: "Patagonia, Argentina",
        summary: "A vast wilderness region offering dramatic landscapes, glaciers, mountains, and some of the world's best trekking opportunities.",
        description: "Patagonia spans across Argentina and Chile, featuring the iconic Andes mountains, pristine lakes, ancient glaciers, and diverse wildlife.",
        location: {
          country: "Argentina",
          city: "El Calafate"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
            caption: "Perito Moreno Glacier",
            isPrimary: true
          }
        ],
        content: {
          history: "Named by Ferdinand Magellan, inhabited by indigenous peoples for over 10,000 years.",
          culture: "Gaucho culture mixed with indigenous traditions, known for excellent beef and wine.",
          attractions: ["Perito Moreno Glacier", "Mount Fitz Roy", "Torres del Paine", "Ushuaia", "Bariloche"],
          bestTimeToVisit: "October to April (Southern Hemisphere summer)",
          climate: "Cold, windy climate with short summers and long winters",
          language: ["Spanish", "English"],
          currency: "Argentine Peso (ARS)"
        },
        recommendations: {
          lodging: [
            {
              name: "Eolo Patagonia",
              type: "resort",
              priceRange: "luxury",
              description: "Luxury estancia with panoramic steppe views"
            }
          ],
          dining: [
            {
              name: "La Tablita",
              cuisine: "Argentine",
              priceRange: "mid-range",
              description: "Traditional parrilla serving excellent steaks",
              address: "El Calafate, Argentina"
            }
          ],
          activities: [
            {
              name: "Glacier Trekking",
              category: "adventure",
              duration: "Full day",
              difficulty: "challenging",
              description: "Ice trekking on Perito Moreno Glacier with crampons",
              cost: "$150-200"
            }
          ]
        },
        tags: ["mountains", "glacier", "trekking", "wilderness", "adventure", "nature", "wildlife", "remote"],
        averageRating: 4.9,
        totalReviews: 1876,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: "Marrakech, Morocco",
        summary: "An enchanting imperial city featuring vibrant souks, stunning palaces, traditional riads, and the bustling Jemaa el-Fnaa square.",
        description: "Marrakech is a sensory feast of colors, sounds, and aromas. The Red City offers a perfect blend of ancient traditions and modern luxury.",
        location: {
          country: "Morocco",
          city: "Marrakech"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=800&h=600&fit=crop",
            caption: "Jemaa el-Fnaa square at sunset",
            isPrimary: true
          }
        ],
        content: {
          history: "Founded in 1070 by the Almoravids, a major economic center for nearly 1000 years.",
          culture: "Berber and Arab culture with Islamic traditions, famous for craftsmanship and hospitality.",
          attractions: ["Jemaa el-Fnaa", "Bahia Palace", "Saadian Tombs", "Majorelle Garden", "Koutoubia Mosque"],
          bestTimeToVisit: "October to April when temperatures are more comfortable",
          climate: "Semi-arid climate with hot summers and mild winters",
          language: ["Arabic", "Berber", "French", "English"],
          currency: "Moroccan Dirham (MAD)"
        },
        recommendations: {
          lodging: [
            {
              name: "La Mamounia",
              type: "hotel",
              priceRange: "luxury",
              description: "Legendary palace hotel with beautiful gardens"
            }
          ],
          dining: [
            {
              name: "Al Fassia",
              cuisine: "Moroccan",
              priceRange: "fine-dining",
              description: "Authentic Moroccan cuisine run by women chefs",
              address: "Gueliz, Marrakech"
            }
          ],
          activities: [
            {
              name: "Souk Shopping Tour",
              category: "cultural",
              duration: "3 hours",
              difficulty: "easy",
              description: "Guided tour through traditional markets and workshops",
              cost: "$25-40"
            }
          ]
        },
        tags: ["cultural", "historic", "souk", "palace", "desert", "traditional", "crafts", "spices"],
        averageRating: 4.6,
        totalReviews: 4203,
        isPublished: true,
        createdBy: adminUser._id
      },
      {
        title: "Banff National Park, Canada",
        summary: "Canada's first national park featuring pristine mountain lakes, snow-capped peaks, and abundant wildlife in the Canadian Rockies.",
        description: "Banff National Park offers year-round outdoor adventures with turquoise lakes, glacial peaks, and diverse ecosystems.",
        location: {
          country: "Canada",
          city: "Banff"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
            caption: "Lake Louise with mountain backdrop",
            isPrimary: true
          }
        ],
        content: {
          history: "Established in 1885 as Canada's first national park, originally created around hot springs.",
          culture: "Canadian mountain culture with strong conservation values and outdoor recreation traditions.",
          attractions: ["Lake Louise", "Moraine Lake", "Icefields Parkway", "Johnston Canyon", "Bow Lake"],
          bestTimeToVisit: "June to September for hiking, December to March for winter sports",
          climate: "Mountain climate with cold winters and mild summers",
          language: ["English", "French"],
          currency: "Canadian Dollar (CAD)"
        },
        recommendations: {
          lodging: [
            {
              name: "Fairmont Chateau Lake Louise",
              type: "hotel",
              priceRange: "luxury",
              description: "Iconic castle hotel overlooking Lake Louise"
            }
          ],
          dining: [
            {
              name: "The Bison Restaurant",
              cuisine: "Canadian",
              priceRange: "fine-dining",
              description: "Farm-to-table cuisine featuring local ingredients",
              address: "Banff, Alberta"
            }
          ],
          activities: [
            {
              name: "Lake Louise Canoeing",
              category: "nature",
              duration: "2-3 hours",
              difficulty: "easy",
              description: "Paddle on the famous turquoise lake",
              cost: "$60-80"
            }
          ]
        },
        tags: ["mountains", "lakes", "wildlife", "hiking", "skiing", "nature", "glaciers", "national park"],
        averageRating: 4.8,
        totalReviews: 2156,
        isPublished: true,
        createdBy: adminUser._id
      }
    ];

    // Check if destinations already exist
    const existingDestinations = await DestinationGuide.find({
      title: { $in: destinations.map(d => d.title) }
    });

    if (existingDestinations.length > 0) {
      console.log('Some destinations already exist:');
      existingDestinations.forEach(dest => {
        console.log(`- ${dest.title} already exists`);
      });
    }

    // Filter out existing destinations
    const newDestinations = destinations.filter(dest => 
      !existingDestinations.some(existing => existing.title === dest.title)
    );

    if (newDestinations.length === 0) {
      console.log('All destinations already exist in the database.');
      return;
    }

    // Insert new destinations
    const result = await DestinationGuide.insertMany(newDestinations);
    console.log(`\nSuccessfully added ${result.length} new destination guides:`);
    result.forEach(dest => {
      console.log(`✅ ${dest.title}, ${dest.location.country}`);
    });

    // Get total count
    const totalCount = await DestinationGuide.countDocuments();
    console.log(`\nTotal destinations in database: ${totalCount}`);

  } catch (error) {
    console.error('Error adding destinations:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

// Run the function
addFiveDestinations();
