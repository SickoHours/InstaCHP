# InstaTCR

A web application for managing California Highway Patrol (CHP) crash report requests. InstaTCR streamlines the process of requesting, tracking, and obtaining crash reports for personal injury law firms.

---

## Current Status

**V2.2.0 (current):**
- Frontend-only (Next.js App Router)
- Mock data: 29 jobs (24 production + 5 dev in `src/lib/mockData.ts`)
- Wrapper behavior simulated with configurable delays
- All 8 screens functional (6 core + 2 V1.6.0)
- Escalation-first staff dashboard with quick actions (V1.7.0)
- Internal notification system with magic links (V1.8.0)
- Authorization upload gate with three-tier sorting (V1.9.0)
- Liquid Glass design system (V2.0.0-V2.1.0)
- ChatGPT-style app shell with collapsible sidebar (V2.2.0)

**Not in V2 yet:**
- Convex database
- Authentication
- Real CHP wrapper execution
- File storage
- Email notifications (stub ready for V3)

See [DEV-ROADMAP.md](DEV-ROADMAP.md) for version details and what's next.

---

## Quick Start

```bash
npm install           # Install dependencies
npm run dev           # Start dev server (http://localhost:3000)
npm run build         # Production build
npm start             # Start production server
npm run lint          # Run ESLint
```

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React

---

## Documentation

> For detailed specs, start with [INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md) (navigation hub).

| Document | Role |
|----------|------|
| [README.md](README.md) | Setup + where to go |
| [INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md) | Docs navigation hub |
| [CHANGELOG.md](CHANGELOG.md) | Shipped truth |
| [DEV-ROADMAP.md](DEV-ROADMAP.md) | What's next |
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | AI agent operating manual |
| [docs/prd/](docs/prd/) | Detailed specs (6 files) |
| [docs/notes/](docs/notes/) | Historical notes |

---

## Documentation Precedence

When product behavior is unclear or documents disagree:

1. **CHANGELOG.md** - Source of truth (what's shipped)
2. **DEV-ROADMAP.md** - Current development plan
3. **docs/prd/*.md** - Original requirements (may be stale)
4. **INSTATCR-MASTER-PRD.md** - Navigation only

If you find a mismatch: assume the PRD text is stale, prefer changelog + code.

---

## Two User Types

- **Law Firms:** Submit requests, track status, download reports (never see technical details)
- **Staff:** Process requests, run automation, handle escalations (see everything)

---

## License

Private - All rights reserved
