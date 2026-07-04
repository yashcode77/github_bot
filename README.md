# GitHub Bot

A GitHub automation platform that authenticates users with GitHub, connects repositories, processes webhook events according to user-defined rules, and sends Slack notifications.

## Features

- GitHub OAuth authentication
- Repository connection and webhook management
- Configurable rules engine for event processing
- Connect multiple repositories
- GitHub API write-back (labels, comments)
- Slack notifications
- Authenticated dashboard for monitoring events and actions

## Technology Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma ORM
- Passport.js (GitHub OAuth)
- JWT authentication

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or Supabase)
- GitHub account
- Slack workspace (optional, for notifications)
- ngrok (for local webhook testing)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd github_bot
```

### 2. Database Setup

#### Option A: Local PostgreSQL

Install PostgreSQL and create a database:

```bash
# Create a database
createdb github_bot
```

#### Option B: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Navigate to Settings > Database
4. Copy the connection string

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your configuration (see Environment Variables section below)

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: GitHub Bot (or your preferred name)
   - **Homepage URL**: `http://localhost:5173`
   - **Application description**: GitHub automation platform
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
4. Click "Register application"
5. Copy the **Client ID** and generate a **Client Secret**
6. Add these to your backend `.env` file:
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback
   ```

## Slack Setup (Optional)

### Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App"
3. Choose "From scratch"
4. Name your app and select your workspace
5. Navigate to "Incoming Webhooks"
6. Toggle "Activate Incoming Webhooks"
7. Click "Add New Webhook to Workspace"
8. Select the channel where notifications should be sent
9. Copy the webhook URL
10. Add it to your backend `.env` file (or configure it in the dashboard after logging in):
    ```
    SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
    ```

### Permissions

The Slack webhook URL will be used to send notifications about:
- New issues and pull requests
- Rule matches
- Bot actions taken

## Environment Variables

Create a `backend/.env` file with the following variables:

```env
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_oauth_app_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/auth/github/callback

# JWT Configuration
JWT_SECRET=replace_with_at_least_32_random_characters
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=7

# Encryption (for storing GitHub tokens)
# Generate with: openssl rand -hex 32
ENCRYPTION_KEY=replace_with_64_character_hex_string

# Session
SESSION_SECRET=replace_with_at_least_32_random_characters

# URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3001

# GitHub Webhook Secret
# Generate a random string for webhook verification
GITHUB_WEBHOOK_SECRET=replace_with_at_least_32_random_characters
```

### Generating Secrets

Use these commands to generate secure random strings:

```bash
# JWT_SECRET and SESSION_SECRET (32+ characters)
openssl rand -base64 32

# ENCRYPTION_KEY (64 hex characters)
openssl rand -hex 32

# GITHUB_WEBHOOK_SECRET (32+ characters)
openssl rand -base64 32
```

## Webhook Testing with ngrok

For local development, you need to expose your backend to the internet to receive GitHub webhooks:

1. Install ngrok: [ngrok.com/download](https://ngrok.com/download)
2. Start ngrok:
   ```bash
   ngrok http 3001
   ```
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)
4. Update your backend `.env`:
   ```
   BACKEND_URL=https://abc123.ngrok-free.app
   ```
5. When connecting a repository in the dashboard, the webhook will be registered using this URL

## Running the Application

### Development Mode

1. Start PostgreSQL database
2. Start backend:
   ```bash
   cd backend
   npm run dev
   ```
3. Start frontend (in a new terminal):
   ```bash
   cd frontend
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser

### Production Mode

1. Build frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Start backend:
   ```bash
   cd backend
   npm start
   ```

## Usage

1. **Login**: Click "Login with GitHub" to authenticate
2. **Connect Repository**: Navigate to Repositories and click "Connect Repository"
3. **Configure Rules**: Create rules to define how events should be processed
4. **Monitor Events**: View received events and bot actions in the dashboard
5. **Configure Slack**: Add your Slack webhook URL in settings to enable notifications

## Database Schema

The application uses the following main models:

- **User**: GitHub user accounts and authentication
- **Repository**: Connected GitHub repositories
- **Rule**: User-defined rules for event processing
- **GitHubEvent**: Received webhook events
- **BotAction**: Actions taken by the bot (labels, comments, Slack notifications)
- **RuleMatch**: Track which rules matched which events