import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().optional(),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),

  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECRET: z.string().min(1),
  GITHUB_CALLBACK_URL: z.string().url(),

  GITHUB_APP_ID: z.string().optional(),
  GITHUB_APP_PRIVATE_KEY: z.string().optional(),
  GITHUB_APP_WEBHOOK_SECRET: z.string().optional(),

  OPENAI_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(["openai", "anthropic", "ollama"]).default("openai"),
  AI_MODEL: z.string().default("gpt-4o-mini"),

  POLAR_ACCESS_TOKEN: z.string().optional(),
  POLAR_WEBHOOK_SECRET: z.string().optional(),
  POLAR_ORGANIZATION_ID: z.string().optional(),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY: z.string().default("7d"),

  WIDGET_CDN_URL: z.string().url().optional(),
})

export type Env = z.infer<typeof envSchema>

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    const formatted = parsed.error.format()
    console.error("Invalid environment variables:", formatted)
    throw new Error("Invalid environment variables. Check server logs for details.")
  }

  return parsed.data
}

export const env = validateEnv()
