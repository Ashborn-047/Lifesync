type CacheEntry<T> = {
    value: T;
    expiry: number;
};

class Cache {
    private store: Map<string, CacheEntry<any>> = new Map();

    set<T>(key: string, value: T, ttlMs: number): void {
        const expiry = Date.now() + ttlMs;
        this.store.set(key, { value, expiry });
    }

    get<T>(key: string): T | null {
        const entry = this.store.get(key);
        if (!entry) return null;

        if (Date.now() > entry.expiry) {
            this.store.delete(key);
            return null;
        }

        return entry.value;
    }

    clear(key?: string): void {
        if (key) {
            this.store.delete(key);
        } else {
            this.store.clear();
        }
    }
}

export const cache = new Cache();
