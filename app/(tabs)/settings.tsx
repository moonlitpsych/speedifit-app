// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
    SafeAreaView,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

// Notification handler configuration
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const STORAGE_KEYS = {
    REMINDER_ENABLED: '@SpeediFit:reminderEnabled',
    REMINDER_TIME: '@SpeediFit:reminderTime',
    NOTIFICATION_ID: '@SpeediFit:notificationId',
};

export default function SettingsScreen() {
    const [reminderEnabled, setReminderEnabled] = useState(false);
    const [reminderTime, setReminderTime] = useState(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        loadSettings();
        checkPermissions();
    }, []);

    const loadSettings = async () => {
        try {
            const enabled = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_ENABLED);
            const time = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_TIME);

            if (enabled !== null) {
                setReminderEnabled(enabled === 'true');
            }

            if (time !== null) {
                setReminderTime(new Date(time));
            } else {
                // Default to 8:00 AM
                const defaultTime = new Date();
                defaultTime.setHours(8, 0, 0, 0);
                setReminderTime(defaultTime);
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    };

    const checkPermissions = async () => {
        const { status } = await Notifications.getPermissionsAsync();
        setHasPermission(status === 'granted');
    };

    const requestPermissions = async () => {
        const { status } = await Notifications.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        return status === 'granted';
    };

    const toggleReminder = async (value: boolean) => {
        if (value && !hasPermission) {
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications in your device settings to use reminders.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        setReminderEnabled(value);
        await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_ENABLED, value.toString());

        if (value) {
            await scheduleNotification();
            Alert.alert(
                'Reminder Set! 💊',
                `You'll receive a daily reminder at ${formatTime(reminderTime)} to take your creatine.`,
                [{ text: 'Perfect!' }]
            );
        } else {
            await cancelNotification();
            Alert.alert(
                'Reminder Disabled',
                'You won\'t receive creatine reminders anymore.',
                [{ text: 'OK' }]
            );
        }
    };

    const scheduleNotification = async () => {
        // Cancel existing notification
        await cancelNotification();

        // Calculate seconds until reminder time
        const now = new Date();
        const scheduledTime = new Date();
        scheduledTime.setHours(reminderTime.getHours());
        scheduledTime.setMinutes(reminderTime.getMinutes());
        scheduledTime.setSeconds(0);
        scheduledTime.setMilliseconds(0);

        // If the time has passed today, schedule for tomorrow
        if (scheduledTime <= now) {
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        // Schedule the notification
        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '💊 Creatine Time!',
                body: 'Time to take your creatine for those Mark Wahlberg gains! 💪',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { type: 'creatine_reminder' },
            },
            trigger: {
                hour: reminderTime.getHours(),
                minute: reminderTime.getMinutes(),
                repeats: true,
            },
        });

        // Save notification ID
        await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATION_ID, notificationId);
    };

    const cancelNotification = async () => {
        try {
            const notificationId = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATION_ID);
            if (notificationId) {
                await Notifications.cancelScheduledNotificationAsync(notificationId);
            }
        } catch (error) {
            console.error('Error canceling notification:', error);
        }
    };

    const handleTimeChange = async (event: any, selectedDate?: Date) => {
        // On Android, close picker after selection
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }

        if (selectedDate) {
            setReminderTime(selectedDate);
            await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_TIME, selectedDate.toISOString());

            if (reminderEnabled) {
                await scheduleNotification();
                // Only show alert on Android or when iOS modal is closed
                if (Platform.OS === 'android') {
                    Alert.alert(
                        'Time Updated! ⏰',
                        `Your creatine reminder is now set for ${formatTime(selectedDate)}.`,
                        [{ text: 'Great!' }]
                    );
                }
            }
        }
    };

    const handleTimePickerDone = async () => {
        setShowTimePicker(false);
        if (reminderEnabled) {
            Alert.alert(
                'Time Updated! ⏰',
                `Your creatine reminder is now set for ${formatTime(reminderTime)}.`,
                [{ text: 'Great!' }]
            );
        }
    };

    const setQuickTime = async (hour: number, minute: number) => {
        const newTime = new Date();
        newTime.setHours(hour, minute, 0, 0);
        setReminderTime(newTime);
        await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_TIME, newTime.toISOString());

        if (reminderEnabled) {
            await scheduleNotification();
            Alert.alert(
                'Time Updated! ⏰',
                `Your creatine reminder is now set for ${formatTime(newTime)}.`,
                [{ text: 'Perfect!' }]
            );
        }
    };

    const formatTime = (date: Date): string => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const testNotification = async () => {
        if (!hasPermission) {
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert(
                    'Permission Required',
                    'Please enable notifications to test.',
                    [{ text: 'OK' }]
                );
                return;
            }
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🧪 Test Notification',
                body: 'This is what your creatine reminder will look like! 💊',
                sound: true,
            },
            trigger: {
                seconds: 2,
            },
        });

        Alert.alert(
            'Test Sent! 📱',
            'You should receive a test notification in 2 seconds.',
            [{ text: 'OK' }]
        );
    };

    const clearAllData = () => {
        Alert.alert(
            'Clear All Data?',
            'This will delete all your maxes, workouts, and settings. This cannot be undone!',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            Alert.alert(
                                'Data Cleared',
                                'All app data has been reset. Please restart the app.',
                                [{ text: 'OK' }]
                            );
                        } catch (error) {
                            console.error('Error clearing data:', error);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Settings</Text>
                        <Text style={styles.subtitle}>
                            Customize your SpeediFit experience
                        </Text>
                    </View>

                    {/* Creatine Reminder Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💊 Creatine Reminder</Text>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={styles.settingLabel}>Daily Reminder</Text>
                                <Text style={styles.settingDescription}>
                                    Get notified to take your creatine
                                </Text>
                            </View>
                            <Switch
                                value={reminderEnabled}
                                onValueChange={toggleReminder}
                                trackColor={{ false: '#e0e0e0', true: '#3498db' }}
                                thumbColor={reminderEnabled ? '#fff' : '#f4f3f4'}
                                ios_backgroundColor="#e0e0e0"
                            />
                        </View>

                        {reminderEnabled && (
                            <>
                                <TouchableOpacity
                                    style={styles.settingRow}
                                    onPress={() => setShowTimePicker(true)}
                                >
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingLabel}>Reminder Time</Text>
                                        <Text style={styles.settingDescription}>
                                            Tap to change time
                                        </Text>
                                    </View>
                                    <View style={styles.timeDisplay}>
                                        <Text style={styles.timeText}>
                                            {formatTime(reminderTime)}
                                        </Text>
                                        <Ionicons name="chevron-forward" size={20} color="#7f8c8d" />
                                    </View>
                                </TouchableOpacity>

                                {/* Quick Time Presets */}
                                <View style={styles.presetsContainer}>
                                    <Text style={styles.presetsLabel}>Quick Set:</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <TouchableOpacity
                                            style={styles.presetButton}
                                            onPress={() => setQuickTime(7, 0)}
                                        >
                                            <Text style={styles.presetButtonText}>7:00 AM</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.presetButton}
                                            onPress={() => setQuickTime(8, 0)}
                                        >
                                            <Text style={styles.presetButtonText}>8:00 AM</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.presetButton}
                                            onPress={() => setQuickTime(12, 0)}
                                        >
                                            <Text style={styles.presetButtonText}>12:00 PM</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.presetButton}
                                            onPress={() => setQuickTime(18, 0)}
                                        >
                                            <Text style={styles.presetButtonText}>6:00 PM</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.presetButton}
                                            onPress={() => setQuickTime(20, 0)}
                                        >
                                            <Text style={styles.presetButtonText}>8:00 PM</Text>
                                        </TouchableOpacity>
                                    </ScrollView>
                                </View>

                                <TouchableOpacity
                                    style={styles.testButton}
                                    onPress={testNotification}
                                >
                                    <Ionicons name="notifications-outline" size={20} color="#fff" />
                                    <Text style={styles.testButtonText}>Test Notification</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    {/* Notification Status */}
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Notification Permission:</Text>
                            <Text style={[
                                styles.infoValue,
                                { color: hasPermission ? '#27ae60' : '#e74c3c' }
                            ]}>
                                {hasPermission ? 'Granted ✓' : 'Not Granted ✗'}
                            </Text>
                        </View>
                        {!hasPermission && (
                            <TouchableOpacity
                                style={styles.permissionButton}
                                onPress={requestPermissions}
                            >
                                <Text style={styles.permissionButtonText}>
                                    Enable Notifications
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* About Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>ℹ️ About</Text>
                        <View style={styles.aboutCard}>
                            <Text style={styles.aboutTitle}>SpeediFit</Text>
                            <Text style={styles.aboutText}>
                                Version 1.0.0{'\n'}
                                Phase 6 - Complete{'\n\n'}
                                Your companion app for the Speediance Gym Monster 2,
                                helping you achieve the Mark Wahlberg physique through
                                percentage-based training.
                            </Text>
                        </View>
                    </View>

                    {/* Tips Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>💡 Pro Tips</Text>
                        <View style={styles.tipsCard}>
                            <Text style={styles.tipItem}>
                                • Take creatine at the same time daily for best results
                            </Text>
                            <Text style={styles.tipItem}>
                                • 5g per day is the recommended dose
                            </Text>
                            <Text style={styles.tipItem}>
                                • Mix with water or your post-workout shake
                            </Text>
                            <Text style={styles.tipItem}>
                                • Stay hydrated - creatine pulls water into muscles
                            </Text>
                            <Text style={styles.tipItem}>
                                • Re-test your maxes every 4-6 weeks
                            </Text>
                        </View>
                    </View>

                    {/* Danger Zone */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>
                        <TouchableOpacity
                            style={styles.dangerButton}
                            onPress={clearAllData}
                        >
                            <Text style={styles.dangerButtonText}>Clear All Data</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Built with 💪 for the Speediance community
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Time Picker Modal - iOS Specific */}
            {showTimePicker && Platform.OS === 'ios' && (
                <View style={styles.timePickerModal}>
                    <View style={styles.timePickerContainer}>
                        <View style={styles.timePickerHeader}>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Text style={styles.timePickerCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <Text style={styles.timePickerTitle}>Set Reminder Time</Text>
                            <TouchableOpacity onPress={handleTimePickerDone}>
                                <Text style={styles.timePickerDone}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={reminderTime}
                            mode="time"
                            is24Hour={false}
                            display="spinner"
                            onChange={handleTimeChange}
                            textColor="#000000"
                            style={styles.timePicker}
                        />
                    </View>
                </View>
            )}

            {/* Time Picker - Android */}
            {showTimePicker && Platform.OS === 'android' && (
                <DateTimePicker
                    value={reminderTime}
                    mode="time"
                    is24Hour={false}
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    content: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#7f8c8d',
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
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    settingInfo: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 12,
        color: '#7f8c8d',
    },
    timeDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3498db',
        marginRight: 8,
    },
    testButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#3498db',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    testButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
    },
    infoCard: {
        backgroundColor: '#e8f4fd',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    infoLabel: {
        fontSize: 14,
        color: '#2980b9',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    permissionButton: {
        backgroundColor: '#2980b9',
        padding: 10,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    aboutCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    aboutTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#3498db',
        marginBottom: 8,
    },
    aboutText: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20,
    },
    tipsCard: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    tipItem: {
        fontSize: 14,
        color: '#7f8c8d',
        lineHeight: 20,
        marginBottom: 8,
    },
    dangerButton: {
        backgroundColor: '#e74c3c',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#95a5a6',
        fontStyle: 'italic',
    },
    timePickerModal: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        height: '100%',
        justifyContent: 'flex-end',
    },
    timePickerContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 30,
    },
    timePickerHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    timePickerCancel: {
        fontSize: 16,
        color: '#e74c3c',
    },
    timePickerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2c3e50',
    },
    timePickerDone: {
        fontSize: 16,
        color: '#3498db',
        fontWeight: '600',
    },
    timePicker: {
        height: 200,
        backgroundColor: '#fff',
    },
    presetsContainer: {
        marginTop: 8,
        marginBottom: 12,
    },
    presetsLabel: {
        fontSize: 12,
        color: '#7f8c8d',
        marginBottom: 8,
        marginLeft: 4,
    },
    presetButton: {
        backgroundColor: '#e8f4fd',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: '#3498db',
    },
    presetButtonText: {
        fontSize: 14,
        color: '#3498db',
        fontWeight: '500',
    },
});