// User types
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  lastLogin: string;
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface RegisterData extends UserCredentials {
  firstName: string;
  lastName: string;
  email: string;
}

// Transaction types
export type TransactionType = "contribution" | "dividend" | "withdrawal" | "fee";

export interface Transaction {
  id: number;
  userId: number;
  amount: number;
  type: TransactionType;
  date: string;
  note?: string;
  paymentMethod?: string;
}

// Dashboard types
export interface DashboardData {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    lastLogin: string;
  };
  financials: {
    balance: number;
    totalContributions: number;
    totalEarnings: number;
  };
  transactions: Transaction[];
  groupPerformance: GroupPerformance;
  monthlyPerformance: MonthlyPerformance[];
}

// Investment types
export interface Investment {
  id: number;
  name: string;
  description?: string;
  totalAmount: number;
  returnRate: number;
  startDate: string;
  endDate?: string;
  active: boolean;
}

export interface InvestmentVote {
  id: number;
  investmentId: number;
  userId: number;
  vote: boolean;
  createdAt: string;
  firstName?: string;
  lastName?: string;
}

// Group performance types
export interface GroupPerformance {
  id: number;
  totalMembers: number;
  totalAssets: number;
  activeInvestments: number;
  ytdReturns: number;
  date: string;
}

// Monthly performance types for charts
export interface MonthlyPerformance {
  id: number;
  month: string;
  year: number;
  returnPercentage: number;
}

// Contribution form types
export interface ContributionFormData {
  amount: number;
  paymentMethod: string;
  note?: string;
}
