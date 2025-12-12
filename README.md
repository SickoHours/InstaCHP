# InstaTCR

A web application for managing California Highway Patrol (CHP) crash report requests. InstaTCR streamlines the process of requesting, tracking, and obtaining crash reports for personal injury law firms.

---

## Current Status

**V1 (current):**
- Frontend-only (Next.js App Router)
- Mock data (18 sample jobs in `src/lib/mockData.ts`)
- Wrapper behavior simulated (8-13s delay)
- All 6 screens functional

**Not in V1 yet:**
- Convex database
- Authentication
- Real CHP wrapper execution
- File storage

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
