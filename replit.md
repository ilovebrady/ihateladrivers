# IHATELADRIVERS - Community Driving Report Platform

## Overview

A community-driven web application for reporting and tracking bad drivers in Los Angeles. Users can upload photos of license plates, rate drivers, add comments, and browse a leaderboard of the worst-rated drivers. The platform uses AI to automatically extract license plate numbers from uploaded images.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Animations**: Framer Motion for page transitions and interactions
- **Build Tool**: Vite with HMR support

The frontend follows a pages-based architecture with reusable components. Key pages include Home (leaderboard), Report (submit new reports), Search (find plates), and PlateDetails (view plate history).

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints with Zod validation schemas defined in `shared/routes.ts`
- **Build**: esbuild for production bundling with selective dependency bundling for cold start optimization

The server uses a storage abstraction layer (`IStorage` interface) for database operations, making it testable and allowing for different storage implementations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` for domain models, `shared/models/` for integration models
- **Migrations**: Drizzle Kit with `db:push` command
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

Core tables:
- `plates` - License plate records
- `reports` - User-submitted reports with ratings, comments, and images
- `users` - User accounts (Replit Auth integration)
- `sessions` - Session management
- `conversations`/`messages` - Chat functionality

### Authentication
- **Provider**: Replit Auth via OpenID Connect
- **Session Management**: Express-session with PostgreSQL store
- **Implementation**: Located in `server/replit_integrations/auth/`

Protected routes use the `isAuthenticated` middleware. User data is upserted on login.

### AI Integrations
- **License Plate Analysis**: OpenAI API for extracting license plate numbers from uploaded images
- **Image Generation**: GPT-Image-1 model via Replit AI Integrations
- **Chat**: OpenAI-powered chat functionality

## External Dependencies

### Third-Party Services
- **OpenAI API**: Used for image analysis (license plate extraction) and chat completions
  - Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL`
- **Replit Auth**: OpenID Connect authentication provider
  - Configured via `ISSUER_URL` and `REPL_ID`

### Database
- **PostgreSQL**: Primary database
  - Connection via `DATABASE_URL` environment variable

### Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- `AI_INTEGRATIONS_OPENAI_API_KEY` - OpenAI API key
- `AI_INTEGRATIONS_OPENAI_BASE_URL` - OpenAI API base URL
- `REPL_ID` - Replit deployment identifier

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Server state management
- `react-dropzone` - File upload handling
- `framer-motion` - Animations
- `openai` - AI API client
- `passport` / `openid-client` - Authentication