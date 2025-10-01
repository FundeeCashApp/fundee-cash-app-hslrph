
import { useAuth } from './AuthContext';
import { supabase } from '@/app/integrations/supabase/client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Draw, Winner, Ticket, AdWatch } from '@/types';

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
  const { user } = useAuth();
  const [currentDraw, setCurrentDraw] = useState<Draw | null>(null);
  const [timeUntilDraw, setTimeUntilDraw] = useState(0);
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [recentWinners, setRecentWinners] = useState<Winner[]>([]);
  const [adWatchCount, setAdWatchCount] = useState(0);
  const [adCooldownTime, setAdCooldownTime] = useState(0);
  const [isAdButtonActive, setIsAdButtonActive] = useState(true);

  // Ad cooldown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (adCooldownTime > 0) {
      interval = setInterval(() => {
        setAdCooldownTime(prev => {
          if (prev <= 1) {
            setIsAdButtonActive(true);
            setAdWatchCount(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [adCooldownTime]);

  const initializeData = useCallback(async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        loadCurrentDraw(),
        loadUserTickets(),
        loadRecentWinners(),
        loadAdWatchData(),
      ]);
    } catch (error) {
      console.error('Error initializing app data:', error);
    }
  }, [user]);

  const updateCountdown = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const drawTime = new Date(today.getTime() + 22 * 60 * 60 * 1000); // 10 PM ET (22:00)
    
    // If it's past 10 PM today, set for tomorrow
    if (now > drawTime) {
      drawTime.setDate(drawTime.getDate() + 1);
    }
    
    const timeDiff = Math.max(0, Math.floor((drawTime.getTime() - now.getTime()) / 1000));
    setTimeUntilDraw(timeDiff);
  }, []);

  useEffect(() => {
    if (user) {
      initializeData();
      updateCountdown();
      
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [user, initializeData, updateCountdown]);

  const loadCurrentDraw = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('draws')
        .select('*')
        .eq('draw_date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading current draw:', error);
        return;
      }

      if (data) {
        setCurrentDraw({
          id: data.id,
          drawDate: data.draw_date,
          drawTime: data.draw_time,
          status: data.status,
          totalTickets: data.total_tickets,
          minimumTickets: data.minimum_tickets,
          prizePool: data.prize_pool,
        });
      } else {
        // Create today's draw if it doesn't exist
        const drawTime = new Date();
        drawTime.setHours(22, 0, 0, 0); // 10 PM

        const { data: newDraw, error: createError } = await supabase
          .from('draws')
          .insert({
            draw_date: today,
            draw_time: drawTime.toISOString(),
            status: 'pending',
            total_tickets: 0,
            minimum_tickets: 300000,
            prize_pool: 0,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating draw:', createError);
          return;
        }

        if (newDraw) {
          setCurrentDraw({
            id: newDraw.id,
            drawDate: newDraw.draw_date,
            drawTime: newDraw.draw_time,
            status: newDraw.status,
            totalTickets: newDraw.total_tickets,
            minimumTickets: newDraw.minimum_tickets,
            prizePool: newDraw.prize_pool,
          });
        }
      }
    } catch (error) {
      console.error('Error loading current draw:', error);
    }
  };

  const loadUserTickets = async () => {
    if (!user || !currentDraw) return;

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user.id)
        .eq('draw_id', currentDraw.id);

      if (error) {
        console.error('Error loading user tickets:', error);
        return;
      }

      const tickets: Ticket[] = data.map(item => ({
        id: item.id,
        userId: item.user_id,
        drawId: item.draw_id,
        ticketNumber: item.ticket_number,
        source: item.source,
        createdAt: item.created_at,
      }));

      setUserTickets(tickets);
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
        .limit(10);

      if (error) {
        console.error('Error loading recent winners:', error);
        return;
      }

      const winners: Winner[] = data.map(item => ({
        id: item.id,
        drawId: item.draw_id,
        userId: item.user_id,
        ticketId: item.ticket_id,
        prizeAmount: parseFloat(item.prize_amount),
        prizeTier: item.prize_tier,
        firstName: item.users.first_name,
        lastName: item.users.last_name,
        createdAt: item.created_at,
      }));

      setRecentWinners(winners);
    } catch (error) {
      console.error('Error loading recent winners:', error);
    }
  };

  const loadAdWatchData = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('ad_watches')
        .select('*')
        .eq('user_id', user.id)
        .gte('watched_at', `${today}T00:00:00.000Z`)
        .order('watched_at', { ascending: false });

      if (error) {
        console.error('Error loading ad watch data:', error);
        return;
      }

      const totalWatched = data.length;
      const recentSession = data.find(watch => watch.session_count >= 5);
      
      if (recentSession) {
        const watchTime = new Date(recentSession.watched_at);
        const cooldownEnd = new Date(watchTime.getTime() + 10 * 60 * 1000); // 10 minutes
        const now = new Date();
        
        if (now < cooldownEnd) {
          const remainingTime = Math.floor((cooldownEnd.getTime() - now.getTime()) / 1000);
          setAdCooldownTime(remainingTime);
          setIsAdButtonActive(false);
        }
      }

      setAdWatchCount(totalWatched % 5);
    } catch (error) {
      console.error('Error loading ad watch data:', error);
    }
  };

  const generateTicketNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  const buyTicket = async (): Promise<string | null> => {
    if (!user || !currentDraw) return null;

    try {
      const ticketNumber = generateTicketNumber();
      
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
        return null;
      }

      // Refresh user tickets
      await loadUserTickets();
      
      return ticketNumber;
    } catch (error) {
      console.error('Error buying ticket:', error);
      return null;
    }
  };

  const watchAd = async (): Promise<boolean> => {
    if (!user || !currentDraw || !isAdButtonActive) return false;

    try {
      const newCount = adWatchCount + 1;
      
      const { error } = await supabase
        .from('ad_watches')
        .insert({
          user_id: user.id,
          ticket_earned: true,
          session_count: newCount,
        });

      if (error) {
        console.error('Error recording ad watch:', error);
        return false;
      }

      // Generate ticket for ad watch
      const ticketNumber = generateTicketNumber();
      const { error: ticketError } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          draw_id: currentDraw.id,
          ticket_number: ticketNumber,
          source: 'ad_watch',
        });

      if (ticketError) {
        console.error('Error creating ticket from ad:', ticketError);
        return false;
      }

      setAdWatchCount(newCount);

      // Check if cooldown should start
      if (newCount >= 5) {
        setAdCooldownTime(600); // 10 minutes
        setIsAdButtonActive(false);
      }

      // Refresh user tickets
      await loadUserTickets();
      
      return true;
    } catch (error) {
      console.error('Error watching ad:', error);
      return false;
    }
  };

  const performDraw = async () => {
    if (!currentDraw) return;

    try {
      // This would be implemented as a scheduled function
      // For now, just update the draw status
      const { error } = await supabase
        .from('draws')
        .update({ status: 'completed' })
        .eq('id', currentDraw.id);

      if (error) {
        console.error('Error updating draw status:', error);
      }
    } catch (error) {
      console.error('Error performing draw:', error);
    }
  };

  const checkDrawResults = useCallback(async () => {
    if (!currentDraw) return;

    try {
      // Check if draw time has passed and draw is still pending
      const drawTime = new Date(currentDraw.drawTime);
      const now = new Date();

      if (now > drawTime && currentDraw.status === 'pending') {
        await performDraw();
        await loadCurrentDraw();
        await loadRecentWinners();
      }
    } catch (error) {
      console.error('Error checking draw results:', error);
    }
  }, [currentDraw]);

  const refreshData = async () => {
    if (!user) return;
    
    try {
      await Promise.all([
        loadCurrentDraw(),
        loadUserTickets(),
        loadRecentWinners(),
        loadAdWatchData(),
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
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
