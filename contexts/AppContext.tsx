
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Draw, Winner, Ticket, AdWatch } from '@/types';
import { useAuth } from './AuthContext';

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
      const storedDraw = await AsyncStorage.getItem('currentDraw');
      if (storedDraw) {
        setCurrentDraw(JSON.parse(storedDraw));
      } else {
        // Create today's draw
        const today = new Date();
        const drawTime = new Date(today);
        drawTime.setHours(22, 0, 0, 0); // 10 PM
        
        if (today > drawTime) {
          // If it's past 10 PM, create tomorrow's draw
          drawTime.setDate(drawTime.getDate() + 1);
        }

        const newDraw: Draw = {
          id: drawTime.toISOString().split('T')[0],
          date: drawTime.toISOString().split('T')[0],
          totalTickets: 0,
          winners: [],
          status: 'pending',
          drawTime: drawTime.toISOString(),
        };

        setCurrentDraw(newDraw);
        await AsyncStorage.setItem('currentDraw', JSON.stringify(newDraw));
      }
    } catch (error) {
      console.log('Error loading current draw:', error);
    }
  };

  const loadUserTickets = async () => {
    try {
      if (!user) return;
      
      const storedTickets = await AsyncStorage.getItem(`userTickets_${user.id}`);
      if (storedTickets) {
        const tickets = JSON.parse(storedTickets);
        const todayTickets = tickets.filter((ticket: Ticket) => 
          ticket.drawDate === new Date().toISOString().split('T')[0]
        );
        setUserTickets(todayTickets);
      }
    } catch (error) {
      console.log('Error loading user tickets:', error);
    }
  };

  const loadRecentWinners = async () => {
    try {
      const storedWinners = await AsyncStorage.getItem('recentWinners');
      if (storedWinners) {
        setRecentWinners(JSON.parse(storedWinners));
      }
    } catch (error) {
      console.log('Error loading recent winners:', error);
    }
  };

  const loadAdWatchData = async () => {
    try {
      if (!user) return;
      
      const today = new Date().toISOString().split('T')[0];
      const storedAdData = await AsyncStorage.getItem(`adWatch_${user.id}_${today}`);
      
      if (storedAdData) {
        const adData = JSON.parse(storedAdData);
        setAdWatchCount(adData.count || 0);
        
        if (adData.cooldownEnd && new Date() < new Date(adData.cooldownEnd)) {
          const remainingTime = Math.ceil((new Date(adData.cooldownEnd).getTime() - new Date().getTime()) / 1000);
          setAdCooldownTime(remainingTime);
          setIsAdButtonActive(false);
        }
      }
    } catch (error) {
      console.log('Error loading ad watch data:', error);
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

  const generateTicketNumber = (): string => {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  };

  const buyTicket = async (): Promise<string | null> => {
    try {
      if (!user || !currentDraw) return null;
      
      const ticketNumber = generateTicketNumber();
      const newTicket: Ticket = {
        id: Date.now().toString(),
        number: ticketNumber,
        userId: user.id,
        drawDate: currentDraw.date,
        isWinner: false,
        createdAt: new Date().toISOString(),
      };

      // Save ticket
      const existingTickets = await AsyncStorage.getItem(`userTickets_${user.id}`) || '[]';
      const tickets = JSON.parse(existingTickets);
      tickets.push(newTicket);
      await AsyncStorage.setItem(`userTickets_${user.id}`, JSON.stringify(tickets));

      // Update current draw total
      const updatedDraw = { ...currentDraw, totalTickets: currentDraw.totalTickets + 1 };
      setCurrentDraw(updatedDraw);
      await AsyncStorage.setItem('currentDraw', JSON.stringify(updatedDraw));

      // Update user tickets
      setUserTickets(prev => [...prev, newTicket]);

      return ticketNumber;
    } catch (error) {
      console.log('Error buying ticket:', error);
      return null;
    }
  };

  const watchAd = async (): Promise<boolean> => {
    try {
      if (!user || !isAdButtonActive) return false;
      
      const newCount = adWatchCount + 1;
      setAdWatchCount(newCount);
      
      // Award ticket
      await updateUser({ ticketCount: user.ticketCount + 1 });
      
      // Check if need cooldown
      if (newCount >= 5) {
        const cooldownEnd = new Date();
        cooldownEnd.setMinutes(cooldownEnd.getMinutes() + 10);
        
        setAdCooldownTime(600); // 10 minutes
        setIsAdButtonActive(false);
        
        // Save ad watch data
        const today = new Date().toISOString().split('T')[0];
        const adData = {
          count: newCount,
          cooldownEnd: cooldownEnd.toISOString(),
        };
        await AsyncStorage.setItem(`adWatch_${user.id}_${today}`, JSON.stringify(adData));
      }
      
      return true;
    } catch (error) {
      console.log('Error watching ad:', error);
      return false;
    }
  };

  const performDraw = async () => {
    try {
      if (!currentDraw) return;
      
      // Check if minimum tickets reached
      if (currentDraw.totalTickets < 300000) {
        // Refund everyone
        const updatedDraw = { ...currentDraw, status: 'refunded' as const };
        setCurrentDraw(updatedDraw);
        await AsyncStorage.setItem('currentDraw', JSON.stringify(updatedDraw));
        return;
      }

      // Perform draw - simulate winners
      const winners: Winner[] = [];
      
      // 10 winners of $100
      for (let i = 0; i < 10; i++) {
        winners.push({
          id: `winner_${Date.now()}_${i}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          userName: `Winner ${i + 1}`,
          ticketNumber: generateTicketNumber(),
          amount: 100,
          drawDate: currentDraw.date,
        });
      }
      
      // 6 winners of $50
      for (let i = 0; i < 6; i++) {
        winners.push({
          id: `winner_${Date.now()}_${i + 10}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          userName: `Winner ${i + 11}`,
          ticketNumber: generateTicketNumber(),
          amount: 50,
          drawDate: currentDraw.date,
        });
      }
      
      // 20 winners of $10
      for (let i = 0; i < 20; i++) {
        winners.push({
          id: `winner_${Date.now()}_${i + 16}`,
          userId: `user_${Math.floor(Math.random() * 1000)}`,
          userName: `Winner ${i + 17}`,
          ticketNumber: generateTicketNumber(),
          amount: 10,
          drawDate: currentDraw.date,
        });
      }

      const updatedDraw = { ...currentDraw, winners, status: 'completed' as const };
      setCurrentDraw(updatedDraw);
      setRecentWinners(winners);
      
      await AsyncStorage.setItem('currentDraw', JSON.stringify(updatedDraw));
      await AsyncStorage.setItem('recentWinners', JSON.stringify(winners));
      
      // Create tomorrow's draw
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(22, 0, 0, 0);
      
      const newDraw: Draw = {
        id: tomorrow.toISOString().split('T')[0],
        date: tomorrow.toISOString().split('T')[0],
        totalTickets: 0,
        winners: [],
        status: 'pending',
        drawTime: tomorrow.toISOString(),
      };
      
      setCurrentDraw(newDraw);
      await AsyncStorage.setItem('currentDraw', JSON.stringify(newDraw));
      
    } catch (error) {
      console.log('Error performing draw:', error);
    }
  };

  const checkDrawResults = async () => {
    // Check if user won
    if (!user || !currentDraw || currentDraw.status !== 'completed') return;
    
    const userWinningTickets = userTickets.filter(ticket => 
      currentDraw.winners.some(winner => winner.ticketNumber === ticket.number)
    );
    
    if (userWinningTickets.length > 0) {
      // User won! Show popup and update balance
      const totalWinnings = userWinningTickets.reduce((sum, ticket) => {
        const winner = currentDraw.winners.find(w => w.ticketNumber === ticket.number);
        return sum + (winner?.amount || 0);
      }, 0);
      
      await updateUser({ walletBalance: user.walletBalance + totalWinnings });
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
