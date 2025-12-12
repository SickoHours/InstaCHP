# Documentation Reorganization

**Date:** 2025-12-11
**Version:** 1.0.2

---

## Why This Happened

The original `INSTATCR-MASTER-PRD.md` had grown to **5,275 lines**, creating several problems:

1. **Too large for efficient navigation** - Finding specific information required extensive scrolling
2. **Drift risk** - A monolithic document makes it easy for sections to become stale without notice
3. **AI agent usability** - Large files consume significant context and are harder to reference accurately
4. **Maintenance burden** - Updating one section risked unintended changes elsewhere

---

## What Changed

### PRD Split into 6 Focused Documents

The master PRD was split into `docs/prd/`:

| File | Focus | Audience |
|------|-------|----------|
| `01-product-foundation.md` | Vision, roadmap (V1-V4), architecture diagrams | PMs, stakeholders |
| `02-business-logic.md` | User flows, status system (13→8 mapping), data models | Engineers, QA |
| `03-screen-specifications.md` | All 6 screen UI/UX specs | Frontend, designers |
| `04-chp-wrapper.md` | Automation engine, behavior patterns | Backend, DevOps |
| `05-component-library.md` | UI components, utility functions | Frontend |
| `06-implementation-guide.md` | Build strategy, validation, accessibility | All engineers |

### Master PRD → Navigation Hub

`INSTATCR-MASTER-PRD.md` was reduced from 5,275 lines to ~166 lines, now serving as:
- Documentation entry point with role-based navigation
- Precedence rules reference
- Links to all detailed documents

### New AI Agent Documentation

- **`AGENTS.md`** (created) - Comprehensive guide for AI agents with precedence rules, documentation map, common tasks, and pitfalls
- **`CLAUDE.md`** (upgraded) - Added precedence rules, quick reference tables, and links to all PRD files

### Updated Cross-References

- **`DEV-ROADMAP.md`** - Resources section updated with links to AGENTS.md and docs/prd/

---

## Documentation Precedence Rules

When product behavior is unclear or documents disagree, follow this hierarchy:

1. **`CHANGELOG.md`** - Source of truth for shipped features
2. **`DEV-ROADMAP.md`** - Current development plan and status
3. **`docs/prd/*.md`** - Original requirements (may be stale)
4. **`INSTATCR-MASTER-PRD.md`** - Navigation only, not detailed specs

**When documents conflict:**
- Assume PRD text is more likely to be stale
- Trust code + changelog over PRD
- Propose PRD updates rather than changing code to match old text

---

## Maintenance Rule

**Do not create new root-level markdown summary files.**

For major refactors, migrations, or documentation milestones:
1. Add a dated note under `docs/notes/` (format: `YYYY-MM-DD-topic.md`)
2. Update the [notes index](README.md) with a link and summary
3. Reference the note from relevant documents if needed

This keeps the repository organized and prevents markdown sprawl at the root level.

---

## Related

- [CHANGELOG.md](../../CHANGELOG.md) - Version 1.0.2 entry for this change
- [INSTATCR-MASTER-PRD.md](../../INSTATCR-MASTER-PRD.md) - The navigation hub
- [AGENTS.md](../../AGENTS.md) - AI agent guide with precedence rules
