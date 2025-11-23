# Kalkylmodul Backend Server

Simple Node.js backend with Express and PostgreSQL for the Kalkylmodul application.

## Setup

1. **Install dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Make sure PostgreSQL is installed and running
   - Create a database:
     ```sql
     CREATE DATABASE kalkylmodul;
     ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Run database migration:**
   ```bash
   npm run db:migrate
   ```
   This will create the tables and insert sample data.

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3000` by default.

## API Endpoints

- `GET /api/calculations` - Get all calculations
- `GET /api/calculations/:id` - Get a single calculation
- `POST /api/calculations` - Create a new calculation
- `PUT /api/calculations/:id` - Update a calculation
- `DELETE /api/calculations/:id` - Delete a calculation

## Environment Variables

- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_NAME` - Database name (default: kalkylmodul)
- `DB_USER` - Database user (default: postgres)
- `DB_PASSWORD` - Database password (default: postgres)
- `PORT` - Server port (default: 3000)

