// src/data/exercises.ts
// Speediance Gym Monster 2 compatible exercises

import { Exercise } from '../types';

export const exercises: Exercise[] = [
    // CHEST EXERCISES
    {
        id: 'chest_press',
        name: 'Chest Press',
        muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
        primaryMuscle: 'Chest',
        equipment: 'speediance',
        description: 'Cable chest press using Speediance handles',
        tips: 'Keep core tight, push through the chest'
    },
    {
        id: 'incline_chest_press',
        name: 'Incline Chest Press',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
        primaryMuscle: 'Chest',
        equipment: 'speediance',
        description: 'Chest press at an incline angle',
        tips: 'Focus on upper chest, control the movement'
    },
    {
        id: 'chest_fly',
        name: 'Chest Fly',
        muscleGroups: ['Chest'],
        primaryMuscle: 'Chest',
        equipment: 'speediance',
        description: 'Wide arc movement for chest isolation',
        tips: 'Slight bend in elbows, feel the stretch'
    },
    {
        id: 'decline_chest_press',
        name: 'Decline Chest Press',
        muscleGroups: ['Chest', 'Triceps'],
        primaryMuscle: 'Chest',
        equipment: 'speediance',
        description: 'Lower chest focused press',
        tips: 'Target lower pecs, maintain control'
    },

    // BICEPS EXERCISES
    {
        id: 'bicep_curl',
        name: 'Bicep Curl',
        muscleGroups: ['Biceps', 'Forearms'],
        primaryMuscle: 'Biceps',
        equipment: 'speediance',
        description: 'Standard cable bicep curl',
        tips: 'Keep elbows stationary, full range of motion'
    },
    {
        id: 'hammer_curl',
        name: 'Hammer Curl',
        muscleGroups: ['Biceps', 'Forearms'],
        primaryMuscle: 'Biceps',
        equipment: 'speediance',
        description: 'Neutral grip bicep curl',
        tips: 'Targets brachialis and forearms'
    },
    {
        id: 'preacher_curl',
        name: 'Preacher Curl',
        muscleGroups: ['Biceps'],
        primaryMuscle: 'Biceps',
        equipment: 'speediance',
        description: 'Isolated bicep curl with arm support',
        tips: 'Slow negative, squeeze at top'
    },

    // TRICEPS EXERCISES
    {
        id: 'tricep_pushdown',
        name: 'Tricep Pushdown',
        muscleGroups: ['Triceps'],
        primaryMuscle: 'Triceps',
        equipment: 'speediance',
        description: 'Cable pushdown for triceps',
        tips: 'Keep elbows at sides, full extension'
    },
    {
        id: 'overhead_tricep_extension',
        name: 'Overhead Tricep Extension',
        muscleGroups: ['Triceps'],
        primaryMuscle: 'Triceps',
        equipment: 'speediance',
        description: 'Overhead cable extension',
        tips: 'Keep elbows close to head, stretch at bottom'
    },
    {
        id: 'tricep_kickback',
        name: 'Tricep Kickback',
        muscleGroups: ['Triceps'],
        primaryMuscle: 'Triceps',
        equipment: 'speediance',
        description: 'Cable kickback for tricep isolation',
        tips: 'Keep upper arm parallel to floor'
    },

    // LEG EXERCISES
    {
        id: 'squat',
        name: 'Squat',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        primaryMuscle: 'Quadriceps',
        equipment: 'speediance',
        description: 'Cable-resisted squat',
        tips: 'Chest up, knees track over toes'
    },
    {
        id: 'deadlift',
        name: 'Deadlift',
        muscleGroups: ['Hamstrings', 'Glutes', 'Back'],
        primaryMuscle: 'Hamstrings',
        equipment: 'speediance',
        description: 'Cable deadlift from floor',
        tips: 'Hinge at hips, maintain neutral spine'
    },
    {
        id: 'leg_press',
        name: 'Leg Press',
        muscleGroups: ['Quadriceps', 'Glutes'],
        primaryMuscle: 'Quadriceps',
        equipment: 'speediance',
        description: 'Lying or seated leg press with cables',
        tips: 'Full range of motion, control the negative'
    },
    {
        id: 'leg_curl',
        name: 'Leg Curl',
        muscleGroups: ['Hamstrings'],
        primaryMuscle: 'Hamstrings',
        equipment: 'speediance',
        description: 'Lying or standing hamstring curl',
        tips: 'Squeeze at top, control the movement'
    },
    {
        id: 'calf_raise',
        name: 'Calf Raise',
        muscleGroups: ['Calves'],
        primaryMuscle: 'Calves',
        equipment: 'speediance',
        description: 'Standing calf raise with cables',
        tips: 'Full range, pause at top'
    },
    {
        id: 'lunges',
        name: 'Lunges',
        muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings'],
        primaryMuscle: 'Quadriceps',
        equipment: 'speediance',
        description: 'Cable-resisted lunges',
        tips: '90-degree angles, push through front heel'
    },

    // BACK EXERCISES
    {
        id: 'lat_pulldown',
        name: 'Lat Pulldown',
        muscleGroups: ['Back', 'Biceps'],
        primaryMuscle: 'Back',
        equipment: 'speediance',
        description: 'Wide grip pulldown for lats',
        tips: 'Pull to upper chest, squeeze shoulder blades'
    },
    {
        id: 'seated_row',
        name: 'Seated Row',
        muscleGroups: ['Back', 'Biceps'],
        primaryMuscle: 'Back',
        equipment: 'speediance',
        description: 'Horizontal cable row',
        tips: 'Pull to stomach, retract shoulder blades'
    },
    {
        id: 'face_pull',
        name: 'Face Pull',
        muscleGroups: ['Back', 'Shoulders'],
        primaryMuscle: 'Back',
        equipment: 'speediance',
        description: 'High cable pull to face level',
        tips: 'Pull apart at face, external rotation'
    },

    // SHOULDER EXERCISES
    {
        id: 'shoulder_press',
        name: 'Shoulder Press',
        muscleGroups: ['Shoulders', 'Triceps'],
        primaryMuscle: 'Shoulders',
        equipment: 'speediance',
        description: 'Overhead cable press',
        tips: 'Press straight up, core engaged'
    },
    {
        id: 'lateral_raise',
        name: 'Lateral Raise',
        muscleGroups: ['Shoulders'],
        primaryMuscle: 'Shoulders',
        equipment: 'speediance',
        description: 'Cable lateral raises',
        tips: 'Lead with elbows, control the weight'
    },
    {
        id: 'rear_delt_fly',
        name: 'Rear Delt Fly',
        muscleGroups: ['Shoulders', 'Back'],
        primaryMuscle: 'Shoulders',
        equipment: 'speediance',
        description: 'Reverse fly for rear delts',
        tips: 'Slight bend in elbows, squeeze at back'
    },
    {
        id: 'upright_row',
        name: 'Upright Row',
        muscleGroups: ['Shoulders', 'Biceps'],
        primaryMuscle: 'Shoulders',
        equipment: 'speediance',
        description: 'Cable upright row',
        tips: 'Pull to chin level, elbows high'
    },

    // CORE EXERCISES
    {
        id: 'cable_crunch',
        name: 'Cable Crunch',
        muscleGroups: ['Core'],
        primaryMuscle: 'Core',
        equipment: 'speediance',
        description: 'Kneeling cable crunch',
        tips: 'Crunch with abs, not arms'
    },
    {
        id: 'russian_twist',
        name: 'Russian Twist',
        muscleGroups: ['Core'],
        primaryMuscle: 'Core',
        equipment: 'speediance',
        description: 'Seated twists with cable resistance',
        tips: 'Keep chest up, rotate from core'
    }
];

// Helper function to get exercises by muscle group
export const getExercisesByMuscleGroup = (muscleGroups: string[]): Exercise[] => {
    return exercises.filter(exercise =>
        exercise.muscleGroups.some(muscle =>
            muscleGroups.includes(muscle)
        )
    );
};

// Helper function to get exercise by ID
export const getExerciseById = (id: string): Exercise | undefined => {
    return exercises.find(exercise => exercise.id === id);
};