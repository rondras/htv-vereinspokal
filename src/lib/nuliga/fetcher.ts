const DEFAULT_HEADERS = {
  "User-Agent": "HTV-Vereinspokal-Tracker/1.0 (+https://github.com/htv-pokal)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "de-DE,de;q=0.9",
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchHtml(url: string, retries = 3): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: DEFAULT_HEADERS,
        next: { revalidate: 3600 },
      });

      if (response.ok) {
        return response.text();
      }

      const retryable = response.status >= 500 || response.status === 429;
      if (retryable && attempt < retries - 1) {
        await sleep(400 * (attempt + 1));
        continue;
      }

      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt < retries - 1) {
        await sleep(400 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError ?? new Error(`Failed to fetch ${url}`);
}

export async function fetchWithConcurrency<T>(
  items: string[],
  worker: (item: string) => Promise<T>,
  concurrency = 4,
): Promise<T[]> {
  const results: T[] = new Array(items.length);
  let index = 0;

  async function runWorker(): Promise<void> {
    while (index < items.length) {
      const current = index++;
      results[current] = await worker(items[current]!);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => runWorker()));
  return results;
}
