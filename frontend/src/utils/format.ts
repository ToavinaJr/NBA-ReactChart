export const formatAvgAge = (age: number | null): string => {
    return age !== null ? age.toFixed(0) + ' ans' : 'N/A';
}

export const formatAvgSalary = (salary: number | null): string => {
    if (salary === null) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 0
    }).format(salary);
}