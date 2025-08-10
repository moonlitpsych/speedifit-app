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

export default function MaxTestingScreen() {
    const [selectedExercise, setSelectedExercise] = useState('');
    const [maxWeight, setMaxWeight] = useState('');

    // Sample exercises for Phase 1
    const exercises = [
        { id: 'chest_press', name: 'Chest Press', current: 0 },
        { id: 'squat', name: 'Squat', current: 0 },
        { id: 'deadlift', name: 'Deadlift', current: 0 },
        { id: 'bicep_curl', name: 'Bicep Curl', current: 0 },
        { id: 'shoulder_press', name: 'Shoulder Press', current: 0 },
    ];

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

        Alert.alert(
            'Max Saved!',
            `Your ${selectedExercise} max has been set to ${weight} lbs. This will be used for percentage-based workouts.`,
            [{ text: 'OK' }]
        );

        setSelectedExercise('');
        setMaxWeight('');
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

                    {/* Exercise Selection */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Exercise</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {exercises.map((exercise) => (
                                <TouchableOpacity
                                    key={exercise.id}
                                    style={[
                                        styles.exerciseCard,
                                        selectedExercise === exercise.name && styles.selectedExerciseCard
                                    ]}
                                    onPress={() => setSelectedExercise(exercise.name)}
                                >
                                    <Text style={[
                                        styles.exerciseName,
                                        selectedExercise === exercise.name && styles.selectedExerciseName
                                    ]}>
                                        {exercise.name}
                                    </Text>
                                    <Text style={[
                                        styles.exerciseMax,
                                        selectedExercise === exercise.name && styles.selectedExerciseMax
                                    ]}>
                                        Current: {exercise.current} lbs
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Weight Input */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Enter One-Rep Max</Text>
                        <TextInput
                            style={styles.input}
                            value={maxWeight}
                            onChangeText={setMaxWeight}
                            placeholder="Enter weight in lbs"
                            placeholderTextColor="#95a5a6"
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        style={styles.saveButton}
                        onPress={handleSaveMax}
                    >
                        <Text style={styles.saveButtonText}>Save Max</Text>
                    </TouchableOpacity>

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
    exerciseCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginRight: 12,
        minWidth: 120,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    selectedExerciseCard: {
        backgroundColor: '#3498db',
        borderColor: '#3498db',
    },
    exerciseName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    selectedExerciseName: {
        color: '#fff',
    },
    exerciseMax: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    selectedExerciseMax: {
        color: '#e8f4fd',
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
    saveButton: {
        backgroundColor: '#27ae60',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 24,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
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