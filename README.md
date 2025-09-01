# Life Dashboard + Creative Journal

A beautiful, playful web app that serves as your personal Life Dashboard and Creative Journal, with dedicated spaces for family, love, faith, career, projects, home dreams, and conscious buying.

## Features

### Core Spaces (7 Life Areas)
- **Projects / Business** - Track your creative ventures and business ideas
- **Family** - Capture memories and moments with loved ones
- **Home / Dreams** - Plan your sanctuary and future aspirations
- **Love with Wife** - Document cherished moments and expressions of love
- **Conscious Buying** - Mindful purchase tracking and wishlist
- **Work / Career** - Professional growth and achievements
- **Religion / Faith** - Spiritual journey and reflections

### Key Features
- **Rich Text Editor** - Block-based editor with TipTap for notes
- **Media Support** - Drag-drop images, audio recording, doodle canvas
- **Event Scheduling** - Convert notes to events, family sharing options
- **Glassmorphic UI** - Beautiful Mario-inspired color palette with glass effects
- **Add-ons** - Mood tracking, love counter, seeds→harvest, vision boards

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS with custom Mario palette, Glassmorphism effects
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (Email magic links + Google/Apple OAuth)
- **Editor**: TipTap rich text editor
- **State**: React Query (TanStack Query)
- **Animations**: Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/life-dashboard.git
cd life-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database credentials and API keys.

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Seed the spaces (optional):
```bash
npx prisma db seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your Life Dashboard.

## Project Structure

```
life-dashboard/
├── app/                    # Next.js 15 app directory
│   ├── actions/           # Server actions
│   ├── api/              # API routes
│   ├── schedule/         # Scheduler page
│   ├── space/[type]/     # Dynamic space pages
│   └── page.tsx          # Dashboard home
├── components/            # React components
│   ├── dashboard/        # Dashboard components
│   └── editor/          # TipTap editor
├── lib/                  # Utilities and configs
├── prisma/              # Database schema
└── public/              # Static assets
```

## Color Palette (Mario-inspired)

- **Mario Red** (#E63946) - Projects/Business
- **Luigi Green** (#06D6A0) - Family
- **Sky Blue** (#118AB2) - Home/Dreams
- **Peach Pink** (#FF8FA3) - Love
- **Sunshine Yellow** (#FFD166) - Conscious Buying
- **Steel Gray** (#5F6C7B) - Work/Career
- **Royal Purple** (#6A4C93) - Religion/Faith

## Database Schema

Key models:
- `User` - User accounts
- `Space` - The 7 life spaces
- `Note` - Journal entries with rich content
- `Asset` - Images, audio, sketches
- `Event` - Scheduled events from notes
- `AddonConfig` - User preferences for add-ons
- `LoveEntry`, `Seed`, `Harvest`, `MoodEntry` - Add-on specific data

## Development

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # TypeScript type checking
```

### Testing

```bash
npm run test       # Run tests
npm run test:e2e   # Run E2E tests with Playwright
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Database
- Use Supabase, Neon, or PlanetScale for managed PostgreSQL
- Configure `DATABASE_URL` in production

## Roadmap

### Phase 1 (MVP) ✅
- Dashboard with 7 spaces
- Basic note editor
- Event scheduling
- Authentication

### Phase 2 (Add-ons)
- Mood tracking
- Love counter
- Seeds → Harvest
- Vision boards
- Weekly reflections

### Phase 3 (Polish)
- Real-time collaboration
- Mobile app
- Advanced analytics
- AI suggestions
- Calendar sync

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this for your personal life dashboard!

## Acknowledgments

- Inspired by the need for a unified life management tool
- Mario color palette for that playful, nostalgic feel
- Built with love for organizing life's beautiful chaos
