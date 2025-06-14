# ტექსტიკო (Tekstiko) - Georgian Grammar Training Platform

A modern web application for practicing Georgian grammar correction. Users receive Georgian texts with grammatical errors and must correct them, then see a side-by-side comparison with the correct version.

## Features

- **Grammar Training**: Practice correcting Georgian texts with common grammatical errors
- **Side-by-side Comparison**: Visual diff highlighting between user input and correct version
- **Progress Tracking**: Local storage of completed texts
- **Admin Panel**: Upload and manage training texts
- **Responsive Design**: Built with Tailwind CSS and shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL with Prisma ORM
- **Toast Notifications**: Sonner
- **Forms**: React Hook Form with Zod validation

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd tekstiko
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the `.env` file and update the database URL:

   ```bash
   # .env
   DATABASE_URL="postgresql://username:password@localhost:5432/tekstiko?schema=public"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

4. **Set up the database**

   Push the schema to your database:

   ```bash
   npm run db:push
   ```

   Or create and run migrations:

   ```bash
   npm run db:migrate
   ```

   ```

   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to `http://localhost:3000` to start training!

## Database Schema

### Text Model

- `id`: Unique identifier
- `referenceID`: Human-readable reference (e.g., "2024v1")
- `text`: Original text with grammatical errors
- `correctedText`: Correct version of the text
- `dateUploaded`: Upload timestamp

### UserText Model

- `id`: Unique identifier
- `textId`: Reference to Text
- `userId`: User identifier (for future use)
- `userAnswer`: User's correction attempt
- `isCompleted`: Completion status
- `completedAt`: Completion timestamp

## Usage

### For Students

1. **Training Interface**:

   - View original Georgian text with errors
   - Type your corrected version
   - Submit to see comparison

2. **Comparison View**:

   - Red highlights show your errors
   - Green highlights show correct version
   - Navigate to next text when ready

3. **Progress Tracking**:
   - See how many texts you've completed
   - Resume partially completed texts

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin`

2. **Upload New Texts**:

   - Enter Reference ID (e.g., "2024v6")
   - Paste original text with errors
   - Paste corrected version
   - Submit to add to database

3. **Manage Texts**:
   - View all uploaded texts
   - Delete texts if needed
   - See upload dates and reference IDs

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio

## Georgian Text Support

The application includes special CSS for proper Georgian text rendering with appropriate fonts and spacing. The comparison algorithm handles Georgian Unicode characters correctly for accurate difference detection.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
