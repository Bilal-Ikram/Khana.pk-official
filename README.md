# Khana.pk - Food Delivery Platform 🍽️

Khana.pk is a modern full-stack food delivery platform that connects customers with local restaurants for seamless food ordering and delivery. Built with cutting-edge technologies and best practices.

## 🌟 Features

- **User Management**
  - Customer and restaurant owner authentication
  - Role-based access control
  - Profile management
  - Address management

- **Restaurant Management**
  - Restaurant profile and menu management
  - Real-time order tracking
  - Order history and analytics
  - Menu item customization

- **Order System**
  - Real-time order tracking
  - Order status updates
  - Order history
  - Payment integration

- **Search & Discovery**
  - Advanced restaurant search
  - Category-based filtering
  - Rating and review system
  - Location-based search

## 🛠️ Tech Stack

### Frontend
- **Core**
  - React.js (v19.0.0)
  - Vite (v6.1.0) - Next-gen build tool
  - React Router DOM (v7.1.5) - Navigation
  - React Hot Toast (v2.5.2) - Notifications

- **UI Components & Styling**
  - Tailwind CSS (v3.4.17)
  - Radix UI Components
    - Alert Dialog
    - Slot
  - Framer Motion (v12.4.2) - Animations
  - Lottie React (v2.4.1) - Lottie animations
  - Lucide React (v0.475.0) - Icons
  - clsx & tailwind-merge - Utility classes

- **Development Tools**
  - ESLint (v9.19.0)
  - PostCSS (v8.5.1)
  - Autoprefixer (v10.4.20)

### Backend
- **Core**
  - Node.js
  - Express.js
  - MongoDB with Mongoose ODM
  - JWT Authentication

- **Key Dependencies**
  - cors - Cross-origin resource sharing
  - dotenv - Environment variables
  - multer - File uploads
  - bcryptjs - Password hashing
  - jsonwebtoken - JWT handling

### Admin Panel
- **Core**
  - React.js
  - Vite
  - React Router
  - Tailwind CSS

- **Features**
  - Dashboard analytics
  - User management
  - Restaurant management
  - Order management
  - Content management

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/khana.pk.git
cd khana.pk
```

2. Install Frontend Dependencies
```bash
cd Frontend
npm install
```

3. Install Backend Dependencies
```bash
cd Backend
npm install
```

4. Install Admin Panel Dependencies
```bash
cd admin
npm install
```

5. Set up environment variables

Backend `.env`:
```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=development
```

Frontend `.env`:
```env
VITE_API_URL=http://localhost:3001
```

Admin `.env`:
```env
VITE_API_URL=http://localhost:3001
```

## 🏃‍♂️ Running the Application

1. Start the Backend Server
```bash
cd Backend
npm run dev
```

2. Start the Frontend Development Server
```bash
cd Frontend
npm run dev
```

3. Start the Admin Panel
```bash
cd admin
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`
- Backend API: `http://localhost:3001`

## 📁 Project Structure

```
khana.pk/
├── Frontend/           # Customer-facing frontend
│   ├── src/           # Source code
│   └── public/        # Static assets
├── Backend/           # Server-side application
│   ├── controllers/   # Route controllers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── services/      # Business logic
│   └── config/        # Configuration files
├── admin/             # Admin panel
│   ├── src/          # Source code
│   └── public/       # Static assets
└── uploads/          # File uploads directory
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Environment variable protection
- Input validation
- Rate limiting
- Secure file uploads

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

\

## 🙏 Acknowledgments

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/) 
