# Khana.pk - Food Delivery Platform 🍽️

Khana.pk is a full-stack food delivery platform built using the MERN (MongoDB, Express.js, React.js, Node.js) stack. It connects customers with local restaurants for seamless food ordering and delivery.

## Features

- User and restaurant authentication
- Restaurant menu management
- Real-time order tracking
- Secure payment integration
- User reviews and ratings
- Restaurant search and filtering
- Responsive design for all devices

## Tech Stack

### Frontend
- React.js
- Redux for state management
- Material-UI/Tailwind CSS
- Axios for API requests
- React Router for navigation

### Backend
- Node.js
- Express.js
- MongoDB
- JWT for authentication
- Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn package manager

## Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/khana.pk.git
cd khana.pk
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

3. Install Backend Dependencies
```bash
cd backend
npm install
```

4. Set up environment variables
Create `.env` files in both frontend and backend directories:

Backend `.env`:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000
```

Frontend `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

## Running the Application

1. Start the Backend Server
```bash
cd backend
npm run dev
```

2. Start the Frontend Development Server
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

The API documentation can be found in the `/docs` directory or visit the live API docs at [API Documentation URL].

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Project Link: [https://github.com/your-username/khana.pk](https://github.com/your-username/khana.pk)

## Acknowledgments

- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Node.js](https://nodejs.org/)