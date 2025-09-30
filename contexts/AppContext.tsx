
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Draw, Winner, Ticket, AdWatch } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AppContextType {
  currentDraw: Draw | null;
  timeUntilDraw: number;
  userTickets: Ticket[];
  recentWinners: Winner[];
  adWatchCount: number;
  adCooldownTime: number;
  isAdButtonActive: boolean;
  buyTicket: () => Promise<string | null>;
  watchAd: () => Promise<boolean>;
  checkDrawResults: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [timeUntilDraw, setTimeUntilDraw] = useState<number>(0);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [adWatchCount, setAdWatchCount] = useState<number>(0);
  const [adCooldownTime, setAdCooldownTime] = useState<number>(0);
  const [isAdButtonActive, setIsAdButtonActive] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      initializeData();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (adCooldownTime > 0) {
      const interval = setInterval(() => {
        setAdCooldownTime(prev => {
          if (prev <= 1) {
            setIsAdButtonActive(true);
            setAdWatchCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [adCooldownTime]);

  const initializeData = async () => {
    await loadCurrentDraw();
    await loadUserTickets();
    await loadRecentWinners();
    await loadAdWatchData();
  };

  const loadCurrentDraw = async () => {
    try {
      // Get today's draw
      const today = new Date();
      const drawDate = today.toISOString().split('T')[0];
      
      // Set draw time to 10 PM ET (22:00)
      const drawTime = new Date(today);
      drawTime.setHours(22, 0, 0, 0);
      
      // If it's past 10 PM, get tomorrow's draw
      if (today.getHours() >= 22) {
        drawTime.setDate(drawTime.getDate() + 1);
      }

      const { data: existingDraw, error } = await supabase
        .from('draws')
        .select('*')
        .eq('draw_date', drawTime.toISOString().split('T')[0])
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading draw:', error);
        return;
      }

      if (existingDraw) {
        const draw: Draw = {
          id: existingDraw.id,
          drawDate: existingDraw.draw_date,
          drawTime: existingDraw.draw_time,
          status: existingDraw.status,
          totalTickets: existingDraw.total_tickets,
          minimumTickets: existingDraw.minimum_tickets,
          prizePool: existingDraw.prize_pool,
          createdAt: existingDraw.created_at,
          updatedAt: existingDraw.updated_at,
        };
        setCurrentDraw(draw);
      } else {
        // Create new draw
        const { data: newDraw, error: createError } = await supabase
          .from('draws')
          .insert({
            draw_date: drawTime.toISOString().split('T')[0],
            draw_time: drawTime.toISOString(),
            minimum_tickets: 300000,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating draw:', createError);
          return;
        }

        if (newDraw) {
          const draw: Draw = {
            id: newDraw.id,
            drawDate: newDraw.draw_date,
            drawTime: newDraw.draw_time,
            status: newDraw.status,
            totalTickets: newDraw.total_tickets,
            minimumTickets: newDraw.minimum_tickets,
            prizePool: newDraw.prize_pool,
            createdAt: newDraw.created_at,
            updatedAt: newDraw.updated_at,
          };
          setCurrentDraw(draw);
        }
      }
    } catch (error) {
      console.error('Error loading current draw:', error);
    }
  };

  const loadUserTickets = async () => {
    try {
      if (!user || !currentDraw) return;
      
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('draw_id', currentDraw.id);

      if (error) {
        console.error('Error loading user tickets:', error);
        return;
      }

      if (data) {
        const tickets: Ticket[] = data.map(ticket => ({
          id: ticket.id,
          userId: ticket.user_id,
          drawId: ticket.draw_id,
          ticketNumber: ticket.ticket_number,
          source: ticket.source,
          createdAt: ticket.created_at,
        }));
        setUserTickets(tickets);
      }
    } catch (error) {
      console.error('Error loading user tickets:', error);
    }
  };

  const loadRecentWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          users!inner(first_name, last_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading recent winners:', error);
        return;
      }

      if (data) {
        const winners: Winner[] = data.map(winner => ({
          id: winner.id,
          drawId: winner.draw_id,
          userId: winner.user_id,
          ticketId: winner.ticket_id,
          prizeAmount: winner.prize_amount,
          prizeTier: winner.prize_tier,
          createdAt: winner.created_at,
          user: {
            firstName: winner.users.first_name,
            lastName: winner.users.last_name,
          },
        }));
        setRecentWinners(winners);
      }
    } catch (error) {
      console.error('Error loading recent winners:', error);
    }
  };

  const loadAdWatchData = async () => {
    try {
      if (!user) return;
      
      // Get today's ad watches
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ad_watches')
        .select('*')
        .eq('user_id', user.id)
        .gte('watched_at', `${today}T00:00:00`)
        .lt('watched_at', `${today}T23:59:59`)
        .order('watched_at', { ascending: false });

      if (error) {
        console.error('Error loading ad watch data:', error);
        return;
      }

      if (data && data.length > 0) {
        // Count consecutive ad watches
        let consecutiveCount = 0;
        const lastAdWatch = data[0];
        const lastWatchTime = new Date(lastAdWatch.watched_at);
        const now = new Date();
        
        // Check if last ad watch was within the last session
        for (const adWatch of data) {
          if (adWatch.session_count === lastAdWatch.session_count) {
            consecutiveCount++;
          } else {
            break;
          }
        }

        setAdWatchCount(consecutiveCount);

        // Check if in cooldown period (10 minutes after 5th ad)
        if (consecutiveCount >= 5) {
          const cooldownEnd = new Date(lastWatchTime);
          cooldownEnd.setMinutes(cooldownEnd.getMinutes() + 10);
          
          if (now < cooldownEnd) {
            const remainingTime = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
            setAdCooldownTime(remainingTime);
            setIsAdButtonActive(false);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ad watch data:', error);
    }
  };

  const updateCountdown = () => {
    if (!currentDraw) return;
    
    const now = new Date();
    const drawTime = new Date(currentDraw.drawTime);
    const timeDiff = drawTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      // Time for draw!
      performDraw();
      setTimeUntilDraw(0);
    } else {
      setTimeUntilDraw(Math.floor(timeDiff / 1000));
    }
  };

  const generateTicketNumber = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.rpc('generate_ticket_number');
      if (error) {
        console.error('Error generating ticket number:', error);
        // Fallback to client-side generation
        return Math.floor(100000000 + Math.random() * 900000000).toString();
      }
      return data;
    } catch (error) {
      console.error('Error generating ticket number:', error);
      // Fallback to client-side generation
      return Math.floor(100000000 + Math.random() * 900000000).toString();
    }
  };

  const buyTicket = async (): Promise<string | null> => {
    try {
      if (!user || !currentDraw) return null;
      
      const ticketNumber = await generateTicketNumber();
      
      // Insert ticket into database
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          draw_id: currentDraw.id,
          ticket_number: ticketNumber,
          source: 'purchase',
        })
        .select()
        .single();

      if (error) {
        console.error('Error buying ticket:', error);
        Alert.alert('Error', 'Failed to purchase ticket');
        return null;
      }

      if (data) {
        // Update local state
        const newTicket: Ticket = {
          id: data.id,
          userId: data.user_id,
          drawId: data.draw_id,
          ticketNumber: data.ticket_number,
          source: data.source,
          createdAt: data.created_at,
        };
        setUserTickets(prev => [...prev, newTicket]);

        // Update draw total tickets
        const { error: updateError } = await supabase
          .from('draws')
          .update({ total_tickets: currentDraw.totalTickets + 1 })
          .eq('id', currentDraw.id);

        if (!updateError) {
          setCurrentDraw(prev => prev ? { ...prev, totalTickets: prev.totalTickets + 1 } : null);
        }

        return ticketNumber;
      }

      return null;
    } catch (error) {
      console.error('Error buying ticket:', error);
      return null;
    }
  };

  const watchAd = async (): Promise<boolean> => {
    try {
      if (!user || !isAdButtonActive || !currentDraw) return false;
      
      const newCount = adWatchCount + 1;
      
      // Record ad watch
      const { error: adError } = await supabase
        .from('ad_watches')
        .insert({
          user_id: user.id,
          session_count: newCount,
          ticket_earned: true,
        });

      if (adError) {
        console.error('Error recording ad watch:', error);
        return false;
      }

      // Award ticket
      const ticketNumber = await generateTicketNumber();
      const { data, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          draw_id: currentDraw.id,
          ticket_number: ticketNumber,
          source: 'ad_watch',
        })
        .select()
        .single();

      if (ticketError) {
        console.error('Error awarding ticket:', ticketError);
        return false;
      }

      if (data) {
        const newTicket: Ticket = {
          id: data.id,
          userId: data.user_id,
          drawId: data.draw_id,
          ticketNumber: data.ticket_number,
          source: data.source,
          createdAt: data.created_at,
        };
        setUserTickets(prev => [...prev, newTicket]);
      }

      setAdWatchCount(newCount);
      
      // Check if need cooldown
      if (newCount >= 5) {
        setAdCooldownTime(600); // 10 minutes
        setIsAdButtonActive(false);
      }
      
      return true;
    } catch (error) {
      console.error('Error watching ad:', error);
      return false;
    }
  };

  const performDraw = async () => {
    try {
      if (!currentDraw || currentDraw.status !== 'pending') return;
      
      // Check if minimum tickets reached
      if (currentDraw.totalTickets < currentDraw.minimumTickets) {
        // Refund everyone
        const { error } = await supabase
          .from('draws')
          .update({ status: 'refunded' })
          .eq('id', currentDraw.id);

        if (!error) {
          setCurrentDraw(prev => prev ? { ...prev, status: 'refunded' } : null);
          Alert.alert(
            'Draw Cancelled',
            'The minimum number of tickets was not reached. All participants will be refunded.',
            [{ text: 'OK' }]
          );
        }
        return;
      }

      // Get all tickets for this draw
      const { data: allTickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('draw_id', currentDraw.id);

      if (ticketsError || !allTickets || allTickets.length === 0) {
        console.error('Error getting tickets for draw:', ticketsError);
        return;
      }

      // Randomly select winners
      const shuffledTickets = [...allTickets].sort(() => Math.random() - 0.5);
      const winners = [];

      // 10 winners of $100 (tier1)
      for (let i = 0; i < Math.min(10, shuffledTickets.length); i++) {
        const ticket = shuffledTickets[i];
        winners.push({
          draw_id: currentDraw.id,
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          prize_amount: 100,
          prize_tier: 'tier1',
        });
      }

      // 6 winners of $50 (tier2)
      for (let i = 10; i < Math.min(16, shuffledTickets.length); i++) {
        const ticket = shuffledTickets[i];
        winners.push({
          draw_id: currentDraw.id,
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          prize_amount: 50,
          prize_tier: 'tier2',
        });
      }

      // 20 winners of $10 (tier3)
      for (let i = 16; i < Math.min(36, shuffledTickets.length); i++) {
        const ticket = shuffledTickets[i];
        winners.push({
          draw_id: currentDraw.id,
          user_id: ticket.user_id,
          ticket_id: ticket.id,
          prize_amount: 10,
          prize_tier: 'tier3',
        });
      }

      // Insert winners
      const { error: winnersError } = await supabase
        .from('winners')
        .insert(winners);

      if (winnersError) {
        console.error('Error inserting winners:', winnersError);
        return;
      }

      // Update draw status
      const totalPrizePool = winners.reduce((sum, winner) => sum + winner.prize_amount, 0);
      const { error: drawError } = await supabase
        .from('draws')
        .update({ 
          status: 'completed',
          prize_pool: totalPrizePool,
        })
        .eq('id', currentDraw.id);

      if (!drawError) {
        setCurrentDraw(prev => prev ? { 
          ...prev, 
          status: 'completed',
          prizePool: totalPrizePool,
        } : null);

        // Update winners' wallet balances
        for (const winner of winners) {
          await supabase
            .from('users')
            .update({ 
              wallet_balance: supabase.raw(`wallet_balance + ${winner.prize_amount}`)
            })
            .eq('id', winner.user_id);
        }

        // Refresh data
        await loadRecentWinners();
        await checkDrawResults();
        
        // Create next draw
        setTimeout(() => {
          loadCurrentDraw();
        }, 1000);
      }
    } catch (error) {
      console.error('Error performing draw:', error);
    }
  };

  const checkDrawResults = async () => {
    try {
      if (!user || !currentDraw) return;
      
      // Check if user won in the current draw
      const { data: userWins, error } = await supabase
        .from('winners')
        .select('*')
        .eq('draw_id', currentDraw.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error checking draw results:', error);
        return;
      }

      if (userWins && userWins.length > 0) {
        const totalWinnings = userWins.reduce((sum, win) => sum + win.prize_amount, 0);
        Alert.alert(
          '🎉 Congratulations! 🎉',
          `You won $${totalWinnings}! The money has been added to your wallet.`,
          [{ text: 'Amazing!' }]
        );

        // Update user's wallet balance in context
        await updateUser({ walletBalance: user.walletBalance + totalWinnings });
      }
    } catch (error) {
      console.error('Error checking draw results:', error);
    }
  };

  const refreshData = async () => {
    await initializeData();
  };

  return (
    <AppContext.Provider
      value={{
        currentDraw,
        timeUntilDraw,
        userTickets,
        recentWinners,
        adWatchCount,
        adCooldownTime,
        isAdButtonActive,
        buyTicket,
        watchAd,
        checkDrawResults,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
