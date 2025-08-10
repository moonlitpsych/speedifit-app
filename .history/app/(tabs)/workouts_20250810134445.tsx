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

export default function WorkoutsScreen() {
    const [workoutName, setWorkoutName] = useState('');
    const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);

    const muscleGroups = [
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

    const handleCreateWorkout = () => {
        if (!workoutName.trim()) {
            Alert.alert('Name Required', 'Please enter a workout name.');
            return;
        }
        if (selectedMuscleGroups.length === 0) {
            Alert.alert('Muscle Groups Required', 'Please select at least one muscle group.');
            return;
        }
        Alert.alert(
            'Workout Created!',
            `"${workoutName}" has been created targeting ${selectedMuscleGroups.join(', ')}.`,
            [{ text: 'OK' }]
        );
        // Reset form
        setWorkoutName('');
        setSelectedMuscleGroups([]);
    };

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

                    {/* Placeholder for exercises */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Exercises</Text>
                        <View style={styles.placeholderCard}>
                            <Text style={styles.placeholderText}>
                                Exercise selection coming in Phase 2
                            </Text>
                        </View>
                    </View>

                    {/* Create Button */}
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={handleCreateWorkout}
                    >
                        <Text style={styles.createButtonText}>Create Workout</Text>
                    </TouchableOpacity>

                    {/* Export Button */}
                    <TouchableOpacity
                        style={styles.exportButton}
                        onPress={() => Alert.alert('Export', 'CSV export will be added in Phase 4')}
                    >
                        <Text style={styles.exportButtonText}>📊 Export to CSV</Text>
                    </TouchableOpacity>
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
    placeholderCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#95a5a6',
        fontStyle: 'italic',
    },
    createButton: {
        backgroundColor: '#27ae60',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    exportButton: {
        backgroundColor: '#f39c12',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    exportButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});