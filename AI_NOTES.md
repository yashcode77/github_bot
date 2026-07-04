# AI_NOTES.md

## AI Usage Summary

I used AI throughout the project using:

* Cursor (free tier, default models)
* Windsurf (free tier, default models)

AI acted as a coding assistant for implementation, code reviews, debugging suggestions, and refactoring. My workflow was to define the requirements and architecture myself, use AI to generate an initial implementation, then manually review, test, and refine the solution. AI was especially helpful for GitHub OAuth, webhook handling, Prisma queries, React components, and deployment troubleshooting.

---

## Key Decisions I Made

### 1. Event-Centric Design

I chose to persist webhook events and bot actions in the database instead of processing them only in memory.

**Why:** This enabled the dashboard audit log, improved debugging, and provided a foundation for observability and future retry mechanisms.

### 2. Layered Backend Architecture

I separated routes, controllers, services, and database access into distinct layers.

**Why:** This kept business logic independent from HTTP concerns and made GitHub and Slack integrations easier to maintain and extend.

### 3. Webhook Security & Reliability

I implemented webhook signature verification and delivery deduplication.

**Why:** This prevents forged requests and avoids duplicate processing when GitHub retries webhook deliveries.

---

## Hardest AI-Led Wrong Turn

One of the more interesting issues involved webhook processing reliability.

The initial AI-generated implementation assumed that each GitHub webhook delivery would only arrive once. During testing, I noticed duplicate Slack notifications and repeated GitHub actions for certain events.

After investigating GitHub's webhook behavior, I discovered that GitHub can legitimately resend deliveries. The solution was to store GitHub delivery IDs and make webhook processing idempotent by ignoring deliveries that had already been processed.

This reinforced an important lesson: AI is excellent at generating working code quickly, but production concerns such as retries, idempotency, and failure handling still require careful engineering judgment.

---

## What I Would Add With More Time

* More advanced rule conditions (AND/OR logic, label filters, author filters).
* AI-powered issue and PR triage with summaries and label suggestions.
* Retry queues and failure recovery for external API calls.
* Migration from OAuth to a GitHub App authentication model.
