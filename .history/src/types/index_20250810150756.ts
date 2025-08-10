// src/types/index.ts
// Type definitions for SpeediFit app

export type MuscleGroup =
    | 'Chest'
    | 'Biceps'
    | 'Triceps'
    | 'Forearms'
    | 'Glutes'
    | 'Hamstrings'
    | 'Quadriceps'
    | 'Calves'
    | 'Shoulders'
    | 'Back'
    | 'Core';

export interface Exercise {
    id: string;
    name: string;
    muscleGroups: MuscleGroup[];
    primaryMuscle: MuscleGroup;
    equipment: 'speediance';
    description: string;
    tips?: string;
}

export interface UserMax {
    weight: number;
    testedDate: string; // Using string for simplicity with AsyncStorage
}

export interface UserMaxes {
    [exerciseId: string]: UserMax;
}

export interface WorkoutSet {
    setNumber: number;
    exerciseId: string;
    exerciseName: string;
    reps: number;
    weight: number;
    percentageOfMax: number;
    restTime: number; // in seconds
    completed?: boolean;
}

export interface Workout {
    id: string;
    name: string;
    date: string;
    muscleGroups: MuscleGroup[];
    exercises: WorkoutExercise[];
    totalVolume?: number;
    duration?: number; // in minutes
}

export interface WorkoutExercise {
    exerciseId: string;
    exerciseName: string;
    sets: WorkoutSet[];
}

export type SetScheme = 'pyramid' | 'straight' | 'progressive' | 'drop';

export interface SetSchemeConfig {
    name: string;
    type: SetScheme;
    description: string;
    sets: Array<{
        percentage: number;
        reps: number;
        restTime: number;
    }>;
}

// Training ranges for different goals
export const TrainingRanges = {
    STRENGTH: {
        percentageMin: 85,
        percentageMax: 100,
        repsMin: 1,
        repsMax: 5,
        name: 'Strength'
    },
    POWER: {
        percentageMin: 80,
        percentageMax: 90,
        repsMin: 3,
        repsMax: 6,
        name: 'Power'
    },
    HYPERTROPHY: {
        percentageMin: 65,
        percentageMax: 80,
        repsMin: 6,
        repsMax: 12,
        name: 'Hypertrophy (Muscle Building)'
    },
    ENDURANCE: {
        percentageMin: 50,
        percentageMax: 65,
        repsMin: 12,
        repsMax: 20,
        name: 'Endurance'
    }
} as const;