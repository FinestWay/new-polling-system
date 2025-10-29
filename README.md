# PollMaster - Online Polling System

A modern, real-time online polling system built with React, Node.js, and MongoDB. Create polls, vote, and see results in real-time with a beautiful, responsive interface.

## 🚀 Features

### Core Features
- **Create Polls**: Easy-to-use form to create polls with multiple options
- **Real-time Voting**: Live updates using Socket.IO
- **User Authentication**: Secure login/register system with JWT
- **Poll Categories**: Organize polls by categories (General, Politics, Technology, etc.)
- **Search & Filter**: Find polls by title, description, or tags
- **Share Polls**: Unique share codes for easy poll sharing
- **Anonymous Voting**: Option to allow anonymous votes
- **Multiple Votes**: Support for multiple votes per user
- **Poll Expiration**: Set expiration dates for polls

### Advanced Features
- **Real-time Results**: Live updates as votes come in
- **Analytics**: Detailed poll analytics for creators
- **Voting History**: Track all your voting activity
- **Responsive Design**: Works perfectly on desktop and mobile
- **Modern UI**: Beautiful interface with Tailwind CSS
- **Security**: Rate limiting, input validation, and secure authentication

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library
- **Framer Motion** - Animation library
- **Recharts** - Chart library for analytics

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd polling-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cd ../backend
   cp env.example .env
   
   # Edit the .env file with your configuration
   nano .env
   ```

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   # Update MONGODB_URI in .env
   ```

5. **Run the application**
   ```bash
   # From the root directory
   npm run dev
   
   # This will start both backend (port 5000) and frontend (port 3000)
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/polling-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### MongoDB Setup

#### Local MongoDB
1. Install MongoDB on your system
2. Start the MongoDB service
3. The database will be created automatically

#### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

## 📱 Usage

### Creating a Poll
1. Register or login to your account
2. Click "Create Poll" in the navigation
3. Fill in the poll details:
   - Title and description
   - Add poll options (2-10 options)
   - Choose category and add tags
   - Configure settings (expiration, multiple votes, etc.)
4. Click "Create Poll"

### Voting on Polls
1. Browse polls on the home page
2. Click on a poll to view details
3. Select your preferred option(s)
4. Click "Vote" to submit
5. See real-time results update

### Managing Your Polls
1. Go to "My Polls" in the navigation
2. View all polls you've created
3. Edit or delete polls as needed
4. View analytics for each poll

## 🏗️ Project Structure

```
polling-system/
├── backend/                 # Backend API
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json
├── frontend/              # React frontend
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React contexts
│   │   ├── pages/        # Page components
│   │   ├── App.js        # Main app component
│   │   └── index.js      # Entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Polls
- `GET /api/polls` - Get all public polls
- `GET /api/polls/:id` - Get specific poll
- `GET /api/polls/share/:code` - Get poll by share code
- `POST /api/polls` - Create new poll
- `PUT /api/polls/:id` - Update poll
- `DELETE /api/polls/:id` - Delete poll
- `GET /api/polls/user/me` - Get user's polls

### Votes
- `POST /api/votes/:pollId` - Vote on poll
- `GET /api/votes/:pollId/results` - Get poll results
- `GET /api/votes/user/history` - Get voting history
- `GET /api/votes/:pollId/analytics` - Get poll analytics

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Add MongoDB add-on
5. Deploy the backend:
   ```bash
   cd backend
   heroku create your-app-name
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Deploy to Vercel or Netlify
3. Update the API URL in the frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/polling-system/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Socket.IO for real-time communication
- MongoDB for the database
- All contributors and users

---

**Happy Polling! 🗳️**




=======
# new-polling-system
>>>>>>> d153e6210f653a414142e384eff8f7a4160e4f8c
