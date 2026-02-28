# Internship Management Portal - Design Guidelines

## Design Approach
**Reference-Based Approach**: Drawing inspiration from EtherAuthority.io's professional blockchain/tech aesthetic, adapted for an internship management system. Clean, modern, corporate design with sophisticated visual hierarchy.

## Typography System

**Font Families**:
- Primary: Inter (Google Fonts) - for UI elements, body text, forms
- Accent: Space Grotesk (Google Fonts) - for headings, hero text

**Hierarchy**:
- Hero Heading: text-5xl md:text-6xl lg:text-7xl, font-bold, Space Grotesk
- Section Headings: text-3xl md:text-4xl, font-bold, Space Grotesk
- Card Titles: text-xl font-semibold, Inter
- Body Text: text-base md:text-lg, Inter
- Form Labels: text-sm font-medium, Inter
- Dashboard Stats: text-4xl font-bold for numbers, text-sm uppercase tracking-wider for labels

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-16 md:py-24 lg:py-32
- Card padding: p-6 md:p-8
- Form spacing: space-y-6
- Dashboard grid gaps: gap-6

**Container Widths**:
- Landing page sections: max-w-7xl mx-auto px-4 md:px-6 lg:px-8
- Forms: max-w-3xl mx-auto
- Admin dashboard: Full width with max-w-7xl for content areas

## Component Library

### Landing Page Components

**Header/Navigation**:
- Fixed header with backdrop blur (backdrop-blur-lg)
- Logo left, navigation center, "Apply Now" CTA right
- Height: h-20, sticky top-0
- Links: text-sm font-medium tracking-wide

**Hero Section** (80vh):
- Split layout: 60% left (content), 40% right (decorative image/illustration)
- Large hero heading with gradient text treatment
- Subheading: text-xl md:text-2xl with opacity-90
- Primary CTA button: Large (px-8 py-4 text-lg), rounded-lg
- Trust indicators below CTA: "Join 500+ successful interns" with stat badges

**Why Join Us Section**:
- 3-column grid (grid-cols-1 md:grid-cols-3)
- Feature cards with icon top, title, description
- Cards with subtle border, rounded-xl, p-8
- Icons: 48x48px from Heroicons (outline style)

**Internship Details Section**:
- 2-column layout: Left (requirements list), Right (benefits)
- Checklist items with check icons
- Highlight boxes for key information (duration, stipend, location)

**Application Preview Section**:
- Single column centered
- Preview of application form fields
- Strong CTA: "Start Your Application" button

**Footer**:
- 3-column grid: Company info, Quick links, Contact
- Social icons row
- EtherAuthority logo inclusion
- Copyright text-sm opacity-70

### Application Form Modal/Page

**Form Container**:
- Centered modal overlay with backdrop-blur
- max-w-4xl width
- Glassmorphic card effect with border
- Close button top-right

**Form Layout**:
- 2-column grid for Name/Email, GitHub/LinkedIn pairs
- Full-width for Phone, Work Experience, Education, Projects
- City field with autocomplete styling
- Skills: Multi-tag input with pill badges
- CV Upload: Drag-and-drop zone with file preview, max-w-md height, dashed border, rounded-lg

**Submit Section**:
- Full-width gradient button
- Terms checkbox above button
- Progress indicator if multi-step

**Success Message**:
- Replace form with centered success card
- Large checkmark icon (w-20 h-20)
- "Thank You" heading (text-4xl)
- Message body explaining next steps
- "Return Home" button

### Admin Dashboard

**Login Page**:
- Centered card (max-w-md)
- Logo at top
- Email/Password fields with icon prefixes
- "Remember me" checkbox
- Full-width login button
- Minimal, focused design

**Dashboard Layout**:
- Sidebar navigation (w-64, fixed left)
- Logo top, nav items below, logout bottom
- Main content area (ml-64)
- Top bar with breadcrumbs, admin name/avatar right

**Dashboard Home**:
- Stats grid: 4 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Large stat cards: Number (text-4xl font-bold), label (text-sm uppercase), icon top-right
- Recent applications table below stats
- "View All" button

**Intern List Page**:
- Search bar and filters top (flex justify-between)
- Export to Excel button (top-right, with download icon)
- Data table with headers: Name, Email, Phone, Education, Skills, Applied Date, Actions
- Row hover states
- Action buttons: View CV (eye icon), Download (download icon), Delete (trash icon)
- Pagination controls bottom

**CV Viewer Modal**:
- Full-screen overlay
- PDF/document viewer embedded
- Download button top-right
- Close button

## Layout Patterns

**Multi-Column Usage**:
- Landing features: 3 columns desktop, 1 mobile
- Form fields: 2 columns where logical, 1 on mobile
- Dashboard stats: 4 columns desktop, 2 tablet, 1 mobile
- Footer: 3 columns desktop, 1 mobile

**Vertical Rhythm**:
- Consistent section spacing: py-20 md:py-32
- Card/component spacing: space-y-8 within sections
- Form field spacing: space-y-6

## Animations

**Subtle Motion Only**:
- Button hover: Scale and shadow increase (hover:scale-105 transition-transform)
- Card hover: Subtle lift effect (hover:shadow-xl transition-shadow)
- Form focus: Border glow animation
- Page transitions: Fade in (opacity + translate)
- NO scroll animations, NO parallax, NO complex transitions

## Icons

**Library**: Heroicons (via CDN)
- Use outline style for most icons
- Solid style for active states and emphasis
- Icon sizes: w-5 h-5 for inline, w-6 h-6 for buttons, w-12 h-12 for feature cards

## Images

**Hero Section Image**: 
Right-side of hero: Abstract tech/gradient illustration or professional office/intern working scene (1200x800px minimum). Use blur effect on edges for seamless integration.

**Feature Section**: 
Optional small icons/illustrations for each benefit card (256x256px).

**About/Company Section** (if added):
Team photo or office environment image, full-width or 50% width depending on layout.

All images should maintain professional, modern aesthetic aligned with tech industry standards.

## Accessibility

- All form inputs: Proper labels, aria-labels, focus states with visible outline
- Color contrast: Ensure text readability
- Keyboard navigation: Full tab support through forms and dashboard
- File upload: Clear status messages for screen readers
- Table data: Proper th/td structure with scope attributes

## Special Considerations

- EtherAuthority.io logo: Place in header (h-8 w-auto) and footer
- Responsive forms: Stack to single column on mobile
- Admin dashboard: Sidebar collapses to hamburger menu on mobile
- CV preview: Fallback for unsupported file types
- Loading states: Skeleton screens for dashboard data, spinner for form submission