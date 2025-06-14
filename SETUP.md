# Quick Setup Guide for Tekstiko

## Prerequisites

- Node.js 18+
- PostgreSQL database running
- Git

## Quick Start

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up your database**

   Create a PostgreSQL database called `tekstiko` and update your `.env` file:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/tekstiko?schema=public"
   ```

3. **Push database schema**

   ```bash
   npm run db:push
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Go to `http://localhost:3000` to start training!

## Usage

### For Students

- View original Georgian text with grammatical errors
- Type your corrected version in the textarea
- Submit to see side-by-side comparison with highlights
- Green highlights = correct parts, Red highlights = errors
- Click "Next Text" to continue

### For Admins

- Go to `/admin` to upload new texts
- Fill in Reference ID (e.g., "2024v6")
- Paste original text with errors
- Paste the corrected version
- Submit to add to database

## Database Commands

- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply migrations
- `npm run db:studio` - Open Prisma Studio GUI

## Features

✅ Georgian text grammar training
✅ Visual difference highlighting  
✅ Progress tracking (localStorage)
✅ Admin panel for text management
✅ Responsive design with shadcn/ui
✅ PostgreSQL database with Prisma
✅ Sample Georgian texts included

## Need Help?

Check the main README.md for detailed documentation or create an issue if you encounter problems.
