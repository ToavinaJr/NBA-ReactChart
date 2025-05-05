export const generateColors = (numColors: number): string[] => {
    const colors: string[] = [];
    const baseColors = [
        'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)', 'rgba(83, 102, 255, 0.6)', 'rgba(255, 102, 183, 0.6)'
    ];
    for (let i = 0; i < numColors; i++) {
        colors.push(baseColors[i % baseColors.length]);
    }
     if (numColors > baseColors.length) {
         console.warn(`Plus de ${baseColors.length} labels (${numColors}), les couleurs vont se répéter.`);
    }
    return colors;
};

export const getChartType = (target: string): 'bar' | 'doughnut' | 'line' | 'pie' | 'radar' => {
    switch (target) {
        case 'Position': return 'doughnut';
        case 'Salary': return 'bar';
        case 'Age': return 'bar';
        case 'Team': return 'bar';
        default: return 'bar';
    }
};