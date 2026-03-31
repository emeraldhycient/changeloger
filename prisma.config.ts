import path from "node:path"
import dotenv from "dotenv"
import { defineConfig } from "prisma/config"

// Prisma config runs outside Next.js, so .env isn't auto-loaded
dotenv.config()

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/changeloger",
  },
})
