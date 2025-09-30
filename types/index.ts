
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  profilePhoto?: string;
  referralCode: string;
  walletBalance: number;
  ticketCount: number;
  createdAt: string;
}

export interface Ticket {
  id: string;
  number: string; // 9-digit unique number
  userId: string;
  drawDate: string;
  isWinner: boolean;
  winAmount?: number;
  createdAt: string;
}

export interface Draw {
  id: string;
  date: string;
  totalTickets: number;
  winners: Winner[];
  status: 'pending' | 'completed' | 'refunded';
  drawTime: string; // 10:00 PM ET
}

export interface Winner {
  id: string;
  userId: string;
  userName: string;
  ticketNumber: string;
  amount: number;
  drawDate: string;
}

export interface Referral {
  id: string;
  referrerId: string;
  referredUserId: string;
  referredUserName: string;
  createdAt: string;
  ticketAwarded: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  amount: number;
  method: 'bank' | 'crypto' | 'paypal';
  details: BankDetails | CryptoDetails | PaypalDetails;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
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

export interface AdWatch {
  id: string;
  userId: string;
  adId: string;
  watchedAt: string;
  completed: boolean;
  ticketAwarded: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  createdAt: string;
}

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}
