# Structura — Frontend

React.js frontend for the Enrollment System Management Platform.

## Technologies Used
- React 18 (Vite)
- React Router DOM
- Axios
- Recharts
- Lucide React
- OpenWeatherMap API

## Setup Instructions

### 1. Clone the repository
```bash
git clone <your-frontend-repo-url>
cd criztyl
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```

### 4. Fill in your `.env`
```
VITE_API_URL=http://127.0.0.1:8000/api
VITE_WEATHER_API_KEY=your_openweathermap_api_key
```

### 5. Start the development server
```bash
npm run dev
```
App runs on http://localhost:5173

## Features
- Secure login/signup with Laravel Sanctum token auth
- Protected dashboard routes
- Interactive charts (Bar, Pie, Area/Line) from real API data
- 5-day live weather forecast via OpenWeatherMap
- Programs and Subjects browser
- Settings page (Profile, Appearance, Notifications, Security)
- Responsive design for desktop and mobile