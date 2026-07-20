export class WindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly windowMs: number,
    private readonly maxHits: number,
  ) {}

  check(key: string, now = Date.now()) {
    const cutoff = now - this.windowMs;
    const current = (this.hits.get(key) ?? []).filter((timestamp) => timestamp > cutoff);
    if (current.length >= this.maxHits) return false;
    current.push(now);
    this.hits.set(key, current);
    return true;
  }
}
