import { useState, useEffect } from 'react';

/**
 * Like useState but synced to localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if nothing is stored
 */
export function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const stored = localStorage.getItem(key);
            return stored !== null ? JSON.parse(stored) : initialValue;
        } catch {
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Quota exceeded or private browsing — silently ignore
        }
    }, [key, value]);

    return [value, setValue];
}
