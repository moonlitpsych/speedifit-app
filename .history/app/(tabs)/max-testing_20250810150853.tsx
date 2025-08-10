import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    SafeAreaView
} from 'react-native';
import { exercises } from '../../src/data/exercises';
import { UserMaxes, Exercise } from '../../src/types';
import { formatWeight } from '../../src/utils/workoutCalculations';

export default function MaxTestingScreen() {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
    const [maxWeight, setMaxWeight] = useState('');
    const [userMaxes, setUserMaxes] = useState<UserMaxes>({});
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    // Get unique muscle groups for filtering
    const muscleCategories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Core'];

    // Filter exercises by category
    const filteredExercises = selectedCategory === 'All'
        ? exercises
        : exercises.filter(ex =>
            ex.primaryMuscle === selectedCategory ||
            (selectedCategory === 'Legs' && ['Quadriceps', 'Hamstrings', 'Glutes', 'Calves'].includes(ex.primaryMuscle))
        );

    const handleSaveMax = () => {
        if (!selectedExercise || !maxWeight.trim()) {
            Alert.alert('Missing Information', 'Please select an exercise and enter a weight.');
            return;
        }

        const weight = parseInt(maxWeight);
        if (isNaN(weight) || weight <= 0) {
            Alert.alert('Invalid Weight', 'Please enter a valid positive number.');
            return;
        }

        // Save the max
        const newMaxes = {
            ...userMaxes,
            [selectedExercise.id]: {
                weight: weight,
                testedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
            }
        };
        setUserMaxes(newMaxes);

        Alert.alert(
            '💪 Max Saved!',
            `Your ${selectedExercise.name} max has been set to ${weight} lbs.\n\nThis will be used for percentage-based workouts.`,
            [{ text: 'OK' }]
        );

        // Reset form
        setSelectedExercise(null);
        setMaxWeight('');
    };

    const getCurrentMax = (exerciseId: string): string => {
        const max = userMaxes[exerciseId];
        if (max) {
            return `${max.weight} lbs`;
        }
        return 'Not tested';
    };

    const getLastTestedDate = (exerciseId: string): string => {
        const max = userMaxes[exerciseId];
        if (max) {
            return `(${max.testedDate})`;
        }
        return '';
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <Text style={styles.title}>Max Testing</Text>
                    <Text style={styles.subtitle}>
                        Record your one-rep maxes for percentage-based training
                    </Text>

                    {/* Instructions Card */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>📋 How It Works</Text>
                        <Text style={styles.infoText}>
                            Test your one-rep max for each exercise. These maxes will be used to calculate your working weights as percentages, just like high school weightlifting!
                        </Text>
                    </View>

                    {/* Category Filter */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Filter by Muscle Group</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {muscleCategories.map((category) => (
                                <TouchableOpacity
                                    key={category}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === category && styles.selectedCategoryChip
                                    ]}
                                    onPress={() => setSelectedCategory(category)}
                                >
                                    <Text style={[
                                        styles.categoryChipText,
                                        selectedCategory === category && styles.selectedCategoryChipText
                                    ]}>
                                        {category}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Exercise Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Select Exercise ({filteredExercises.length} exercises)
                        </Text>
                        <ScrollView style={styles.exerciseList}>
                            {filteredExercises.map((exercise) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={[
                                        styles.exerciseCard,
                                        selectedExercise?.id === exercise.id && styles.selectedExerciseCard
                                    ]}
                                    onPress={() => setSelectedExercise(exercise)}
                                >
                                    <View style={styles.exerciseCardContent}>
                                        <View style={styles.exerciseInfo}>
                                            <Text style={[
                                                styles.exerciseName,
                                                selectedExercise?.id === exercise.id && styles.selectedExerciseName
                                            ]}>
                                                {exercise.name}
                                            </Text>
                                            <Text style={[
                                                styles.exerciseMuscles,
                                                selectedExercise?.id === exercise.id && styles.selectedExerciseMuscles
                                            ]}>
                                                {exercise.muscleGroups.join(', ')}
                                            </Text>
                                        </View>
                                        <View style={styles.exerciseMaxInfo}>
                                            <Text style={[
                                                styles.exerciseMax,
                                                selectedExercise?.id === exercise.id && styles.selectedExerciseMax
                                            ]}>
                                                {getCurrentMax(exercise.id)}
                                            </Text>
                                            <Text style={[
                                                styles.exerciseDate,
                                                selectedExercise?.id === exercise.id && styles.selectedExerciseDate
                                            ]}>
                                                {getLastTestedDate(exercise.id)}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Selected Exercise Details */}
                    {selectedExercise && (
                        <View style={styles.selectedDetails}>
                            <Text style={styles.selectedTitle}>Selected: {selectedExercise.name}</Text>
                            <Text style={styles.selectedDescription}>{selectedExercise.description}</Text>
                            {selectedExercise.tips && (
                                <Text style={styles.selectedTips}>💡 {selectedExercise.tips}</Text>
                            )}
                        </View>
                    )}

                    {/* Weight Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Enter One-Rep Max</Text>
                        <TextInput
                            style={[styles.input, !selectedExercise && styles.inputDisabled]}
                            value={maxWeight}
                            onChangeText={setMaxWeight}
                            placeholder={selectedExercise ? "Enter weight in lbs" : "Select an exercise first"}
                            placeholderTextColor="#95a5a6"
                            keyboardType="numeric"
                            editable={!!selectedExercise}
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, !selectedExercise && styles.saveButtonDisabled]}
                        onPress={handleSaveMax}
                        disabled={!selectedExercise}
                    >
                        <Text style={styles.saveButtonText}>Save Max</Text>
                    </TouchableOpacity>

                    {/* Your Current Maxes Summary */}
                    {Object.keys(userMaxes).length > 0 && (
                        <View style={styles.summaryCard}>
                            <Text style={styles.summaryTitle}>📊 Your Current Maxes</Text>
                            <Text style={styles.summaryCount}>
                                You've tested {Object.keys(userMaxes).length} exercise{Object.keys(userMaxes).length !== 1 ? 's' : ''}
                            </Text>
                        </View>
                    )}

                    {/* Tips Card */}
                    <View style={styles.tipsCard}>
                        <Text style={styles.tipsTitle}>💡 Testing Tips</Text>
                        <Text style={styles.tipsText}>
                            • Always warm up thoroughly{'\n'}
                            • Have a spotter for safety{'\n'}
                            • Test when you're fresh{'\n'}
                            • Re-test every 4-6 weeks{'\n'}
                            • Use Speediance safety features
                        </Text>
                    </View>
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
    infoCard: {
        backgroundColor: '#e8f4fd',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2980b9',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 14,
        color: '#2980b9',
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
    categoryChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    selectedCategoryChip: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    categoryChipText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    selectedCategoryChipText: {
        color: '#fff',
    },
    exerciseList: {
        maxHeight: 300,
    },
    exerciseCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    selectedExerciseCard: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    exerciseCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    exerciseInfo: {
        flex: 1,
    },
    exerciseName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    selectedExerciseName: {
        color: '#fff',
    },
    exerciseMuscles: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    selectedExerciseMuscles: {
        color: '#e8f4fd',
    },
    exerciseMaxInfo: {
        alignItems: 'flex-end',
    },
    exerciseMax: {
        fontSize: 14,
        fontWeight: '600',
        color: '#3498db',
    },
    selectedExerciseMax: {
        color: '#fff',
    },
    exerciseDate: {
        fontSize: 10,
        color: '#95a5a6',
        marginTop: 2,
    },
    selectedExerciseDate: {
        color: '#e8f4fd',
    },
    selectedDetails: {
        backgroundColor: '#f0f8ff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#3498db',
    },
    selectedTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    selectedDescription: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 8,
        lineHeight: 20,
    },
    selectedTips: {
        fontSize: 13,
        color: '#2980b9',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    input: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#3498db',
        fontSize: 18,
        textAlign: 'center',
        fontWeight: '600',
        color: '#2c3e50',
    },
    inputDisabled: {
        borderColor: '#e0e0e0',
        backgroundColor: '#f8f9fa',
    },
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    saveButtonDisabled: {
        backgroundColor: '#95a5a6',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    summaryCount: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    tipsCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tipsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 8,
    },
    tipsText: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20,
    },
});