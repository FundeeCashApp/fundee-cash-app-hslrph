
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';

export default function AdViewerModal() {
  const { user, updateUser } = useAuth();
  const { watchAd } = useApp();
  const [adProgress, setAdProgress] = useState(0);
  const [isWatching, setIsWatching] = useState(false);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    if (isWatching && adProgress < 100) {
      const interval = setInterval(() => {
        setAdProgress(prev => {
          if (prev >= 100) {
            setAdCompleted(true);
            return 100;
          }
          return prev + 2; // 2% every 100ms = 5 seconds total
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isWatching, adProgress]);

  const startWatching = () => {
    setIsWatching(true);
    setAdProgress(0);
  };

  const handleAdComplete = async () => {
    const success = await watchAd();
    if (success) {
      Alert.alert(
        'Ticket Earned!',
        'You have successfully earned 1 ticket for watching the ad.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', 'Failed to award ticket. Please try again.');
      router.back();
    }
  };

  const handleClose = () => {
    if (isWatching && !adCompleted) {
      Alert.alert(
        'Close Ad?',
        'You need to watch the entire ad to earn a ticket. Are you sure you want to close?',
        [
          { text: 'Continue Watching', style: 'cancel' },
          { text: 'Close', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Watch Ad</Text>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <IconSymbol name="xmark" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Ad Content Area */}
      <View style={styles.adContainer}>
        {!isWatching ? (
          <View style={styles.adPreview}>
            <IconSymbol name="play.circle.fill" size={80} color={colors.primary} />
            <Text style={styles.adTitle}>Sample Advertisement</Text>
            <Text style={styles.adDescription}>
              Watch this 5-second ad to earn 1 ticket for today&apos;s draw
            </Text>
            <Button onPress={startWatching} style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Watching</Text>
            </Button>
          </View>
        ) : (
          <View style={styles.adPlayer}>
            <View style={styles.videoPlaceholder}>
              <IconSymbol name="tv" size={60} color={colors.textSecondary} />
              <Text style={styles.videoText}>Ad Playing...</Text>
            </View>
            
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${adProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(adProgress)}%</Text>
            </View>

            {adCompleted && (
              <View style={styles.completedContainer}>
                <IconSymbol name="checkmark.circle.fill" size={48} color={colors.success} />
                <Text style={styles.completedText}>Ad Completed!</Text>
                <Button onPress={handleAdComplete} style={styles.claimButton}>
                  <Text style={styles.claimButtonText}>Claim Your Ticket</Text>
                </Button>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          • Watch the entire ad to earn 1 ticket{'\n'}
          • You can watch up to 5 ads before a 10-minute cooldown{'\n'}
          • Tickets are automatically added to your account
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  closeButton: {
    padding: 8,
  },
  adContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  adPreview: {
    alignItems: 'center',
    padding: 40,
  },
  adTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
  },
  adDescription: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  adPlayer: {
    width: '100%',
    alignItems: 'center',
  },
  videoPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  videoText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 12,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    minWidth: 40,
  },
  completedContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  completedText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.success,
    marginTop: 12,
    marginBottom: 20,
  },
  claimButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  claimButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
