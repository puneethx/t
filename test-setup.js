const fs = require('fs');
const path = require('path');

console.log('🧪 TravelTrove Setup Test\n');

// Check if all required files exist
const requiredFiles = [
  'backend/package.json',
  'backend/server.js',
  'backend/.env',
  'frontend/package.json',
  'frontend/src/App.js',
  'frontend/.env',
  'package.json'
];

console.log('📁 Checking required files...');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✅' : '❌'} ${file}`);
});

// Check backend models
const backendModels = [
  'backend/models/User.js',
  'backend/models/DestinationGuide.js',
  'backend/models/TripItinerary.js',
  'backend/models/Review.js',
  'backend/models/Group.js',
  'backend/models/Favorite.js'
];

console.log('\n🗄️  Checking backend models...');
backendModels.forEach(model => {
  const exists = fs.existsSync(path.join(__dirname, model));
  console.log(`${exists ? '✅' : '❌'} ${model}`);
});

// Check frontend pages
const frontendPages = [
  'frontend/src/pages/Home.js',
  'frontend/src/pages/auth/Login.js',
  'frontend/src/pages/auth/Register.js',
  'frontend/src/pages/destinations/Destinations.js',
  'frontend/src/pages/destinations/DestinationDetail.js',
  'frontend/src/pages/itineraries/Itineraries.js',
  'frontend/src/pages/itineraries/CreateItinerary.js',
  'frontend/src/pages/itineraries/ItineraryDetail.js',
  'frontend/src/pages/groups/Groups.js',
  'frontend/src/pages/groups/GroupDetail.js',
  'frontend/src/pages/admin/Dashboard.js',
  'frontend/src/pages/user/Profile.js',
  'frontend/src/pages/user/Favorites.js'
];

console.log('\n📄 Checking frontend pages...');
frontendPages.forEach(page => {
  const exists = fs.existsSync(path.join(__dirname, page));
  console.log(`${exists ? '✅' : '❌'} ${page}`);
});

console.log('\n🎯 Setup verification complete!');
console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Set up MongoDB connection in backend/.env');
console.log('3. Run seed script: cd backend && node scripts/seedData.js');
console.log('4. Start development: npm run dev');
console.log('\n🔑 Default admin credentials:');
console.log('Email: puneethreddyt2004@gmail.com');
console.log('Password: admin@123');
