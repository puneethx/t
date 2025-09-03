const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting TravelTrove Development Servers...\n');

// Start backend server
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Wait a moment then start frontend
setTimeout(() => {
  console.log('🌐 Starting frontend server...');
  const frontend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'frontend'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 3000);

console.log('\n✅ Servers starting...');
console.log('Backend: http://localhost:5000');
console.log('Frontend: http://localhost:3000');
console.log('\nPress Ctrl+C to stop both servers');
