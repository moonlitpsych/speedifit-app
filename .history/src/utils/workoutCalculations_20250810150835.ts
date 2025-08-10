// src/utils/workoutCalculations.ts
// Percentage-based workout calculations

import { SetSchemeConfig, WorkoutSet } from '../types';

/**
 * Calculate weight based on percentage of one-rep max
 * Rounds to nearest 5 lbs for practical loading
 */
export const calculateWeight = (oneRepMax: number, percentage: number): number => {
    if (oneRepMax <= 0 || percentage <= 0) return 0;
    const weight = (oneRepMax * percentage) / 100;
    // Round to nearest 5 lbs for easier loading
    return Math.round(weight / 5) * 5;
};

/**
 * Calculate one-rep max from weight and reps (Epley formula)
 * Useful for estimating max from submaximal lifts
 */
export const estimateOneRepMax = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    if (reps > 30 || reps < 1) return 0;

    // Epley formula: 1RM = weight × (1 + reps/30)
    const estimated = weight * (1 + reps / 30);
    return Math.round(estimated / 5) * 5;
};

/**
 * Pre-defined set schemes for different training goals
 */
export const setSchemes: { [key: string]: SetSchemeConfig } = {
    // HYPERTROPHY SCHEMES (Mark Wahlberg physique focus)
    pyramid: {
        name: 'Pyramid',
        type: 'pyramid',
        description: 'Build up weight, then back down',
        sets: [
            { percentage: 65, reps: 12, restTime: 60 },
            { percentage: 70, reps: 10, restTime: 75 },
            { percentage: 75, reps: 8, restTime: 90 },
            { percentage: 80, reps: 6, restTime: 90 },
            { percentage: 75, reps: 8, restTime: 75 }
        ]
    },

    straight: {
        name: 'Straight Sets',
        type: 'straight',
        description: 'Same weight and reps for all sets',
        sets: [
            { percentage: 75, reps: 8, restTime: 90 },
            { percentage: 75, reps: 8, restTime: 90 },
            { percentage: 75, reps: 8, restTime: 90 },
            { percentage: 75, reps: 8, restTime: 90 }
        ]
    },

    progressive: {
        name: 'Progressive',
        type: 'progressive',
        description: 'Increase weight, decrease reps',
        sets: [
            { percentage: 65, reps: 10, restTime: 60 },
            { percentage: 70, reps: 8, restTime: 75 },
            { percentage: 75, reps: 6, restTime: 90 },
            { percentage: 80, reps: 4, restTime: 120 }
        ]
    },

    drop: {
        name: 'Drop Set',
        type: 'drop',
        description: 'Decrease weight, increase reps',
        sets: [
            { percentage: 80, reps: 6, restTime: 90 },
            { percentage: 70, reps: 8, restTime: 75 },
            { percentage: 60, reps: 10, restTime: 60 },
            { percentage: 50, reps: 12, restTime: 60 }
        ]
    },

    // VOLUME SCHEMES
    volume: {
        name: 'Volume Training',
        type: 'straight',
        description: 'High volume for muscle growth',
        sets: [
            { percentage: 70, reps: 10, restTime: 60 },
            { percentage: 70, reps: 10, restTime: 60 },
            { percentage: 70, reps: 10, restTime: 60 },
            { percentage: 70, reps: 10, restTime: 60 },
            { percentage: 70, reps: 10, restTime: 60 }
        ]
    },

    // STRENGTH SCHEMES (occasionally good to build base strength)
    strength: {
        name: 'Strength Focus',
        type: 'progressive',
        description: 'Heavy weights, low reps',
        sets: [
            { percentage: 75, reps: 5, restTime: 120 },
            { percentage: 80, reps: 4, restTime: 150 },
            { percentage: 85, reps: 3, restTime: 180 },
            { percentage: 90, reps: 2, restTime: 180 }
        ]
    }
};

/**
 * Generate workout sets based on one-rep max and selected scheme
 */
export const generateWorkoutSets = (
    exerciseId: string,
    exerciseName: string,
    oneRepMax: number,
    scheme: SetSchemeConfig
): WorkoutSet[] => {
    return scheme.sets.map((set, index) => ({
        setNumber: index + 1,
        exerciseId,
        exerciseName,
        reps: set.reps,
        weight: calculateWeight(oneRepMax, set.percentage),
        percentageOfMax: set.percentage,
        restTime: set.restTime,
        completed: false
    }));
};

/**
 * Calculate total volume for a workout (sets × reps × weight)
 */
export const calculateTotalVolume = (sets: WorkoutSet[]): number => {
    return sets.reduce((total, set) => {
        return total + (set.weight * set.reps);
    }, 0);
};

/**
 * Get recommended training range based on goals
 */
export const getRecommendedRange = (goal: 'strength' | 'hypertrophy' | 'endurance') => {
    switch (goal) {
        case 'strength':
            return {
                percentageRange: '85-100%',
                repRange: '1-5 reps',
                restTime: '3-5 minutes',
                sets: '3-5 sets'
            };
        case 'hypertrophy':
            return {
                percentageRange: '65-80%',
                repRange: '6-12 reps',
                restTime: '60-90 seconds',
                sets: '3-5 sets'
            };
        case 'endurance':
            return {
                percentageRange: '50-65%',
                repRange: '12-20 reps',
                restTime: '30-60 seconds',
                sets: '2-4 sets'
            };
    }
};

/**
 * Format weight for display (adds 'lbs' suffix)
 */
export const formatWeight = (weight: number): string => {
    return `${weight} lbs`;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (percentage: number): string => {
    return `${percentage}%`;
};

/**
 * Format rest time for display (converts seconds to minutes if needed)
 */
export const formatRestTime = (seconds: number): string => {
    if (seconds < 60) {
        return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (remainingSeconds === 0) {
        return `${minutes}m`;
    }
    return `${minutes}m ${remainingSeconds}s`;
};