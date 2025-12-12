# InstaTCR - Master Product Requirements Document

**Version:** 2.0 (Reorganized)
**Date:** 2025-12-11
**Status:** Navigation Hub & Index
**Purpose:** Entry point for all InstaTCR documentation

---

## About This Document

This is the **navigation hub** for all InstaTCR product documentation. For detailed specifications, see the linked documents below.

The original 5,275-line master PRD has been split into focused, maintainable documents organized by topic and audience.

---

## 📋 Documentation Precedence Rules

**When product behavior is unclear or documents disagree:**

1. **[CHANGELOG.md](CHANGELOG.md)** - Source of truth for what's actually shipped
2. **[DEV-ROADMAP.md](DEV-ROADMAP.md)** - Current near-term plan and development status
3. **docs/prd/*.md files** - Original requirements and specifications
4. **INSTATCR-MASTER-PRD.md** (this file) - Navigation and overview only

### Important

If you find mismatches:
- **Assume PRD text is more likely to be stale**
- **Prefer changelog + roadmap** over PRD specs
- **Propose PRD updates** rather than changing code to match old text

---

## 🎯 What is InstaTCR?

InstaTCR is a web application for managing California Highway Patrol (CHP) crash report requests. It streamlines the process of requesting, tracking, and obtaining CHP crash reports through automation and manual retrieval.

The application serves as the bridge between personal injury law firms who need crash reports and the CHP system where those reports are stored. InstaTCR automates the tedious process of logging into CHP portals, searching for reports, and downloading documents.

### Two User Groups

- **Law Firms (Attorneys and Paralegals):** Request and track crash reports through a simple, friendly interface
- **InstaTCR Staff (Internal Team):** Process requests efficiently using automation and manual workflows

---

## 🚨 The Critical Rule

> **Law firms NEVER see technical details about automation, portals, robots, or manual processes.**

- **Law Firms (Public):** See friendly messages like "We're contacting CHP about your report"
- **Staff (Internal):** See all technical details, internal statuses, automation errors, journey logs

This separation is **critical** for maintaining a professional user experience.

---

## 📚 Documentation Structure

### Product & Design Documents

- **[Product Foundation](docs/prd/01-product-foundation.md)** - Vision, roadmap (V1-V4), architecture diagrams
- **[Business Logic](docs/prd/02-business-logic.md)** - User flows, status system (13→8 mapping), data models
- **[Screen Specifications](docs/prd/03-screen-specifications.md)** - All 6 screen UI/UX specs with wireframes

### Technical Documents

- **[CHP Wrapper](docs/prd/04-chp-wrapper.md)** - Automation engine deep dive, behavior patterns, execution timeline
- **[Component Library](docs/prd/05-component-library.md)** - UI components and utility functions
- **[Implementation Guide](docs/prd/06-implementation-guide.md)** - Build strategy, validation rules, technical standards

### Development Documents

- **[DEV-ROADMAP.md](DEV-ROADMAP.md)** - Current development status and near-term plan
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and shipped changes
- **[CLAUDE.md](CLAUDE.md)** - Quick reference for Claude Code
- **[AGENTS.md](AGENTS.md)** - Documentation guide for all AI agents
- **[Documentation Notes](docs/notes/)** - Historical notes on major documentation changes

---

## 🗺️ Quick Navigation by Role

### I'm a Product Manager / Designer

Start here:
1. [Product Foundation](docs/prd/01-product-foundation.md) - Understand the vision and roadmap
2. [Business Logic](docs/prd/02-business-logic.md) - Learn the workflows and status system
3. [Screen Specifications](docs/prd/03-screen-specifications.md) - Review UI/UX for all 6 screens

### I'm a Frontend Engineer

Start here:
1. [Screen Specifications](docs/prd/03-screen-specifications.md) - See what to build
2. [Component Library](docs/prd/05-component-library.md) - Use existing components
3. [Implementation Guide](docs/prd/06-implementation-guide.md) - Follow responsive design and accessibility standards

### I'm a Backend Engineer

Start here:
1. [Business Logic](docs/prd/02-business-logic.md) - Understand data flow and status transitions
2. [CHP Wrapper](docs/prd/04-chp-wrapper.md) - Core automation logic and behavior patterns
3. [Implementation Guide](docs/prd/06-implementation-guide.md) - V2 backend integration specs

### I'm a QA Engineer

Start here:
1. [Screen Specifications](docs/prd/03-screen-specifications.md) - Test scenarios for all screens
2. [Business Logic](docs/prd/02-business-logic.md) - Validate user flows and status transitions
3. [Implementation Guide](docs/prd/06-implementation-guide.md) - Testing checklist and validation rules

### I'm an AI Agent

Start here:
1. **[AGENTS.md](AGENTS.md)** - Learn how to read the docs and precedence rules
2. **[CLAUDE.md](CLAUDE.md)** - Quick reference (if you're Claude)
3. **[CHANGELOG.md](CHANGELOG.md)** - What's actually shipped (source of truth)

---

## 📊 Current Status

**Version:** V1.0.1 (Frontend Complete)
**Next:** V2 Backend Integration

See [DEV-ROADMAP.md](DEV-ROADMAP.md) for detailed development status.

### Version Overview

| Version | Focus | Status |
|---------|-------|--------|
| **V1** | MVP Frontend (mock data) | ✅ Complete |
| **V2** | Backend Integration (Convex + wrapper) | ⚪ Not Started |
| **V3** | VAPI AI Caller | ⚪ Not Started |
| **V4** | Open Router AI | ⚪ Not Started |

---

## 🔗 External Resources

- **Production App:** [instatcr.vercel.app](https://instatcr.vercel.app) (placeholder)
- **API Documentation:** (V2+)

---

## 📖 Document Version History

### Version 2.0 (2025-12-11) - Current
- **Split 5,275-line master PRD into 6 focused documents**
- Transformed master PRD into navigation hub
- Added AGENTS.md with AI agent guidelines
- Updated CLAUDE.md with precedence rules and doc links
- Improved cross-references across all documentation

### Version 1.0 (2025-12-10)
- Original monolithic PRD (5,275 lines)
- All specifications in single document

---

*Last Updated: 2025-12-11*
*Document Version: 2.0 (Post-Split)*
*For detailed specifications, see the linked documents above.*
