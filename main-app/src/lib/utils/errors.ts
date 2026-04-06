export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message)
    this.name = "AppError"
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.details ? { details: this.details } : {}),
    }
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized", code = "AUTH_ERROR", statusCode = 401) {
    super(message, code, statusCode)
    this.name = "AuthError"
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", code = "FORBIDDEN") {
    super(message, code, 403)
    this.name = "ForbiddenError"
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found", code = "NOT_FOUND") {
    super(message, code, 404)
    this.name = "NotFoundError"
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: unknown) {
    super(message, "VALIDATION_ERROR", 400, details)
    this.name = "ValidationError"
  }
}

export class BillingError extends AppError {
  constructor(message = "Billing error", code = "BILLING_ERROR") {
    super(message, code, 402)
    this.name = "BillingError"
  }
}

export class GitHubError extends AppError {
  constructor(message = "GitHub API error", code = "GITHUB_ERROR") {
    super(message, code, 502)
    this.name = "GitHubError"
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 429)
    this.name = "RateLimitError"
  }
}

export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return Response.json(error.toJSON(), { status: error.statusCode })
  }

  console.error("Unhandled error:", error)
  return Response.json(
    { error: "Internal server error", code: "INTERNAL_ERROR" },
    { status: 500 },
  )
}
