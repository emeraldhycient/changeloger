import { Queue, Worker, type Job } from "bullmq"

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

function parseRedisUrl(url: string) {
  try {
    const parsed = new URL(url)
    return {
      host: parsed.hostname || "localhost",
      port: parseInt(parsed.port || "6379", 10),
      password: parsed.password || undefined,
    }
  } catch {
    return { host: "localhost", port: 6379 }
  }
}

const connection = parseRedisUrl(REDIS_URL)

export const webhookQueue = new Queue("webhook-processing", { connection })
export const analysisQueue = new Queue("change-analysis", { connection })

export function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<void>,
) {
  return new Worker<T>(queueName, processor, {
    connection,
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  })
}
