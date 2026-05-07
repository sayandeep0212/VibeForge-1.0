import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiter for general API routes (10 requests per minute per IP)
export const apiLimiter = new RateLimiterMemory({
  points: 10,
  duration: 60,
});

// Stricter limiter for sensitive routes like login (3 requests per minute per IP)
export const authLimiter = new RateLimiterMemory({
  points: 3,
  duration: 60,
});

export async function checkRateLimit(limiter: RateLimiterMemory, ip: string | null | undefined) {
  const key = ip || 'anonymous';
  try {
    await limiter.consume(key);
    return { success: true };
  } catch (rejRes: any) {
    // If it's a rate limit rejection, it will have msBeforeNext
    const msBeforeNext = typeof rejRes?.msBeforeNext === 'number' ? rejRes.msBeforeNext : 1000;
    return { 
      success: false, 
      retryAfter: Math.round(msBeforeNext / 1000) || 1 
    };
  }
}
