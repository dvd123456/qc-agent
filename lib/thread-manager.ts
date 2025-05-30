/**
 * Thread manager utility for handling chat thread IDs
 * Manages thread IDs with 60-minute expiration
 */

// Generate a new thread ID
export function generateThreadId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `thread_${timestamp}_${randomPart}`;
}

// Get the expiration timestamp (60 minutes from now)
export function getExpiryTimestamp(): number {
  const expiry: number = Number(process.env.EXPIRY_TIMESTAMP_THREAD) || 10;
  return Date.now() + expiry * 60 * 1000;
}

// Get existing thread ID or create a new one
export function getOrCreateThreadId(projectId: string): string {
  if (typeof window === "undefined") {
    return generateThreadId(); // For SSR
  }

  const threadKey = `qc_agent_thread_${projectId}`;
  const expiryKey = `qc_agent_thread_expiry_${projectId}`;

  // Check if thread ID exists and is not expired
  const existingThreadId = localStorage.getItem(threadKey);
  const expiryTimestamp = localStorage.getItem(expiryKey);

  if (existingThreadId && expiryTimestamp) {
    const expiry = Number.parseInt(expiryTimestamp, 10);
    if (Date.now() < expiry) {
      // Thread ID exists and is not expired
      return existingThreadId;
    }
  }

  // Generate new thread ID if expired or not found
  const newThreadId = generateThreadId();
  const newExpiry = getExpiryTimestamp();

  localStorage.setItem(threadKey, newThreadId);
  localStorage.setItem(expiryKey, newExpiry.toString());

  return newThreadId;
}

// Update thread expiry time (call after each message)
export function updateThreadExpiry(projectId: string): void {
  if (typeof window === "undefined") return;

  const threadKey = `qc_agent_thread_${projectId}`;
  const expiryKey = `qc_agent_thread_expiry_${projectId}`;

  // Only update if thread exists
  if (localStorage.getItem(threadKey)) {
    const newExpiry = getExpiryTimestamp();
    localStorage.setItem(expiryKey, newExpiry.toString());
  }
}
