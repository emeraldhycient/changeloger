let timeoutId: ReturnType<typeof setTimeout> | null = null
const TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes

export function startIdleTimer(onTimeout: () => void) {
  const resetTimer = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(onTimeout, TIMEOUT_MS)
  }

  window.addEventListener("mousemove", resetTimer)
  window.addEventListener("keydown", resetTimer)
  window.addEventListener("click", resetTimer)
  resetTimer()

  return () => {
    if (timeoutId) clearTimeout(timeoutId)
    window.removeEventListener("mousemove", resetTimer)
    window.removeEventListener("keydown", resetTimer)
    window.removeEventListener("click", resetTimer)
  }
}
