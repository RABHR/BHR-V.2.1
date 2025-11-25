# BrainHR IT Solutions - Job Portal with Admin Dashboard

A comprehensive job portal website with an integrated admin dashboard for managing job postings and candidate applications.

## Features

### Public Website
- **Professional Landing Page**: Modern, responsive design showcasing company services
- **Job Listings**: Dynamic job postings with detailed descriptions and application forms
- **Job Application System**: Complete application form with resume upload functionality
- **Company Information**: About us, services, and contact information

### Admin Dashboard
- **Secure Authentication**: Admin login with session management
- **Job Management**: Create, edit, and delete job postings
- **Candidate Management**: View and manage job applications
- **Resume Downloads**: Individual and bulk resume download functionality
- **Search & Filter**: Advanced filtering by job, candidate name, and status
- **Bulk Operations**: Select multiple candidates for batch operations
- **Export Functionality**: Export candidate data to Excel format
- **Real-time Statistics**: Dashboard with application counts and metrics

## Technology Stack

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern UI component library
- **Lucide React**: Icon library

### Backend
- **Flask**: Python web framework
- **SQLite**: Lightweight database
- **Flask-CORS**: Cross-origin resource sharing
- **Pandas**: Data manipulation and Excel export
- **Werkzeug**: Security utilities

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install flask flask-cors pandas python-dotenv xlsxwriter
   ```

3. Start the backend server:
   ```bash
   python app.py
   ```
   The backend will run on http://localhost:5000

### Frontend Setup
1. Install Node.js dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will run on http://localhost:3000

### Full Stack Development
Run both frontend and backend simultaneously:
```bash
npm run dev:full
```

## Admin Access

### Default Admin Credentials
- **Username**: BHRadmin
- **Password**: BHR@6789$

### Admin Dashboard Features
1. **Login**: Access via `/admin/login`
2. **Dashboard**: Main admin interface at `/admin`
3. **Job Management**: Create, edit, and delete job postings
4. **Candidate Profiles**: View applications in tabular format
5. **Resume Management**: Download individual or multiple resumes
6. **Bulk Operations**: Select all candidates and perform batch actions
7. **Export Data**: Export candidate information to Excel

## Database Schema

### Jobs Table
- id (Primary Key)
- title
- location
- description
- visa_constraints
- active (Boolean)
- created_at

### Applications Table
- id (Primary Key)
- name
- email
- contact_no
- linkedin
- location
- visa_status
- relocation
- experience_years
- job_id (Foreign Key)
- job_title
- resume_filename
- applied_at
- viewed (Boolean)

## API Endpoints

### Public Endpoints
- `GET /api/jobs` - Get active job listings
- `POST /api/apply` - Submit job application

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/check` - Check authentication status
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/jobs` - Get all jobs with application counts
- `POST /api/admin/jobs` - Create new job
- `DELETE /api/admin/jobs/{id}` - Delete job
- `GET /api/admin/applications` - Get all applications
- `DELETE /api/admin/applications/{id}` - Delete application
- `POST /api/admin/applications/delete` - Bulk delete applications
- `GET /api/admin/download/resume/{filename}` - Download resume
- `POST /api/admin/download/resumes` - Download multiple resumes as ZIP
- `POST /api/admin/export/excel` - Export applications to Excel

## File Structure

```
brainhrits-test/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin pages
│   ├── jobs/              # Job listings page
│   ├── company/           # Company information
│   ├── contact/           # Contact page
│   └── services/          # Services page
├── backend/               # Flask backend
│   ├── app.py            # Main Flask application
│   ├── brainhr.db        # SQLite database
│   └── uploads/          # Resume file storage
├── components/            # Reusable React components
├── lib/                  # Utility libraries
│   └── adminApi.ts       # API client for admin operations
├── public/               # Static assets
└── styles/               # Global styles
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Create a `.env` file in the backend directory:
```
SECRET_KEY=your-secret-key-here
SMTP_SERVER=your-smtp-server
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
HR_EMAIL=hr@brainhritsolutions.com
```

## Security Features

- **Password Hashing**: Admin passwords are securely hashed
- **Session Management**: Secure session handling with HTTP-only cookies
- **File Upload Validation**: Resume uploads are validated for file type and size
- **CORS Configuration**: Properly configured cross-origin requests
- **SQL Injection Prevention**: Parameterized queries for database operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software owned by BrainHR IT Solutions.

## Support

For technical support or questions, please contact the development team.



# BrainHR IT Solutions - Job Portal Repository

## Repository Summary

BrainHR IT Solutions is a full-stack job portal application with an integrated admin dashboard. The repository contains a modern Next.js frontend for job listings and applications, coupled with a Python Flask backend API for data management, authentication, and resume handling. The application enables candidates to apply for positions and provides administrators with comprehensive tools to manage job postings, applications, and candidate information.

## Repository Structure

The project is organized as a monorepo with two primary components:

- **Frontend** (`/app`, `/components`, `/lib`, `/hooks`): Next.js application serving the public job portal and admin dashboard
- **Backend** (`/backend`): Flask REST API handling job management, applications, authentication, and file operations
- **Shared Assets** (`/public`): Static files and images for the frontend
- **Configuration**: Root-level config files for TypeScript, ESLint, Tailwind CSS, and PostCSS

### Main Repository Components

- **Frontend Application**: React-based single-page application for job browsing and application submission
- **Admin Dashboard**: Secure admin interface for job and candidate management built within the Next.js app
- **REST API Server**: Flask backend providing endpoints for jobs, applications, authentication, and file operations
- **Database Layer**: SQLite database for persistent storage of jobs and applications
- **File Management System**: Resume upload and download functionality with ZIP packaging support
- **GitHub Actions**: CI/CD pipeline for automated deployments to GitHub Pages

## Projects

### Next.js Frontend Application

**Configuration Files**: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`

#### Language & Runtime

**Language**: TypeScript (5.2.2), React (19.0.0)
**Runtime**: Node.js 20+ (from GitHub Actions workflow)
**Framework**: Next.js 15.5.3 with App Router
**Build System**: Next.js built-in build system
**Package Manager**: npm

#### Dependencies

**Main Dependencies**:
- **UI Framework**: Radix UI components, shadcn/ui, Lucide React icons
- **Styling**: Tailwind CSS 3.3.3, Tailwind Merge, tailwindcss-animate
- **Form Handling**: React Hook Form 7.55.0, zod 3.24.2 (validation)
- **Data Visualization**: Recharts 2.15.2
- **Utilities**: date-fns 4.1.0, file-saver 2.0.5, jszip 3.10.1
- **Carousel**: Embla Carousel React 8.6.0
- **Routing**: Next.js built-in routing with dynamic segments
- **Layout**: React Resizable Panels, vaul (drawer component)
- **Notifications**: Sonner 2.0.3, React Hot Toast (via hooks)
- **Themes**: next-themes 0.4.6, next-seo 6.6.0

**Development Dependencies**:
- @types/file-saver, @types/node, @types/react, @types/react-dom
- TypeScript, ESLint, Next.js ESLint config

#### Build & Installation

```bash
npm install
npm run build
npm run start
npm run dev
npm run lint
```

Development with concurrent backend and frontend:
```bash
npm run dev:full
```

#### Configuration Details

- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to root)
- **Next.js Config**: Image optimization disabled for localhost, CORS configured for Flask backend at `http://localhost:5000`
- **Tailwind CSS**: Dark mode via class, extended color system with CSS variables, custom animations
- **PostCSS**: Standard configuration with Tailwind and Autoprefixer
- **ESLint**: Extends `next/core-web-vitals`

### Flask Backend API

**Configuration Files**: `requirements.txt`, `app.py`, `.env`

#### Language & Runtime

**Language**: Python 3.8+
**Framework**: Flask 2.3.3
**Runtime**: Python with virtual environment (`/backend/venv`)
**Package Manager**: pip
**Database**: SQLite 3

#### Dependencies

**Main Dependencies**:
- **Web Framework**: Flask 2.3.3
- **CORS**: Flask-CORS 4.0.0
- **Security**: Werkzeug 2.3.7 (password hashing, file utilities)
- **Data Processing**: pandas 2.3.2, openpyxl 3.1.2 (Excel export)
- **Environment Management**: python-dotenv

#### Build & Installation

```bash
cd backend
pip install -r requirements.txt
python app.py
```

Server runs on `http://localhost:5000`

#### Main Application Structure

**Database Tables**:
- `applications`: Candidate applications with contact info, experience, visa status, resume reference
- `jobs`: Job postings with title, location, description, visa constraints
- `courses`: Course catalog with metadata (video URLs, skills, level, duration)

**Core Features**:
- Admin authentication with session-based login
- Job posting management (CRUD operations)
- Application submission with resume upload
- Application viewing and filtering
- Bulk operations (delete, export to Excel, download resumes as ZIP)
- Email notifications for new applications (SMTP-based)
- File upload handling (resumés stored in `/backend/uploads`)

**Key API Endpoints**:
- Public: `GET /api/jobs`, `POST /api/apply`, `GET /api/public/courses`
- Admin (auth required): `/api/admin/login`, `/api/admin/logout`, `/api/admin/check`, `/api/admin/jobs`, `/api/admin/applications`, `/api/admin/download/*`, `/api/admin/export/excel`, `/api/admin/courses`

#### Configuration

- **CORS**: Allowed origins are `http://localhost:3000` and `http://127.0.0.1:3000`
- **File Upload**: Max size 5MB, supported formats: PDF, DOC, DOCX
- **Session Security**: HTTP-only cookies, Lax SameSite policy, 1-day lifetime
- **Default Admin Credentials**: Username `BHRadmin`, Password `BHR@6789$`
- **Environment Variables**: SECRET_KEY, SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, HR_EMAIL

### GitHub Actions Deployment

**Workflow File**: `.github/workflows/nextjs.yml`

**Trigger**: Pushes to `develop` branch
**Process**:
- Node.js 20 setup
- npm installation via `npm ci`
- Next.js build
- Artifact upload
- Deployment to GitHub Pages

## Build & Installation Commands

**Full Stack Setup**:
```bash
npm install
cd backend && pip install -r requirements.txt
```

**Development**:
```bash
npm run dev:full
```

**Production Build**:
```bash
npm run build
npm run start
```

**Backend Only**:
```bash
npm run backend
```

## Summary

BrainHR IT Solutions is a comprehensive full-stack job portal featuring a modern React/Next.js frontend with TypeScript type safety, styled with Tailwind CSS and shadcn/ui components, and a Flask REST API backend with SQLite persistence. The application supports job browsing, candidate applications with resume uploads, admin authentication, bulk operations, and Excel export functionality. Development workflow supports concurrent frontend and backend execution via npm scripts, with GitHub Actions CI/CD for automated deployment.

