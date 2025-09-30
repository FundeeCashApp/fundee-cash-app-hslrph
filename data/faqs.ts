
import { FAQ } from '@/types';

export const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How does the daily draw work?',
    answer: 'Every day at 10:00 PM Eastern Time, we conduct a draw where 36 winners are selected: 10 winners receive $100, 6 winners receive $50, and 20 winners receive $10. If fewer than 300,000 tickets are sold, all participants are refunded.',
    category: 'Draw'
  },
  {
    id: '2',
    question: 'How can I get tickets?',
    answer: 'You can earn tickets by watching ads (1 ticket per ad) or through referrals (1 ticket per successful referral). After watching 5 ads, there&apos;s a 10-minute cooldown period.',
    category: 'Tickets'
  },
  {
    id: '3',
    question: 'What are the withdrawal options?',
    answer: 'You can withdraw your winnings via bank transfer, cryptocurrency (USDT TRC-20, BTC, ETH ERC-20), or PayPal. The minimum withdrawal amount is $10.',
    category: 'Withdrawals'
  },
  {
    id: '4',
    question: 'How long do withdrawals take?',
    answer: 'All withdrawals are processed manually and typically take 3-5 business days to complete. You&apos;ll receive updates on your withdrawal status.',
    category: 'Withdrawals'
  },
  {
    id: '5',
    question: 'How does the referral system work?',
    answer: 'Share your unique referral code with friends. When they sign up using your code, you&apos;ll receive 1 ticket for the daily draw. There&apos;s no limit to how many people you can refer.',
    category: 'Referrals'
  },
  {
    id: '6',
    question: 'What happens if I win?',
    answer: 'If you win, you&apos;ll receive a congratulations popup and the prize money will be added to your wallet balance. You can then withdraw your winnings using any of the available methods.',
    category: 'Winnings'
  },
  {
    id: '7',
    question: 'Why do I need to provide accurate personal information?',
    answer: 'Your name must match your bank details for successful withdrawals. This is required for security and compliance purposes.',
    category: 'Account'
  },
  {
    id: '8',
    question: 'What if the draw doesn&apos;t meet the minimum ticket requirement?',
    answer: 'If fewer than 300,000 tickets are sold by 10 PM ET, the draw is cancelled and all participants receive a full refund. We apologize for any inconvenience this may cause.',
    category: 'Draw'
  },
  {
    id: '9',
    question: 'Can I change my personal information?',
    answer: 'You can update your email, phone number, profile photo, and password. However, your first name, last name, and country cannot be changed after registration.',
    category: 'Account'
  },
  {
    id: '10',
    question: 'Is my personal information secure?',
    answer: 'Yes, we take your privacy and security seriously. All personal information is encrypted and stored securely. We never share your information with third parties.',
    category: 'Security'
  }
];
