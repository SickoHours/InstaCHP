# InstaTCR - Quick Reference for Claude

> **For general AI agent guidance, see [AGENTS.md](AGENTS.md)**
> This document is Claude-specific shortcuts and quick lookups.

---

## 🎯 What is InstaTCR?
InstaTCR is a web application that helps personal injury law firms request, track, and obtain California Highway Patrol (CHP) crash reports through browser automation.

---

## 📋 Documentation Precedence Rules (READ FIRST)

**When behavior is unclear or docs conflict:**

1. **[CHANGELOG.md](CHANGELOG.md)** ← Shipped features (truth)
2. **[DEV-ROADMAP.md](DEV-ROADMAP.md)** ← Current plan
3. **[docs/prd/*.md](docs/prd/)** ← Requirements (may be stale)

**If mismatch found:**
- Assume PRD is stale, code + changelog are correct
- Propose PRD updates, don't change code to match old text

👉 **Full precedence guide:** [AGENTS.md § Documentation Precedence Rules](AGENTS.md#-documentation-precedence-rules-critical)

---

## 🗺️ Documentation Quick Links

| I need... | Read this... |
|-----------|-------------|
| Overview & vision | [docs/prd/01-product-foundation.md](docs/prd/01-product-foundation.md) |
| Status system rules | [docs/prd/02-business-logic.md](docs/prd/02-business-logic.md) § Status System |
| User workflows | [docs/prd/02-business-logic.md](docs/prd/02-business-logic.md) § User Flows |
| Screen layouts | [docs/prd/03-screen-specifications.md](docs/prd/03-screen-specifications.md) |
| CHP wrapper specs | [docs/prd/04-chp-wrapper.md](docs/prd/04-chp-wrapper.md) |
| UI components | [docs/prd/05-component-library.md](docs/prd/05-component-library.md) |
| Implementation guide | [docs/prd/06-implementation-guide.md](docs/prd/06-implementation-guide.md) |
| What's shipped | [CHANGELOG.md](CHANGELOG.md) ← **READ FIRST** |
| What's next | [DEV-ROADMAP.md](DEV-ROADMAP.md) |

---

## 🚨 THE CRITICAL RULE (Never Forget)

**Law firms NEVER see technical details.**

| User Type | Sees | Example Message |
|-----------|------|-----------------|
| **Law Firms** | Friendly, vague status | "We're contacting CHP about your report" |
| **Staff** | All technical details | "Wrapper running", "Automation error", "Journey log" |

**Status Mapping:**
- 14 internal statuses (staff)
- 8 public statuses (law firms)
- **Source of truth:** `src/lib/statusMapping.ts` → `STATUS_MESSAGES`

---

## 📊 Current Status: V1 Complete (Frontend Only)

**V1 MVP:** ✅ COMPLETE (V1.6.2)
- All 8 screens functional (6 core + 2 V1.6.0)
- Mock data: 27 jobs (22 production + 5 dev)
- No backend (wrapper simulated with delays)
- Dark mode + glass-morphism

**V2-V4:** ⚪ Not started
- V2: Convex + real wrapper
- V3: VAPI AI phone calls
- V4: Open Router AI

👉 **Details:** [DEV-ROADMAP.md](DEV-ROADMAP.md)

---

## 🏗️ File Structure (Quick Reference)

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── law/
│   │   ├── page.tsx                # Law firm dashboard
│   │   └── jobs/
│   │       ├── new/page.tsx        # New request form (2 fields only!)
│   │       └── [jobId]/page.tsx    # Job detail (chat view)
│   └── staff/
│       ├── page.tsx                # Staff queue
│       └── jobs/[jobId]/page.tsx   # Staff job detail (7 cards)
├── components/ui/                   # Reusable components
├── lib/
│   ├── mockData.ts                 # 27 sample jobs (22 prod + 5 dev)
│   ├── statusMapping.ts            # Status conversion (CANONICAL)
│   ├── utils.ts                    # Helper functions
│   └── types.ts                    # TypeScript interfaces
```

---

## 🎨 Tech Stack (V1)

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS 4
- **Icons:** lucide-react
- **Data:** Mock data (no backend)
- **Deployment:** Vercel

---

## 📏 Key Technical Specs

| Spec | Value |
|------|-------|
| Mobile min width | 375px |
| Main breakpoint | 768px |
| Touch targets | ≥ 44px (WCAG AAA) |
| Mobile input font | 16px (prevents iOS zoom) |
| Desktop input font | 14px |
| Mobile button height | 48px |
| Desktop button height | 40px |

---

## 🔤 Status Mapping Quick Reference

| Internal Status | Public Status | Color | Law Firm Message |
|-----------------|---------------|-------|------------------|
| `NEW` | `IN_PROGRESS` | Blue | "We're working on your request." |
| `NEEDS_CALL` | `IN_PROGRESS` | Blue | "We're working on your request." |
| `CALL_IN_PROGRESS` | `CONTACTING_CHP` | Blue | "We're contacting CHP about your report." |
| `READY_FOR_AUTOMATION` | `IN_PROGRESS` | Blue | "We're working on your request." |
| `AUTOMATION_RUNNING` | `CONTACTING_CHP` | Blue | "We're contacting CHP about your report." |
| `FACE_PAGE_ONLY` | `FACE_PAGE_READY` | Yellow | "We've received a preliminary copy (face page). The full report will follow." |
| `WAITING_FOR_FULL_REPORT` | `WAITING_FOR_REPORT` | Yellow | "We're waiting for the full report to become available." |
| `COMPLETED_FULL_REPORT` | `REPORT_READY` | Green | "Your report is ready to download." |
| `COMPLETED_MANUAL` | `REPORT_READY` | Green | "Your report is ready to download." |
| `COMPLETED_FACE_PAGE_ONLY` | `REPORT_READY` | Green | "Your report is ready to download." |
| `NEEDS_MORE_INFO` | `NEEDS_INFO` | Amber | "We need a bit more information to locate your report." |
| `NEEDS_IN_PERSON_PICKUP` | `IN_PROGRESS` | Blue | "We're working on your request." |
| `AUTOMATION_ERROR` | `IN_PROGRESS` | Blue | "We're working on your request." |
| `CANCELLED` | `CANCELLED` | Red | "This request has been cancelled." |

👉 **Full messages:** `src/lib/statusMapping.ts` → `STATUS_MESSAGES`

---

## ✅ Validation Rules Quick Reference

| Field | Format | Example |
|-------|--------|---------|
| Report Number | `9XXX-YYYY-ZZZZZ` | "9465-2025-02802" |
| NCIC | 4 digits, starts with 9 (auto) | "9465" |
| Crash Time | HHMM (24-hour) | "1430" |
| Officer ID | 6 digits, starts with 0 | "012345" |
| Crash Date | mm/dd/yyyy, not future | "12/01/2025" |

👉 **Details:** [docs/prd/06-implementation-guide.md § Validation Rules](docs/prd/06-implementation-guide.md)

---

## 📝 New Request Form (`/law/jobs/new`)

**Law firms submit ONLY 2 fields:**

| Field | Required | Validation |
|-------|----------|------------|
| Client Name | Yes | Min 2 characters |
| Report Number | Yes | `9XXX-YYYY-ZZZZZ` |

**NOT in form:**
- ❌ Client Type (collected later in chat)
- ❌ Crash Date/Time (staff fills in Card 1)
- ❌ Case Reference (not used)

👉 **Why?** See [CHANGELOG.md § [1.0.1] PRD-FORM-001](CHANGELOG.md)

---

## 🧮 Core Business Rules

| Rule | Implementation |
|------|----------------|
| **NCIC derivation** | First 4 digits of report number |
| **Name splitting** | `"Dora Cruz"` → `{firstName: "Dora", lastName: "Cruz"}` |
| **Wrapper prerequisites** | Page 1 complete + ≥1 Page 2 field |
| **Wrapper results (V1 mock)** | FULL 30%, FACE_PAGE 40%, NO_RESULT 15%, ERROR 15% |
| **Wrapper timing (V1 mock)** | 8-13 seconds |

---

## 🔧 Essential Functions

```typescript
// Status conversion (ALWAYS use this for law firm views)
getPublicStatus(internalStatus: InternalStatus): PublicStatus

// NCIC extraction
deriveNcic(reportNumber: string): string  // First 4 chars

// Name parsing
splitClientName(fullName: string): { firstName, lastName }

// Date formatting
convertDateForApi(htmlDate: string): string  // YYYY-MM-DD → MM/DD/YYYY

// Relative time
formatRelativeTime(timestamp: number): string  // "2 hours ago"
```

👉 **Source:** `src/lib/utils.ts` and `src/lib/statusMapping.ts`

---

## 🖥️ Staff Job Detail Layout

**Mobile (< 768px):** Two tabs
- Tab 1: "Law Firm View"
- Tab 2: "Staff Controls" (7 cards)

**Desktop (≥ 768px):** Split view
- Left: Law Firm View
- Right: Staff Controls (7 cards)

### Staff Controls (7 Cards)

| # | Card Name | Purpose |
|---|-----------|---------|
| 1 | Page 1 Data | Call CHP, NCIC (auto), crash date/time, officer ID |
| 2 | Page 2 Verification | Driver name (auto-split), plate, license, VIN |
| 3 | CHP Wrapper | Prerequisites, Run button, journey log |
| 4 | Wrapper History | Previous runs with results |
| 5 | Auto-Checker | Check if full report ready (requires face page + name) |
| 6 | Escalation | Escalate to manual pickup |
| 7 | Manual Completion | Upload face page or full report |

---

## 💻 Development Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
```

---

## 📱 Responsive Design Patterns

```typescript
// Mobile (< 768px) - base styles
button: "h-12 text-base"     // 48px height, 16px font
input: "h-12 text-base"      // 48px height, 16px font

// Desktop (≥ 768px) - md: prefix
button: "md:h-10 md:text-sm" // 40px height, 14px font
input: "md:h-10 md:text-sm"  // 40px height, 14px font

// Visibility toggles
className="md:hidden"              // Mobile only
className="hidden md:block"        // Desktop only
className="md:grid md:grid-cols-2" // Desktop grid
```

---

## 🎯 Common Tasks (Quick Patterns)

### Task: Check what's shipped
```
Read: CHANGELOG.md (ALWAYS read first)
```

### Task: Understand a screen layout
```
Read: docs/prd/03-screen-specifications.md
Find: Screen {number}
```

### Task: Use a component
```
Read: docs/prd/05-component-library.md
Find: Component name
Check: src/components/ui/{ComponentName}.tsx
```

### Task: Add status-related code
```
Read: src/lib/statusMapping.ts  # CANONICAL source
Use: STATUS_MESSAGES export
Use: getPublicStatus() for law firm views
```

### Task: Validate a field
```
Read: docs/prd/06-implementation-guide.md § Validation Rules
Check: src/lib/utils.ts for existing validators
```

---

## ⚠️ Common Mistakes to Avoid

1. **❌ Showing internal status to law firms**
   - ✅ Always use `getPublicStatus()`

2. **❌ Trusting PRD without checking CHANGELOG**
   - ✅ Read CHANGELOG.md first for V1 features

3. **❌ Adding backend code in V1**
   - ✅ V1 is frontend-only, all data is mocked

4. **❌ Breaking mobile-first design**
   - ✅ Start at 375px, enhance at 768px

5. **❌ Adding more fields to new request form**
   - ✅ Form has ONLY 2 fields (see CHANGELOG PRD-FORM-001)

---

## 📚 See Also

- **[README.md](README.md)** - Setup + quick start
- **[AGENTS.md](AGENTS.md)** - Complete documentation guide for all AI agents
- **[DEV-ROADMAP.md](DEV-ROADMAP.md)** - Development status
- **[INSTATCR-MASTER-PRD.md](INSTATCR-MASTER-PRD.md)** - Documentation index

---

*Last Updated: 2025-12-12*
*Quick reference for Claude Code - see [AGENTS.md](AGENTS.md) for full guidance*
