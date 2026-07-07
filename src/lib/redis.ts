import Redis from 'ioredis';

// ── Redis client singleton ─────────────────────────────────────────────
// Reuses a single connection across all serverless invocations in the
// same cold-start. The `lazyConnect` option means the TCP handshake
// only happens on the first command, not at import time.
// ────────────────────────────────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redis) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
      // Connection timeout: 3 seconds
      connectTimeout: 3000,
      // Disconnect after 5 minutes of inactivity (serverless-friendly)
      disconnectTimeout: 300000,
      retryStrategy(times) {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 1000);
      },
      // TLS for production Redis instances
      tls: process.env.REDIS_URL?.startsWith('rediss://') ? {} : undefined,
    });

    redis.on('error', (err) => {
      console.error('[Redis] Connection error:', err.message);
    });
  }

  return redis;
}

// ── Cache helpers ────────────────────────────────────────────────────────

/**
 * Get a cached value from Redis. Returns null if:
 * - Redis is not configured
 * - The key doesn't exist
 * - Redis is unreachable (fails silently)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    if (!client) return null;

    const cached = await client.get(key);
    if (!cached) return null;

    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

/**
 * Set a value in Redis with a TTL (time-to-live in seconds).
 * Fails silently if Redis is not configured or unreachable.
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    // Fail silently — cache is optional, app works without it
  }
}

/**
 * Delete a cache key (e.g. after a mutation).
 * Fails silently if Redis is not configured or unreachable.
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    await client.del(key);
  } catch {
    // Fail silently
  }
}

/**
 * Delete all cache keys matching a pattern (e.g. "admin:*").
 * Fails silently if Redis is not configured or unreachable.
 */
export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    if (!client) return;

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // Fail silently
  }
}
