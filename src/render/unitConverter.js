/**
 * Unit Converter
 * Centralized unit conversion to avoid scattered "divide by 1000" throughout codebase
 */

/**
 * Convert value to meters based on unit of measurement
 * @param {number} value - Value to convert
 * @param {string} uom - Unit of measurement ('mm', 'cm', 'm')
 * @returns {number} Value in meters
 * @throws {Error} If UOM is unknown
 */
export function toMeters(value, uom) {
    const uomLower = (uom || 'mm').toLowerCase();

    switch (uomLower) {
        case 'mm':
            return value / 1000;
        case 'cm':
            return value / 100;
        case 'm':
            return value;
        default:
            throw new Error(`Unknown unit of measurement: ${uom}. Expected 'mm', 'cm', or 'm'.`);
    }
}

/**
 * Convert value from meters to specified unit
 * @param {number} valueInMeters - Value in meters
 * @param {string} uom - Target unit of measurement ('mm', 'cm', 'm')
 * @returns {number} Value in target unit
 */
export function fromMeters(valueInMeters, uom) {
    const uomLower = (uom || 'mm').toLowerCase();

    switch (uomLower) {
        case 'mm':
            return valueInMeters * 1000;
        case 'cm':
            return valueInMeters * 100;
        case 'm':
            return valueInMeters;
        default:
            throw new Error(`Unknown unit of measurement: ${uom}. Expected 'mm', 'cm', or 'm'.`);
    }
}
