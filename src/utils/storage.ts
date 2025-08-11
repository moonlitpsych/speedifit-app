// src/utils/storage.ts
// AsyncStorage utilities for persisting data - ENHANCED for Phase 6

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserMaxes, Workout } from '../types';

const STORAGE_KEYS = {
    USER_MAXES: '@SpeediFit:userMaxes',
    WORKOUTS: '@SpeediFit:workouts',
    CREATINE_TAKEN: '@SpeediFit:creatineTaken',
    LAST_WORKOUT: '@SpeediFit:lastWorkout',
    CREATINE_STREAK: '@SpeediFit:creatineStreak',
    LAST_CREATINE_DATE: '@SpeediFit:lastCreatineDate',
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

// Enhanced Creatine Tracking with Streak
export const saveCreatineTaken = async (date: string): Promise<void> => {
    try {
        const history = await loadCreatineHistory();
        if (!history.includes(date)) {
            history.push(date);
            // Keep last 90 days
            const toSave = history.slice(-90);
            await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_TAKEN, JSON.stringify(toSave));
        }

        // Update streak
        await updateCreatineStreak(date);

        // Save last creatine date
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_CREATINE_DATE, date);
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

// New: Creatine Streak Tracking
const updateCreatineStreak = async (date: string): Promise<void> => {
    try {
        const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CREATINE_DATE);
        const currentStreak = await getCreatineStreak();

        if (!lastDate) {
            // First time taking creatine
            await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_STREAK, '1');
            return;
        }

        const last = new Date(lastDate);
        const current = new Date(date);
        const diffTime = Math.abs(current.getTime() - last.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            // Consecutive day - increase streak
            await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_STREAK, (currentStreak + 1).toString());
        } else if (diffDays === 0) {
            // Same day - no change
            return;
        } else {
            // Streak broken - reset to 1
            await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_STREAK, '1');
        }
    } catch (error) {
        console.error('Error updating creatine streak:', error);
    }
};

export const getCreatineStreak = async (): Promise<number> => {
    try {
        const streak = await AsyncStorage.getItem(STORAGE_KEYS.CREATINE_STREAK);
        return streak ? parseInt(streak) : 0;
    } catch (error) {
        console.error('Error getting creatine streak:', error);
        return 0;
    }
};

export const calculateCreatineStreak = async (): Promise<number> => {
    try {
        const history = await loadCreatineHistory();
        if (history.length === 0) return 0;

        // Sort dates in descending order
        const sortedDates = history.sort((a, b) =>
            new Date(b).getTime() - new Date(a).getTime()
        );

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedDates.length; i++) {
            const checkDate = new Date(sortedDates[i]);
            checkDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(today.getDate() - i);
            expectedDate.setHours(0, 0, 0, 0);

            if (checkDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        // Update stored streak
        await AsyncStorage.setItem(STORAGE_KEYS.CREATINE_STREAK, streak.toString());
        return streak;
    } catch (error) {
        console.error('Error calculating creatine streak:', error);
        return 0;
    }
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