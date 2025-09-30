
import React, { useState, useEffect, useCallback } from 'react';
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

  const checkDrawResultsCallback = useCallback(checkDrawResults, [checkDrawResults]);

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  useEffect(() => {
    checkDrawResultsCallback();
  }, [currentDraw, checkDrawResultsCallback]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuyTicket = async () => {
    if (!currentDraw || currentDraw.status !== 'pending') {
      Alert.alert('Error', 'No active draw available');
      return;
    }

    const ticketNumber = await buyTicket();
    if (ticketNumber) {
      Alert.alert(
        'Ticket Purchased!',
        `Your ticket number is: ${ticketNumber}\n\nGood luck in today's draw!`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Error', 'Failed to purchase ticket');
    }
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
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user.firstName}!</Text>
      </View>

      {/* Countdown Card */}
      <View style={[commonStyles.card, styles.countdownCard]}>
        <Text style={styles.cardTitle}>Next Draw</Text>
        <Text style={styles.drawTime}>Today at 10:00 PM ET</Text>
        
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownLabel}>Time Remaining</Text>
          <Text style={styles.countdownTime}>
            {timeUntilDraw > 0 ? formatTime(timeUntilDraw) : '00:00:00'}
          </Text>
        </View>

        {currentDraw && (
          <View style={styles.drawInfo}>
            <View style={styles.drawInfoItem}>
              <Text style={styles.drawInfoLabel}>Total Tickets</Text>
              <Text style={styles.drawInfoValue}>
                {currentDraw.totalTickets.toLocaleString()}
              </Text>
            </View>
            <View style={styles.drawInfoItem}>
              <Text style={styles.drawInfoLabel}>Your Tickets</Text>
              <Text style={styles.drawInfoValue}>{userTickets.length}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Prize Information */}
      <View style={[commonStyles.card, styles.prizeCard]}>
        <Text style={styles.cardTitle}>Today&apos;s Prizes</Text>
        <Text style={styles.prizeNote}>
          Prize amounts and winner count will increase as more members participate
        </Text>
        
        <View style={styles.prizeList}>
          <View style={styles.prizeItem}>
            <View style={[styles.prizeIcon, { backgroundColor: '#FFD700' }]}>
              <Text style={styles.prizeIconText}>🏆</Text>
            </View>
            <View style={styles.prizeDetails}>
              <Text style={styles.prizeAmount}>$100</Text>
              <Text style={styles.prizeCount}>10 winners</Text>
            </View>
          </View>
          
          <View style={styles.prizeItem}>
            <View style={[styles.prizeIcon, { backgroundColor: '#C0C0C0' }]}>
              <Text style={styles.prizeIconText}>🥈</Text>
            </View>
            <View style={styles.prizeDetails}>
              <Text style={styles.prizeAmount}>$50</Text>
              <Text style={styles.prizeCount}>6 winners</Text>
            </View>
          </View>
          
          <View style={styles.prizeItem}>
            <View style={[styles.prizeIcon, { backgroundColor: '#CD7F32' }]}>
              <Text style={styles.prizeIconText}>🥉</Text>
            </View>
            <View style={styles.prizeDetails}>
              <Text style={styles.prizeAmount}>$10</Text>
              <Text style={styles.prizeCount}>20 winners</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Ticket Purchase */}
      <View style={[commonStyles.card, styles.ticketCard]}>
        <Text style={styles.cardTitle}>Get Your Tickets</Text>
        <Text style={styles.ticketBalance}>
          Your Tickets: {userTickets.length}
        </Text>
        
        <Button
          onPress={handleBuyTicket}
          style={styles.buyTicketButton}
          disabled={!currentDraw || currentDraw.status !== 'pending'}
        >
          <Text style={styles.buyTicketText}>
            {currentDraw?.status === 'pending' ? 'Buy Ticket' : 'Draw Not Active'}
          </Text>
        </Button>
        
        <TouchableOpacity
          style={styles.earnTicketsButton}
          onPress={() => router.push('/(tabs)/wallet')}
        >
          <IconSymbol name="plus.circle" size={20} color={colors.primary} />
          <Text style={styles.earnTicketsText}>Earn More Tickets</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Winners */}
      {recentWinners.length > 0 && (
        <View style={[commonStyles.card, styles.winnersCard]}>
          <Text style={styles.cardTitle}>Recent Winners</Text>
          {recentWinners.slice(0, 5).map((winner, index) => (
            <View key={winner.id} style={styles.winnerItem}>
              <View style={styles.winnerInfo}>
                <Text style={styles.winnerName}>
                  {winner.user?.firstName} {winner.user?.lastName}
                </Text>
                <Text style={styles.winnerTicket}>Ticket #{winner.ticketId}</Text>
              </View>
              <Text style={styles.winnerAmount}>${winner.prizeAmount}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Draw Status */}
      {currentDraw?.status === 'refunded' && (
        <View style={[commonStyles.card, styles.refundCard]}>
          <IconSymbol name="exclamationmark.triangle" size={24} color={colors.warning} />
          <Text style={styles.refundTitle}>Draw Cancelled</Text>
          <Text style={styles.refundMessage}>
            The number of tickets in the draw did not meet the minimum requirement of 300,000. 
            All participants have been refunded. We apologize for any inconvenience.
          </Text>
        </View>
      )}
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
  welcomeText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
  },
  countdownCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  drawTime: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  countdownTime: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  drawInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  drawInfoItem: {
    alignItems: 'center',
  },
  drawInfoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  drawInfoValue: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  prizeCard: {
    marginBottom: 20,
  },
  prizeNote: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  prizeList: {
    gap: 12,
  },
  prizeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 8,
  },
  prizeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prizeIconText: {
    fontSize: 20,
  },
  prizeDetails: {
    flex: 1,
  },
  prizeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  prizeCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  ticketCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketBalance: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  buyTicketButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginBottom: 12,
  },
  buyTicketText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  earnTicketsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  earnTicketsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  winnersCard: {
    marginBottom: 20,
  },
  winnerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  winnerTicket: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  winnerAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.success,
  },
  refundCard: {
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    borderColor: colors.warning,
    marginBottom: 20,
  },
  refundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.warning,
    marginTop: 8,
    marginBottom: 8,
  },
  refundMessage: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 20,
  },
});
