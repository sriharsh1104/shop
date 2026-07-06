export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function retry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 20,
  delayMs = 3000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[${label}] attempt ${attempt}/${maxAttempts} failed: ${message}`);
      if (attempt === maxAttempts) throw err;
      await sleep(delayMs);
    }
  }
  throw new Error(`[${label}] exhausted retries`);
}
