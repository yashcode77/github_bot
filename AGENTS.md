# AGENTS.md

## Project Overview

Build a GitHub automation platform that:

* Authenticates users with GitHub
* Allows users to connect repositories they own
* Receives GitHub webhook events
* Processes events according to user-defined rules
* Writes back to GitHub (labels, comments, etc.)
* Sends Slack notifications
* Displays event and action history in a dashboard

This project is being built for a hiring assignment. The primary goal is a reliable, secure, production-quality implementation that works end-to-end on a public URL.

---

## Core Requirements

The application must provide:

* GitHub authentication
* Repository connection flow
* GitHub webhook endpoint
* Support for at least two webhook event types
* Persistence of received events
* GitHub API write-back capability
* Slack notifications
* Authenticated dashboard
* Public deployment
* README.md
* AI_NOTES.md
* .env.example

---

## Success Criteria

The application should:

- Work end-to-end on a public deployment
- Be secure against forged webhook requests
- Handle duplicate webhook deliveries safely
- Maintain an auditable history of events and actions
- Be easy for reviewers to understand and test

A smaller, complete solution is preferred over a larger, partially working solution.

## Stretch Goals

Implement stretch goals when they provide meaningful value without significantly increasing complexity.

Priority order:

1. Configurable rules in the UI
2. AI-powered issue and PR summarization
3. AI-powered issue and PR triage
4. Observability and failure tracking
5. Multi-repository support
6. GitHub App authentication

Prioritize a complete, reliable system over additional features.

Never sacrifice security, deployment quality, or reliability to implement a stretch goal.

---

## Technology Preferences

Use:

### Frontend

* React
* Vite
* Tailwind CSS

### Backend

* Node.js
* Express

### Database

* PostgreSQL
* Prisma ORM

### Deployment

* Vercel (frontend)
* Render (backend)
* Supabase (PostgreSQL)
* ngrok for development and testing (webhooks)

### AI

* Gemini API or Groq free tier

Use the latest stable versions of libraries unless there is a compatibility reason not to.

Prefer current stable and widely adopted patterns.

---

## Architecture Principles

Keep the architecture simple.

Avoid over-engineering.

Avoid unnecessary abstractions.

Build only what is required by the assignment and documented stretch goals.

Prefer readability and maintainability over clever patterns.

Prefer straightforward implementations over enterprise-style complexity.

Before introducing a dependency, explain why it is needed.

Prefer built-in platform features when they are sufficient.

---

## Backend Guidelines

Use a layered structure:

- Routes
- Middleware
- Controllers
- Services
- Database access

Responsibilities:

- Routes define endpoints and attach middleware.
- Middleware handles cross-cutting concerns such as authentication, validation, webhook verification, and error handling.
- Controllers handle HTTP request/response concerns only.
- Services contain business logic.
- Database access is responsible for persistence and queries.

Validate external inputs.

Use async/await consistently.

Use environment variables for configuration.

Never hardcode secrets.

Use structured logging.

---

## Frontend Guidelines

Use functional React components.

Keep components focused and small.

Avoid unnecessary state.

Prefer composition over deeply nested component hierarchies.

Keep UI implementation straightforward.

Optimize for clarity and maintainability.

---

## Frontend Standards

- React + Vite frontend
- Use javascript and not typescript
- Tailwind CSS is the primary styling solution
- shadcn/ui is the component library
- Prefer existing shadcn/ui components over creating custom UI primitives
- Reuse existing components before creating new ones
- Use Tailwind utility classes for styling
- Maintain a consistent design system across the application
- Use React Router for routing
- Use Axios for API communication
- Use Context API for authentication state
- Keep components small and reusable

## Security Requirements

These are mandatory.

* Verify GitHub webhook signatures
* Validate incoming payloads
* Protect authenticated routes
* Never expose secrets to the client
* Never commit secrets to the repository
* Store secrets in environment variables only
* Use secure session handling
* Follow least-privilege principles for external integrations

---

## Reliability Requirements

These are mandatory.

GitHub may:

* Retry deliveries
* Deliver duplicate events
* Deliver events out of order

The application should:

* Track GitHub delivery IDs
* Prevent duplicate processing
* Record processing failures
* Avoid silently losing events
* Log important actions and failures

Keep solutions simple while maintaining correctness.

---

## Database Guidelines

Design the schema around:

* Users
* Connected repositories
* Rules
* GitHub events
* Bot actions

Prefer simple schemas.

Avoid premature optimization.

Avoid unnecessary tables.

---

## AI Features

If implementing AI functionality:

* Summarize issues and pull requests
* Suggest labels
* Suggest priority levels
* Surface AI output in the dashboard
* Include AI output in Slack notifications where useful

Use free-tier AI providers only.

Keep prompts simple and deterministic.

---

## Dashboard Requirements

Authenticated users should be able to:

* View connected repositories
* View received events
* View actions taken by the bot
* View rule matches
* View failures when applicable
* Configure rules if the rules engine is implemented

Favor usability over visual complexity.

---

## Code Quality

Write code as if it will be maintained by another engineer.

Prefer:

* Clear naming
* Small functions
* Predictable control flow
* Consistent formatting

Avoid:

* Dead code
* Premature optimization
* Unused abstractions
* Unnecessary comments

Comments should explain reasoning, not restate code.

---

## Documentation

Keep documentation concise.

README.md should cover:

* Project overview
* Setup
* Environment variables
* Local development
* Deployment
* Testing instructions

AI_NOTES.md should cover:

* AI tools used
* Architecture decisions made by the developer
* Mistakes made by AI and how they were corrected
* Future improvements

---

## Decision Making

When proposing implementation options:

* Prefer simpler solutions
* Explain tradeoffs
* Prioritize reliability
* Prioritize security
* Prioritize successful deployment
* Favor working software over theoretical perfection

When uncertain, choose the simplest solution that satisfies the assignment requirements.
