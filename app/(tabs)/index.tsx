
import { router } from 'expo-router';
import { IconSymbol } from '@/components/IconSymbol';
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { colors, commonStyles } from '@/styles/commonStyles';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Button } from '@/components/button';
import { useApp } from '@/contexts/AppContext';

export default function HomeScreen() {
  const { user } = useAuth();
  const {
    currentDraw,
    timeUntilDraw,
    userTickets,
    recentWinners,
    buyTicket,
    checkDrawResults,
    refreshData,
  } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  // Redirect to welcome if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/welcome');
    }
  }, [user]);

  const checkDrawResultsCallback = useCallback(() => {
    checkDrawResults();
  }, [checkDrawResults]);

  useEffect(() => {
    if (currentDraw) {
      checkDrawResultsCallback();
    }
  }, [currentDraw, checkDrawResultsCallback]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuyTicket = async () => {
    const ticketNumber = await buyTicket();
    if (ticketNumber) {
      Alert.alert(
        'Ticket Purchased!',
        `Your ticket number is: ${ticketNumber}`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Failed to purchase ticket. Please try again.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  if (!user) {
    return null; // Will redirect in useEffect
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
        <Text style={styles.welcomeText}>Welcome back, {user.firstName}!</Text>
        <Text style={styles.balanceText}>
          Wallet Balance: ${user.walletBalance?.toFixed(2) || '0.00'}
        </Text>
      </View>

      {/* Countdown Timer */}
      <View style={styles.countdownCard}>
        <Text style={styles.countdownTitle}>Next Draw In</Text>
        <Text style={styles.countdownTime}>{formatTime(timeUntilDraw)}</Text>
        <Text style={styles.countdownSubtitle}>Daily draw at 10:00 PM ET</Text>
      </View>

      {/* Prize Information */}
      <View style={styles.prizeCard}>
        <Text style={styles.prizeTitle}>Today&apos;s Prizes</Text>
        <View style={styles.prizeGrid}>
          <View style={styles.prizeItem}>
            <Text style={styles.prizeAmount}>$100</Text>
            <Text style={styles.prizeCount}>10 winners</Text>
          </View>
          <View style={styles.prizeItem}>
            <Text style={styles.prizeAmount}>$50</Text>
            <Text style={styles.prizeCount}>6 winners</Text>
          </View>
          <View style={styles.prizeItem}>
            <Text style={styles.prizeAmount}>$10</Text>
            <Text style={styles.prizeCount}>20 winners</Text>
          </View>
        </View>
        <Text style={styles.prizeNote}>
          Prizes increase as more members participate!
        </Text>
      </View>

      {/* User Tickets */}
      <View style={styles.ticketsCard}>
        <View style={styles.ticketsHeader}>
          <Text style={styles.ticketsTitle}>Your Tickets</Text>
          <Text style={styles.ticketsCount}>{userTickets.length}</Text>
        </View>
        {userTickets.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {userTickets.map((ticket) => (
              <View key={ticket.id} style={styles.ticketItem}>
                <Text style={styles.ticketNumber}>{ticket.ticketNumber}</Text>
                <Text style={styles.ticketSource}>{ticket.source}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noTicketsText}>
            No tickets yet. Buy a ticket or watch ads to participate!
          </Text>
        )}
      </View>

      {/* Buy Ticket Button */}
      <TouchableOpacity onPress={handleBuyTicket} style={styles.buyButton}>
        <IconSymbol name="ticket.fill" size={20} color="white" />
        <Text style={styles.buyButtonText}>Buy Ticket - $1.00</Text>
      </TouchableOpacity>

      {/* Recent Winners */}
      {recentWinners.length > 0 && (
        <View style={styles.winnersCard}>
          <Text style={styles.winnersTitle}>Recent Winners</Text>
          {recentWinners.slice(0, 5).map((winner) => (
            <View key={winner.id} style={styles.winnerItem}>
              <Text style={styles.winnerName}>
                {winner.firstName} {winner.lastName?.charAt(0)}.
              </Text>
              <Text style={styles.winnerPrize}>${winner.prizeAmount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.actionsCard}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/wallet')}
        >
          <IconSymbol name="tv.fill" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Watch Ads</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/referrals')}
        >
          <IconSymbol name="person.2.fill" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Refer Friends</Text>
        </TouchableOpacity>
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
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  balanceText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  countdownCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  countdownTime: {
    fontSize: 36,
    color: 'white',
    fontWeight: '800',
    marginBottom: 8,
  },
  countdownSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  prizeCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  prizeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  prizeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  prizeItem: {
    alignItems: 'center',
  },
  prizeAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  prizeCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  prizeNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  ticketsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  ticketsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  ticketItem: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  ticketNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  ticketSource: {
    fontSize: 10,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  noTicketsText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  winnersCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  winnersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  winnerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  winnerName: {
    fontSize: 14,
    color: colors.text,
  },
  winnerPrize: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  actionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 20,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginTop: 8,
  },
});
