export const setItem = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const getItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);

    if (!item) return null;

    try {
        return JSON.parse(item) as T;
    } catch {
        return null;
    }
};

export const removeItem = (key: string): void => {
    localStorage.removeItem(key);
};

export const clearStorage = (): void => {
    localStorage.clear();
};