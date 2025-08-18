const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb+srv://Roshan:AQWMqluF68St5kfm@polling-system.jqkclbn.mongodb.net/

# JWT Configuration
JWT_SECRET=c50dc9f68b762a64108b3b3683ed355c9b32d9d6b38d66c6d002aa385d87dae29f7cf9f2d9c8f0067520dd4774cb446d1e7728792af82561d487b83fa0313b5b

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, 'backend', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Environment file fixed successfully!');
  console.log('📝 MongoDB Atlas URI and JWT secret configured.');
  console.log('🚀 You can now restart the backend server.');
} catch (error) {
  console.error('❌ Error fixing environment file:', error.message);
}



