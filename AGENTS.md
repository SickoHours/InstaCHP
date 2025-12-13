# InstaTCR - Guide for AI Agents

**Version:** 1.0
**Last Updated:** 2025-12-11
**Purpose:** Help AI agents navigate InstaTCR documentation and work effectively in this codebase

---

## Introduction

This document helps AI agents (Claude, GPT, Gemini, etc.) navigate InstaTCR documentation and understand how to work effectively in this codebase.

---

## 📋 Documentation Precedence Rules (CRITICAL)

### The Hierarchy

When product behavior is unclear or documents disagree, follow this precedence:

1. **[CHANGELOG.md](CHANGELOG.md)** - Source of truth for shipped features
   - If it's in the changelog, it's implemented and should not be changed
   - Most recent version at top

2. **[DEV-ROADMAP.md](DEV-ROADMAP.md)** - Current development plan
   - Shows what's in progress and what's next
   - V1 status, V2-V4 plans

3. **[docs/prd/*.md](docs/prd/)** - Original requirements
   - May contain future features not yet implemented
   - May have stale text that hasn't been updated post-implementation

4. **[INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md)** - Navigation hub only
   - Use for navigation, not for detailed specs

### When Documents Conflict

**Scenario:** Code does X, but PRD says Y

**Your response:**
1. ✅ Check [CHANGELOG.md](CHANGELOG.md) - Does it mention X being shipped?
2. ✅ Check [DEV-ROADMAP.md](DEV-ROADMAP.md) - Is X marked complete?
3. ✅ Assume the code is correct (X is right)
4. ✅ Propose updating the PRD to match reality
5. ❌ DO NOT change code to match old PRD text

**Example:**
- PRD says: "New request form has 4 fields"
- Code has: 2 fields (clientName, reportNumber)
- CHANGELOG says: "Updated form to 2 fields per PRD-FORM-001"
- **Conclusion:** Code is correct, PRD needs update

---

## 🗺️ Documentation Map

### Quick Lookup Guide

**I need to understand:**
- **What InstaTCR does** → [docs/prd/01-product-foundation.md](docs/prd/01-product-foundation.md)
- **How workflows work** → [docs/prd/02-business-logic.md](docs/prd/02-business-logic.md)
- **Status system rules** → [docs/prd/02-business-logic.md](docs/prd/02-business-logic.md) § Status System
- **Screen layouts** → [docs/prd/03-screen-specifications.md](docs/prd/03-screen-specifications.md)
- **CHP automation** → [docs/prd/04-chp-wrapper.md](docs/prd/04-chp-wrapper.md)
- **Available components** → [docs/prd/05-component-library.md](docs/prd/05-component-library.md)
- **How to implement** → [docs/prd/06-implementation-guide.md](docs/prd/06-implementation-guide.md)
- **What's shipped** → [CHANGELOG.md](CHANGELOG.md)
- **What's next** → [DEV-ROADMAP.md](DEV-ROADMAP.md)

### Document Purposes

| Document | Purpose | When to Read |
|----------|---------|--------------|
| CHANGELOG.md | What's actually shipped | ALWAYS read first for V1 features |
| DEV-ROADMAP.md | Current dev status | Check before proposing new work |
| 01-product-foundation.md | Vision & architecture | Understanding the big picture |
| 02-business-logic.md | Workflows & data models | Implementing business rules |
| 03-screen-specifications.md | UI/UX specs | Building user interfaces |
| 04-chp-wrapper.md | Automation engine | Backend automation work |
| 05-component-library.md | Reusable components | Using existing UI components |
| 06-implementation-guide.md | Technical standards | Following code patterns |

---

## 🎯 The Critical Rule (NEVER FORGET)

**Law firms NEVER see technical details.**

### Two User Types

| User Type | What They See | What They DON'T See |
|-----------|---------------|---------------------|
| **Law Firms** | "We're contacting CHP about your report" | "Wrapper running", "Automation error", "Portal timeout" |
| **Staff** | All technical details, internal statuses, journey logs | (Nothing hidden) |

### Status Mapping
- **14 internal statuses** (staff sees all)
- **8 public statuses** (law firms see simplified)
- **Canonical source:** `src/lib/statusMapping.ts` → `STATUS_MESSAGES` export

**Example:**
- Internal: `AUTOMATION_ERROR`
- Public: `IN_PROGRESS`
- Message: "We're working on your request."

---

## 🏗️ Current Implementation Status

### V1 MVP (Frontend Only) - ✅ COMPLETE (V1.6.2)
- All 8 screens functional (6 core + 2 V1.6.0)
- Mock data in `src/lib/mockData.ts` (27 jobs: 22 production + 5 dev)
- No backend (wrapper execution simulated with delays)
- Dark mode aesthetic with glass-morphism

### V2 Backend Integration - ⚪ Not Started
- Convex database
- Real CHP wrapper on Fly.io
- File storage
- Authentication

### V3 VAPI AI Caller - ⚪ Not Started
### V4 Open Router AI - ⚪ Not Started

**Reference:** See [DEV-ROADMAP.md](DEV-ROADMAP.md) for detailed status

---

## 🧭 Common Tasks for AI Agents

### Task: "Add a new UI component"
1. Read [05-component-library.md](docs/prd/05-component-library.md) - Check if component exists
2. Read [06-implementation-guide.md](docs/prd/06-implementation-guide.md) § Responsive Design
3. Follow mobile-first pattern (375px → 768px breakpoint)
4. Use existing design tokens from `globals.css`

### Task: "Fix a status display issue"
1. Read [CHANGELOG.md](CHANGELOG.md) - Check what's shipped
2. Read [02-business-logic.md](docs/prd/02-business-logic.md) § Status System
3. Check `src/lib/statusMapping.ts` - This is the canonical source
4. Never show internal statuses to law firms

### Task: "Modify a screen layout"
1. Read [CHANGELOG.md](CHANGELOG.md) - Check current implementation
2. Read [03-screen-specifications.md](docs/prd/03-screen-specifications.md) - Find the screen
3. Follow existing mobile/desktop patterns
4. Test at 375px and 768px breakpoints

### Task: "Update the CHP wrapper"
1. Check [DEV-ROADMAP.md](DEV-ROADMAP.md) - Is V2 started? (No = still mock)
2. Read [04-chp-wrapper.md](docs/prd/04-chp-wrapper.md) - Understand wrapper behavior
3. V1 only: Mock behavior in `src/app/staff/jobs/[jobId]/page.tsx`
4. V2+: Real implementation on Fly.io

### Task: "Understand a business rule"
1. Read [02-business-logic.md](docs/prd/02-business-logic.md) - Find the rule
2. Check [CHANGELOG.md](CHANGELOG.md) - Has it been modified?
3. Check `src/lib/types.ts` and `src/lib/utils.ts` - Actual implementation

---

## 📝 Core Business Rules Quick Reference

| Rule | Implementation |
|------|----------------|
| NCIC derivation | First 4 digits of report number (auto) |
| Name splitting | `splitClientName()` in `src/lib/utils.ts` |
| Wrapper prerequisites | Page 1 complete + ≥1 Page 2 field |
| Status conversion | `getPublicStatus()` in `src/lib/statusMapping.ts` |
| Form fields (new request) | Only 2 fields: Client Name + Report Number |

---

## 🔧 Tech Stack Reference

**V1 (Current):**
- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS 4
- Mock data (no backend)

**V2 (Future):**
- Convex (database + realtime)
- Fly.io (CHP wrapper hosting)
- Clerk or Auth0 (authentication)

---

## 🚦 Decision Framework

**When asked to add a feature:**
1. ✅ Check [DEV-ROADMAP.md](DEV-ROADMAP.md) - Is this V1, V2, V3, or V4?
2. ✅ If V2+: Explain it's not implemented yet, offer to plan it
3. ✅ If V1: Check [CHANGELOG.md](CHANGELOG.md) to see if already shipped
4. ✅ Read relevant PRD section for requirements
5. ✅ Follow existing code patterns in the codebase

**When asked to fix a bug:**
1. ✅ Reproduce the issue in the code
2. ✅ Check [CHANGELOG.md](CHANGELOG.md) - Was this feature recently changed?
3. ✅ Check relevant PRD for intended behavior
4. ✅ If conflict: Trust CHANGELOG.md over PRD
5. ✅ Fix the bug, update tests

**When asked "Does InstaTCR do X?":**
1. ✅ Check [CHANGELOG.md](CHANGELOG.md) first (what's shipped)
2. ✅ Check [DEV-ROADMAP.md](DEV-ROADMAP.md) (what's in progress)
3. ✅ Check PRD files (what's planned)
4. ✅ Be clear about "shipped" vs "planned" vs "not planned"

---

## ⚠️ Common Pitfalls

### Pitfall 1: Trusting outdated PRD text
**Mistake:** Implementing based on PRD without checking CHANGELOG
**Fix:** Always verify against CHANGELOG.md first

### Pitfall 2: Showing internal details to law firms
**Mistake:** Displaying "AUTOMATION_ERROR" to law firm users
**Fix:** Always use `getPublicStatus()` for law firm views

### Pitfall 3: Creating files that don't exist in V1
**Mistake:** Trying to integrate Convex when V1 is frontend-only
**Fix:** Check DEV-ROADMAP.md for current version

### Pitfall 4: Breaking mobile-first design
**Mistake:** Designing desktop-first, then squashing for mobile
**Fix:** Start with 375px, enhance at 768px+

### Pitfall 5: Assuming V2+ features exist
**Mistake:** Writing code that calls the CHP wrapper API
**Fix:** V1 has mock data only, wrapper is simulated

---

## 💻 AI Agent Best Practices

### Make Small, Reviewable Diffs
- Keep changes focused and atomic
- Don't bundle unrelated changes together
- One logical change per commit/PR

### Explain Changes in Plain English
- Describe what changed and why
- Write for beginner developers
- Example: "Changed the form from 4 fields to 2 fields because law firms found it too complex. Client type is now collected later via chat."

### Document Your Reasoning
- When fixing a bug, explain the root cause
- When adding a feature, explain why this approach was chosen
- Reference the PRD section or CHANGELOG entry that drove the change

### Respect the Codebase
- Follow existing patterns and conventions
- Don't refactor unnecessarily
- Preserve the established architecture

### Repo Hygiene
- **Do not** create new root-level markdown summary files
- For major refactors/migrations, add a dated note under `docs/notes/` and update the notes index
- Keep documentation organized under existing folders (`docs/prd/`, `docs/notes/`)

---

## 📚 Additional Resources

- **[CLAUDE.md](CLAUDE.md)** - Claude-specific quick reference
- **[README.md](README.md)** - Setup and development commands
- **[src/lib/types.ts](src/lib/types.ts)** - All TypeScript interfaces
- **[src/lib/statusMapping.ts](src/lib/statusMapping.ts)** - Canonical status mapping
- **[docs/notes/](docs/notes/)** - Historical documentation change notes

---

*Last Updated: 2025-12-11*
*For Claude-specific tips, see [CLAUDE.md](CLAUDE.md)*
