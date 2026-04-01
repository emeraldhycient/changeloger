/**
 * Changeloger Embeddable Widget
 * https://app.changeloger.dev
 *
 * Standalone, self-contained changelog widget. Load via:
 *   <script async src="https://app.changeloger.dev/widget/changeloger.js"
 *           data-token="EMBED_TOKEN" data-type="page"></script>
 *
 * Data attributes:
 *   data-token         (required) Widget embed token UUID
 *   data-type          page | modal | badge (default: page)
 *   data-target        CSS selector for render target (page widget only)
 *   data-theme         light | dark | auto (default: auto)
 *   data-primary-color Hex color (default: #6C63FF)
 *   data-position      bottom-right | bottom-left (modal/badge, default: bottom-right)
 *   data-trigger-text  Custom text for modal trigger (default: What's New)
 *   data-max-releases  Number of releases to show (default: 10)
 *   data-no-analytics  If present, disables analytics tracking
 */
(function () {
  "use strict";

  // ─── Guard: prevent double-initialization ─────────────────────────────────
  if (window.__changeloger_loaded) return;
  window.__changeloger_loaded = true;

  // DOM-based guard: if we already rendered, don't re-init on HMR
  if (document.querySelector("[data-changeloger-rendered]")) return;

  // ─── Constants ────────────────────────────────────────────────────────────
  var PREFIX = "clgr";
  var API_BASE = (function () {
    var scripts = document.querySelectorAll("script[data-token]");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("changeloger") !== -1) {
        var url = new URL(scripts[i].src);
        return url.origin;
      }
    }
    return window.location.origin;
  })();

  var CATEGORY_COLORS = {
    added:       { bg: "#ECFDF5", fg: "#065F46", dot: "#10B981" },
    fixed:       { bg: "#EFF6FF", fg: "#1E40AF", dot: "#3B82F6" },
    changed:     { bg: "#FFFBEB", fg: "#92400E", dot: "#F59E0B" },
    removed:     { bg: "#FEF2F2", fg: "#991B1B", dot: "#EF4444" },
    deprecated:  { bg: "#F9FAFB", fg: "#4B5563", dot: "#9CA3AF" },
    security:    { bg: "#F5F3FF", fg: "#5B21B6", dot: "#8B5CF6" },
    performance: { bg: "#ECFEFF", fg: "#155E75", dot: "#06B6D4" },
    breaking:    { bg: "#FEF2F2", fg: "#991B1B", dot: "#DC2626" }
  };

  var CATEGORY_LABELS = {
    added: "Added", fixed: "Fixed", changed: "Changed", removed: "Removed",
    deprecated: "Deprecated", security: "Security", performance: "Performance",
    breaking: "Breaking"
  };

  // ─── Utilities ────────────────────────────────────────────────────────────

  /** Generate a privacy-friendly visitor hash (no cookies, no PII). */
  function generateVisitorHash() {
    var raw = [
      navigator.userAgent || "",
      screen.width + "x" + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      navigator.language || ""
    ].join("|");
    var hash = 0;
    for (var i = 0; i < raw.length; i++) {
      hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
    }
    return "v_" + Math.abs(hash).toString(36);
  }

  /** Format an ISO date string to a human-readable form. */
  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  /** Compute relative time (e.g. "3 days ago"). */
  function relativeTime(iso) {
    if (!iso) return "";
    var diff = Date.now() - new Date(iso).getTime();
    var mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    if (days < 30) return days + "d ago";
    return formatDate(iso);
  }

  /** Escape HTML to prevent XSS. */
  function esc(str) {
    if (!str) return "";
    var el = document.createElement("span");
    el.textContent = str;
    return el.innerHTML;
  }

  /** Detect if user prefers dark mode. */
  function prefersDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // ─── Styles ───────────────────────────────────────────────────────────────

  function buildCSS(primaryColor, theme) {
    var isDark = theme === "dark" || (theme === "auto" && prefersDark());
    var bg       = isDark ? "#1A1A2E" : "#FFFFFF";
    var bgAlt    = isDark ? "#16213E" : "#F9FAFB";
    var text     = isDark ? "#E2E8F0" : "#1E293B";
    var textMute = isDark ? "#94A3B8" : "#64748B";
    var border   = isDark ? "#334155" : "#E2E8F0";
    var shadow   = isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.08)";

    return "\n" +
    "/* Changeloger Widget — Scoped Styles */\n" +
    "." + PREFIX + "-root *,." + PREFIX + "-root *::before,." + PREFIX + "-root *::after{box-sizing:border-box;margin:0;padding:0;}\n" +
    "." + PREFIX + "-root{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.5;color:" + text + ";-webkit-font-smoothing:antialiased;}\n" +

    /* ── Timeline (shared by page + modal body) ── */
    "." + PREFIX + "-timeline{padding:16px 0;}\n" +
    "." + PREFIX + "-release{position:relative;padding:0 0 32px 0;}\n" +
    "." + PREFIX + "-release:last-child{padding-bottom:0;}\n" +
    "." + PREFIX + "-release-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;flex-wrap:wrap;}\n" +
    "." + PREFIX + "-version{display:inline-flex;align-items:center;padding:3px 10px;border-radius:9999px;font-size:13px;font-weight:600;background:" + primaryColor + ";color:#fff;}\n" +
    "." + PREFIX + "-date{font-size:12px;color:" + textMute + ";}\n" +
    "." + PREFIX + "-repo{font-size:11px;color:" + textMute + ";background:" + bgAlt + ";padding:2px 8px;border-radius:4px;}\n" +
    "." + PREFIX + "-entries{display:flex;flex-direction:column;gap:8px;}\n" +
    "." + PREFIX + "-entry{display:flex;align-items:flex-start;gap:10px;padding:10px 14px;border-radius:8px;background:" + bgAlt + ";border:1px solid " + border + ";transition:box-shadow .15s,border-color .15s;cursor:default;}\n" +
    "." + PREFIX + "-entry:hover{box-shadow:0 2px 8px " + shadow + ";border-color:" + primaryColor + "30;}\n" +
    "." + PREFIX + "-entry-breaking{border-left:3px solid #EF4444;}\n" +
    "." + PREFIX + "-cat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;margin-top:6px;}\n" +
    "." + PREFIX + "-cat-badge{display:inline-flex;align-items:center;padding:1px 7px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.03em;flex-shrink:0;}\n" +
    "." + PREFIX + "-entry-body{flex:1;min-width:0;}\n" +
    "." + PREFIX + "-entry-title{font-weight:600;font-size:14px;color:" + text + ";}\n" +
    "." + PREFIX + "-entry-desc{font-size:13px;color:" + textMute + ";margin-top:2px;}\n" +
    "." + PREFIX + "-breaking-tag{display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;color:#DC2626;background:#FEE2E2;padding:1px 6px;border-radius:3px;margin-left:6px;text-transform:uppercase;}\n" +
    "." + PREFIX + "-empty{text-align:center;padding:40px 20px;color:" + textMute + ";}\n" +

    /* ── Divider line between releases ── */
    "." + PREFIX + "-divider{border:0;border-top:1px solid " + border + ";margin:0 0 24px 0;}\n" +

    /* ── Modal widget ── */
    "." + PREFIX + "-trigger{position:fixed;z-index:999998;display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border:none;border-radius:9999px;background:" + primaryColor + ";color:#fff;font-size:14px;font-weight:600;cursor:pointer;box-shadow:0 4px 14px " + primaryColor + "55;transition:transform .2s,box-shadow .2s;font-family:inherit;}\n" +
    "." + PREFIX + "-trigger:hover{transform:translateY(-2px);box-shadow:0 6px 20px " + primaryColor + "66;}\n" +
    "." + PREFIX + "-trigger-br{bottom:24px;right:24px;}\n" +
    "." + PREFIX + "-trigger-bl{bottom:24px;left:24px;}\n" +
    "." + PREFIX + "-trigger-icon{font-size:16px;line-height:1;}\n" +
    "." + PREFIX + "-overlay{position:fixed;inset:0;z-index:999999;background:rgba(0,0,0,.35);opacity:0;transition:opacity .25s;pointer-events:none;}\n" +
    "." + PREFIX + "-overlay-open{opacity:1;pointer-events:auto;}\n" +
    "." + PREFIX + "-panel{position:fixed;top:0;bottom:0;z-index:1000000;width:420px;max-width:100vw;background:" + bg + ";box-shadow:-4px 0 24px " + shadow + ";display:flex;flex-direction:column;transition:transform .3s cubic-bezier(.4,0,.2,1);}\n" +
    "." + PREFIX + "-panel-right{right:0;transform:translateX(100%);}\n" +
    "." + PREFIX + "-panel-left{left:0;transform:translateX(-100%);}\n" +
    "." + PREFIX + "-panel-open{transform:translateX(0);}\n" +
    "." + PREFIX + "-panel-header{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;border-bottom:1px solid " + border + ";flex-shrink:0;}\n" +
    "." + PREFIX + "-panel-title{font-size:17px;font-weight:700;color:" + text + ";}\n" +
    "." + PREFIX + "-panel-close{width:32px;height:32px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;cursor:pointer;border-radius:6px;color:" + textMute + ";font-size:20px;transition:background .15s;}\n" +
    "." + PREFIX + "-panel-close:hover{background:" + bgAlt + ";}\n" +
    "." + PREFIX + "-panel-body{flex:1;overflow-y:auto;padding:8px 20px 20px;}\n" +
    "." + PREFIX + "-powered{text-align:center;padding:12px;font-size:11px;color:" + textMute + ";border-top:1px solid " + border + ";flex-shrink:0;}\n" +
    "." + PREFIX + "-powered a{color:" + primaryColor + ";text-decoration:none;font-weight:600;}\n" +

    /* ── Badge widget ── */
    "." + PREFIX + "-badge-wrap{position:relative;display:inline-block;}\n" +
    "." + PREFIX + "-badge-dot{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:9999px;background:" + primaryColor + ";color:#fff;font-size:11px;font-weight:700;cursor:pointer;border:2px solid " + bg + ";box-shadow:0 2px 6px " + shadow + ";transition:transform .15s;}\n" +
    "." + PREFIX + "-badge-dot:hover{transform:scale(1.15);}\n" +
    "." + PREFIX + "-badge-float{position:fixed;z-index:999998;}\n" +
    "." + PREFIX + "-dropdown{position:absolute;z-index:1000000;width:320px;max-height:420px;background:" + bg + ";border:1px solid " + border + ";border-radius:12px;box-shadow:0 10px 40px " + shadow + ";overflow:hidden;opacity:0;transform:translateY(-8px) scale(.96);transition:opacity .2s,transform .2s;pointer-events:none;}\n" +
    "." + PREFIX + "-dropdown-open{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}\n" +
    "." + PREFIX + "-dropdown-right{right:0;top:calc(100% + 8px);}\n" +
    "." + PREFIX + "-dropdown-left{left:0;top:calc(100% + 8px);}\n" +
    "." + PREFIX + "-dropdown-float-br{position:fixed;bottom:52px;right:24px;}\n" +
    "." + PREFIX + "-dropdown-float-bl{position:fixed;bottom:52px;left:24px;}\n" +
    "." + PREFIX + "-dd-header{padding:14px 16px 10px;font-size:15px;font-weight:700;color:" + text + ";border-bottom:1px solid " + border + ";}\n" +
    "." + PREFIX + "-dd-body{overflow-y:auto;max-height:320px;padding:8px 0;}\n" +
    "." + PREFIX + "-dd-item{display:flex;align-items:flex-start;gap:10px;padding:10px 16px;cursor:default;transition:background .1s;}\n" +
    "." + PREFIX + "-dd-item:hover{background:" + bgAlt + ";}\n" +
    "." + PREFIX + "-dd-footer{text-align:center;padding:10px;border-top:1px solid " + border + ";}\n" +
    "." + PREFIX + "-dd-footer a{font-size:12px;font-weight:600;color:" + primaryColor + ";text-decoration:none;}\n" +
    "." + PREFIX + "-dd-footer a:hover{text-decoration:underline;}\n" +

    /* ── Scrollbar ── */
    "." + PREFIX + "-root ::-webkit-scrollbar{width:6px;}\n" +
    "." + PREFIX + "-root ::-webkit-scrollbar-track{background:transparent;}\n" +
    "." + PREFIX + "-root ::-webkit-scrollbar-thumb{background:" + border + ";border-radius:3px;}\n" +

    /* ── Responsive ── */
    "@media(max-width:480px){." + PREFIX + "-panel{width:100vw;}." + PREFIX + "-dropdown{width:calc(100vw - 32px);}}\n";
  }

  // ─── HTML Builders ────────────────────────────────────────────────────────

  /** Render a single entry row. */
  function renderEntry(entry) {
    var cat = entry.category || "changed";
    var colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.changed;
    var label = CATEGORY_LABELS[cat] || cat;
    var breakingClass = entry.breaking ? " " + PREFIX + "-entry-breaking" : "";
    var breakingTag = entry.breaking
      ? '<span class="' + PREFIX + '-breaking-tag">&#9888; Breaking</span>'
      : "";

    return '<div class="' + PREFIX + "-entry" + breakingClass + '" data-entry-id="' + esc(entry.id) + '">' +
      '<span class="' + PREFIX + '-cat-badge" style="background:' + colors.bg + ";color:" + colors.fg + ';">' + esc(label) + "</span>" +
      '<div class="' + PREFIX + '-entry-body">' +
        '<div class="' + PREFIX + '-entry-title">' + esc(entry.title) + breakingTag + "</div>" +
        (entry.description ? '<div class="' + PREFIX + '-entry-desc">' + esc(entry.description) + "</div>" : "") +
      "</div>" +
    "</div>";
  }

  /** Render a release block. */
  function renderRelease(release, isLast) {
    var repoTag = release.repository
      ? '<span class="' + PREFIX + '-repo">' + esc(release.repository.name) + "</span>"
      : "";

    var entriesHtml = "";
    if (release.entries && release.entries.length) {
      release.entries.forEach(function (e) { entriesHtml += renderEntry(e); });
    }

    return '<div class="' + PREFIX + '-release">' +
      '<div class="' + PREFIX + '-release-header">' +
        '<span class="' + PREFIX + '-version">' + esc(release.version) + "</span>" +
        '<span class="' + PREFIX + '-date">' + formatDate(release.date) + "</span>" +
        repoTag +
      "</div>" +
      '<div class="' + PREFIX + '-entries">' + entriesHtml + "</div>" +
    "</div>" +
    (isLast ? "" : '<hr class="' + PREFIX + '-divider">');
  }

  /** Render the full timeline. */
  function renderTimeline(releases) {
    if (!releases || !releases.length) {
      return '<div class="' + PREFIX + '-empty">No changelog entries yet.</div>';
    }
    var html = '<div class="' + PREFIX + '-timeline">';
    releases.forEach(function (r, i) {
      html += renderRelease(r, i === releases.length - 1);
    });
    html += "</div>";
    return html;
  }

  /** Render a compact entry for the badge dropdown. */
  function renderCompactEntry(entry, releaseDate) {
    var cat = entry.category || "changed";
    var colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.changed;

    return '<div class="' + PREFIX + '-dd-item" data-entry-id="' + esc(entry.id) + '">' +
      '<span class="' + PREFIX + '-cat-dot" style="background:' + colors.dot + ';"></span>' +
      '<div class="' + PREFIX + '-entry-body">' +
        '<div class="' + PREFIX + '-entry-title">' + esc(entry.title) + "</div>" +
        '<div class="' + PREFIX + '-entry-desc">' + relativeTime(releaseDate) + "</div>" +
      "</div>" +
    "</div>";
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  function createAnalytics(token, disabled) {
    var queue = [];
    var visitorHash = generateVisitorHash();
    var flushing = false;
    var intervalId = null;

    function push(eventType, meta, immediate) {
      if (disabled) return;
      queue.push({
        eventType: eventType,
        visitorHash: visitorHash,
        entryId: (meta && meta.entryId) || null,
        referrer: document.referrer || null,
        metadata: meta || {},
        timestamp: new Date().toISOString()
      });
      // Flush immediately for important events
      if (immediate) flush();
    }

    function flush() {
      if (disabled || flushing || !queue.length) return;
      flushing = true;
      var batch = queue.splice(0, queue.length);

      fetch(API_BASE + "/api/widgets/" + token + "/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ events: batch }),
        keepalive: true
      })
      .catch(function () {
        // On failure put events back for retry
        queue.unshift.apply(queue, batch);
      })
      .finally(function () { flushing = false; });
    }

    var visHandler = null;

    function start() {
      if (disabled || intervalId) return;
      intervalId = setInterval(flush, 5000);
      // Also flush on page hide (only attach once)
      if (!visHandler) {
        visHandler = function () {
          if (document.visibilityState === "hidden") flush();
        };
        document.addEventListener("visibilitychange", visHandler);
      }
      window.addEventListener("beforeunload", flush);
    }

    function stop() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      flush();
    }

    return { push: push, flush: flush, start: start, stop: stop };
  }

  /** Attach scroll-depth tracking to a scrollable element. */
  function trackScrollDepth(el, analytics) {
    var milestones = { 25: false, 50: false, 75: false, 100: false };
    el.addEventListener("scroll", function () {
      var pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
      [25, 50, 75, 100].forEach(function (m) {
        if (pct >= m && !milestones[m]) {
          milestones[m] = true;
          analytics.push("scroll_depth", { depth: m });
        }
      });
    });
  }

  /** Attach entry click tracking to a container. */
  function trackEntryClicks(el, analytics) {
    el.addEventListener("click", function (e) {
      var entry = e.target.closest("[data-entry-id]");
      if (entry) {
        analytics.push("entry_click", { entryId: entry.getAttribute("data-entry-id") });
      }
    });
  }

  // ─── Widget Types ─────────────────────────────────────────────────────────

  /** Page widget: inline timeline. */
  function initPageWidget(config) {
    var container;
    if (config.target) {
      container = document.querySelector(config.target);
    }
    if (!container) {
      // Check if we already created a container for this token
      var existingId = PREFIX + "-page-" + config.token;
      container = document.getElementById(existingId);
      if (!container) {
        container = document.createElement("div");
        container.id = existingId;
        if (config.scriptEl && config.scriptEl.parentNode) {
          config.scriptEl.parentNode.insertBefore(container, config.scriptEl.nextSibling);
        } else {
          document.body.appendChild(container);
        }
      }
    }

    container.className = PREFIX + "-root " + PREFIX + "-page";
    container.innerHTML = renderTimeline(config.releases);

    trackEntryClicks(container, config.analytics);
    trackScrollDepth(container.querySelector("." + PREFIX + "-timeline") || container, config.analytics);
    config.analytics.push("page_view", {}, true);
  }

  /** Modal widget: floating trigger + slide-out panel. */
  function initModalWidget(config) {
    var isRight = config.position !== "bottom-left";
    var posClass = isRight ? PREFIX + "-trigger-br" : PREFIX + "-trigger-bl";
    var panelSide = isRight ? PREFIX + "-panel-right" : PREFIX + "-panel-left";

    // Root wrapper
    var root = document.createElement("div");
    root.className = PREFIX + "-root " + PREFIX + "-modal";

    // Trigger button
    var trigger = document.createElement("button");
    trigger.className = PREFIX + "-trigger " + posClass;
    trigger.innerHTML = '<span class="' + PREFIX + '-trigger-icon">&#10024;</span> ' + esc(config.triggerText);
    trigger.setAttribute("aria-label", "Open changelog");

    // Overlay
    var overlay = document.createElement("div");
    overlay.className = PREFIX + "-overlay";

    // Panel
    var panel = document.createElement("div");
    panel.className = PREFIX + "-panel " + panelSide;
    panel.innerHTML =
      '<div class="' + PREFIX + '-panel-header">' +
        '<span class="' + PREFIX + '-panel-title">What\'s New</span>' +
        '<button class="' + PREFIX + '-panel-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="' + PREFIX + '-panel-body">' + renderTimeline(config.releases) + "</div>" +
      '<div class="' + PREFIX + '-powered">Powered by <a href="https://changeloger.dev" target="_blank" rel="noopener">Changeloger</a></div>';

    root.appendChild(trigger);
    root.appendChild(overlay);
    root.appendChild(panel);
    document.body.appendChild(root);

    var isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      overlay.classList.add(PREFIX + "-overlay-open");
      panel.classList.add(PREFIX + "-panel-open");
      trigger.style.display = "none";
      config.analytics.push("page_view", {}, true);
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      overlay.classList.remove(PREFIX + "-overlay-open");
      panel.classList.remove(PREFIX + "-panel-open");
      setTimeout(function () { trigger.style.display = ""; }, 300);
    }

    trigger.addEventListener("click", open);
    overlay.addEventListener("click", close);
    panel.querySelector("." + PREFIX + "-panel-close").addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });

    var body = panel.querySelector("." + PREFIX + "-panel-body");
    trackEntryClicks(body, config.analytics);
    trackScrollDepth(body, config.analytics);
  }

  /** Badge widget: dot/count + dropdown. */
  function initBadgeWidget(config) {
    var isRight = config.position !== "bottom-left";
    var isFloat = !config.target;

    // Collect latest entries (up to 3)
    var latestEntries = [];
    (config.releases || []).forEach(function (r) {
      r.entries.forEach(function (e) {
        if (latestEntries.length < 3) {
          latestEntries.push({ entry: e, date: r.date });
        }
      });
    });

    var totalCount = 0;
    (config.releases || []).forEach(function (r) { totalCount += r.entries.length; });

    // Root
    var root = document.createElement("div");
    root.className = PREFIX + "-root " + PREFIX + "-badge-wrap" + (isFloat ? " " + PREFIX + "-badge-float" : "");
    if (isFloat) {
      root.style.cssText = isRight ? "bottom:24px;right:24px;" : "bottom:24px;left:24px;";
    }

    // Badge dot
    var dot = document.createElement("span");
    dot.className = PREFIX + "-badge-dot";
    dot.textContent = totalCount > 99 ? "99+" : String(totalCount || "");
    dot.setAttribute("aria-label", totalCount + " changelog updates");

    // Dropdown
    var ddPosClass;
    if (isFloat) {
      ddPosClass = isRight ? PREFIX + "-dropdown-float-br" : PREFIX + "-dropdown-float-bl";
    } else {
      ddPosClass = isRight ? PREFIX + "-dropdown-right" : PREFIX + "-dropdown-left";
    }

    var dropdown = document.createElement("div");
    dropdown.className = PREFIX + "-dropdown " + ddPosClass;

    var ddBody = "";
    latestEntries.forEach(function (item) {
      ddBody += renderCompactEntry(item.entry, item.date);
    });
    if (!latestEntries.length) {
      ddBody = '<div class="' + PREFIX + '-empty" style="padding:20px;">No updates yet.</div>';
    }

    dropdown.innerHTML =
      '<div class="' + PREFIX + '-dd-header">What\'s New</div>' +
      '<div class="' + PREFIX + '-dd-body">' + ddBody + "</div>" +
      (totalCount > 3
        ? '<div class="' + PREFIX + '-dd-footer"><a href="https://changeloger.dev" target="_blank" rel="noopener">View all ' + totalCount + " updates</a></div>"
        : "");

    root.appendChild(dot);
    root.appendChild(dropdown);

    // Insert into target or float in body
    if (config.target) {
      var targetEl = document.querySelector(config.target);
      if (targetEl) {
        targetEl.style.position = targetEl.style.position || "relative";
        targetEl.appendChild(root);
      } else {
        document.body.appendChild(root);
      }
    } else {
      document.body.appendChild(root);
    }

    var isOpen = false;

    function toggle() {
      isOpen = !isOpen;
      dropdown.classList.toggle(PREFIX + "-dropdown-open", isOpen);
      if (isOpen) config.analytics.push("page_view", {}, true);
    }

    dot.addEventListener("click", function (e) {
      e.stopPropagation();
      toggle();
    });

    document.addEventListener("click", function (e) {
      if (isOpen && !root.contains(e.target)) {
        isOpen = false;
        dropdown.classList.remove(PREFIX + "-dropdown-open");
      }
    });

    trackEntryClicks(dropdown, config.analytics);
  }

  // ─── Initialization ───────────────────────────────────────────────────────

  function init() {
    // Find our script tag
    var scriptEl = document.currentScript
      || (function () {
        var scripts = document.querySelectorAll("script[data-token]");
        for (var i = scripts.length - 1; i >= 0; i--) {
          if (scripts[i].src && scripts[i].src.indexOf("changeloger") !== -1) return scripts[i];
        }
        return null;
      })();

    if (!scriptEl) {
      console.warn("[Changeloger] Could not locate script tag.");
      return;
    }

    var token = scriptEl.getAttribute("data-token");
    if (!token) {
      console.warn("[Changeloger] Missing data-token attribute.");
      return;
    }

    // Read configuration from data attributes
    var cfg = {
      token:        token,
      type:         scriptEl.getAttribute("data-type") || "page",
      target:       scriptEl.getAttribute("data-target") || null,
      theme:        scriptEl.getAttribute("data-theme") || "auto",
      primaryColor: scriptEl.getAttribute("data-primary-color") || "#6C63FF",
      position:     scriptEl.getAttribute("data-position") || "bottom-right",
      triggerText:  scriptEl.getAttribute("data-trigger-text") || "What's New",
      maxReleases:  parseInt(scriptEl.getAttribute("data-max-releases"), 10) || 10,
      noAnalytics:  scriptEl.hasAttribute("data-no-analytics"),
      scriptEl:     scriptEl
    };

    // Inject scoped CSS
    var styleEl = document.createElement("style");
    styleEl.id = PREFIX + "-styles";
    if (!document.getElementById(styleEl.id)) {
      styleEl.textContent = buildCSS(cfg.primaryColor, cfg.theme);
      document.head.appendChild(styleEl);
    }

    // Listen for system dark mode changes when theme is auto
    if (cfg.theme === "auto" && window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
        var existing = document.getElementById(PREFIX + "-styles");
        if (existing) existing.textContent = buildCSS(cfg.primaryColor, cfg.theme);
      });
    }

    // Set up analytics
    var analytics = createAnalytics(token, cfg.noAnalytics);
    analytics.start();

    // Fetch changelog data
    fetch(API_BASE + "/api/widgets/" + token + "/changelog")
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        // Merge server config with data attributes (data attributes win)
        var serverPrimary = data.config && data.config.primaryColor;
        if (serverPrimary && !scriptEl.hasAttribute("data-primary-color")) {
          cfg.primaryColor = serverPrimary;
          var existing = document.getElementById(PREFIX + "-styles");
          if (existing) existing.textContent = buildCSS(cfg.primaryColor, cfg.theme);
        }

        var releases = (data.releases || []).slice(0, cfg.maxReleases);
        cfg.releases = releases;
        cfg.analytics = analytics;
        cfg.workspace = data.workspace;

        // Initialize the appropriate widget type
        var widgetType = cfg.type;
        // Server can suggest a type, but data-type attribute takes precedence
        if (!scriptEl.hasAttribute("data-type") && data.type) {
          widgetType = data.type;
        }

        switch (widgetType) {
          case "modal":
            initModalWidget(cfg);
            break;
          case "badge":
            initBadgeWidget(cfg);
            break;
          case "page":
          default:
            initPageWidget(cfg);
            break;
        }

        // Mark as rendered so DOM guard prevents re-init on HMR reloads
        scriptEl.setAttribute("data-changeloger-rendered", "true");
      })
      .catch(function (err) {
        console.warn("[Changeloger] Failed to load changelog:", err.message);
      });
  }

  // ─── Boot ─────────────────────────────────────────────────────────────────
  // Run init when DOM is ready. If the script is loaded async, the DOM may
  // already be ready by the time we execute.

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
