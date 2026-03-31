import type { AIProvider } from "./types"
import { createOpenAIProvider } from "./openai"

let cachedProvider: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider

  const provider = process.env.AI_PROVIDER || "openai"
  const model = process.env.AI_MODEL || "gpt-4o-mini"

  switch (provider) {
    case "openai": {
      const apiKey = process.env.OPENAI_API_KEY
      if (!apiKey) throw new Error("OPENAI_API_KEY is required when AI_PROVIDER=openai")
      cachedProvider = createOpenAIProvider(apiKey, model)
      break
    }
    case "anthropic":
      throw new Error("Anthropic AI provider is not yet implemented. Set AI_PROVIDER=openai or AI_PROVIDER=ollama")
    case "ollama":
      throw new Error("Ollama AI provider is not yet implemented. Set AI_PROVIDER=openai")
    default:
      throw new Error(`Unknown AI provider: ${provider}`)
  }

  return cachedProvider
}
