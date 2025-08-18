const crypto = require('crypto');

// Generate a secure random JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');

console.log('🔐 Generated JWT Secret Key:');
console.log('============================');
console.log(jwtSecret);
console.log('\n📝 This secret key will be automatically added to your .env file.');

// Update the .env file with the new JWT secret
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, 'backend', '.env');

try {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  // Replace the JWT_SECRET line
  envContent = envContent.replace(
    /JWT_SECRET=.*/,
    `JWT_SECRET=${jwtSecret}`
  );
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ JWT secret key has been added to your .env file!');
  console.log('🚀 You can now start the backend server.');
} catch (error) {
  console.error('❌ Error updating .env file:', error.message);
  console.log('\n📋 Please manually add this line to your backend/.env file:');
  console.log(`JWT_SECRET=${jwtSecret}`);
}



