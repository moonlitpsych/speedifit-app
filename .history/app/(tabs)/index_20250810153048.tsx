import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  loadWorkouts,
  saveCreatineTaken,
  didTakeCreatineToday,
  loadUserMaxes
} from '../../src/utils/storage';

export default function HomeScreen() {
  const [workoutsThisWeek, setWorkoutsThisWeek] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [creatineTaken, setCreatineTaken] = useState(false);
  const [testedExercises, setTestedExercises] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load data when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [])
  );

  const loadHomeData = async () => {
    // Load workouts for the week
    const workouts = await loadWorkouts();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);

    const thisWeekWorkouts = workouts.filter(w =>
      new Date(w.date) >= weekStart
    );

    setWorkoutsThisWeek(thisWeekWorkouts.length);

    // Calculate total volume for the week
    const weekVolume = thisWeekWorkouts.reduce((total, workout) =>
      total + (workout.totalVolume || 0), 0
    );
    setTotalVolume(weekVolume);

    // Check creatine status
    const tookCreatine = await didTakeCreatineToday();
    setCreatineTaken(tookCreatine);

    // Count tested exercises
    const maxes = await loadUserMaxes();
    setTestedExercises(Object.keys(maxes).length);
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadHomeData();
    setIsRefreshing(false);
  };

  const handleStartWorkout = () => {
    Alert.alert(
      'Start Workout',
      'Ready to build that Mark Wahlberg physique! Go to the Workouts tab to create your percentage-based workout.',
      [{ text: 'Let\'s Go!' }]
    );
  };

  const handleCreatineReminder = async () => {
    if (creatineTaken) {
      Alert.alert(
        'Already Taken',
        'You\'ve already logged your creatine for today! Keep up the consistency.',
        [{ text: 'Nice!' }]
      );
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await saveCreatineTaken(today);
    setCreatineTaken(true);

    Alert.alert(
      'Creatine Logged! 💪',
      'Great job staying consistent! Creatine helps with strength and muscle building.',
      [{ text: 'Nice!' }]
    );
  };

  const getMotivationalMessage = () => {
    if (workoutsThisWeek === 0) {
      return "Time to start this week strong! Your Mark Wahlberg physique awaits.";
    } else if (workoutsThisWeek < 3) {
      return `${workoutsThisWeek} workout${workoutsThisWeek === 1 ? '' : 's'} down! Keep the momentum going.`;
    } else {
      return `Crushing it with ${workoutsThisWeek} workouts this week! You're on fire!`;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#3498db"
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              Your Speediance Gym Monster 2 Companion
            </Text>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{workoutsThisWeek}</Text>
              <Text style={styles.statLabel}>Workouts This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {totalVolume > 0 ? `${(totalVolume / 1000).toFixed(1)}k` : '0'}
              </Text>
              <Text style={styles.statLabel}>Weekly Volume (lbs)</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{testedExercises}</Text>
              <Text style={styles.statLabel}>Exercises Tested</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {creatineTaken ? '✅' : '⏳'}
              </Text>
              <Text style={styles.statLabel}>Creatine Today</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleStartWorkout}
          >
            <Text style={styles.primaryButtonText}>Start Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              creatineTaken ? styles.creatineButtonDone : styles.creatineButton
            ]}
            onPress={handleCreatineReminder}
          >
            <Text style={styles.primaryButtonText}>
              {creatineTaken ? '✅ Creatine Taken' : '💊 Take Creatine'}
            </Text>
          </TouchableOpacity>

          {/* Motivation Section */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>💪 Today's Focus</Text>
            <Text style={styles.motivationText}>
              {getMotivationalMessage()}
            </Text>
          </View>

          {/* Tips Card */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>🎯 Quick Tips</Text>
            <Text style={styles.tipsText}>
              • Test your maxes in the Max Testing tab{'\n'}
              • Create percentage-based workouts{'\n'}
              • Share your workout sheet to reference during training{'\n'}
              • Take creatine daily for best results{'\n'}
              • Re-test maxes every 4-6 weeks
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
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  button: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3498db',
  },
  creatineButton: {
    backgroundColor: '#f39c12',
  },
  creatineButtonDone: {
    backgroundColor: '#27ae60',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  motivationCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  motivationText: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: '#e8f4fd',
    padding: 16,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2980b9',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: '#2980b9',
    lineHeight: 20,
  },
});