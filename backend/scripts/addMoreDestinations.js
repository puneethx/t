const mongoose = require('mongoose');
const DestinationGuide = require('../models/DestinationGuide');
const User = require('../models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/traveltrove', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

const addMoreDestinations = async () => {
  try {
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating destinations without creator.');
      return;
    }

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
          },
          {
            url: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&h=600&fit=crop",
            caption: "Sunset view from Oia village"
          }
        ],
        content: {
          history: "Santorini was shaped by one of the largest volcanic eruptions in recorded history, around 1600 BC, which created its distinctive crescent shape.",
          culture: "Greek island culture with strong maritime traditions, local wine production, and traditional Cycladic architecture.",
          attractions: ["Oia Village", "Red Beach", "Akrotiri Archaeological Site", "Fira Town", "Santo Wines Winery"],
          bestTimeToVisit: "April to October, with May-June and September-October being ideal for fewer crowds",
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
              description: "Luxury resort with infinity pools and caldera views",
              website: "https://canaves.com"
            },
            {
              name: "Hostel Anna",
              type: "hostel",
              priceRange: "budget",
              description: "Budget-friendly accommodation in Perissa",
              website: "https://hostelanna.com"
            }
          ],
          dining: [
            {
              name: "Ambrosia Restaurant",
              cuisine: "Mediterranean",
              priceRange: "fine-dining",
              description: "Fine dining with caldera views and creative Greek cuisine",
              address: "Oia, Santorini"
            },
            {
              name: "Lucky's Souvlakis",
              cuisine: "Greek",
              priceRange: "budget",
              description: "Authentic Greek souvlaki and gyros",
              address: "Fira, Santorini"
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
            },
            {
              name: "Volcano Hiking",
              category: "adventure",
              duration: "4 hours",
              difficulty: "moderate",
              description: "Hike the active volcano and hot springs",
              cost: "€25-35"
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
        description: "Bali combines spiritual tranquility with natural beauty, featuring emerald rice paddies, volcanic mountains, and world-class beaches. The island offers everything from yoga retreats to adventure sports.",
        location: {
          country: "Indonesia",
          city: "Denpasar"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&h=600&fit=crop",
            caption: "Tegallalang Rice Terraces",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=800&h=600&fit=crop",
            caption: "Traditional Balinese temple"
          }
        ],
        content: {
          history: "Bali has been inhabited since 2000 BC and has a rich Hindu-Buddhist heritage with influences from Indian, Chinese, and Javanese cultures.",
          culture: "Predominantly Hindu culture with daily temple ceremonies, traditional arts, and strong community values.",
          attractions: ["Tanah Lot Temple", "Ubud Monkey Forest", "Mount Batur", "Sekumpul Waterfall", "Uluwatu Temple"],
          bestTimeToVisit: "April to October during the dry season",
          climate: "Tropical climate with wet season (November-March) and dry season (April-October)",
          language: ["Indonesian", "Balinese", "English"],
          currency: "Indonesian Rupiah (IDR)"
        },
        recommendations: {
          lodging: [
            {
              name: "COMO Shambhala Estate",
              type: "resort",
              priceRange: "luxury",
              description: "Luxury wellness retreat in the jungle",
              website: "https://comohotels.com/shambhala"
            },
            {
              name: "Puri Garden Hotel",
              type: "hotel",
              priceRange: "mid-range",
              description: "Boutique hotel in central Ubud",
              website: "https://purigarden.com"
            }
          ],
          dining: [
            {
              name: "Locavore",
              cuisine: "Modern Indonesian",
              priceRange: "fine-dining",
              description: "Award-winning restaurant with innovative Indonesian cuisine",
              address: "Ubud, Bali"
            },
            {
              name: "Warung Babi Guling Ibu Oka",
              cuisine: "Balinese",
              priceRange: "budget",
              description: "Famous for traditional Balinese roast pork",
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
            },
            {
              name: "Yoga Retreat",
              category: "relaxation",
              duration: "3-7 days",
              difficulty: "easy",
              description: "Traditional yoga and meditation sessions",
              cost: "$50-150 per day"
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
        description: "Patagonia spans across Argentina and Chile, featuring the iconic Andes mountains, pristine lakes, ancient glaciers, and diverse wildlife. It's a paradise for outdoor enthusiasts and nature lovers.",
        location: {
          country: "Argentina",
          city: "El Calafate"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop",
            caption: "Perito Moreno Glacier",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
            caption: "Fitz Roy mountain range"
          }
        ],
        content: {
          history: "Named by Ferdinand Magellan after the Patagón people, this region has been inhabited by indigenous peoples for over 10,000 years.",
          culture: "Gaucho culture mixed with indigenous traditions, known for excellent beef, wine, and outdoor lifestyle.",
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
              description: "Luxury estancia with panoramic steppe views",
              website: "https://eolo.com.ar"
            },
            {
              name: "Hosteria Senderos",
              type: "guesthouse",
              priceRange: "mid-range",
              description: "Cozy mountain lodge near El Chalten",
              website: "https://senderos.com.ar"
            }
          ],
          dining: [
            {
              name: "La Tablita",
              cuisine: "Argentine",
              priceRange: "mid-range",
              description: "Traditional parrilla serving excellent steaks",
              address: "El Calafate, Argentina"
            },
            {
              name: "Viva la Pepa",
              cuisine: "International",
              priceRange: "budget",
              description: "Casual dining with local ingredients",
              address: "El Chalten, Argentina"
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
            },
            {
              name: "Fitz Roy Base Trek",
              category: "adventure",
              duration: "8 hours",
              difficulty: "moderate",
              description: "Day hike to the base of iconic Fitz Roy mountain",
              cost: "$30-50"
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
        description: "Marrakech is a sensory feast of colors, sounds, and aromas. The Red City offers a perfect blend of ancient traditions and modern luxury, from historic medinas to contemporary spas.",
        location: {
          country: "Morocco",
          city: "Marrakech"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73a0e?w=800&h=600&fit=crop",
            caption: "Jemaa el-Fnaa square at sunset",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1544948503-7ad532a1e8e4?w=800&h=600&fit=crop",
            caption: "Traditional Moroccan architecture"
          }
        ],
        content: {
          history: "Founded in 1070 by the Almoravids, Marrakech has been a major economic center and imperial city for nearly 1000 years.",
          culture: "Berber and Arab culture with Islamic traditions, famous for craftsmanship, hospitality, and culinary arts.",
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
              description: "Legendary palace hotel with beautiful gardens",
              website: "https://mamounia.com"
            },
            {
              name: "Riad Yasmine",
              type: "guesthouse",
              priceRange: "mid-range",
              description: "Traditional riad with rooftop terrace",
              website: "https://riadyasmine.com"
            }
          ],
          dining: [
            {
              name: "Al Fassia",
              cuisine: "Moroccan",
              priceRange: "fine-dining",
              description: "Authentic Moroccan cuisine run by women chefs",
              address: "Gueliz, Marrakech"
            },
            {
              name: "Jemaa el-Fnaa Food Stalls",
              cuisine: "Street Food",
              priceRange: "budget",
              description: "Traditional street food experience in the main square",
              address: "Jemaa el-Fnaa, Marrakech"
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
            },
            {
              name: "Atlas Mountains Day Trip",
              category: "adventure",
              duration: "8 hours",
              difficulty: "moderate",
              description: "Visit Berber villages and enjoy mountain scenery",
              cost: "$60-80"
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
        description: "Banff National Park offers year-round outdoor adventures with turquoise lakes, glacial peaks, and diverse ecosystems. It's a UNESCO World Heritage site known for its stunning natural beauty.",
        location: {
          country: "Canada",
          city: "Banff"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
            caption: "Lake Louise with mountain backdrop",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
            caption: "Moraine Lake in autumn"
          }
        ],
        content: {
          history: "Established in 1885 as Canada's first national park, originally created around the Cave and Basin hot springs.",
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
              description: "Iconic castle hotel overlooking Lake Louise",
              website: "https://fairmont.com/lake-louise"
            },
            {
              name: "HI-Banff Alpine Centre",
              type: "hostel",
              priceRange: "budget",
              description: "Mountain hostel with shared and private rooms",
              website: "https://hihostels.ca/banff"
            }
          ],
          dining: [
            {
              name: "The Bison Restaurant",
              cuisine: "Canadian",
              priceRange: "fine-dining",
              description: "Farm-to-table cuisine featuring local ingredients",
              address: "Banff, Alberta"
            },
            {
              name: "Evelyn's Coffee Bar",
              cuisine: "Cafe",
              priceRange: "budget",
              description: "Local coffee shop with homemade pastries",
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
            },
            {
              name: "Plain of Six Glaciers Hike",
              category: "adventure",
              duration: "6 hours",
              difficulty: "moderate",
              description: "Hike to tea house with glacier views",
              cost: "$0 (park entry required)"
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

    // Insert destinations
    const result = await DestinationGuide.insertMany(destinations);
    console.log(`Successfully added ${result.length} new destination guides:`);
    result.forEach(dest => {
      console.log(`- ${dest.title}, ${dest.location.country}`);
    });

  } catch (error) {
    console.error('Error adding destinations:', error);
  } finally {
    mongoose.connection.close();
  }
};

addMoreDestinations();
