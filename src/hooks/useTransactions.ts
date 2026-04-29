import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export type PaymentStatus = 'all' | 'received' | 'sent' | 'pending';
export type PaymentType = 'all' | 'swift' | 'local' | 'direct' | 'pending';

export interface Payment {
  id: string;
  date: string;
  time: string;
  name: string;
  desc: string;
  type: 'swift' | 'local' | 'direct' | 'pending';
  amount: string;
  status: 'received' | 'sent' | 'pending';
  initials: string;
  color: string;
}

const paymentsData: Payment[] = [
  { id: '1', date: "21 Apr 2026", time: "09:45", name: "Ahmed Nady", desc: "Regular Transfer", type: "swift", amount: "+12,000 EGP", status: "received", initials: "AH", color: "linear-gradient(135deg,#1a6fff,#0ecbcb)" },
  { id: '2', date: "20 Apr 2026", time: "14:22", name: "Mostafa Yasser", desc: "Electricity Bill", type: "local", amount: "-3,500 EGP", status: "sent", initials: "MY", color: "linear-gradient(135deg,#ff4d6a,#ff8c00)" },
  { id: '3', date: "19 Apr 2026", time: "11:05", name: "Karim Tarek", desc: "Freelance Payment", type: "swift", amount: "+28,500 EGP", status: "received", initials: "KT", color: "linear-gradient(135deg,#0ecbcb,#006060)" },
  { id: '4', date: "18 Apr 2026", time: "16:30", name: "Mohamed Adel", desc: "Subscription", type: "pending", amount: "-850 EGP", status: "pending", initials: "MA", color: "linear-gradient(135deg,#7c3aed,#1a6fff)" },
  { id: '5', date: "17 Apr 2026", time: "08:15", name: "Ahmed Nady", desc: "Salary Transfer", type: "direct", amount: "+45,000 EGP", status: "received", initials: "AN", color: "linear-gradient(135deg,#0ecbcb,#1a6fff)" },
];

const txHistoryData: Payment[] = [
  { id: 't1', date: "21 Apr 2026", time: "09:45", name: "Ahmed Nady", desc: "Received · SWIFT", type: "swift", amount: "+12,000 EGP", status: "received", initials: "AN", color: "linear-gradient(135deg,#1a6fff,#0ecbcb)" },
  { id: 't2', date: "20 Apr 2026", time: "14:22", name: "Vodafone Cash", desc: "Sent · Mobile Top-up", type: "local", amount: "-1,500 EGP", status: "sent", initials: "VC", color: "linear-gradient(135deg,#e60000,#ff4d4d)" },
  { id: 't3', date: "20 Apr 2026", time: "11:10", name: "Mostafa Yasser", desc: "Received · Bank Transfer", type: "local", amount: "+8,000 EGP", status: "received", initials: "MY", color: "linear-gradient(135deg,#0ecbcb,#1a6fff)" },
  { id: 't4', date: "19 Apr 2026", time: "16:45", name: "Karim Tarek", desc: "Sent · Wire Transfer", type: "swift", amount: "-5,200 EGP", status: "sent", initials: "KT", color: "linear-gradient(135deg,#7c3aed,#1a6fff)" },
  { id: 't5', date: "18 Apr 2026", time: "08:30", name: "Orange Telecom", desc: "Sent · Bill Payment", type: "local", amount: "-450 EGP", status: "sent", initials: "OT", color: "linear-gradient(135deg,#ff8c00,#ffb900)" },
  { id: 't6', date: "17 Apr 2026", time: "12:00", name: "Mohamed Adel", desc: "Received · Salary", type: "direct", amount: "+45,000 EGP", status: "received", initials: "MA", color: "linear-gradient(135deg,#00a86b,#0ecbcb)" },
  { id: 't7', date: "16 Apr 2026", time: "09:00", name: "Amazon Egypt", desc: "Pending · Online Purchase", type: "pending", amount: "-3,200 EGP", status: "pending", initials: "AZ", color: "linear-gradient(135deg,#ff9900,#ff6600)" },
  { id: 't8', date: "15 Apr 2026", time: "17:20", name: "Ahmed Ali", desc: "Received · Bank Transfer", type: "local", amount: "+7,500 EGP", status: "received", initials: "AA", color: "linear-gradient(135deg,#1a6fff,#7c3aed)" },
  { id: 't9', date: "14 Apr 2026", time: "10:15", name: "Fawry", desc: "Sent · Utilities", type: "local", amount: "-890 EGP", status: "sent", initials: "FW", color: "linear-gradient(135deg,#ff4d6a,#ff8c00)" },
  { id: 't10', date: "13 Apr 2026", time: "14:00", name: "Etisalat", desc: "Pending · Mobile Recharge", type: "pending", amount: "-200 EGP", status: "pending", initials: "ET", color: "linear-gradient(135deg,#0ecbcb,#00a86b)" },
];

// --- Simulated API Calls ---
const fetchPayments = async (): Promise<Payment[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(paymentsData), 600));
};

const fetchHistory = async (): Promise<Payment[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(txHistoryData), 600));
};

export const useTransactions = () => {
  const [payStatusFilter, setPayStatusFilter] = useState<PaymentStatus>('all');
  const [payTypeFilter, setPayTypeFilter] = useState<PaymentType>('all');
  
  const [txFilter, setTxFilter] = useState<PaymentStatus>('all');
  const [txSearchQuery, setTxSearchQuery] = useState('');

  // 1. Fetch data using React Query
  const { data: payments = [], isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: fetchPayments,
  });

  const { data: history = [], isLoading: isLoadingHistory } = useQuery({
    queryKey: ['transactions-history'],
    queryFn: fetchHistory,
  });

  // 2. Filter cached data
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchStatus = payStatusFilter === 'all' || p.status === payStatusFilter;
      const matchType = payTypeFilter === 'all' || p.type === payTypeFilter || (payTypeFilter === 'pending' && p.status === 'pending');
      return matchStatus && matchType;
    });
  }, [payments, payStatusFilter, payTypeFilter]);

  const filteredHistory = useMemo(() => {
    let data = history;
    if (txFilter !== 'all') {
      data = data.filter(tx => tx.status === txFilter);
    }
    if (txSearchQuery) {
      const q = txSearchQuery.toLowerCase();
      data = data.filter(tx => 
        tx.name.toLowerCase().includes(q) || 
        tx.desc.toLowerCase().includes(q)
      );
    }
    return data;
  }, [history, txFilter, txSearchQuery]);

  return {
    payments: filteredPayments,
    isLoadingPayments, // Exposing loading state for future UI upgrades
    payStatusFilter,
    setPayStatusFilter,
    payTypeFilter,
    setPayTypeFilter,
    history: filteredHistory,
    isLoadingHistory, // Exposing loading state for future UI upgrades
    txFilter,
    setTxFilter,
    txSearchQuery,
    setTxSearchQuery,
  };
};
