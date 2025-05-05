export interface Player {
  id?: number | string;
  name: string;
  team: string;
  number: number | string;
  position: string;
  age: number;
  height: string;
  weight: number;
  college: string | null;
  salary: number | null;
}

export interface ChartResponseData {
  labels: (string | number)[];
  data: number[];
}

export interface ChartStateData {
  labels: (string | number)[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

export type PlayerSortKey = keyof Pick<Player, 'name' | 'team' | 'number' | 'position' | 'age' | 'height' | 'weight' | 'college' | 'salary'>;

export type SortOrder = 'asc' | 'desc';
