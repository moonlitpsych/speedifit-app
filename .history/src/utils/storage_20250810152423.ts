// src/utils/storage.ts
// AsyncStorage utilities for persisting data

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMaxes, Workout } from '../types';

const STORAGE_KEYS = {
    USER_MAXES: '@SpeediFit:userMaxes',
    WORKOUTS: '@SpeediFit:workouts',
    CREATINE_TAKEN: '@SpeediFit:creatineTaken',
    LAST_WORKOUT: '@SpeediFit:lastWorkout',
};

// User Maxes Storage
export const saveUserMaxes = async (maxes: UserMaxes): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(maxes);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_MAXES, jsonValue);
    } catch (error) {
        console.error('Error saving maxes:', error);
    }
};

export const loadUserMaxes = async (): Promise<UserMaxes> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER_MAXES);
        return jsonValue != null ? JSON.parse(jsonValue) : {};
    } catch (error) {
        console.error('Error loading maxes:', error);
        return {};
    }
};

// Workout Storage
export const saveWorkout = async (workout: Workout): Promise<void> => {
    try {
        // Load existing workouts
        const existingWorkouts = await loadWorkouts();

        // Add new workout
        existingWorkouts.push(workout);

        // Keep only last 50 workouts to manage storage
        const workoutsToSave = existingWorkouts.slice(-50);

        const jsonValue = JSON.stringify(workoutsToSave);
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, jsonValue);
    } catch (error) {
        console.error('Error saving workout:', error);
    }
};

export const loadWorkouts = async (): Promise<Workout[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error loading workouts:', error);
        return [];
    }
};

// Creatine Tracking
export const saveCreatineTaken = async (date: string): Promise<void> => {
    try {
        const history = await loadCreatineHistory();
        if (!history.includes(date)) {
            history.push(date);
            // Keep last 90 days
            const toSave = history.slice(-90);
            await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_TAKEN, JSON.stringify(toSave));
        }
    } catch (error) {
        console.error('Error saving creatine:', error);
    }
};

export const loadCreatineHistory = async (): Promise<string[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CREATINE_TAKEN);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Error loading creatine history:', error);
        return [];
    }
};

export const didTakeCreatineToday = async (): Promise<boolean> => {
    const today = new Date().toISOString().split('T')[0];
    const history = await loadCreatineHistory();
    return history.includes(today);
};

// Last Workout
export const saveLastWorkoutDate = async (date: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_WORKOUT, date);
    } catch (error) {
        console.error('Error saving last workout date:', error);
    }
};

export const loadLastWorkoutDate = async (): Promise<string | null> => {
    try {
        return await AsyncStorage.getItem(STORAGE_KEYS.LAST_WORKOUT);
    } catch (error) {
        console.error('Error loading last workout date:', error);
        return null;
    }
};

// Clear all data (for testing or reset)
export const clearAllData = async (): Promise<void> => {
    try {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
        console.error('Error clearing data:', error);
    }
};