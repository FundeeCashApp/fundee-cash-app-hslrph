
export interface User {
  id: string;
  authUserId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  referralCode: string;
  referredBy?: string;
  profilePhoto?: string;
  walletBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Draw {
  id: string;
  drawDate: string;
  drawTime: string;
  status: 'pending' | 'completed' | 'refunded';
  totalTickets: number;
  minimumTickets: number;
  prizePool: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  userId: string;
  drawId: string;
  ticketNumber: string;
  source: 'purchase' | 'ad_watch' | 'referral';
  createdAt: string;
}

export interface Winner {
  id: string;
  drawId: string;
  userId: string;
  ticketId: string;
  prizeAmount: number;
  prizeTier: 'tier1' | 'tier2' | 'tier3';
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface AdWatch {
  id: string;
  userId: string;
  watchedAt: string;
  ticketEarned: boolean;
  sessionCount: number;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  ticketEarned: boolean;
  createdAt: string;
  referredUser?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'bank_transfer' | 'crypto_usdt' | 'crypto_btc' | 'crypto_eth' | 'paypal';
  details: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
  dial_code: string;
}

export interface CountryOption {
  name: string;
  code: string;
  flag: string;
  dial_code: string;
}

export interface BankDetails {
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountHolderName: string;
}

export interface CryptoDetails {
  network: 'TRC-20' | 'Bitcoin' | 'ERC-20';
  walletAddress: string;
  currency: 'USDT' | 'BTC' | 'ETH';
}

export interface PaypalDetails {
  email: string;
}
