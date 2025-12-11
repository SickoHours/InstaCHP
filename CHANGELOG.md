# Changelog

All notable changes to InstaTCR will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-10

### Added

#### Design System Foundation
- **`src/lib/utils.ts`** - `cn()` utility function for conditional class merging (clsx + tailwind-merge)
- **`src/lib/constants.ts`** - Color palette and design constants
- **`src/app/layout.tsx`** - Root layout with Google Fonts (Source Serif 4 + Work Sans)
- **`src/app/globals.css`** - Design system CSS with custom properties and animations

#### UI Components (`src/components/ui/`)
- **Button** - 3 variants (primary, secondary, ghost), 3 sizes (sm, md, lg), full mobile-first responsive
- **Card** - Flexible container with glass effect support for frosted transparency
- **Container** - Responsive width container (sm, md, lg, xl, full)
- **Logo** - Text-based InstaTCR logo component
- **`index.ts`** - Barrel exports for all UI components

#### Landing Page Components (`src/components/landing/`)
- **AnimatedBackground** - Floating orbs with 25-second animation loops, blurred circles creating atmospheric effect
- **Hero** - Logo, headline ("CHP Crash Reports, Delivered Fast"), subheadline, two primary CTAs
- **ValuePropositionCard** - Glass-effect cards with icon, title, and description for showcasing benefits
- **Footer** - Copyright notice and placeholder navigation links

#### Landing Page (`src/app/page.tsx`)
- Complete landing page assembly with Hero, Value Proposition section (3 cards), and Footer
- Sections: Automated Retrieval, Real-Time Tracking, Instant Downloads

### Design Decisions

#### Visual Aesthetic: "Authoritative Modernity"
- **Color Palette**: Navy blue (#0a1628), Gold (#d4a84b), Teal (#14b8a6)
- **Typography**: Source Serif 4 for headings (authority), Work Sans for body (clarity)
- **Effects**: Frosted glass cards, animated floating orbs, subtle gradients
- **Avoided**: Generic purple gradients, typical "AI slop" aesthetics

#### Responsive Strategy
- **Mobile-first**: Base styles for 375px minimum width
- **Breakpoint**: 768px for tablet/desktop transitions
- **Touch targets**: 44px minimum (WCAG 2.1 AAA compliance)
- **Input font size**: 16px on mobile (prevents iOS zoom), 14px on desktop

#### Performance Optimizations
- GPU-accelerated animations using `transform` and `opacity`
- `will-change` properties for animated elements
- Reduced motion support via `prefers-reduced-motion` media query

### Dependencies Added
- `clsx` ^2.1.1 - Conditional class construction
- `lucide-react` ^0.559.0 - Icon library
- `tailwind-merge` ^3.4.0 - Merge Tailwind classes without conflicts

### Technical Notes
- Next.js 15 with App Router
- React 19
- Tailwind CSS 4
- TypeScript in strict mode
- All components are Server Components by default (no "use client" unless needed)
