# Academic Portal - Professional Design System

## Overview

This design system has been refactored to create a professional, academic-focused interface suitable for university lecturers and professors seeking academic promotion.

## Color Palette

Based on the official UMaT emblem and flag colors:

### Brand Colors
- **Emerald Green** `hsl(152 78% 25%)` — Primary. Represents growth and the Western Region's forests.
- **Golden Yellow** `hsl(45 92% 48%)` — Secondary. Represents mineral wealth.
- **Sky Blue** `hsl(203 72% 50%)` — Accent. Represents serenity.
- **Scarlet Red** `hsl(4 84% 47%)` — Destructive/danger. Represents bravery.
- **Black** `hsl(0 0% 10%)` — Foreground text. Represents solidity.
- **White** `hsl(0 0% 100%)` — Background. Clean and pure.

### Status Colors
- **Success**: `hsl(152 65% 32%)` — Emerald green tint for approval/eligible status
- **Warning**: `hsl(45 92% 48%)` — Golden yellow for caution/attention
- **Info**: `hsl(203 72% 50%)` — Sky blue for informational status
- **Destructive**: `hsl(4 84% 47%)` — Scarlet red for errors/negative status

## Typography

### Font Stack
- **Serif**: Lora (headings) - Professional academic feel
- **Sans-serif**: Inter (body) - Clean, modern readability

### Hierarchy
- **H1**: 2.125rem, font-weight 600, letter-spacing -0.5px
- **H2**: 1.625rem, font-weight 600, letter-spacing -0.3px
- **H3**: 1.125rem, font-weight 600
- **Body**: 1rem, font-weight 400, line-height 1.65

## Components

### Cards (`.card-elevated`)
- Clean white background with subtle border
- Minimal shadow (--shadow-sm by default)
- Smooth hover transition with slightly larger shadow
- No gradients or glows
- Professional rounded corners (0.375rem)

### Buttons
- Clear primary/outline variants
- Professional sizing and spacing
- Icons paired with clear labels
- No decorative animations beyond simple transitions

### Forms
- Clean input styling with focus ring
- Simple labels and placeholders
- Border-based focus states (not glows)
- Professional spacing and organization

### Status Indicators
- Badge system with background color + text color
- Icons for quick visual recognition
- Clear, readable combinations
- No flashing or excessive animations

### Section Headers
- Clear title with serif font
- Optional description text in muted color
- Border separator for visual structure
- Proper spacing (8px gaps between elements)

## Design Principles

### 1. **Professional**
- Minimal decoration, maximum clarity
- No excessive gradients, glows, or animations
- Functional beauty over decorative beauty
- Academic sensibility

### 2. **Natural**
- Feels like real professional software
- Not AI-generated or overly trendy
- Consistent patterns and conventions
- Respects academic user's time

### 3. **Readable**
- High contrast for accessibility
- Generous whitespace for breathing room
- Clear hierarchy of information
- Serif fonts for headings, sans for body

### 4. **Functional**
- Clear affordances and interactive states
- Status clearly indicated
- Actions obvious and accessible
- Forms professionally organized

### 5. **Consistent**
- Unified design language across all pages
- Reusable component patterns
- Predictable interactions
- Professional color application

## Usage Guidelines

### Spacing
- Base unit: 4px
- Common gaps: 8px, 12px, 16px, 24px 32px
- Section gaps: 24-32px
- Card padding: 16-32px depending on content

### Shadows
- **--shadow-sm**: Default for cards
- **--shadow-md**: Card hover state
- **--shadow-lg**: Modals and elevated content
- No decorative glows or multiple shadows

### Animations
- Transition duration: 0.2s (default for interactions)
- Fade-in: Subtle opacity transition
- Slide-up: Small translateY with fade
- No bounce, ping, or complex animations

### Icons
- All from lucide-react for consistency
- Size: 4px (w-4 h-4) for inline, up to 6px (w-6 h-6) for standalone
- Color: Inherit from text color or use explicit color
- Academic content: Use appropriate metaphors

## Component Examples

### Status Badge
```html
<span class="badge-success">Eligible</span>
<span class="badge-warning">Pending Review</span>
<span class="badge-info">In Progress</span>
```

### Info Box
```html
<div class="info-box">
  <div class="info-box-title">Academic Achievement</div>
  <div class="info-box-content">Learn more about...</div>
</div>
```

### Section Header
```html
<section class="section-header">
  <h2 class="section-title">Promotion Requirements</h2>
  <p class="section-description">Review the standards for...</p>
</section>
```

### Form Field
```html
<div class="form-field">
  <label class="form-label">Publication Title</label>
  <input class="form-input" type="text" />
</div>
```

## Page Structure Guidelines

### Dashboard
- Clear welcome section with minimal decoration
- Status overview with clean cards
- Action buttons for primary tasks
- Sidebar with resources and announcements
- Simple color-coded sections

### Eligibility
- Clear requirement overview
- Progress indicators with numbers (not decorative rings)
- Requirement sections with status icons
- Professional information hierarchy

### Application
- Form sections with clear organization
- Field groupings by category
- Progress indication (simple text or numbers)
- Professional form inputs
- Clear validation states

### History/Timeline
- Clean list or timeline format
- Status cards with relevant information
- Expandable sections for details
- Simple visual connections (borders, not decorative lines)

### Settings
- Professional form organization
- Clear section headers
- Simple toggle switches
- Professional buttons

## Transition Guide

### Remove From Old Design
- Gradient borders and overlays
- Excessive glow effects (box-shadow glows)
- Decorative shimmer and float animations
- Oversized icon backgrounds
- Multiple badge variants with heavy styling
- Slide, bounce, and ping animations
- Floating glass effects
- Premium card effects with CSS masks

### Keep/Refactor
- Color palette ✓
- Typography system ✓ (changed serif font to Lora)
- Component structure ✓
- Icon system ✓
- Responsive layout ✓
- Dark mode support ✓

## Implementation Checklist

- [x] Design system CSS refactored
- [x] Color variables updated
- [x] Typography system defined
- [x] Dashboard redesigned
- [x] Eligibility redesigned
- [ ] Application pages
- [ ] History/Timeline
- [ ] Settings
- [ ] Auth pages
- [ ] Form sections
- [ ] Review pages

## References

- **Color Values**: Defined in CSS variables (`:root`)
- **Assets**: /src/index.css (design tokens)
- **Components**: Using shadcn/ui base + custom styling
- **Icons**: lucide-react library
- **Fonts**: Imported from Google Fonts

---

**Design Lead**: GitHub Copilot
**Created**: 2024
**Last Updated**: Current Session
**Status**: In Progress (Pages Being Redesigned)
