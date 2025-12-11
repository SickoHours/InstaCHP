# InstaTCR

A web application for managing California Highway Patrol (CHP) crash report requests. InstaTCR streamlines the process of requesting, tracking, and obtaining crash reports for personal injury law firms.

## Current Status

**Version:** 0.1.0 (V1 MVP - Frontend Only)
**Phase:** Design System & Landing Page Complete

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Deployment:** Vercel

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout with fonts
│   ├── globals.css        # Design system CSS
│   ├── law/               # Law firm screens (coming soon)
│   └── staff/             # Staff screens (coming soon)
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx     # 3 variants, 3 sizes
│   │   ├── Card.tsx       # Glass effect support
│   │   ├── Container.tsx  # Responsive container
│   │   └── Logo.tsx       # Text-based logo
│   └── landing/           # Landing page components
│       ├── AnimatedBackground.tsx
│       ├── Hero.tsx
│       ├── ValuePropositionCard.tsx
│       └── Footer.tsx
└── lib/
    ├── utils.ts           # cn() utility
    └── constants.ts       # Colors & constants
```

## Design System

- **Colors:** Navy blue (#0a1628), Gold (#d4a84b), Teal (#14b8a6)
- **Typography:** Source Serif 4 (headings), Work Sans (body)
- **Mobile-first:** 375px minimum, 768px breakpoint
- **Touch targets:** 44px minimum (WCAG 2.1 AAA)

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Quick reference for AI assistants
- **[INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md)** - Complete product specifications
- **[DEV-ROADMAP.md](DEV-ROADMAP.md)** - Detailed development roadmap
- **[CHANGELOG.md](CHANGELOG.md)** - Version history

## Two User Types

1. **Law Firms** - Submit requests, track status, download reports
2. **Staff** - Process requests, run automation, handle escalations

> Law firms never see technical details about automation or internal processes.

## License

Private - All rights reserved
