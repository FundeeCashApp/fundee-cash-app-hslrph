
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import { Button } from '@/components/button';
import { IconSymbol } from '@/components/IconSymbol';
import { router } from 'expo-router';

export default function WalletScreen() {
  const { user } = useAuth();
  const { adCooldownTime, isAdButtonActive, watchAd, refreshData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const formatCooldownTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWatchAd = async () => {
    if (!isAdButtonActive) {
      Alert.alert('Cooldown Active', `Please wait ${formatCooldownTime(adCooldownTime)} before watching more ads.`);
      return;
    }

    // Simulate ad watching
    router.push('/modals/ad-viewer');
  };

  const handleWithdraw = () => {
    if (!user?.walletBalance || user.walletBalance < 10) {
      Alert.alert('Insufficient Balance', 'Minimum withdrawal amount is $10.');
      return;
    }
    router.push('/modals/withdrawal');
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!user) {
    return null;
  }

  return (
    <ScrollView
      style={commonStyles.wrapper}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Wallet</Text>
      </View>

      {/* Balance Card */}
      <View style={[commonStyles.card, styles.balanceCard]}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${user.walletBalance.toFixed(2)}</Text>
        
        <View style={styles.ticketInfo}>
          <IconSymbol name="ticket" size={20} color={colors.primary} />
          <Text style={styles.ticketCount}>{user.ticketCount} tickets available</Text>
        </View>
      </View>

      {/* Watch Ads Section */}
      <View style={[commonStyles.card, styles.adCard]}>
        <Text style={styles.cardTitle}>Earn Tickets</Text>
        <Text style={styles.adDescription}>
          Watch ads to earn tickets for the daily draw. Each ad gives you 1 ticket!
        </Text>
        
        {!isAdButtonActive && (
          <View style={styles.cooldownContainer}>
            <IconSymbol name="clock" size={20} color={colors.warning} />
            <Text style={styles.cooldownText}>
              More ads available in {formatCooldownTime(adCooldownTime)}
            </Text>
          </View>
        )}
        
        <Button
          onPress={handleWatchAd}
          disabled={!isAdButtonActive}
          style={[
            styles.watchAdButton,
            !isAdButtonActive && styles.watchAdButtonDisabled
          ]}
        >
          <Text style={[
            styles.watchAdText,
            !isAdButtonActive && styles.watchAdTextDisabled
          ]}>
            {isAdButtonActive ? 'Watch Ad for 1 Ticket' : 'Ads Unavailable'}
          </Text>
        </Button>
        
        <Text style={styles.adNote}>
          After watching 5 ads continuously, there&apos;s a 10-minute cooldown period.
        </Text>
      </View>

      {/* Withdrawal Section */}
      <View style={[commonStyles.card, styles.withdrawalCard]}>
        <Text style={styles.cardTitle}>Withdraw Funds</Text>
        <Text style={styles.withdrawalDescription}>
          All withdrawals are processed manually and will take 3-5 business days. 
          We ensure secure and reliable transactions for all our members.
        </Text>
        
        <View style={styles.withdrawalMethods}>
          <View style={styles.methodItem}>
            <IconSymbol name="building.columns" size={24} color={colors.primary} />
            <Text style={styles.methodText}>Bank Transfer</Text>
          </View>
          <View style={styles.methodItem}>
            <IconSymbol name="bitcoinsign.circle" size={24} color={colors.primary} />
            <Text style={styles.methodText}>Cryptocurrency</Text>
          </View>
          <View style={styles.methodItem}>
            <IconSymbol name="creditcard" size={24} color={colors.primary} />
            <Text style={styles.methodText}>PayPal</Text>
          </View>
        </View>
        
        <Button
          onPress={handleWithdraw}
          disabled={!user.walletBalance || user.walletBalance < 10}
          style={[
            styles.withdrawButton,
            (!user.walletBalance || user.walletBalance < 10) && styles.withdrawButtonDisabled
          ]}
        >
          <Text style={[
            styles.withdrawText,
            (!user.walletBalance || user.walletBalance < 10) && styles.withdrawTextDisabled
          ]}>
            {user.walletBalance >= 10 ? 'Withdraw Funds' : 'Minimum $10 Required'}
          </Text>
        </Button>
        
        <Text style={styles.minimumNote}>
          Minimum withdrawal amount: $10
        </Text>
      </View>

      {/* Transaction History */}
      <View style={[commonStyles.card, styles.historyCard]}>
        <Text style={styles.cardTitle}>Recent Activity</Text>
        <View style={styles.emptyHistory}>
          <IconSymbol name="clock" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyHistoryText}>No recent transactions</Text>
          <Text style={styles.emptyHistorySubtext}>
            Your transaction history will appear here
          </Text>
        </View>
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
  balanceCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
  },
  ticketInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ticketCount: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  adCard: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  adDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  cooldownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
  },
  cooldownText: {
    fontSize: 14,
    color: colors.warning,
    fontWeight: '500',
  },
  watchAdButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  watchAdButtonDisabled: {
    backgroundColor: colors.grey,
  },
  watchAdText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  watchAdTextDisabled: {
    color: colors.textSecondary,
  },
  adNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  withdrawalCard: {
    marginBottom: 20,
  },
  withdrawalDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  withdrawalMethods: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  methodItem: {
    alignItems: 'center',
    gap: 8,
  },
  methodText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  withdrawButton: {
    backgroundColor: colors.success,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  withdrawButtonDisabled: {
    backgroundColor: colors.grey,
  },
  withdrawText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  withdrawTextDisabled: {
    color: colors.textSecondary,
  },
  minimumNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    marginBottom: 20,
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
