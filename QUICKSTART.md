# Quickstart Guide

Get juTask up and running on your local machine in minutes.

## Prerequisites

- Node.js 18+ 
- Supabase Project

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd juTask
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

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000`.

## Scripts

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run start`: Start production server.
- `npm run lint`: Run ESLint checks.