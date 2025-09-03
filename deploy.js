const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TravelTrove Deployment Script\n');

// Check if MongoDB is running
console.log('📦 Checking prerequisites...');

try {
  // Check if .env files exist
  const backendEnv = fs.existsSync(path.join(__dirname, 'backend', '.env'));
  const frontendEnv = fs.existsSync(path.join(__dirname, 'frontend', '.env'));
  
  console.log(`${backendEnv ? '✅' : '❌'} Backend .env file`);
  console.log(`${frontendEnv ? '✅' : '❌'} Frontend .env file`);
  
  if (!backendEnv || !frontendEnv) {
    console.log('\n⚠️  Missing environment files. Please create them before deployment.');
    process.exit(1);
  }

  // Install dependencies
  console.log('\n📦 Installing dependencies...');
  
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('Installing backend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });
  
  console.log('Installing frontend dependencies...');
  execSync('npm install', { cwd: path.join(__dirname, 'frontend'), stdio: 'inherit' });

  // Seed database
  console.log('\n🌱 Seeding database...');
  execSync('node scripts/seedData.js', { cwd: path.join(__dirname, 'backend'), stdio: 'inherit' });

  console.log('\n✅ Setup complete!');
  console.log('\n🎯 To start the application:');
  console.log('npm run dev');
  console.log('\n🔑 Admin credentials:');
  console.log('Email: puneethreddyt2004@gmail.com');
  console.log('Password: admin@123');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
}
