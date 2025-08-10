import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView,
    Share
} from 'react-native';
import { exercises, getExercisesByMuscleGroup } from '../../src/data/exercises';
import {
    Exercise,
    UserMaxes,
    WorkoutExercise,
    MuscleGroup,
    SetSchemeConfig,
    Workout
} from '../../src/types';
import {
    setSchemes,
    generateWorkoutSets,
    formatWeight,
    formatPercentage,
    formatRestTime,
    calculateTotalVolume
} from '../../src/utils/workoutCalculations';
import { loadUserMaxes, saveWorkout } from '../../src/utils/storage';

export default function WorkoutsScreen() {
    const [workoutName, setWorkoutName] = useState('');
    const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const [selectedScheme, setSelectedScheme] = useState<string>('pyramid');
    const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
    const [showExerciseSelector, setShowExerciseSelector] = useState(false);
    const [userMaxes, setUserMaxes] = useState<UserMaxes>({});
    const [isLoading, setIsLoading] = useState(true);

    // Load saved maxes on component mount
    useEffect(() => {
        loadSavedMaxes();
    }, []);

    const loadSavedMaxes = async () => {
        setIsLoading(true);
        const savedMaxes = await loadUserMaxes();
        setUserMaxes(savedMaxes);
        setIsLoading(false);
    };

    const muscleGroups: MuscleGroup[] = [
        'Chest', 'Biceps', 'Triceps', 'Forearms',
        'Glutes', 'Hamstrings', 'Quadriceps', 'Calves',
        'Shoulders', 'Back', 'Core'
    ];

    const toggleMuscleGroup = (group: string) => {
        setSelectedMuscleGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const toggleExercise = (exercise: Exercise) => {
        setSelectedExercises(prev =>
            prev.find(e => e.id === exercise.id)
                ? prev.filter(e => e.id !== exercise.id)
                : [...prev, exercise]
        );
    };

    const generateWorkout = () => {
        if (selectedExercises.length === 0) {
            Alert.alert('No Exercises', 'Please select at least one exercise.');
            return;
        }

        const scheme = setSchemes[selectedScheme];
        const newWorkoutExercises: WorkoutExercise[] = [];
        const missingMaxes: string[] = [];

        selectedExercises.forEach(exercise => {
            const max = userMaxes[exercise.id];
            if (!max) {
                missingMaxes.push(exercise.name);
                return;
            }

            const sets = generateWorkoutSets(
                exercise.id,
                exercise.name,
                max.weight,
                scheme
            );

            newWorkoutExercises.push({
                exerciseId: exercise.id,
                exerciseName: exercise.name,
                sets: sets
            });
        });

        if (missingMaxes.length > 0) {
            Alert.alert(
                'Missing Maxes',
                `Please test your max for: ${missingMaxes.join(', ')}\n\nGo to Max Testing tab to record these.`,
                [{ text: 'OK' }]
            );
            return;
        }

        setWorkoutExercises(newWorkoutExercises);
        setShowExerciseSelector(false);

        Alert.alert(
            'Workout Generated! 💪',
            `Created ${newWorkoutExercises.length} exercises with ${scheme.name} scheme.`,
            [{ text: 'Let\'s Go!' }]
        );
    };

    const handleCreateWorkout = async () => {
        if (!workoutName.trim()) {
            Alert.alert('Name Required', 'Please enter a workout name.');
            return;
        }
        if (workoutExercises.length === 0) {
            Alert.alert('No Exercises', 'Please generate a workout first.');
            return;
        }

        const totalVolume = workoutExercises.reduce((total, exercise) => {
            return total + calculateTotalVolume(exercise.sets);
        }, 0);

        // Create workout object
        const workout: Workout = {
            id: Date.now().toString(),
            name: workoutName,
            date: new Date().toISOString(),
            muscleGroups: selectedMuscleGroups as MuscleGroup[],
            exercises: workoutExercises,
            totalVolume: totalVolume
        };

        // Save to storage
        await saveWorkout(workout);

        Alert.alert(
            'Workout Created! 🎯',
            `"${workoutName}" saved!\n\nTotal Volume: ${totalVolume.toLocaleString()} lbs\nExercises: ${workoutExercises.length}\n\nWould you like to share this workout?`,
            [
                { text: 'Share', onPress: () => shareWorkout(workout) },
                { text: 'Done' }
            ]
        );

        // Reset form
        setWorkoutName('');
        setSelectedMuscleGroups([]);
        setSelectedExercises([]);
        setWorkoutExercises([]);
    };

    const shareWorkout = async (workout: Workout) => {
        const workoutText = formatWorkoutForSharing(workout);
        try {
            await Share.share({
                message: workoutText,
                title: `SpeediFit Workout: ${workout.name}`
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const formatWorkoutForSharing = (workout: Workout): string => {
        let text = `🏋️ SpeediFit Workout: ${workout.name}\n`;
        text += `📅 Date: ${new Date(workout.date).toLocaleDateString()}\n`;
        text += `💪 Muscle Groups: ${workout.muscleGroups.join(', ')}\n`;
        text += `📊 Total Volume: ${workout.totalVolume?.toLocaleString()} lbs\n`;
        text += `\n--- EXERCISES ---\n\n`;

        workout.exercises.forEach((exercise, index) => {
            text += `${index + 1}. ${exercise.exerciseName}\n`;
            exercise.sets.forEach(set => {
                text += `   Set ${set.setNumber}: ${set.weight} lbs × ${set.reps} reps (${set.percentageOfMax}%) - Rest: ${formatRestTime(set.restTime)}\n`;
            });
            text += `   Volume: ${calculateTotalVolume(exercise.sets).toLocaleString()} lbs\n\n`;
        });

        text += `\n💡 Generated with SpeediFit - Percentage-based training for the Mark Wahlberg physique!`;
        return text;
    };

    // Get filtered exercises based on selected muscle groups
    const filteredExercises = selectedMuscleGroups.length > 0
        ? getExercisesByMuscleGroup(selectedMuscleGroups)
        : exercises;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading your maxes...</Text>
                </View>
            </SafeAreaView>
        );
    }

    // Check if user has any maxes saved
    const hasAnyMaxes = Object.keys(userMaxes).length > 0;

    if (!hasAnyMaxes) {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <View style={styles.content}>
                        <Text style={styles.title}>Create Custom Workout</Text>
                        <View style={styles.noMaxesCard}>
                            <Text style={styles.noMaxesEmoji}>⚠️</Text>
                            <Text style={styles.noMaxesTitle}>No Maxes Recorded</Text>
                            <Text style={styles.noMaxesText}>
                                You need to test your one-rep maxes before creating percentage-based workouts.
                            </Text>
                            <TouchableOpacity style={styles.goToMaxButton}>
                                <Text style={styles.goToMaxButtonText}>
                                    Go to Max Testing Tab →
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <Text style={styles.title}>Create Custom Workout</Text>
                    <Text style={styles.subtitle}>
                        Build percentage-based workouts for your Mark Wahlberg physique goals
                    </Text>

                    {/* Workout Name Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Workout Name</Text>
                        <TextInput
                            style={styles.input}
                            value={workoutName}
                            onChangeText={setWorkoutName}
                            placeholder="e.g., Upper Body Strength"
                            placeholderTextColor="#95a5a6"
                        />
                    </View>

                    {/* Muscle Group Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Target Muscle Groups</Text>
                        <View style={styles.muscleGroupContainer}>
                            {muscleGroups.map((group) => (
                                <TouchableOpacity
                                    key={group}
                                    style={[
                                        styles.muscleGroupChip,
                                        selectedMuscleGroups.includes(group) && styles.selectedChip
                                    ]}
                                    onPress={() => toggleMuscleGroup(group)}
                                >
                                    <Text style={[
                                        styles.chipText,
                                        selectedMuscleGroups.includes(group) && styles.selectedChipText
                                    ]}>
                                        {group}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Set Scheme Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Training Style</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {Object.entries(setSchemes).map(([key, scheme]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.schemeCard,
                                        selectedScheme === key && styles.selectedSchemeCard
                                    ]}
                                    onPress={() => setSelectedScheme(key)}
                                >
                                    <Text style={[
                                        styles.schemeName,
                                        selectedScheme === key && styles.selectedSchemeName
                                    ]}>
                                        {scheme.name}
                                    </Text>
                                    <Text style={[
                                        styles.schemeDescription,
                                        selectedScheme === key && styles.selectedSchemeDescription
                                    ]}>
                                        {scheme.sets.length} sets • {scheme.description}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Exercise Selection Toggle */}
                    <View style={styles.section}>
                        <View style={styles.exerciseHeader}>
                            <Text style={styles.sectionTitle}>Exercises</Text>
                            <TouchableOpacity
                                style={styles.addExerciseButton}
                                onPress={() => setShowExerciseSelector(!showExerciseSelector)}
                            >
                                <Text style={styles.addExerciseButtonText}>
                                    {showExerciseSelector ? '✓ Done' : '+ Add Exercises'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Exercise Selector */}
                        {showExerciseSelector && (
                            <View style={styles.exerciseSelectorContainer}>
                                <Text style={styles.exerciseSelectorHint}>
                                    {selectedMuscleGroups.length > 0
                                        ? `Showing exercises for: ${selectedMuscleGroups.join(', ')}`
                                        : 'Select muscle groups above to filter exercises'
                                    }
                                </Text>
                                <ScrollView style={styles.exerciseList}>
                                    {filteredExercises.map((exercise) => {
                                        const hasMax = !!userMaxes[exercise.id];
                                        const isSelected = selectedExercises.find(e => e.id === exercise.id);

                                        return (
                                            <TouchableOpacity
                                                key={exercise.id}
                                                style={[
                                                    styles.exerciseItem,
                                                    isSelected && styles.selectedExerciseItem,
                                                    !hasMax && styles.disabledExerciseItem
                                                ]}
                                                onPress={() => {
                                                    if (!hasMax) {
                                                        Alert.alert(
                                                            'Max Not Tested',
                                                            `Please test your max for ${exercise.name} first.\n\nGo to Max Testing tab.`,
                                                            [{ text: 'OK' }]
                                                        );
                                                        return;
                                                    }
                                                    toggleExercise(exercise);
                                                }}
                                            >
                                                <View style={styles.exerciseItemContent}>
                                                    <View>
                                                        <Text style={[
                                                            styles.exerciseItemName,
                                                            isSelected && styles.selectedExerciseItemName
                                                        ]}>
                                                            {exercise.name}
                                                        </Text>
                                                        <Text style={[
                                                            styles.exerciseItemMuscles,
                                                            isSelected && styles.selectedExerciseItemMuscles
                                                        ]}>
                                                            {exercise.primaryMuscle}
                                                        </Text>
                                                    </View>
                                                    <Text style={[
                                                        styles.exerciseItemMax,
                                                        isSelected && styles.selectedExerciseItemMax
                                                    ]}>
                                                        {hasMax
                                                            ? `Max: ${userMaxes[exercise.id].weight} lbs`
                                                            : 'No max'}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                {selectedExercises.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.generateButton}
                                        onPress={generateWorkout}
                                    >
                                        <Text style={styles.generateButtonText}>
                                            Generate Sets ({selectedExercises.length} exercises)
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {/* Selected Exercises Summary */}
                        {!showExerciseSelector && selectedExercises.length > 0 && (
                            <View style={styles.selectedExercisesSummary}>
                                <Text style={styles.selectedExercisesText}>
                                    Selected: {selectedExercises.map(e => e.name).join(', ')}
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Generated Workout Display */}
                    {workoutExercises.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Your Workout</Text>
                            {workoutExercises.map((exercise, exerciseIndex) => (
                                <View key={exercise.exerciseId} style={styles.workoutExerciseCard}>
                                    <Text style={styles.workoutExerciseName}>
                                        {exerciseIndex + 1}. {exercise.exerciseName}
                                    </Text>
                                    <View style={styles.setsContainer}>
                                        {exercise.sets.map((set) => (
                                            <View key={set.setNumber} style={styles.setRow}>
                                                <Text style={styles.setNumber}>Set {set.setNumber}</Text>
                                                <Text style={styles.setDetails}>
                                                    {formatWeight(set.weight)} × {set.reps} reps
                                                </Text>
                                                <Text style={styles.setPercentage}>
                                                    {formatPercentage(set.percentageOfMax)}
                                                </Text>
                                                <Text style={styles.setRest}>
                                                    Rest: {formatRestTime(set.restTime)}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                    <Text style={styles.exerciseVolume}>
                                        Volume: {calculateTotalVolume(exercise.sets).toLocaleString()} lbs
                                    </Text>
                                </View>
                            ))}

                            {/* Total Workout Stats */}
                            <View style={styles.workoutStatsCard}>
                                <Text style={styles.workoutStatTitle}>Workout Summary</Text>
                                <Text style={styles.workoutStat}>
                                    Total Exercises: {workoutExercises.length}
                                </Text>
                                <Text style={styles.workoutStat}>
                                    Total Sets: {workoutExercises.reduce((t, e) => t + e.sets.length, 0)}
                                </Text>
                                <Text style={styles.workoutStat}>
                                    Total Volume: {workoutExercises.reduce((t, e) =>
                                        t + calculateTotalVolume(e.sets), 0
                                    ).toLocaleString()} lbs
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <TouchableOpacity
                        style={[
                            styles.createButton,
                            workoutExercises.length === 0 && styles.createButtonDisabled
                        ]}
                        onPress={handleCreateWorkout}
                        disabled={workoutExercises.length === 0}
                    >
                        <Text style={styles.createButtonText}>Save Workout</Text>
                    </TouchableOpacity>

                    {workoutExercises.length > 0 && (
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={() => {
                                const tempWorkout: Workout = {
                                    id: 'temp',
                                    name: workoutName || 'Quick Workout',
                                    date: new Date().toISOString(),
                                    muscleGroups: selectedMuscleGroups as MuscleGroup[],
                                    exercises: workoutExercises,
                                    totalVolume: workoutExercises.reduce((t, e) =>
                                        t + calculateTotalVolume(e.sets), 0
                                    )
                                };
                                shareWorkout(tempWorkout);
                            }}
                        >
                            <Text style={styles.shareButtonText}>📤 Share Workout Sheet</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: '#7f8c8d',
    },
    noMaxesCard: {
        backgroundColor: '#fff',
        padding: 32,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noMaxesEmoji: {
        fontSize: 48,
        marginBottom: 16,
    },
    noMaxesTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    noMaxesText: {
        fontSize: 14,
        color: '#7f8c8d',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    goToMaxButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    goToMaxButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 24,
        lineHeight: 20,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        fontSize: 16,
        color: '#2c3e50',
    },
    muscleGroupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    muscleGroupChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
        margin: 4,
    },
    selectedChip: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    chipText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    selectedChipText: {
        color: '#fff',
    },
    schemeCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        minWidth: 150,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    selectedSchemeCard: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    schemeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    selectedSchemeName: {
        color: '#fff',
    },
    schemeDescription: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    selectedSchemeDescription: {
        color: '#e8f4fd',
    },
    exerciseHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addExerciseButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addExerciseButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    exerciseSelectorContainer: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    exerciseSelectorHint: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 12,
        fontStyle: 'italic',
    },
    exerciseList: {
        maxHeight: 300,
    },
    exerciseItem: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedExerciseItem: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    disabledExerciseItem: {
        opacity: 0.5,
    },
    exerciseItemContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseItemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
    },
    selectedExerciseItemName: {
        color: '#fff',
    },
    exerciseItemMuscles: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 2,
    },
    selectedExerciseItemMuscles: {
        color: '#e8f4fd',
    },
    exerciseItemMax: {
        fontSize: 12,
        color: '#3498db',
        fontWeight: '600',
    },
    selectedExerciseItemMax: {
        color: '#fff',
    },
    generateButton: {
        backgroundColor: '#27ae60',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    generateButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    selectedExercisesSummary: {
        backgroundColor: '#e8f4fd',
        padding: 12,
        borderRadius: 8,
    },
    selectedExercisesText: {
        fontSize: 14,
        color: '#2980b9',
        lineHeight: 20,
    },
    workoutExerciseCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    workoutExerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    setsContainer: {
        marginBottom: 8,
    },
    setRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    setNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7f8c8d',
        width: 50,
    },
    setDetails: {
        fontSize: 14,
        color: '#2c3e50',
        flex: 1,
        textAlign: 'center',
        fontWeight: '500',
    },
    setPercentage: {
        fontSize: 14,
        color: '#3498db',
        fontWeight: '600',
        width: 50,
        textAlign: 'right',
    },
    setRest: {
        fontSize: 12,
        color: '#95a5a6',
        width: 60,
        textAlign: 'right',
    },
    exerciseVolume: {
        fontSize: 12,
        color: '#7f8c8d',
        marginTop: 8,
        fontStyle: 'italic',
    },
    workoutStatsCard: {
        backgroundColor: '#f0f8ff',
        padding: 16,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
    },
    workoutStatTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    workoutStat: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    createButton: {
        backgroundColor: '#27ae60',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    createButtonDisabled: {
        backgroundColor: '#95a5a6',
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    shareButton: {
        backgroundColor: '#3498db',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    shareButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});