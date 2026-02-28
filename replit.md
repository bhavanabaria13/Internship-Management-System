# Internship Management Portal

## Overview

This is an internship management portal for EtherAuthority, a blockchain security company. The application allows prospective interns to submit applications through a public-facing landing page, while administrators can review, manage, and export applicant data through a protected dashboard.

The portal features a modern landing page with hero section, benefits, and requirements sections, an application form with CV upload capability, and a full admin dashboard for managing intern applications.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration for Replit environment
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming (light/dark mode)
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Design**: RESTful API endpoints under `/api/` prefix
- **Session Management**: Express session with connect-pg-simple for PostgreSQL session storage
- **File Uploads**: Multer for CV file handling (PDF, DOC, DOCX up to 5MB)
- **Authentication**: Simple session-based admin authentication with environment variable credentials

### Data Storage
- **Primary Database**: MongoDB with Mongoose ODM for intern application data
- **Schema Definition**: Drizzle ORM configured for PostgreSQL (used for session storage)
- **File Storage**: Local filesystem storage in `uploads/` directory for CV files

### Key Design Decisions

1. **Dual Database Approach**: MongoDB handles application data (flexible document structure for intern profiles), while PostgreSQL is configured for session persistence via Drizzle.

2. **Monorepo Structure**: Client, server, and shared code coexist in a single repository with clear separation:
   - `client/` - React frontend
   - `server/` - Express backend
   - `shared/` - Shared TypeScript types and Zod schemas

3. **Component Architecture**: Feature components in `client/src/components/` with UI primitives in `client/src/components/ui/`. Example components provided in `client/src/components/examples/` for development reference.

4. **Build Process**: Custom build script (`script/build.ts`) bundles server dependencies to reduce cold start times, with specific allowlist for bundled packages.

## External Dependencies

### Database Services
- **MongoDB**: Primary data store for intern applications (connection via `MONGODB_URI` environment variable)
- **PostgreSQL**: Session storage and Drizzle ORM target (connection via `DATABASE_URL` environment variable)

### Email Service
- **Nodemailer**: SMTP-based email sending for application confirmations and admin notifications
- Configuration via `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` environment variables

### Third-Party Libraries
- **ExcelJS**: Excel file generation for exporting intern data
- **Multer**: Multipart form handling for file uploads
- **Zod**: Schema validation shared between client and server

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` - Admin dashboard credentials
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email configuration (optional)