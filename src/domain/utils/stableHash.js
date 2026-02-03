/**
 * Stable hash utility for deterministic ID generation
 * Prevents unstable renders caused by random UUIDs
 */

/**
 * Simple deterministic hash function (djb2 algorithm)
 * @param {string} str - String to hash
 * @returns {string} - Hex hash string
 */
function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    }
    // Convert to positive number and then to hex
    return (hash >>> 0).toString(16);
}

/**
 * Generate a stable ID from multiple components
 * @param {...string} components - Components to hash together
 * @returns {string} - Stable hash ID
 */
export function stableHash(...components) {
    const combined = components.filter(c => c != null).join('|');
    return simpleHash(combined);
}

/**
 * Generate a stable UUID-like ID (for compatibility)
 * @param {...string} components - Components to hash together
 * @returns {string} - UUID-like stable ID
 */
export function stableUUID(...components) {
    const hash = stableHash(...components);
    // Pad to 32 chars and format like UUID
    const padded = hash.padEnd(32, '0');
    return `${padded.slice(0, 8)}-${padded.slice(8, 12)}-${padded.slice(12, 16)}-${padded.slice(16, 20)}-${padded.slice(20, 32)}`;
}
