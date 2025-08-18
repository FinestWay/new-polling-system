const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB Atlas Setup');
console.log('=====================');
console.log('1. Go to https://www.mongodb.com/atlas');
console.log('2. Create a free account and cluster');
console.log('3. Get your connection string');
console.log('4. Paste it below (replace <password> with your actual password)\n');

rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString) {
    console.log('❌ No connection string provided. Using local MongoDB.');
    rl.close();
    return;
  }

  const envPath = path.join(__dirname, 'backend', '.env');
  
  try {
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the MONGODB_URI line
    envContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${connectionString}`
    );
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ MongoDB Atlas connection string updated successfully!');
    console.log('🚀 You can now start the backend server.');
  } catch (error) {
    console.error('❌ Error updating connection string:', error.message);
  }
  
  rl.close();
});



