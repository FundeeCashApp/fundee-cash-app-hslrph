
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import * as Clipboard from 'expo-clipboard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Referral } from '@/types';

export default function ReferralsScreen() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    if (user) {
      loadReferrals();
    }
  }, [user]);

  const loadReferrals = async () => {
    try {
      if (!user) return;
      
      const storedReferrals = await AsyncStorage.getItem(`referrals_${user.id}`);
      if (storedReferrals) {
        const referralList = JSON.parse(storedReferrals);
        setReferrals(referralList);
        setTotalEarned(referralList.length);
      }
    } catch (error) {
      console.log('Error loading referrals:', error);
    }
  };

  const copyReferralCode = async () => {
    if (!user?.referralCode) return;
    
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const shareReferralLink = async () => {
    if (!user?.referralCode) return;
    
    const shareUrl = `https://fundeecash.com/signup?ref=${user.referralCode}`;
    const message = `Join me on Fundee Cash and earn money through daily draws! Use my referral code: ${user.referralCode}\n\n${shareUrl}`;
    
    try {
      await Share.share({
        message,
        title: 'Join Fundee Cash',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView style={commonStyles.wrapper} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Referrals</Text>
        <Text style={styles.subtitle}>Invite friends and earn tickets</Text>
      </View>

      {/* Referral Stats */}
      <View style={[commonStyles.card, styles.statsCard]}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{referrals.length}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalEarned}</Text>
          <Text style={styles.statLabel}>Tickets Earned</Text>
        </View>
      </View>

      {/* Referral Code */}
      <View style={[commonStyles.card, styles.codeCard]}>
        <Text style={styles.cardTitle}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.referralCode}>{user.referralCode}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyReferralCode}>
            <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.codeDescription}>
          Share this code with friends. When they sign up, you both get 1 ticket!
        </Text>
      </View>

      {/* Share Options */}
      <View style={[commonStyles.card, styles.shareCard]}>
        <Text style={styles.cardTitle}>Share & Earn</Text>
        <Text style={styles.shareDescription}>
          Invite friends to join Fundee Cash and earn 1 ticket for each successful referral.
        </Text>
        
        <Button onPress={shareReferralLink} style={styles.shareButton}>
          <IconSymbol name="square.and.arrow.up" size={20} color="white" />
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </Button>
      </View>

      {/* How It Works */}
      <View style={[commonStyles.card, styles.howItWorksCard]}>
        <Text style={styles.cardTitle}>How Referrals Work</Text>
        
        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Share Your Code</Text>
            <Text style={styles.stepDescription}>
              Send your unique referral code to friends and family
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Friend Signs Up</Text>
            <Text style={styles.stepDescription}>
              They create an account using your referral code
            </Text>
          </View>
        </View>

        <View style={styles.stepContainer}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Earn Tickets</Text>
            <Text style={styles.stepDescription}>
              You both receive 1 ticket for the daily draw
            </Text>
          </View>
        </View>
      </View>

      {/* Referral History */}
      <View style={[commonStyles.card, styles.historyCard]}>
        <Text style={styles.cardTitle}>Referral History</Text>
        
        {referrals.length > 0 ? (
          referrals.map((referral) => (
            <View key={referral.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>{referral.referredUserName}</Text>
                <Text style={styles.referralDate}>
                  {new Date(referral.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.referralReward}>
                <IconSymbol name="ticket" size={16} color={colors.success} />
                <Text style={styles.rewardText}>+1 Ticket</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyHistory}>
            <IconSymbol name="person.2" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyHistoryText}>No referrals yet</Text>
            <Text style={styles.emptyHistorySubtext}>
              Start sharing your code to earn tickets!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  codeCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 2,
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
  },
  codeDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  shareCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shareDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  howItWorksCard: {
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  historyCard: {
    marginBottom: 20,
  },
  referralItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  referralInfo: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  referralDate: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  referralReward: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 12,
  },
  emptyHistorySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});
