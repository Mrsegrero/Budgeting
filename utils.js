export const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
};

export const getTodayKey = () => {
    return new Date().toISOString().split('T')[0];
};

/**
 * Deterministic day count between two dates, normalized to midnight.
 */
export const daysBetween = (d1, d2) => {
    const start = new Date(d1);
    const end = new Date(d2);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    // +1 because we count the starting day as day 1
    return Math.max(1, Math.floor((end - start) / 86400000) + 1);
};
