const mongoose = require('mongoose');
const { DestinationGuide } = require('../models');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveltrove';

async function clearDestinationGuides() {
  try {
    console.log('Clearing existing destination guides...');
    await DestinationGuide.deleteMany({});
    console.log('✅ All destination guides cleared');
  } catch (error) {
    console.error('Error clearing destination guides:', error);
  }
}

async function createTravelDestinations() {
  try {
    console.log('Creating new travel destination guides...');

    const destinations = [
      {
        title: "Bali - Island of the Gods",
        summary: "Discover the enchanting island of Bali, where ancient temples meet pristine beaches and vibrant culture.",
        description: "Bali, Indonesia's most famous island, is a paradise for travelers seeking a perfect blend of culture, nature, and relaxation. Known as the 'Island of the Gods', Bali offers everything from sacred temples and traditional villages to stunning beaches and lush rice terraces. The island's unique Hindu culture, warm hospitality, and diverse landscapes make it an unforgettable destination for any traveler.",
        location: {
          country: "Indonesia",
          city: "Bali"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800",
            caption: "Sacred Monkey Forest in Ubud",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=800",
            caption: "Tegallalang Rice Terraces"
          },
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            caption: "Tanah Lot Temple at sunset"
          }
        ],
        content: {
          history: "Bali's history dates back to ancient times, with evidence of human habitation from prehistoric periods. The island was influenced by Hindu culture from Java in the 11th century, which shaped its unique religious and cultural identity. Despite Dutch colonial rule and Indonesian independence, Bali has maintained its distinct cultural heritage.",
          culture: "Bali's culture is deeply rooted in Hinduism, with daily offerings, temple ceremonies, and traditional arts. The island is famous for its dance performances, gamelan music, and intricate craftsmanship. Balinese people are known for their warm hospitality and strong community bonds.",
          attractions: [
            "Sacred Monkey Forest Sanctuary",
            "Tegallalang Rice Terraces",
            "Tanah Lot Temple",
            "Uluwatu Temple",
            "Mount Batur Volcano",
            "Nusa Penida Island",
            "Seminyak Beach",
            "Ubud Palace"
          ],
          bestTimeToVisit: "April to October (dry season)",
          climate: "Tropical climate with wet and dry seasons",
          language: ["Indonesian", "Balinese", "English"],
          currency: "Indonesian Rupiah (IDR)"
        },
        recommendations: {
          lodging: [
            {
              name: "Four Seasons Resort Bali at Sayan",
              type: "resort",
              priceRange: "luxury",
              description: "Luxurious jungle resort with stunning river valley views",
              website: "https://www.fourseasons.com/bali"
            },
            {
              name: "Bambu Indah",
              type: "villa",
              priceRange: "mid-range",
              description: "Eco-friendly bamboo villas with natural swimming pools",
              website: "https://bambuindah.com"
            },
            {
              name: "Pondok Wisata Sari",
              type: "guesthouse",
              priceRange: "budget",
              description: "Traditional Balinese guesthouse with authentic experience",
              website: ""
            }
          ],
          dining: [
            {
              name: "Locavore",
              cuisine: "Modern Indonesian",
              priceRange: "fine-dining",
              description: "Award-winning restaurant focusing on local ingredients",
              address: "Jalan Dewisita, Ubud"
            },
            {
              name: "Warung Babi Guling Ibu Oka",
              cuisine: "Balinese",
              priceRange: "budget",
              description: "Famous for traditional suckling pig",
              address: "Jalan Suweta, Ubud"
            },
            {
              name: "Potato Head Beach Club",
              cuisine: "International",
              priceRange: "mid-range",
              description: "Beachfront dining with sunset views",
              address: "Jalan Petitenget, Seminyak"
            }
          ],
          activities: [
            {
              name: "Sunrise Mount Batur Trek",
              category: "adventure",
              duration: "6-8 hours",
              difficulty: "moderate",
              description: "Hike to the summit for breathtaking sunrise views",
              cost: "$25-40 USD"
            },
            {
              name: "Traditional Balinese Cooking Class",
              category: "cultural",
              duration: "4-5 hours",
              difficulty: "easy",
              description: "Learn to cook authentic Balinese dishes",
              cost: "$30-50 USD"
            },
            {
              name: "Rice Terrace Cycling Tour",
              category: "nature",
              duration: "4-6 hours",
              difficulty: "easy",
              description: "Cycle through scenic rice fields and villages",
              cost: "$20-35 USD"
            }
          ]
        },
        tags: ["beach", "culture", "temple", "nature", "adventure", "spa", "yoga"],
        averageRating: 4.8,
        totalReviews: 1247,
        isPublished: true,
        createdBy: "64f8b2c1a2b3c4d5e6f7a8b9" // Admin user ID
      },
      {
        title: "Paris - City of Light",
        summary: "Experience the magic of Paris, where art, culture, and romance come together in perfect harmony.",
        description: "Paris, the capital of France, is a city that needs no introduction. Known as the 'City of Light', Paris has been inspiring artists, writers, and travelers for centuries. From the iconic Eiffel Tower to the world-famous Louvre Museum, every corner of this magnificent city tells a story. Paris offers an unparalleled blend of history, art, fashion, and gastronomy that makes it one of the world's most beloved destinations.",
        location: {
          country: "France",
          city: "Paris"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1502602898534-47d22c0b3b0b?w=800",
            caption: "Eiffel Tower at sunset",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
            caption: "Louvre Museum and glass pyramid"
          },
          {
            url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800",
            caption: "Notre-Dame Cathedral"
          }
        ],
        content: {
          history: "Paris was founded in the 3rd century BC by the Parisii, a Celtic tribe. The city grew into a major center during the Middle Ages and became the capital of France in the 12th century. The French Revolution, Napoleonic era, and Belle Époque all left their mark on the city's architecture and culture.",
          culture: "Paris is a global center for art, fashion, gastronomy, and culture. The city is home to world-class museums, theaters, and galleries. Parisian culture emphasizes style, sophistication, and the art of living well.",
          attractions: [
            "Eiffel Tower",
            "Louvre Museum",
            "Notre-Dame Cathedral",
            "Arc de Triomphe",
            "Champs-Élysées",
            "Montmartre and Sacré-Cœur",
            "Palace of Versailles",
            "Seine River Cruise"
          ],
          bestTimeToVisit: "April to June and September to November",
          climate: "Temperate climate with four distinct seasons",
          language: ["French", "English"],
          currency: "Euro (EUR)"
        },
        recommendations: {
          lodging: [
            {
              name: "The Ritz Paris",
              type: "hotel",
              priceRange: "luxury",
              description: "Historic luxury hotel in the heart of Paris",
              website: "https://www.ritzparis.com"
            },
            {
              name: "Hotel Le Bristol",
              type: "hotel",
              priceRange: "luxury",
              description: "Elegant palace hotel with Michelin-starred dining",
              website: "https://www.lebristolparis.com"
            },
            {
              name: "Generator Paris",
              type: "hostel",
              priceRange: "budget",
              description: "Modern hostel with great social atmosphere",
              website: "https://generatorhostels.com"
            }
          ],
          dining: [
            {
              name: "Le Comptoir du Relais",
              cuisine: "French",
              priceRange: "mid-range",
              description: "Authentic French bistro in Saint-Germain",
              address: "9 Carrefour de l'Odéon, 75006 Paris"
            },
            {
              name: "L'Arpège",
              cuisine: "French",
              priceRange: "fine-dining",
              description: "Three-Michelin-starred restaurant by Alain Passard",
              address: "84 Rue de Varenne, 75007 Paris"
            },
            {
              name: "Du Pain et des Idées",
              cuisine: "French Bakery",
              priceRange: "budget",
              description: "Artisanal bakery famous for croissants",
              address: "34 Rue Yves Toudic, 75010 Paris"
            }
          ],
          activities: [
            {
              name: "Louvre Museum Guided Tour",
              category: "cultural",
              duration: "3-4 hours",
              difficulty: "easy",
              description: "Explore the world's largest art museum",
              cost: "€50-80"
            },
            {
              name: "Seine River Dinner Cruise",
              category: "cultural",
              duration: "2-3 hours",
              difficulty: "easy",
              description: "Romantic dinner cruise with city views",
              cost: "€80-150"
            },
            {
              name: "Montmartre Walking Tour",
              category: "cultural",
              duration: "2-3 hours",
              difficulty: "easy",
              description: "Discover the artistic neighborhood",
              cost: "€25-40"
            }
          ]
        },
        tags: ["art", "culture", "romance", "food", "history", "architecture", "fashion"],
        averageRating: 4.9,
        totalReviews: 2156,
        isPublished: true,
        createdBy: "64f8b2c1a2b3c4d5e6f7a8b9"
      },
      {
        title: "Tokyo - Where Tradition Meets Innovation",
        summary: "Immerse yourself in Tokyo's unique blend of ancient traditions and cutting-edge technology.",
        description: "Tokyo, Japan's bustling capital, is a fascinating metropolis where centuries-old temples stand alongside futuristic skyscrapers. This dynamic city offers visitors an incredible mix of traditional Japanese culture and modern innovation. From serene gardens and historic shrines to neon-lit streets and world-class dining, Tokyo provides an unforgettable experience that showcases the best of both old and new Japan.",
        location: {
          country: "Japan",
          city: "Tokyo"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800",
            caption: "Shibuya Crossing at night",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=800",
            caption: "Senso-ji Temple in Asakusa"
          },
          {
            url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
            caption: "Tokyo Tower and cityscape"
          }
        ],
        content: {
          history: "Tokyo began as a small fishing village called Edo in the 12th century. It became the seat of power for the Tokugawa shogunate in 1603 and grew into one of the world's largest cities. After the Meiji Restoration in 1868, Edo was renamed Tokyo and became the imperial capital.",
          culture: "Tokyo's culture reflects Japan's unique blend of tradition and modernity. The city is known for its politeness, efficiency, and attention to detail. Traditional arts like tea ceremonies and kabuki theater coexist with contemporary pop culture and technology.",
          attractions: [
            "Senso-ji Temple",
            "Tokyo Skytree",
            "Shibuya Crossing",
            "Tsukiji Outer Market",
            "Meiji Shrine",
            "Tokyo Disneyland",
            "Ueno Park",
            "Akihabara Electronics District"
          ],
          bestTimeToVisit: "March to May (cherry blossom) and September to November",
          climate: "Humid subtropical climate with four seasons",
          language: ["Japanese", "English"],
          currency: "Japanese Yen (JPY)"
        },
        recommendations: {
          lodging: [
            {
              name: "Aman Tokyo",
              type: "hotel",
              priceRange: "luxury",
              description: "Ultra-luxury hotel with stunning city views",
              website: "https://www.aman.com/hotels/aman-tokyo"
            },
            {
              name: "Park Hotel Tokyo",
              type: "hotel",
              priceRange: "mid-range",
              description: "Art-themed hotel near Tokyo Tower",
              website: "https://www.parkhoteltokyo.com"
            },
            {
              name: "UNPLAN Kagurazaka",
              type: "hostel",
              priceRange: "budget",
              description: "Modern hostel in traditional neighborhood",
              website: "https://unplan.jp"
            }
          ],
          dining: [
            {
              name: "Sukiyabashi Jiro",
              cuisine: "Sushi",
              priceRange: "fine-dining",
              description: "Legendary sushi restaurant by Jiro Ono",
              address: "Tsukiji, Chuo City, Tokyo"
            },
            {
              name: "Ichiran Ramen",
              cuisine: "Japanese",
              priceRange: "budget",
              description: "Famous ramen chain with individual booths",
              address: "Multiple locations across Tokyo"
            },
            {
              name: "Gonpachi",
              cuisine: "Japanese",
              priceRange: "mid-range",
              description: "Traditional izakaya featured in Kill Bill",
              address: "1-13-11 Nishi-Azabu, Minato City"
            }
          ],
          activities: [
            {
              name: "Tsukiji Market Food Tour",
              category: "cultural",
              duration: "3-4 hours",
              difficulty: "easy",
              description: "Explore the famous fish market and try fresh sushi",
              cost: "¥8,000-12,000"
            },
            {
              name: "Mount Fuji Day Trip",
              category: "nature",
              duration: "8-10 hours",
              difficulty: "moderate",
              description: "Visit Japan's iconic mountain and Lake Kawaguchi",
              cost: "¥15,000-25,000"
            },
            {
              name: "Traditional Tea Ceremony",
              category: "cultural",
              duration: "1-2 hours",
              difficulty: "easy",
              description: "Experience authentic Japanese tea ceremony",
              cost: "¥3,000-5,000"
            }
          ]
        },
        tags: ["technology", "culture", "food", "shopping", "temple", "modern", "traditional"],
        averageRating: 4.7,
        totalReviews: 1893,
        isPublished: true,
        createdBy: "64f8b2c1a2b3c4d5e6f7a8b9"
      },
      {
        title: "New York City - The Big Apple",
        summary: "Experience the energy and diversity of New York City, where dreams are made and anything is possible.",
        description: "New York City, often called 'The Big Apple', is the most populous city in the United States and a global center for finance, culture, and entertainment. From the iconic skyline to world-class museums, Broadway shows, and diverse neighborhoods, NYC offers an unparalleled urban experience. The city's unique energy, cultural diversity, and endless opportunities make it a must-visit destination for travelers from around the world.",
        location: {
          country: "United States",
          city: "New York"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800",
            caption: "Manhattan skyline from Brooklyn Bridge",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800",
            caption: "Central Park in autumn"
          },
          {
            url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800",
            caption: "Times Square at night"
          }
        ],
        content: {
          history: "New York City was originally inhabited by Native Americans before being settled by the Dutch in 1624 as New Amsterdam. The British took control in 1664 and renamed it New York. The city grew rapidly during the 19th and 20th centuries, becoming a major port and financial center.",
          culture: "NYC is one of the world's most culturally diverse cities, with residents from over 200 countries. The city is a global center for arts, fashion, media, and entertainment. New Yorkers are known for their fast-paced lifestyle and direct communication style.",
          attractions: [
            "Statue of Liberty",
            "Central Park",
            "Times Square",
            "Empire State Building",
            "Metropolitan Museum of Art",
            "Broadway Theater District",
            "Brooklyn Bridge",
            "High Line Park"
          ],
          bestTimeToVisit: "April to May and September to November",
          climate: "Humid subtropical climate with four seasons",
          language: ["English", "Spanish", "Chinese"],
          currency: "US Dollar (USD)"
        },
        recommendations: {
          lodging: [
            {
              name: "The Plaza Hotel",
              type: "hotel",
              priceRange: "luxury",
              description: "Historic luxury hotel overlooking Central Park",
              website: "https://www.theplazany.com"
            },
            {
              name: "The Standard High Line",
              type: "hotel",
              priceRange: "mid-range",
              description: "Modern hotel with rooftop bar and city views",
              website: "https://www.standardhotels.com"
            },
            {
              name: "HI NYC Hostel",
              type: "hostel",
              priceRange: "budget",
              description: "Large hostel near Central Park",
              website: "https://hinewyork.org"
            }
          ],
          dining: [
            {
              name: "Le Bernardin",
              cuisine: "French Seafood",
              priceRange: "fine-dining",
              description: "Three-Michelin-starred seafood restaurant",
              address: "155 W 51st St, New York, NY 10019"
            },
            {
              name: "Katz's Delicatessen",
              cuisine: "Jewish Deli",
              priceRange: "mid-range",
              description: "Famous for pastrami sandwiches since 1888",
              address: "205 E Houston St, New York, NY 10002"
            },
            {
              name: "Joe's Pizza",
              cuisine: "Pizza",
              priceRange: "budget",
              description: "Classic New York pizza slice",
              address: "123 Carmine St, New York, NY 10014"
            }
          ],
          activities: [
            {
              name: "Broadway Show",
              category: "cultural",
              duration: "2-3 hours",
              difficulty: "easy",
              description: "Experience world-class theater",
              cost: "$50-200 USD"
            },
            {
              name: "Central Park Walking Tour",
              category: "nature",
              duration: "2-3 hours",
              difficulty: "easy",
              description: "Explore the famous urban park",
              cost: "$25-40 USD"
            },
            {
              name: "Brooklyn Bridge Walk",
              category: "adventure",
              duration: "1-2 hours",
              difficulty: "easy",
              description: "Walk across the iconic bridge for skyline views",
              cost: "Free"
            }
          ]
        },
        tags: ["city", "culture", "food", "shopping", "art", "music", "diversity"],
        averageRating: 4.6,
        totalReviews: 2341,
        isPublished: true,
        createdBy: "64f8b2c1a2b3c4d5e6f7a8b9"
      },
      {
        title: "Santorini - Mediterranean Paradise",
        summary: "Discover the stunning beauty of Santorini, with its iconic white buildings, blue domes, and breathtaking sunsets.",
        description: "Santorini, one of Greece's most beautiful islands, is famous for its dramatic volcanic landscape, stunning sunsets, and iconic white-washed buildings with blue domes. This Cycladic island offers visitors a perfect blend of natural beauty, rich history, and Mediterranean charm. From the picturesque villages of Oia and Fira to the black sand beaches and ancient ruins, Santorini provides an unforgettable Greek island experience.",
        location: {
          country: "Greece",
          city: "Santorini"
        },
        photos: [
          {
            url: "https://images.unsplash.com/photo-1570077188670-6e2492d9a9e6?w=800",
            caption: "Oia village with blue domes",
            isPrimary: true
          },
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            caption: "Santorini sunset over the caldera"
          },
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
            caption: "Fira town and caldera views"
          }
        ],
        content: {
          history: "Santorini was formed by a massive volcanic eruption around 3,600 years ago, which created the island's distinctive caldera. The island was home to the ancient Minoan civilization and later became part of the Byzantine and Venetian empires. The current architecture dates mainly from the 18th and 19th centuries.",
          culture: "Santorini's culture reflects its Greek heritage with strong influences from its volcanic history. The island is known for its wine production, traditional architecture, and warm hospitality. Local festivals and religious celebrations are important parts of island life.",
          attractions: [
            "Oia Village",
            "Fira Town",
            "Red Beach",
            "Ancient Thera",
            "Santorini Volcano",
            "Wine Museum",
            "Akrotiri Archaeological Site",
            "Santorini Caldera"
          ],
          bestTimeToVisit: "May to October (peak season June to August)",
          climate: "Mediterranean climate with hot summers and mild winters",
          language: ["Greek", "English"],
          currency: "Euro (EUR)"
        },
        recommendations: {
          lodging: [
            {
              name: "Katikies Hotel",
              type: "hotel",
              priceRange: "luxury",
              description: "Luxury hotel with infinity pools and caldera views",
              website: "https://www.katikies.com"
            },
            {
              name: "Mystique, a Luxury Collection Hotel",
              type: "hotel",
              priceRange: "luxury",
              description: "Cave-style luxury hotel in Oia",
              website: "https://www.mystique.gr"
            },
            {
              name: "Santorini View Hotel",
              type: "hotel",
              priceRange: "mid-range",
              description: "Family-run hotel with traditional charm",
              website: "https://santoriniview.com"
            }
          ],
          dining: [
            {
              name: "Ambrosia Restaurant",
              cuisine: "Greek",
              priceRange: "fine-dining",
              description: "Upscale dining with caldera views",
              address: "Oia, Santorini"
            },
            {
              name: "Metaxi Mas",
              cuisine: "Greek",
              priceRange: "mid-range",
              description: "Traditional Greek taverna with local specialties",
              address: "Exo Gonia, Santorini"
            },
            {
              name: "Lucky's Souvlakis",
              cuisine: "Greek",
              priceRange: "budget",
              description: "Famous for souvlaki and gyros",
              address: "Fira, Santorini"
            }
          ],
          activities: [
            {
              name: "Santorini Volcano Tour",
              category: "adventure",
              duration: "4-5 hours",
              difficulty: "moderate",
              description: "Hike the volcano and swim in hot springs",
              cost: "€25-40"
            },
            {
              name: "Wine Tasting Tour",
              category: "cultural",
              duration: "3-4 hours",
              difficulty: "easy",
              description: "Visit local wineries and taste Santorini wines",
              cost: "€35-60"
            },
            {
              name: "Sunset Sailing Cruise",
              category: "relaxation",
              duration: "5-6 hours",
              difficulty: "easy",
              description: "Sail around the island with dinner and sunset views",
              cost: "€80-120"
            }
          ]
        },
        tags: ["island", "beach", "romance", "sunset", "wine", "culture", "volcano"],
        averageRating: 4.9,
        totalReviews: 1678,
        isPublished: true,
        createdBy: "64f8b2c1a2b3c4d5e6f7a8b9"
      }
    ];

    // Create destination guides
    for (const destination of destinations) {
      const newDestination = new DestinationGuide(destination);
      await newDestination.save();
      console.log(`✅ Created: ${destination.title}`);
    }

    console.log(`\n🎉 Successfully created ${destinations.length} destination guides!`);
    
    // Display summary
    console.log('\n📋 Destination Summary:');
    destinations.forEach((dest, index) => {
      console.log(`${index + 1}. ${dest.title} - ${dest.location.city}, ${dest.location.country}`);
    });

  } catch (error) {
    console.error('Error creating destination guides:', error);
  }
}

async function main() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await clearDestinationGuides();
    await createTravelDestinations();

    console.log('\n🎯 All done! Your travel destination guides are ready.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { clearDestinationGuides, createTravelDestinations };
