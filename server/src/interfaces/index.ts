export interface PositionStats {
    position: string;
    playerCount: number;
    averageSalary: number | null;
    averageAge: number | null;
}

export interface EntityComparisonData {
    entityName: string;
    stats: PositionStats[];
}
