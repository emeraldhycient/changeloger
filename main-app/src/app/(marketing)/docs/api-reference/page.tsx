"use client"

import SwaggerUI from "swagger-ui-react"
import "swagger-ui-react/swagger-ui.css"

export default function ApiReferencePage() {
  return (
    <article className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          API Reference
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Explore the Changeloger REST API. All endpoints return JSON and use
          JWT bearer token authentication unless otherwise noted.
        </p>
      </header>

      <div className="swagger-wrapper">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .swagger-wrapper .swagger-ui {
                font-family: inherit;
              }
              .swagger-wrapper .swagger-ui .topbar {
                display: none;
              }
              .swagger-wrapper .swagger-ui .info {
                margin: 20px 0;
              }
              .swagger-wrapper .swagger-ui .scheme-container {
                background: transparent;
                box-shadow: none;
                padding: 0;
              }
              .swagger-wrapper .swagger-ui .opblock {
                border-radius: 0;
                border-color: hsl(var(--border));
                background: transparent;
              }
              .swagger-wrapper .swagger-ui .opblock .opblock-summary {
                border-radius: 0;
              }
              .swagger-wrapper .swagger-ui .opblock-tag {
                border-bottom-color: hsl(var(--border));
              }
              .swagger-wrapper .swagger-ui .btn {
                border-radius: 0;
              }
              .swagger-wrapper .swagger-ui input[type=text],
              .swagger-wrapper .swagger-ui textarea,
              .swagger-wrapper .swagger-ui select {
                border-radius: 0;
              }
              .swagger-wrapper .swagger-ui .model-box {
                border-radius: 0;
              }
              .swagger-wrapper .swagger-ui table thead tr th,
              .swagger-wrapper .swagger-ui table thead tr td {
                border-bottom-color: hsl(var(--border));
              }
              .swagger-wrapper .swagger-ui .response-col_status {
                font-family: ui-monospace, monospace;
              }
              /* Dark mode overrides */
              .dark .swagger-wrapper .swagger-ui,
              .dark .swagger-wrapper .swagger-ui .info .title,
              .dark .swagger-wrapper .swagger-ui .info p,
              .dark .swagger-wrapper .swagger-ui .info li,
              .dark .swagger-wrapper .swagger-ui .opblock-tag,
              .dark .swagger-wrapper .swagger-ui .opblock .opblock-summary-description,
              .dark .swagger-wrapper .swagger-ui .opblock-description-wrapper p,
              .dark .swagger-wrapper .swagger-ui .response-col_description__inner p,
              .dark .swagger-wrapper .swagger-ui table thead tr th,
              .dark .swagger-wrapper .swagger-ui table thead tr td,
              .dark .swagger-wrapper .swagger-ui .parameter__name,
              .dark .swagger-wrapper .swagger-ui .parameter__type,
              .dark .swagger-wrapper .swagger-ui .tab li,
              .dark .swagger-wrapper .swagger-ui label,
              .dark .swagger-wrapper .swagger-ui .model-title,
              .dark .swagger-wrapper .swagger-ui .model {
                color: hsl(var(--foreground));
              }
              .dark .swagger-wrapper .swagger-ui .opblock .opblock-section-header {
                background: hsl(var(--muted));
                border-radius: 0;
              }
              .dark .swagger-wrapper .swagger-ui .opblock .opblock-section-header h4 {
                color: hsl(var(--foreground));
              }
              .dark .swagger-wrapper .swagger-ui .opblock-body pre.microlight {
                background: hsl(var(--muted));
                color: hsl(var(--foreground));
                border-radius: 0;
              }
              .dark .swagger-wrapper .swagger-ui .highlight-code > .microlight code {
                color: hsl(var(--foreground));
              }
              .dark .swagger-wrapper .swagger-ui select {
                background: hsl(var(--muted));
                color: hsl(var(--foreground));
              }
              .dark .swagger-wrapper .swagger-ui input[type=text],
              .dark .swagger-wrapper .swagger-ui textarea {
                background: hsl(var(--muted));
                color: hsl(var(--foreground));
              }
              .dark .swagger-wrapper .swagger-ui .opblock.opblock-get {
                border-color: #61affe;
                background: rgba(97, 175, 254, 0.05);
              }
              .dark .swagger-wrapper .swagger-ui .opblock.opblock-post {
                border-color: #49cc90;
                background: rgba(73, 204, 144, 0.05);
              }
              .dark .swagger-wrapper .swagger-ui .opblock.opblock-put {
                border-color: #fca130;
                background: rgba(252, 161, 48, 0.05);
              }
              .dark .swagger-wrapper .swagger-ui .opblock.opblock-delete {
                border-color: #f93e3e;
                background: rgba(249, 62, 62, 0.05);
              }
              .dark .swagger-wrapper .swagger-ui .opblock.opblock-patch {
                border-color: #50e3c2;
                background: rgba(80, 227, 194, 0.05);
              }
            `,
          }}
        />
        <SwaggerUI url="/openapi.yaml" />
      </div>
    </article>
  )
}
