// Thread manager for chat threads with expiration

const THREAD_ID_KEY = "qc_agent_chat_thread_id"
const THREAD_EXPIRY_KEY = "qc_agent_chat_thread_expiry"
const THREAD_EXPIRY_MINUTES = 60 // 60 minutes expiration

export function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

export function getOrCreateThreadId(projectId: string): string {
  if (typeof window === "undefined") {
    // Server-side, generate a new thread ID
    return generateThreadId()
  }

  // Check if we have a stored thread ID and if it's still valid
  const storedThreadId = localStorage.getItem(`${THREAD_ID_KEY}_${projectId}`)
  const expiryTimestamp = localStorage.getItem(`${THREAD_EXPIRY_KEY}_${projectId}`)
  
  const now = Date.now()
  const isExpired = !expiryTimestamp || parseInt(expiryTimestamp) < now

  if (!storedThreadId || isExpired) {
    // Generate a new thread ID
    const newThreadId = generateThreadId()
    const expiryTime = now + THREAD_EXPIRY_MINUTES * 60 * 1000
    
    // Store the new thread ID and expiry
    localStorage.setItem(`${THREAD_ID_KEY}_${projectId}`, newThreadId)
    localStorage.setItem(`${THREAD_EXPIRY_KEY}_${projectId}`, expiryTime.toString())
    
    return newThreadId
  }
  
  // Extend the expiry time
  const newExpiryTime = now + THREAD_EXPIRY_MINUTES * 60 * 1000
  localStorage.setItem(`${THREAD_EXPIRY_KEY}_${projectId}`, newExpiryTime.toString())
  
  return storedThreadId
}

export function clearThreadId(projectId: string): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(`${THREAD_ID_KEY}_${projectId}`)
    localStorage.removeItem(`${THREAD_EXPIRY_KEY}_${projectId}`)
  }
}
