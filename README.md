# Kalkylmodul

A cost calculation management application built with React, TypeScript, Vite, Node.js, Express, and PostgreSQL.

## Project Structure

- `src/` - Frontend React application
- `server/` - Backend Node.js/Express API server

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose (recommended for database)
- OR PostgreSQL (v12 or higher) if running database manually
- npm or yarn

## Setup

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173` by default.

### 2. Database Setup with Docker Compose (Recommended)

```bash
# Start PostgreSQL database
docker-compose up -d

# Verify database is running
docker-compose ps
```

The database will be available at `localhost:5432` with:
- Database: `kalkylmodul`
- User: `postgres`
- Password: `postgres`

To stop the database:
```bash
docker-compose down
```

To stop and remove all data:
```bash
docker-compose down -v
```

### 3. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# The default .env values work with Docker Compose setup

# Run database migration (creates tables and inserts sample data)
npm run db:migrate

# Start development server
npm run dev
```

The backend API will run on `http://localhost:3000` by default.

**Alternative: Manual Database Setup**

If you prefer to run PostgreSQL locally without Docker:

```bash
# Create PostgreSQL database
createdb kalkylmodul
# Or using psql:
# psql -U postgres
# CREATE DATABASE kalkylmodul;
```

### 4. Configure Frontend API URL

Make sure the frontend is configured to connect to the backend. The default API URL is `http://localhost:3000/api`. You can override this by setting the `VITE_API_URL` environment variable in a `.env` file:

```bash
# Create .env file in the root directory
echo "VITE_API_URL=http://localhost:3000/api" > .env
```

## Database Schema

The database includes a `calculations` table with the following structure:

- `id` - Primary key (SERIAL)
- `name` - Calculation name (VARCHAR)
- `project` - Project name (VARCHAR)
- `status` - Status ('Aktiv' or 'Avslutad')
- `amount` - Total amount (VARCHAR)
- `created` - Creation date (DATE)
- `created_by` - Creator name (VARCHAR)
- `revision` - Revision identifier (VARCHAR, nullable)
- `created_at` - Timestamp (TIMESTAMP)
- `updated_at` - Timestamp (TIMESTAMP)

## API Endpoints

- `GET /api/calculations` - Get all calculations
- `GET /api/calculations/:id` - Get a single calculation
- `POST /api/calculations` - Create a new calculation
- `PUT /api/calculations/:id` - Update a calculation
- `DELETE /api/calculations/:id` - Delete a calculation

## Quick Start

1. Start the database: `docker-compose up -d`
2. Set up backend: `cd server && npm install && cp .env.example .env && npm run db:migrate && npm run dev`
3. Set up frontend: `npm install && npm run dev`

## Development

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend

```bash
cd server
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript to JavaScript
npm start        # Start production server
npm run db:migrate # Run database migration
```

## Environment Variables

### Frontend (.env)
- `VITE_API_URL` - Backend API URL (default: `http://localhost:3000/api`)

### Backend (server/.env)
- `DB_HOST` - Database host (default: `localhost`)
- `DB_PORT` - Database port (default: `5432`)
- `DB_NAME` - Database name (default: `kalkylmodul`)
- `DB_USER` - Database user (default: `postgres`)
- `DB_PASSWORD` - Database password (default: `postgres`)
- `PORT` - Server port (default: `3000`)
- `NODE_ENV` - Environment (default: `development`)

## Technologies Used

### Frontend
- React 19
- TypeScript
- Vite
- TanStack Query
- Tailwind CSS
- Motion (Framer Motion)
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- pg (PostgreSQL client)

## License

Private project
