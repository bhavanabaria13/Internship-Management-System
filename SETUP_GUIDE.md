
# Internship Portal - Complete Setup Guide

## Prerequisites

- **Node.js**: Version 20 (LTS) - Already configured in Replit
- **PostgreSQL**: Version 16 - Provided by Replit Database

## Database Setup

### 1. Create PostgreSQL Database in Replit

1. Open the **Database** tab in Replit
2. Click **"Create a database"**
3. Select **PostgreSQL**
4. The database will be automatically provisioned

### 2. Environment Variables

The following environment variables are automatically set by Replit:

- `DATABASE_URL` - PostgreSQL connection string

You need to manually add these in the Secrets tab:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
SESSION_SECRET=your_session_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Run Database Migrations

The database schema will be created automatically when you start the application. The migration files are located in the `drizzle/` folder.

## Application Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Application

Click the **Run** button or execute:

```bash
npm run dev
```

The application will be available at:
- Development: `http://0.0.0.0:5000`
- Production (after deployment): Your Replit deployment URL

## Application Features

### Admin Panel

**Access:** `/admin`

**Features:**
1. **Dashboard** - Overview of all interns and statistics
2. **Intern Management** - View, approve, reject, edit, and delete intern applications
3. **Task Management** - Create and assign tasks to interns
4. **Project Management** - Manage projects and link tasks
5. **Weekly Updates** - Review intern weekly progress reports
6. **Time Tracking** - Monitor intern work hours
7. **Contact Messages** - View and respond to contact form submissions
8. **Excel Import** - Bulk import intern data from spreadsheets

**Default Credentials:**
- Username: `admin`
- Password: `admin123` (Change in Secrets)

### Intern Portal

**Access:** `/intern/login`

**Features:**
1. **Dashboard** - View task statistics and latest running tasks
2. **Profile Management** - Update personal information and upload profile picture
3. **Tasks** - View assigned tasks, start/stop timers, submit completed work
4. **Projects** - View all projects (read-only)
5. **Weekly Updates** - Submit weekly progress reports
6. **Notifications** - Receive task assignments and updates

**Login:**
- Email: Your registered email
- Default Password: `123456` (after admin approval)

### Public Pages

1. **Home** (`/`) - Landing page with company information
2. **Career** (`/career`) - Internship application form
3. **Contact Us** (`/contact`) - Contact form
4. **Privacy Policy** (`/privacy`)
5. **Terms & Conditions** (`/terms`)

## Database Schema

### Core Tables

1. **interns** - Intern profile information
2. **intern_users** - Login credentials and approval status
3. **tasks** - Task assignments and tracking
4. **projects** - Project management
5. **weekly_updates** - Intern weekly progress reports
6. **time_logs** - Time tracking for tasks
7. **notifications** - User notifications
8. **contact_messages** - Contact form submissions
9. **session** - Express session storage

## Workflow

### For New Intern Applications

1. User submits application via `/career` page
2. Admin receives email notification
3. Admin reviews application in Admin Panel
4. Admin approves/rejects intern
5. Approved intern receives email with login credentials
6. Intern logs in with default password `123456`
7. Intern can change password in profile settings

### For Task Management

1. Admin creates task and assigns to intern
2. Intern receives notification
3. Intern starts task timer
4. Intern works on task
5. Intern stops timer and submits task
6. Admin reviews completed task

### For Weekly Updates

1. Intern submits weekly progress report
2. Admin reviews update
3. Admin provides feedback and performance score
4. Intern views feedback in their dashboard

## Email Configuration

The application sends emails for:
- Application confirmations
- Admin notifications
- Intern approvals
- Password resets

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication
2. Generate App Password
3. Add to Secrets:
   - `SMTP_USER`: your.email@gmail.com
   - `SMTP_PASS`: your_app_password

## Security Features

- Session-based authentication
- Password hashing with bcrypt
- SQL injection protection via Drizzle ORM
- File upload validation
- CSRF protection
- Secure session cookies

## Performance Features

- Connection pooling for database
- Optimized queries with indexes
- Automatic session cleanup
- Efficient file handling

## Troubleshooting

### Database Connection Issues

1. Verify `DATABASE_URL` is set in environment variables
2. Check PostgreSQL service is running
3. Review connection string format

### Email Not Sending

1. Verify SMTP credentials in Secrets
2. Check Gmail app password is correct
3. Review email logs in console

### Login Issues

1. Clear browser cookies
2. Verify intern is approved by admin
3. Reset password using "Forgot Password"

### Session Expired

1. Sessions expire after 24 hours of inactivity
2. Click logout and login again
3. Check browser cookies are enabled

## Development Commands

```bash
# Start development server
npm run dev

# Run database migrations
npx drizzle-kit push:pg

# Generate migration files
npx drizzle-kit generate:pg

# View database studio
npx drizzle-kit studio
```

## Production Deployment

1. Click **Deploy** in Replit
2. Configure deployment settings
3. Set environment variables
4. Deploy to production

The application is production-ready with:
- Automatic HTTPS
- Session persistence
- Database connection pooling
- Error handling
- Logging

## Support

For issues or questions:
- Check console logs for errors
- Review database query logs
- Contact system administrator

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL 16
- **ORM**: Drizzle ORM
- **Authentication**: express-session with PostgreSQL store
- **Email**: Nodemailer
- **File Upload**: Multer
- **Validation**: Zod

## File Structure

```
/
├── client/          # React frontend
├── server/          # Express backend
├── shared/          # Shared types and schemas
├── drizzle/         # Database migrations
├── uploads/         # User uploaded files
└── data/            # Legacy SQLite (no longer used)
```

## Recent Changes

- Migrated from dual MongoDB/PostgreSQL to PostgreSQL only
- All data now stored in PostgreSQL
- Removed MongoDB dependencies
- Unified UUID generation using PostgreSQL native functions
- Updated all schemas to use PostgreSQL types

## Next Steps

1. Change default admin password
2. Configure email settings
3. Customize branding (logo, colors)
4. Add custom fields if needed
5. Configure backup strategy
