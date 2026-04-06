# API Reference

Changeloger exposes a RESTful JSON API consumed by the frontend (via Axios + TanStack Query) and, in the future, by third-party integrations.

## Base URL

```
https://your-domain.com/api
```

Development: `http://localhost:3000/api`

## Authentication

All endpoints require authentication via JWT bearer token stored in httpOnly cookies, except:

- OAuth initiation and callback endpoints
- Widget serving endpoints (authenticated by embed token)
- Webhook receiver endpoints (authenticated by signature)

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

Common error codes:

| HTTP Status | Code | Description |
|-------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body or parameters |
| 401 | `AUTH_ERROR` | Missing or invalid authentication |
| 402 | `BILLING_ERROR` | Plan limit reached, upgrade required |
| 403 | `FORBIDDEN` | Insufficient role permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMIT` | Too many requests |
| 500 | `INTERNAL_ERROR` | Unexpected server error |

---

## Auth Endpoints

### `GET /api/auth/google`

Initiates Google OAuth 2.0 flow. Redirects the user to Google's authorization page.

**Auth:** None

**Response:** `302 Redirect` to Google OAuth

---

### `GET /api/auth/github`

Initiates GitHub OAuth 2.0 flow. Redirects the user to GitHub's authorization page.

**Auth:** None

**Response:** `302 Redirect` to GitHub OAuth

---

### `GET /api/auth/callback/:provider`

OAuth callback handler. Exchanges authorization code for tokens, creates or links user account, sets session cookies.

**Auth:** None

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `provider` | path | `google` or `github` |
| `code` | query | Authorization code from OAuth provider |

**Response:** `302 Redirect` to `/dashboard` on success, `/sign-in?error=...` on failure.

---

### `POST /api/auth/logout`

Invalidates the current session and clears cookies.

**Auth:** JWT

**Response:**

```json
{ "success": true }
```

---

### `GET /api/auth/me`

Returns the current authenticated user's profile.

**Auth:** JWT

**Response:**

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatarUrl": "https://...",
  "providers": ["google", "github"]
}
```

---

## Workspace Endpoints

### `GET /api/workspaces`

List all workspaces the authenticated user is a member of.

**Auth:** JWT

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "My Workspace",
    "slug": "my-workspace",
    "plan": "free",
    "_count": { "members": 1, "repositories": 2 }
  }
]
```

---

### `POST /api/workspaces`

Create a new workspace.

**Auth:** JWT

**Request Body:**

```json
{
  "name": "My Team",
  "slug": "my-team"
}
```

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `name` | string | Yes | 1-100 characters |
| `slug` | string | Yes | 1-50 chars, lowercase alphanumeric + hyphens |

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "name": "My Team",
  "slug": "my-team",
  "plan": "free"
}
```

---

### `GET /api/workspaces/:id/members`

List all members of a workspace.

**Auth:** JWT (any role)

**Response:**

```json
[
  {
    "id": "uuid",
    "role": "owner",
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "avatarUrl": "https://..."
    }
  }
]
```

---

### `POST /api/workspaces/:id/invitations`

Invite a new member to the workspace.

**Auth:** JWT (admin+)

**Request Body:**

```json
{
  "email": "colleague@company.com",
  "role": "editor"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `email` | string | Yes | Valid email |
| `role` | string | Yes | `viewer`, `editor`, `admin` |

**Response:** `201 Created`

---

## Repository Endpoints

### `GET /api/repositories?workspaceId=:id`

List repositories connected to a workspace.

**Auth:** JWT

**Query Parameters:**

| Param | Type | Required |
|-------|------|----------|
| `workspaceId` | uuid | Yes |

**Response:**

```json
[
  {
    "id": "uuid",
    "name": "my-repo",
    "fullName": "owner/my-repo",
    "language": "TypeScript",
    "isActive": true,
    "defaultBranch": "main",
    "githubInstallation": { "accountLogin": "owner" },
    "_count": { "releases": 3, "changeRecords": 42 }
  }
]
```

---

### `POST /api/repositories`

Connect a new repository.

**Auth:** JWT (admin+)

**Request Body:**

```json
{
  "workspaceId": "uuid",
  "githubInstallationId": "uuid",
  "githubRepoId": 123456,
  "name": "my-repo",
  "fullName": "owner/my-repo",
  "defaultBranch": "main",
  "language": "TypeScript"
}
```

---

### `GET /api/repositories/:id`

Get repository details and configuration.

**Auth:** JWT

---

### `PATCH /api/repositories/:id`

Update repository configuration.

**Auth:** JWT

**Request Body:**

```json
{
  "config": {
    "monitoredBranches": ["main", "develop"],
    "ignorePaths": ["*.lock", "dist/**"],
    "aiEnabled": true
  },
  "isActive": true
}
```

---

### `DELETE /api/repositories/:id`

Disconnect a repository.

**Auth:** JWT

---

## Release Endpoints

### `GET /api/repositories/:id/releases`

List changelog releases for a repository.

**Auth:** JWT

**Query Parameters:**

| Param | Type | Values |
|-------|------|--------|
| `status` | string | `draft`, `published`, `archived` |

---

### `POST /api/repositories/:id/releases`

Create a new draft release.

**Auth:** JWT

**Request Body:**

```json
{
  "version": "1.2.0",
  "summary": "Optional summary"
}
```

---

### `GET /api/repositories/:id/releases/:version`

Get a specific release with all entries.

**Auth:** JWT

**Response:**

```json
{
  "id": "uuid",
  "version": "1.2.0",
  "status": "draft",
  "entries": [
    {
      "id": "uuid",
      "category": "added",
      "title": "OAuth 2.0 support",
      "description": "Added Google and GitHub sign-in",
      "impact": "high",
      "breaking": false,
      "position": 0,
      "reviewed": false
    }
  ]
}
```

---

### `PUT /api/repositories/:id/releases/:version`

Update release metadata.

**Auth:** JWT (editor+)

---

### `POST /api/repositories/:id/releases/:version/publish`

Publish a draft release.

**Auth:** JWT (editor+)

Validates all entries have titles, generates Markdown/HTML/JSON outputs, creates revision snapshot, updates widget cache.

**Response:**

```json
{
  "release": { "...": "published release data" },
  "markdown": "## [1.2.0] - 2026-03-31\n...",
  "html": "<article>...</article>",
  "json": { "version": "1.2.0", "entries": [] }
}
```

---

## Entry Endpoints

### `GET /api/repositories/:id/releases/:version/entries`

List entries for a release, ordered by position.

**Auth:** JWT

---

### `POST /api/repositories/:id/releases/:version/entries`

Create a new changelog entry.

**Auth:** JWT (editor+)

**Request Body:**

```json
{
  "category": "added",
  "title": "New feature description",
  "description": "Optional detailed description",
  "impact": "medium",
  "breaking": false
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `category` | string | Yes | `added`, `fixed`, `changed`, `removed`, `deprecated`, `security`, `performance`, `documentation`, `maintenance`, `breaking` |
| `title` | string | Yes | Min 1 character |
| `description` | string | No | |
| `impact` | string | No | `critical`, `high`, `medium`, `low`, `negligible` |
| `breaking` | boolean | No | Default `false` |

---

### `PATCH /api/repositories/:id/releases/:version/entries`

Bulk reorder entries.

**Auth:** JWT (editor+)

**Request Body:**

```json
{
  "orderedIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

---

### `PATCH /api/repositories/:id/releases/:version/entries/:entryId`

Update a single entry.

**Auth:** JWT (editor+)

**Request Body:** Any subset of entry fields (category, title, description, impact, breaking, reviewed).

---

### `DELETE /api/repositories/:id/releases/:version/entries/:entryId`

Delete an entry.

**Auth:** JWT (editor+)

---

## Widget Endpoints

### `GET /api/widgets?repositoryId=:id`

List widgets for a repository.

**Auth:** JWT

---

### `POST /api/widgets`

Create a new widget.

**Auth:** JWT

**Request Body:**

```json
{
  "repositoryId": "uuid",
  "type": "page",
  "config": { "primaryColor": "#6C63FF", "darkMode": true },
  "domains": ["example.com"]
}
```

| Field | Type | Values |
|-------|------|--------|
| `type` | string | `page`, `modal`, `badge` |

---

### `GET /api/widgets/:embedToken/changelog`

Serve changelog data for an embedded widget.

**Auth:** Embed token (in URL)

**Response:**

```json
{
  "config": {},
  "type": "page",
  "releases": [
    {
      "version": "1.2.0",
      "date": "2026-03-31T00:00:00Z",
      "entries": [
        {
          "id": "uuid",
          "category": "added",
          "title": "New feature",
          "description": "Details",
          "breaking": false
        }
      ]
    }
  ]
}
```

**Headers:** `Cache-Control: public, max-age=60`, `Access-Control-Allow-Origin: *`

---

### `POST /api/widgets/:embedToken/events`

Ingest analytics events from widgets.

**Auth:** Embed token (in URL)

**Request Body:**

```json
{
  "events": [
    {
      "eventType": "page_view",
      "visitorHash": "abc123",
      "referrer": "https://docs.example.com",
      "metadata": { "widgetType": "page" }
    }
  ]
}
```

| Event Type | Description |
|------------|-------------|
| `page_view` | Widget loaded |
| `entry_click` | User clicked/expanded an entry |
| `scroll_depth` | Scroll milestone reached (25/50/75/100%) |
| `session_end` | User left the page |

---

## Webhook Endpoints

### `POST /api/webhooks/github`

GitHub App webhook receiver. Processes push, create (tag), and release events.

**Auth:** HMAC SHA-256 signature (`X-Hub-Signature-256` header)

---

### `POST /api/webhooks/polar`

Polar billing webhook receiver. Processes subscription lifecycle events.

**Auth:** HMAC SHA-256 signature (`X-Polar-Signature` header)

---

## Billing Endpoints

### `POST /api/billing/checkout`

Initiate a Polar checkout session for a workspace.

**Auth:** JWT

**Request Body:**

```json
{
  "workspaceId": "uuid",
  "priceId": "polar-price-id"
}
```

**Response:**

```json
{ "url": "https://checkout.polar.sh/..." }
```

---

### `POST /api/billing/portal`

Get a Polar customer portal URL for self-service plan management.

**Auth:** JWT

**Request Body:**

```json
{ "workspaceId": "uuid" }
```

**Response:**

```json
{ "url": "https://portal.polar.sh/..." }
```

---

## GitHub App Installation

### `GET /api/github/installation`

Handle GitHub App installation callback. Stores installation, syncs repos, redirects to dashboard.

**Auth:** JWT (via cookies)

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `installation_id` | number | GitHub installation ID |
| `setup_action` | string | Must be `install` |

**Response:** `302 Redirect` to `/dashboard/repositories?setup=complete`
