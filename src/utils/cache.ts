import NodeCache from 'node-cache';
import logger from './logger';

/**
 * In-memory cache with TTL support
 * Used for caching Pokemon data and translation results
 */
class CacheService {
	private cache: NodeCache;

	constructor() {
		// Default TTL: 1 hour (3600 seconds)
		this.cache = new NodeCache({
			stdTTL: 3600,
			checkperiod: 600, // Check for expired keys every 10 minutes
			useClones: false,
		});

		this.cache.on('set', (key, _value) => {
			logger.debug(`Cache SET: ${key}`);
		});

		this.cache.on('expired', (key, _value) => {
			logger.debug(`Cache EXPIRED: ${key}`);
		});
	}

	/**
	 * Get value from cache
	 */
	get<T>(key: string): T | undefined {
		const value = this.cache.get<T>(key);
		if (value) {
			logger.debug(`Cache HIT: ${key}`);
		} else {
			logger.debug(`Cache MISS: ${key}`);
		}
		return value;
	}

	/**
	 * Set value in cache with optional TTL
	 */
	set<T>(key: string, value: T, ttl?: number): boolean {
		return this.cache.set(key, value, ttl || 0);
	}

	/**
	 * Delete key from cache
	 */
	del(key: string): number {
		return this.cache.del(key);
	}

	/**
	 * Clear all cache entries
	 */
	flush(): void {
		this.cache.flushAll();
		logger.info('Cache flushed');
	}

	/**
	 * Get cache statistics
	 */
	getStats() {
		return this.cache.getStats();
	}
}

export default new CacheService();
