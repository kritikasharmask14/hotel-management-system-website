# PostgreSQL Setup Guide

## Migration from Turso to PostgreSQL

This project has been migrated from Turso (LibSQL) to PostgreSQL.

## Prerequisites

1. **Install PostgreSQL**
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **Mac**: `brew install postgresql@16`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL Service**
   - **Windows**: PostgreSQL service starts automatically
   - **Mac**: `brew services start postgresql@16`
   - **Linux**: `sudo systemctl start postgresql`

## Database Setup

### Option 1: Local PostgreSQL Setup

1. **Create Database**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE hotel_management;
   
   # Create user (optional)
   CREATE USER hotel_admin WITH PASSWORD 'your_password';
   
   # Grant privileges
   GRANT ALL PRIVILEGES ON DATABASE hotel_management TO hotel_admin;
   
   # Exit
   \q
   ```

2. **Update .env File**
   ```env
   # For default postgres user
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/hotel_management
   
   # Or for custom user
   DATABASE_URL=postgresql://hotel_admin:your_password@localhost:5432/hotel_management
   ```

### Option 2: Cloud PostgreSQL (Recommended for Production)

You can use any of these PostgreSQL cloud providers:

#### **Neon** (Recommended - Free tier available)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Update `.env`:
   ```env
   DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

#### **Supabase** (Free tier available)
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the "Connection string" (Transaction mode)
5. Update `.env` with the connection string

#### **Railway** (Free tier available)
1. Sign up at [railway.app](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the DATABASE_URL from variables
5. Update `.env` with the connection string

#### **Vercel Postgres**
1. In your Vercel project dashboard
2. Go to Storage tab
3. Create PostgreSQL database
4. Copy environment variables to `.env`

## Running Migrations

1. **Generate Migration Files**
   ```bash
   npm run db:generate
   ```

2. **Apply Migrations**
   ```bash
   npm run db:migrate
   ```

3. **Push Schema Directly (Development)**
   ```bash
   npm run db:push
   ```

4. **Open Drizzle Studio (Database GUI)**
   ```bash
   npm run db:studio
   ```

## Migration Changes Summary

### Changed Files:
- ✅ `src/db/schema.ts` - Updated to use PostgreSQL syntax
- ✅ `src/db/index.ts` - Changed from libsql to node-postgres
- ✅ `drizzle.config.ts` - Updated dialect to postgresql
- ✅ `.env` - Changed from TURSO_* to DATABASE_URL
- ✅ `package.json` - Added pg dependency

### Schema Changes:
- Changed `sqliteTable` → `pgTable`
- Changed `integer().primaryKey({ autoIncrement: true })` → `serial().primaryKey()`
- Changed `text('created_at')` → `timestamp('created_at').defaultNow()`
- Changed `real()` → `real()` (same type)
- Amenities stored as comma-separated text (no JSON mode needed)

## Troubleshooting

### Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format in `.env`
- Ensure database exists: `psql -U postgres -l`

### Migration Issues
- Delete `drizzle/` folder and regenerate: `npm run db:generate`
- Check PostgreSQL version: `psql --version` (requires 12+)

### Common Errors
1. **"password authentication failed"**
   - Check username and password in DATABASE_URL
   - Reset password: `ALTER USER postgres PASSWORD 'newpassword';`

2. **"database does not exist"**
   - Create database first: `createdb hotel_management`

3. **"relation already exists"**
   - Drop all tables and re-migrate, or use `npm run db:push`

## Next Steps

1. Set up your PostgreSQL database (local or cloud)
2. Update `.env` with correct DATABASE_URL
3. Run `npm run db:push` to create tables
4. Start the development server: `npm run dev`

## Support

For PostgreSQL documentation: [postgresql.org/docs](https://www.postgresql.org/docs/)
For Drizzle ORM documentation: [orm.drizzle.team](https://orm.drizzle.team/)
