import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';

export default function ProgressScreen() {
    const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'year'>('month');

    const timeframes = [
        { key: 'week' as const, label: 'Week' },
        { key: 'month' as const, label: 'Month' },
        { key: 'year' as const, label: 'Year' },
    ];

    // Mock data for Phase 1
    const progressStats = {
        totalWorkouts: 0,
        totalVolume: 0,
        averageWorkoutDuration: 0,
        personalRecords: [],
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.content}>
                    <Text style={styles.title}>Progress Tracking</Text>
                    <Text style={styles.subtitle}>
                        Your journey to the Mark Wahlberg physique
                    </Text>

                    {/* Timeframe Selector */}
                    <View style={styles.timeframeContainer}>
                        {timeframes.map((timeframe) => (
                            <TouchableOpacity
                                key={timeframe.key}
                                style={[
                                    styles.timeframeButton,
                                    selectedTimeframe === timeframe.key && styles.activeTimeframe
                                ]}
                                onPress={() => setSelectedTimeframe(timeframe.key)}
                            >
                                <Text style={[
                                    styles.timeframeText,
                                    selectedTimeframe === timeframe.key && styles.activeTimeframeText
                                ]}>
                                    {timeframe.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Overall Stats */}
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{progressStats.totalWorkouts}</Text>
                            <Text style={styles.statLabel}>Total Workouts</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{progressStats.totalVolume}</Text>
                            <Text style={styles.statLabel}>Total Volume (lbs)</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>{progressStats.averageWorkoutDuration}</Text>
                            <Text style={styles.statLabel}>Avg Duration (min)</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>0</Text>
                            <Text style={styles.statLabel}>Streak (days)</Text>
                        </View>
                    </View>

                    {/* Progress Chart Placeholder */}
                    <View style={styles.chartSection}>
                        <Text style={styles.sectionTitle}>Volume Progress</Text>
                        <View style={styles.chartPlaceholder}>
                            <Text style={styles.chartEmoji}>📊</Text>
                            <Text style={styles.placeholderText}>
                                Progress charts will display here
                            </Text>
                            <Text style={styles.placeholderSubtext}>
                                Start working out to see your gains!
                            </Text>
                        </View>
                    </View>

                    {/* Personal Records */}
                    <View style={styles.prSection}>
                        <Text style={styles.sectionTitle}>Personal Records</Text>
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>
                                No personal records yet. Start testing your maxes and complete workouts to track PRs!
                            </Text>
                        </View>
                    </View>

                    {/* Apple Health Integration Notice */}
                    <View style={styles.integrationCard}>
                        <Text style={styles.integrationTitle}>🔗 Apple Health Integration</Text>
                        <Text style={styles.integrationText}>
                            Coming soon: Connect to Apple Health to automatically sync your Speediance workouts!
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
    },
    timeframeContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f2f6',
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
    },
    timeframeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeTimeframe: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    timeframeText: {
        fontSize: 14,
        color: '#7f8c8d',
        fontWeight: '500',
    },
    activeTimeframeText: {
        color: '#2c3e50',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    statCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        width: '48%',
        marginBottom: 8,
        marginHorizontal: '1%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        textAlign: 'center',
    },
    chartSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 12,
    },
    chartPlaceholder: {
        backgroundColor: '#fff',
        padding: 40,
        borderRadius: 12,
        alignItems: 'center',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    chartEmoji: {
        fontSize: 40,
        marginBottom: 12,
    },
    placeholderText: {
        fontSize: 14,
        color: '#7f8c8d',
        marginBottom: 4,
    },
    placeholderSubtext: {
        fontSize: 12,
        color: '#95a5a6',
    },
    prSection: {
        marginBottom: 24,
    },
    emptyCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    emptyText: {
        color: '#7f8c8d',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 20,
    },
    integrationCard: {
        backgroundColor: '#e8f4fd',
        padding: 16,
        borderRadius: 12,
    },
    integrationTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2980b9',
        marginBottom: 8,
    },
    integrationText: {
        fontSize: 14,
        color: '#2980b9',
        lineHeight: 20,
    },
});