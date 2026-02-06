# Quickstart Guide

Get **Taskpaz** up and running on your local machine in minutes.

## Prerequisites

- Node.js 18+ 
- [Supabase](https://supabase.com) account and project

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Taskpaz
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize Database**:
   - Go to your Supabase Project dashboard.
   - Open the **SQL Editor**.
   - Copy the contents of [`supabase-schema.sql`](file:///home/deepak/Pictures/Taskpaz/supabase-schema.sql) and run it to create tables and set up Row Level Security (RLS).

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open the app**:
   Navigate to [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint checks.