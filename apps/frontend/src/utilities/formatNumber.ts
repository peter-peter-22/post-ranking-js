/** Convert a number to thousands or millions. */
export function formatNumber(num: number): string {
    if (Math.abs(num) >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (Math.abs(num) >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}