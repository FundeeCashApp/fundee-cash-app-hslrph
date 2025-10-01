
import { IconSymbol } from '@/components/IconSymbol';
import { supabase } from '@/app/integrations/supabase/client';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Referral } from '@/types';
import { colors, commonStyles } from '@/styles/commonStyles';
import * as Clipboard from 'expo-clipboard';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { Button } from '@/components/button';

export default function ReferralsScreen() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReferrals = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, created_at')
        .eq('referred_by', user.referralCode);

      if (error) {
        console.error('Error loading referrals:', error);
        return;
      }

      const referralData: Referral[] = data.map(item => ({
        id: item.id,
        firstName: item.first_name,
        lastName: item.last_name,
        joinedAt: item.created_at,
      }));

      setReferrals(referralData);
    } catch (error) {
      console.error('Error loading referrals:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadReferrals();
    }
  }, [user, loadReferrals]);

  const copyReferralCode = async () => {
    if (!user?.referralCode) return;
    
    await Clipboard.setStringAsync(user.referralCode);
    Alert.alert('Copied!', 'Referral code copied to clipboard');
  };

  const shareReferralLink = async () => {
    if (!user?.referralCode) return;

    const message = `Join me on Fundee Cash and win daily prizes! Use my referral code: ${user.referralCode}`;
    
    try {
      await Share.share({
        message,
        title: 'Join Fundee Cash',
      });
    } catch (error) {
      console.error('Error sharing:', error);
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
        <Text style={styles.subtitle}>
          Earn 1 ticket for each friend you refer!
        </Text>
      </View>

      {/* Referral Code Card */}
      <View style={styles.codeCard}>
        <Text style={styles.codeTitle}>Your Referral Code</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.codeText}>{user.referralCode}</Text>
          <TouchableOpacity onPress={copyReferralCode} style={styles.copyButton}>
            <IconSymbol name="doc.on.doc" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={shareReferralLink} style={styles.shareButton}>
          <IconSymbol name="square.and.arrow.up" size={16} color="white" />
          <Text style={styles.shareButtonText}>Share Referral Link</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{referrals.length}</Text>
          <Text style={styles.statLabel}>Total Referrals</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{referrals.length}</Text>
          <Text style={styles.statLabel}>Tickets Earned</Text>
        </View>
      </View>

      {/* Referrals List */}
      <View style={styles.referralsCard}>
        <Text style={styles.referralsTitle}>Your Referrals</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading referrals...</Text>
        ) : referrals.length > 0 ? (
          referrals.map((referral) => (
            <View key={referral.id} style={styles.referralItem}>
              <View style={styles.referralInfo}>
                <Text style={styles.referralName}>
                  {referral.firstName} {referral.lastName}
                </Text>
                <Text style={styles.referralDate}>
                  Joined {new Date(referral.joinedAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.ticketBadge}>
                <IconSymbol name="ticket.fill" size={16} color="white" />
                <Text style={styles.ticketText}>+1</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <IconSymbol name="person.2" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyTitle}>No referrals yet</Text>
            <Text style={styles.emptySubtitle}>
              Share your referral code with friends to start earning tickets!
            </Text>
          </View>
        )}
      </View>

      {/* How it Works */}
      <View style={styles.howItWorksCard}>
        <Text style={styles.howItWorksTitle}>How Referrals Work</Text>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>Share your unique referral code</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>Friend signs up using your code</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>3</Text>
          </View>
          <Text style={styles.stepText}>You both get 1 free ticket!</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  codeCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  codeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
  },
  shareButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: 20,
  },
  referralsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  referralsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
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
    marginBottom: 4,
  },
  referralDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  ticketBadge: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  howItWorksCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  howItWorksTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
});
