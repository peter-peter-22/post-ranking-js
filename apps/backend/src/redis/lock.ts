import { RedisClientType } from 'redis';

/**
 * Attempts to create a lock on the specified key.
 * @param redis - Redis client
 * @param key - The key to lock (e.g., `post:123:lock`)
 * @param ttlMs - Lock TTL in milliseconds (default: 5000ms)
 * @returns `true` if the lock was acquired, `false` if already locked.
 */
export async function createLock(
  redis: RedisClientType,
  key: string,
  ttlMs: number = 5000
): Promise<boolean> {
  const lockValue = generateLockValue(); // Unique value for safety
  const result = await redis.set(key, lockValue, {
    NX: true,  // Only set if key doesn't exist
    PX: ttlMs, // Auto-expire after TTL
  });
  return result === 'OK'; // 'OK' means lock acquired
}

// Helper: Generate a unique lock value (timestamp + random)
function generateLockValue(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Releases a lock if the current value matches the original.
 * @param redis - Redis client
 * @param key - The locked key
 * @returns `true` if the lock was released, `false` if already gone or mismatched.
 */
export async function releaseLock(
  redis: RedisClientType,
  key: string
): Promise<boolean> {
  // Use Lua script for atomic check-and-delete
  const luaScript = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;
  const lockValue = await redis.get(key);
  if (!lockValue) return false; // Lock already expired

  const result = await redis.eval(luaScript, {
    keys: [key],
    arguments: [lockValue],
  });
  return result === 1; // 1 means lock deleted
}