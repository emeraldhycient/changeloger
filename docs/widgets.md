# Embeddable Widgets

Changeloger provides three types of embeddable widgets that allow teams to surface changelogs directly inside their product, documentation site, or any web page.

## Widget Types

### Page Widget

A full-page changelog rendered into a target `<div>`. Ideal for documentation sites, standalone changelog pages, or footer links.

```html
<div id="changeloger"></div>
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="page"
  data-target="#changeloger"
></script>
```

### Modal Widget

A floating button that opens a modal overlay with changelog content. Ideal for in-app "What's New" experiences.

```html
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="modal"
  data-trigger-text="What's New"
  data-position="bottom-right"
></script>
```

### Badge Widget

A minimal notification indicator (dot or count) that attaches to any element. Shows when new changes are available.

```html
<button id="changelog-trigger">Updates</button>
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_EMBED_TOKEN"
  data-type="badge"
  data-target="#changelog-trigger"
  data-style="dot"
></script>
```

## Configuration

All widgets are configured via the dashboard UI or data attributes on the script tag.

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-token` | UUID | Required. Your widget embed token. |
| `data-type` | `page`, `modal`, `badge` | Widget type. |
| `data-target` | CSS selector | Target element (page and badge types). |
| `data-theme` | `light`, `dark`, `auto` | Color scheme. Default: `auto`. |
| `data-primary-color` | Hex color | Primary brand color. |
| `data-position` | `bottom-right`, `bottom-left` | Modal trigger position. |
| `data-trigger-text` | String | Modal button text. |
| `data-style` | `dot`, `count` | Badge display style. |
| `data-analytics` | `true`, `false` | Enable/disable analytics. Default: `true`. |
| `data-no-analytics` | (presence) | Opt out of analytics (GDPR). |

### Dashboard Configuration

From Settings > Widgets, you can configure:

- Brand colors (primary, accent, background)
- Font family override
- Company logo
- Category visibility toggles
- Dark mode / light mode / auto
- Domain whitelisting
- Custom CSS class injection

## Performance

- Widget bundle: less than 30 KB gzipped
- Initial render: under 200 ms
- Script loaded asynchronously (does not block host page)
- Changelog data is edge-cached with 60-second TTL
- Cache invalidated automatically on publish

## Analytics Events

When analytics are enabled, widgets fire the following events:

| Event | Trigger | Data |
|-------|---------|------|
| `page_view` | Widget loads | Widget type, referrer, visitor hash |
| `entry_click` | User clicks/expands an entry | Entry ID, version |
| `scroll_depth` | Scroll milestones (25/50/75/100%) | Depth percentage |
| `session_end` | Page unload | Session duration |

Events are batched and sent every 5 seconds to minimize network overhead.

### GDPR Opt-Out

Add `data-no-analytics` to the script tag to disable all analytics collection:

```html
<script
  async
  src="https://cdn.changeloger.com/widget.js"
  data-token="YOUR_TOKEN"
  data-type="page"
  data-no-analytics
></script>
```

No cookies are used. Visitor identification relies on an anonymized hash of user agent, screen resolution, and timezone. No personally identifiable information is collected or stored.

## Auto-Update

When a new changelog version is published:

- Widgets on next page load fetch fresh content automatically.
- Open modals display a "New version available" notification.
- No redeployment of the host application is required.

## Domain Whitelisting

For security, you can restrict which domains are allowed to use your embed token. Configure this in the dashboard under Widget Settings > Allowed Domains. Requests from non-whitelisted domains will receive a 403 response.

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/widgets/:token/changelog` | GET | Embed token | Fetch changelog data |
| `/api/widgets/:token/events` | POST | Embed token | Submit analytics events |
| `/api/widgets` | GET/POST | JWT | Manage widgets |
