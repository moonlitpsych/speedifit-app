import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';

export default function HomeScreen() {
  const handleStartWorkout = () => {
    Alert.alert(
      'Start Workout',
      'Ready to build that Mark Wahlberg physique! Go to the Workouts tab to create your percentage-based workout.',
      [{ text: 'Let\'s Go!' }]
    );
  };

  const handleCreatineReminder = () => {
    Alert.alert(
      'Creatine Taken! 💪',
      'Great job staying consistent! Creatine helps with strength and muscle building.',
      [{ text: 'Nice!' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Workouts This Week</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0 lbs</Text>
              <Text style={styles.statLabel}>Total Volume</Text>
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
            style={[styles.button, styles.creatineButton]}
            onPress={handleCreatineReminder}
          >
            <Text style={styles.primaryButtonText}>✓ Took Creatine Today</Text>
          </TouchableOpacity>

          {/* Motivation Section */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationTitle}>💪 Today's Focus</Text>
            <Text style={styles.motivationText}>
              Build muscle with percentage-based training. Test your maxes, create workouts, and track progress!
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
    marginBottom: 24,
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
});