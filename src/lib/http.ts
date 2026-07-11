// Small fetch helpers shared by every source adapter: a JSON GET with a hard
// timeout, and a "try each source in order, return the first that works" runner
// that powers the redundancy chains.

export class HttpError extends Error {
  constructor(
    public url: string,
    public status: number,
  ) {
    super(`${url} -> HTTP ${status}`);
  }
}

export async function fetchJson<T>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = 8000, headers, ...rest } = init;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      headers: { Accept: "application/json", ...headers },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new HttpError(url, res.status);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Runs the given source functions in order and returns the result of the first
 * one that resolves to a non-empty value. Errors and empty results fall through
 * to the next source. Returns null only if every source fails.
 */
export async function firstOk<T>(
  attempts: Array<{ key: string; run: () => Promise<T | null> }>,
): Promise<{ value: T; from: string } | null> {
  for (const { key, run } of attempts) {
    try {
      const value = await run();
      if (value == null) continue;
      if (Array.isArray(value) && value.length === 0) continue;
      return { value, from: key };
    } catch (err) {
      console.warn(`[source:${key}] failed:`, (err as Error).message);
    }
  }
  return null;
}
