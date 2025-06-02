# Tusenfryd Amusement Park Management System

A comprehensive web application for managing Tusenfryd amusement park operations, including attraction management, queue reservations, and visitor experience optimization.

## 🎢 Features

### Visitor Interface
- **Attraction Browser**: View all park attractions with real-time wait times
- **Queue Reservations**: Reserve spots in attraction queues
- **Real-time Updates**: Live wait times and attraction status
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### Admin Panel
- **Attraction Management**: Full CRUD operations for attractions
- **Reservation System**: Monitor and manage visitor reservations
- **Dashboard**: Real-time statistics and park overview
- **Notification System**: Broadcast important messages to visitors
- **Settings Management**: Configure park hours, reservation limits, and more

### Technical Features
- **MVC Architecture**: Clean separation of concerns
- **JWT Authentication**: Secure admin access
- **Input Validation**: Comprehensive data validation
- **Error Handling**: Graceful error management
- **Real-time Updates**: Live data synchronization

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Authentication**: JWT with bcrypt
- **Styling**: Bootstrap 5, Custom CSS
- **Validation**: express-validator
- **Architecture**: MVC (Model-View-Controller)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn** package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tusenfryd.git
   cd tusenfryd
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/tusenfryd
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   ```bash
   # On macOS with Homebrew:
   brew services start mongodb-community
   
   # On Linux:
   sudo systemctl start mongod
   
   # On Windows:
   net start MongoDB
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   - Visitor interface: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`

## 📁 Project Structure

```
tusenfryd/
├── controllers/           # Request handlers
│   ├── adminController.js
│   ├── apiController.js
│   └── visitorController.js
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication middleware
│   ├── errorHandler.js  # Error handling
│   └── validation.js    # Input validation rules
├── models/              # Database models
│   ├── Attraction.js
│   ├── ParkSetting.js
│   ├── Reservation.js
│   └── User.js
├── public/              # Static assets
│   ├── css/
│   ├── js/
│   └── images/
├── routes/              # Route definitions
│   ├── admin.js
│   ├── api.js
│   └── visitor.js
├── views/               # EJS templates
│   ├── admin/          # Admin panel views
│   ├── visitor/        # Visitor interface views
│   └── partials/       # Shared components
├── server.js            # Application entry point
└── package.json
```

## 🔧 Configuration

### Database Configuration

The application uses MongoDB. Configure your connection in the `.env` file:

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/tusenfryd

# MongoDB Atlas (cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tusenfryd
```

### Admin Account

Set up your admin credentials in the `.env` file:

```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@tusenfryd.no
ADMIN_PASSWORD=your-secure-password
```

### Park Settings

Configure default park settings:

```env
PARK_NAME=Tusenfryd
DEFAULT_OPEN_TIME=09:00
DEFAULT_CLOSE_TIME=18:00
```

## 📚 API Documentation

### Visitor API Endpoints

- `GET /api/attractions` - Get all attractions
- `GET /api/attractions/:id` - Get specific attraction
- `POST /api/reservations` - Create new reservation
- `GET /api/reservation/:id` - Check reservation status
- `PUT /api/reservation/:id/cancel` - Cancel reservation

### Admin API Endpoints

- `GET /admin/api/dashboard-stats` - Dashboard statistics
- `GET /admin/api/attractions` - Admin attraction list
- `POST /admin/api/attractions` - Create attraction
- `PUT /admin/api/attractions/:id` - Update attraction
- `DELETE /admin/api/attractions/:id` - Delete attraction

## 🎯 Usage

### For Park Visitors

1. **Browse Attractions**: Visit the homepage to see all available attractions
2. **Check Wait Times**: View real-time wait times for each attraction
3. **Make Reservations**: Reserve your spot in the queue for popular attractions
4. **Track Status**: Check your reservation status using your confirmation ID

### For Park Administrators

1. **Login**: Access the admin panel at `/admin` with your credentials
2. **Manage Attractions**: Add, edit, or remove attractions from the park
3. **Monitor Reservations**: View and manage visitor reservations
4. **Send Notifications**: Broadcast important messages to park visitors
5. **Configure Settings**: Adjust park hours, reservation limits, and other settings

## 🧪 Development

### Available Scripts

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Seed database with sample data
npm run seed

# Run tests (if implemented)
npm test

# Lint code
npm run lint
```

### Adding New Features

1. **Models**: Create new Mongoose schemas in the `models/` directory
2. **Controllers**: Add business logic in the `controllers/` directory
3. **Routes**: Define new endpoints in the `routes/` directory
4. **Views**: Create EJS templates in the `views/` directory
5. **Middleware**: Add custom middleware in the `middleware/` directory

## 🔒 Security

This application implements several security measures:

- **JWT Authentication**: Secure admin authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: express-validator for data validation
- **Error Handling**: Secure error messages
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin request handling

## 🚀 Deployment

### Production Deployment

1. **Environment Variables**: Set production environment variables
   ```env
   NODE_ENV=production
   MONGODB_URI=your-production-mongodb-uri
   JWT_SECRET=your-production-jwt-secret
   ```

2. **Build Process**: Install production dependencies
   ```bash
   npm ci --only=production
   ```

3. **Process Management**: Use PM2 for process management
   ```bash
   npm install -g pm2
   pm2 start server.js --name tusenfryd
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the [Issues](https://github.com/your-username/tusenfryd/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- Bootstrap team for the UI framework
- MongoDB team for the database
- Express.js team for the web framework
- All contributors who helped build this project

---

**Made with ❤️ for Tusenfryd Amusement Park**
