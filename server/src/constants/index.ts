export const ALLOWED_STATS_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];
export const ALLOWED_FILTER_PROPERTIES = ['age', 'position', 'team', 'college', 'height', 'number', 'weight', 'salary'];
export const SALARY_RANGES: Record<string, [number | null, number | null]> = {
    "< 1M": [0, 999999],
    "1M - 5M": [1000000, 4999999],
    "5M - 10M": [5000000, 9999999],
    "10M - 20M": [10000000, 19999999],
    "20M+": [20000000, null],
};