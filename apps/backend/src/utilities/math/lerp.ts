/**
 * Linear interpolation between two values
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} t - Interpolation factor (0 to 1)
 * @returns {number} Interpolated value
 */
export function lerp(start:number, end:number, t:number) {
    // Clamp t between 0 and 1
    t = Math.max(0, Math.min(1, t));
    return start * (1 - t) + end * t;
}