# TravelTrove - MERN Travel Application

A comprehensive travel planning platform built with the MERN stack, featuring destination guides, trip itineraries, user reviews, travel groups, and an admin dashboard.

## Features

### User Features
- **User Authentication**: Register, login, and manage profile
- **Destination Guides**: Browse and search curated travel destinations
- **Trip Itineraries**: Create, view, and manage detailed trip plans
- **Reviews & Ratings**: Rate and review destinations and itineraries
- **Favorites**: Save favorite destinations and itineraries
- **Travel Groups**: Join or create travel groups for collaboration
- **Responsive Design**: Works seamlessly on desktop and mobile

### Admin Features
- **Dashboard**: Overview of platform statistics
- **User Management**: Manage user accounts and roles
- **Content Management**: Create and moderate destination guides
- **Review Moderation**: Approve, hide, or delete user reviews
- **Analytics**: Track platform usage and engagement

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Helmet** for security
- **Rate limiting** for API protection

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **React Query** for data fetching and caching
- **React Hook Form** for form management
- **Axios** for API requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd traveltrove_windsurf
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

3. **Environment Setup**
   
   **Backend (.env)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/traveltrove
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   PORT=5000
   NODE_ENV=development
   
   # Optional: Cloudinary for image uploads
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   
   **Frontend (.env)**
   ```env
   REACT_APP_API_URL=http://localhost:5000
   GENERATE_SOURCEMAP=false
   ```

4. **Database Setup**
   ```bash
   # From the backend directory
   node scripts/seedData.js
   ```
   This creates an admin user and sample data.

5. **Run the Application**
   ```bash
   # From the root directory (runs both backend and frontend)
   npm run dev
   
   # Or run separately:
   # Backend (from backend directory)
   npm run dev
   
   # Frontend (from frontend directory)
   npm start
   ```

## Default Admin Credentials
- **Email**: puneethreddyt2004@gmail.com
- **Password**: admin@123

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/profile` - Get user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Destinations
- `GET /api/v1/destinations` - List destinations (with search)
- `GET /api/v1/destinations/:id` - Get destination details
- `POST /api/v1/destinations` - Create destination (admin only)
- `PUT /api/v1/destinations/:id` - Update destination (admin only)
- `DELETE /api/v1/destinations/:id` - Delete destination (admin only)

### Trip Itineraries
- `GET /api/v1/itineraries` - List itineraries
- `GET /api/v1/itineraries/:id` - Get itinerary details
- `POST /api/v1/itineraries` - Create itinerary
- `PUT /api/v1/itineraries/:id` - Update itinerary
- `DELETE /api/v1/itineraries/:id` - Delete itinerary

### Reviews
- `GET /api/v1/reviews` - Get reviews for a resource
- `POST /api/v1/reviews` - Create review
- `PUT /api/v1/reviews/:id` - Update review
- `DELETE /api/v1/reviews/:id` - Delete review

### Favorites
- `GET /api/v1/favorites` - Get user favorites
- `POST /api/v1/favorites` - Add to favorites
- `DELETE /api/v1/favorites/:id` - Remove from favorites

### Groups
- `GET /api/v1/groups/public` - List public groups
- `GET /api/v1/groups/my-groups` - Get user's groups
- `GET /api/v1/groups/:id` - Get group details
- `POST /api/v1/groups` - Create group
- `POST /api/v1/groups/:id/join` - Join group
- `POST /api/v1/groups/:id/leave` - Leave group
- `POST /api/v1/groups/:id/posts` - Add group post

### Admin
- `GET /api/v1/admin/stats` - Dashboard statistics
- `GET /api/v1/admin/users` - Manage users
- `PATCH /api/v1/admin/users/:id` - Update user status/role
- `GET /api/v1/admin/reviews` - Moderate reviews
- `PATCH /api/v1/admin/reviews/:id` - Update review status

## Project Structure

```
traveltrove_windsurf/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── DestinationGuide.js
│   │   ├── TripItinerary.js
│   │   ├── Review.js
│   │   ├── Group.js
│   │   ├── Favorite.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── destinations.js
│   │   ├── itineraries.js
│   │   ├── reviews.js
│   │   ├── favorites.js
│   │   ├── groups.js
│   │   └── admin.js
│   ├── scripts/
│   │   └── seedData.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   ├── auth/
│   │   │   └── common/
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   ├── destinations/
│   │   │   ├── itineraries/
│   │   │   ├── groups/
│   │   │   ├── user/
│   │   │   └── admin/
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── theme.js
│   │   └── index.css
│   ├── package.json
│   └── .env
├── package.json
└── README.md
```

## Key Features Implementation

### Authentication & Authorization
- JWT-based authentication with role-based access control
- Protected routes for authenticated users
- Admin-only routes for content management
- Secure password hashing with bcrypt

### Data Models
- **User**: Profile, preferences, role management
- **DestinationGuide**: Comprehensive destination information
- **TripItinerary**: Detailed trip planning with daily schedules
- **Review**: User feedback and ratings system
- **Group**: Travel group collaboration
- **Favorite**: User bookmarking system

### UI/UX Features
- Material Design components with custom theming
- Responsive design for all screen sizes
- Loading states and error handling
- Form validation with user-friendly messages
- Accessibility features (ARIA labels, keyboard navigation)

## Development

### Available Scripts
- `npm run dev` - Run both backend and frontend in development mode
- `npm run backend` - Run backend server only
- `npm run frontend` - Run frontend development server only

### Code Style
- ESLint configuration for consistent code style
- Prettier for code formatting
- Component-based architecture
- Separation of concerns with contexts and utilities

## Deployment

The application is ready for deployment to platforms like:
- **Backend**: Heroku, Railway, DigitalOcean
- **Frontend**: Netlify, Vercel, GitHub Pages
- **Database**: MongoDB Atlas

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team or create an issue in the repository.
