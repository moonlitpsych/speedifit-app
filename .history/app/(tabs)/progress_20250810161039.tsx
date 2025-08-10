// app/(tabs)/progress.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    RefreshControl,
    Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { loadWorkouts, loadUserMaxes } from '../../src/utils/storage';
import { Workout, UserMaxes, MuscleGroup } from '../../src/types';
import { exercises } from '../../src/data/exercises';

type TimeRange = 'week' | 'month' | 'year';

interface ProgressStats {
    totalWorkouts: number;
    totalVolume: number;
    averageWorkoutDuration: number;
    currentStreak: number;
    mostTrainedMuscles: { muscle: string; count: number }[];
    personalRecords: { exercise: string; weight: number; date: string }[];
}

interface WorkoutHistory {
    id: string;
    date: string;
    name: string;
    muscleGroups: string[];
    volume: number;
    exerciseCount: number;
}

export default function ProgressScreen() {
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [userMaxes, setUserMaxes] = useState<UserMaxes>({});
    const [progressStats, setProgressStats] = useState<ProgressStats>({
        totalWorkouts: 0,
        totalVolume: 0,
        averageWorkoutDuration: 0,
        currentStreak: 0,
        mostTrainedMuscles: [],
        personalRecords: []
    });
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutHistory[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

    // Load data when screen focuses
    useFocusEffect(
        useCallback(() => {
            loadProgressData();
        }, [timeRange])
    );

    const loadProgressData = async () => {
        const allWorkouts = await loadWorkouts();
        const maxes = await loadUserMaxes();

        setWorkouts(allWorkouts);
        setUserMaxes(maxes);

        // Filter workouts by time range
        const filteredWorkouts = filterWorkoutsByTimeRange(allWorkouts, timeRange);

        // Calculate statistics
        const stats = calculateProgressStats(filteredWorkouts, maxes);
        setProgressStats(stats);

        // Prepare workout history
        const history = prepareWorkoutHistory(filteredWorkouts);
        setWorkoutHistory(history);
    };

    const onRefresh = async () => {
        setIsRefreshing(true);
        await loadProgressData();
        setIsRefreshing(false);
    };

    const filterWorkoutsByTimeRange = (workouts: Workout[], range: TimeRange): Workout[] => {
        const now = new Date();
        const cutoffDate = new Date();

        switch (range) {
            case 'week':
                cutoffDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoffDate.setDate(now.getDate() - 30);
                break;
            case 'year':
                cutoffDate.setDate(now.getDate() - 365);
                break;
        }

        return workouts.filter(w => new Date(w.date) >= cutoffDate);
    };

    const calculateProgressStats = (workouts: Workout[], maxes: UserMaxes): ProgressStats => {
        // Total workouts
        const totalWorkouts = workouts.length;

        // Total volume
        const totalVolume = workouts.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

        // Average workout duration (estimate based on exercises)
        const totalExercises = workouts.reduce((sum, w) =>
            sum + w.exercises.length, 0
        );
        const averageWorkoutDuration = totalWorkouts > 0
            ? Math.round((totalExercises / totalWorkouts) * 15) // Assume 15 min per exercise
            : 0;

        // Calculate streak
        const currentStreak = calculateCurrentStreak(workouts);

        // Most trained muscles
        const muscleFrequency: Record<string, number> = {};
        workouts.forEach(w => {
            w.muscleGroups.forEach(mg => {
                muscleFrequency[mg] = (muscleFrequency[mg] || 0) + 1;
            });
        });

        const mostTrainedMuscles = Object.entries(muscleFrequency)
            .map(([muscle, count]) => ({ muscle, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // Personal records (from saved maxes)
        const personalRecords = Object.entries(maxes)
            .map(([exerciseId, max]) => {
                // Find the actual exercise to get its proper name
                const exercise = exercises.find(ex => ex.id === exerciseId);
                return {
                    exercise: exercise ? exercise.name : exerciseId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    weight: max.weight,
                    date: max.testedDate
                };
            })
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 5);

        return {
            totalWorkouts,
            totalVolume,
            averageWorkoutDuration,
            currentStreak,
            mostTrainedMuscles,
            personalRecords
        };
    };

    const calculateCurrentStreak = (workouts: Workout[]): number => {
        if (workouts.length === 0) return 0;

        // Sort workouts by date (most recent first)
        const sortedWorkouts = [...workouts].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const workout of sortedWorkouts) {
            const workoutDate = new Date(workout.date);
            workoutDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff <= streak + 1) {
                streak = Math.max(streak, daysDiff + 1);
            } else {
                break;
            }
        }

        return streak;
    };

    const prepareWorkoutHistory = (workouts: Workout[]): WorkoutHistory[] => {
        return workouts
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(w => ({
                id: w.id,
                date: w.date,
                name: w.name,
                muscleGroups: w.muscleGroups,
                volume: w.totalVolume || 0,
                exerciseCount: w.exercises.length
            }));
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const renderVolumeChart = () => {
        const maxBars = 7;
        const recentWorkouts = workouts
            .filter(w => filterWorkoutsByTimeRange([w], timeRange).length > 0)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(-maxBars);

        if (recentWorkouts.length === 0) {
            return (
                <Text style={styles.emptyChartText}>
                    No workouts yet. Start training to see your progress!
                </Text>
            );
        }

        const maxVolume = Math.max(...recentWorkouts.map(w => w.totalVolume || 0));

        return (
            <View style={styles.chartContainer}>
                {recentWorkouts.map((workout, index) => {
                    const volume = workout.totalVolume || 0;
                    const percentage = maxVolume > 0 ? (volume / maxVolume) * 100 : 0;
                    const barHeight = Math.max(percentage, 5); // Minimum height for visibility

                    return (
                        <View key={workout.id} style={styles.chartBar}>
                            <View style={styles.barContainer}>
                                <View
                                    style={[
                                        styles.bar,
                                        { height: `${barHeight}%` }
                                    ]}
                                />
                            </View>
                            <Text style={styles.barLabel}>
                                {new Date(workout.date).getDate()}
                            </Text>
                            <Text style={styles.barVolume}>
                                {(volume / 1000).toFixed(1)}k
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderMuscleDistribution = () => {
        if (progressStats.mostTrainedMuscles.length === 0) {
            return <Text style={styles.emptyText}>No muscle group data yet</Text>;
        }

        const maxCount = Math.max(...progressStats.mostTrainedMuscles.map(m => m.count));

        return (
            <View>
                {progressStats.mostTrainedMuscles.map((item, index) => {
                    const percentage = (item.count / maxCount) * 100;
                    const emoji = getMuscleEmoji(item.muscle);

                    return (
                        <View key={item.muscle} style={styles.muscleItem}>
                            <Text style={styles.muscleName}>
                                {emoji} {item.muscle}
                            </Text>
                            <View style={styles.muscleBarContainer}>
                                <View
                                    style={[
                                        styles.muscleBar,
                                        { width: `${percentage}%` }
                                    ]}
                                />
                                <Text style={styles.muscleCount}>{item.count}x</Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    const getMuscleEmoji = (muscle: string): string => {
        const emojiMap: Record<string, string> = {
            'Chest': '🎯',
            'Back': '🔙',
            'Shoulders': '🎪',
            'Biceps': '💪',
            'Triceps': '💪',
            'Quadriceps': '🦵',
            'Hamstrings': '🦵',
            'Glutes': '🍑',
            'Core': '🎯',
            'Calves': '🦵',
            'Forearms': '💪'
        };
        return emojiMap[muscle] || '💪';
    };

    const showWorkoutDetails = (workout: Workout) => {
        const details = workout.exercises.map(ex =>
            `${ex.exerciseName}: ${ex.sets.length} sets`
        ).join('\n');

        Alert.alert(
            workout.name,
            `Date: ${formatDate(workout.date)}\n` +
            `Muscle Groups: ${workout.muscleGroups.join(', ')}\n` +
            `Total Volume: ${(workout.totalVolume || 0).toLocaleString()} lbs\n\n` +
            `Exercises:\n${details}`,
            [{ text: 'OK' }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={onRefresh}
                        tintColor="#3498db"
                    />
                }
            >
                {/* Time Range Selector */}
                <View style={styles.timeRangeContainer}>
                    <TouchableOpacity
                        style={[styles.timeRangeButton, timeRange === 'week' && styles.activeTimeRange]}
                        onPress={() => setTimeRange('week')}
                    >
                        <Text style={[styles.timeRangeText, timeRange === 'week' && styles.activeTimeRangeText]}>
                            Week
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeRangeButton, timeRange === 'month' && styles.activeTimeRange]}
                        onPress={() => setTimeRange('month')}
                    >
                        <Text style={[styles.timeRangeText, timeRange === 'month' && styles.activeTimeRangeText]}>
                            Month
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.timeRangeButton, timeRange === 'year' && styles.activeTimeRange]}
                        onPress={() => setTimeRange('year')}
                    >
                        <Text style={[styles.timeRangeText, timeRange === 'year' && styles.activeTimeRangeText]}>
                            Year
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Overview */}
                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{progressStats.totalWorkouts}</Text>
                        <Text style={styles.statLabel}>Workouts</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>
                            {progressStats.totalVolume >= 1000
                                ? `${(progressStats.totalVolume / 1000).toFixed(1)}k`
                                : progressStats.totalVolume}
                        </Text>
                        <Text style={styles.statLabel}>Total Volume (lbs)</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{progressStats.averageWorkoutDuration}</Text>
                        <Text style={styles.statLabel}>Avg Duration (min)</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{progressStats.currentStreak}</Text>
                        <Text style={styles.statLabel}>Streak (days)</Text>
                    </View>
                </View>

                {/* Volume Progress Chart */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Volume Progress</Text>
                    {renderVolumeChart()}
                </View>

                {/* Muscle Group Distribution */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Most Trained Muscles</Text>
                    {renderMuscleDistribution()}
                </View>

                {/* Personal Records */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Records 🏆</Text>
                    {progressStats.personalRecords.length > 0 ? (
                        progressStats.personalRecords.map((pr, index) => (
                            <View key={index} style={styles.prItem}>
                                <View>
                                    <Text style={styles.prExercise}>{pr.exercise}</Text>
                                    <Text style={styles.prDate}>
                                        Set on {formatDate(pr.date)}
                                    </Text>
                                </View>
                                <Text style={styles.prWeight}>{pr.weight} lbs</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>
                                No PRs yet. Test your maxes to start tracking records!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Workout History */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Workout History</Text>
                    {workoutHistory.length > 0 ? (
                        workoutHistory.map((workout) => (
                            <TouchableOpacity
                                key={workout.id}
                                style={styles.historyItem}
                                onPress={() => {
                                    const fullWorkout = workouts.find(w => w.id === workout.id);
                                    if (fullWorkout) showWorkoutDetails(fullWorkout);
                                }}
                            >
                                <View style={styles.historyLeft}>
                                    <Text style={styles.historyDate}>{formatDate(workout.date)}</Text>
                                    <Text style={styles.historyName}>{workout.name}</Text>
                                    <Text style={styles.historyMuscles}>
                                        {workout.muscleGroups.join(', ')}
                                    </Text>
                                </View>
                                <View style={styles.historyRight}>
                                    <Text style={styles.historyVolume}>
                                        {(workout.volume / 1000).toFixed(1)}k lbs
                                    </Text>
                                    <Text style={styles.historyExercises}>
                                        {workout.exerciseCount} exercises
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>
                                No workouts recorded yet. Create your first workout to start tracking progress!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Motivational Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>
                        {progressStats.totalWorkouts === 0
                            ? "💪 Start your journey to the Mark Wahlberg physique!"
                            : progressStats.totalWorkouts < 5
                                ? "🔥 Great start! Keep the momentum going!"
                                : progressStats.totalWorkouts < 20
                                    ? "⚡ You're crushing it! Consistency is key!"
                                    : "🏆 Elite status! You're on the path to greatness!"}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f7fa',
    },
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        gap: 10,
    },
    timeRangeButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    activeTimeRange: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    timeRangeText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7f8c8d',
    },
    activeTimeRangeText: {
        color: '#fff',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#3498db',
    },
    statLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 12,
    },
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 150,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    chartBar: {
        flex: 1,
        alignItems: 'center',
        marginHorizontal: 2,
    },
    barContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'flex-end',
    },
    bar: {
        width: '100%',
        backgroundColor: '#3498db',
        borderRadius: 4,
        minHeight: 5,
    },
    barLabel: {
        fontSize: 10,
        color: '#7f8c8d',
        marginTop: 4,
    },
    barVolume: {
        fontSize: 9,
        color: '#3498db',
        fontWeight: '600',
    },
    emptyChartText: {
        textAlign: 'center',
        color: '#7f8c8d',
        fontStyle: 'italic',
        paddingVertical: 30,
    },
    muscleItem: {
        marginBottom: 12,
    },
    muscleName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    muscleBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        height: 24,
        overflow: 'hidden',
    },
    muscleBar: {
        height: '100%',
        backgroundColor: '#3498db',
        borderRadius: 20,
        minWidth: 30,
    },
    muscleCount: {
        position: 'absolute',
        right: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#7f8c8d',
    },
    prItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#f39c12',
    },
    prExercise: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    prDate: {
        fontSize: 11,
        color: '#7f8c8d',
        marginTop: 2,
    },
    prWeight: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#f39c12',
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    historyLeft: {
        flex: 1,
    },
    historyRight: {
        alignItems: 'flex-end',
    },
    historyDate: {
        fontSize: 11,
        color: '#7f8c8d',
        fontWeight: '600',
    },
    historyName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2c3e50',
        marginTop: 2,
    },
    historyMuscles: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    historyVolume: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#3498db',
    },
    historyExercises: {
        fontSize: 11,
        color: '#7f8c8d',
        marginTop: 2,
    },
    emptyCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    emptyText: {
        color: '#7f8c8d',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#2c3e50',
        textAlign: 'center',
        fontWeight: '500',
    },
});