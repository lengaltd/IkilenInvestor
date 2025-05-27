import { 
  users, 
  transactions, 
  investments, 
  investmentVotes,
  groupPerformance, 
  monthlyPerformance,
  type InsertUser,
  type InsertTransaction,
  type InsertInvestment,
  type InsertInvestmentVote,
  type InsertGroupPerformance,
  type InsertMonthlyPerformance,
  type User, type Transaction, type Investment, type GroupPerformance, type MonthlyPerformance
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: number): Promise<User | undefined>;

  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;

  // Balance operations
  getUserBalance(userId: number): Promise<number>;
  getUserTotalContributions(userId: number): Promise<number>;
  getUserTotalEarnings(userId: number): Promise<number>;

  // Investment operations
  createInvestment(investment: InsertInvestment): Promise<Investment>;
  getActiveInvestments(): Promise<Investment[]>;
  getAllInvestments(): Promise<Investment[]>;
  voteOnInvestment(vote: InsertInvestmentVote): Promise<any>;
  checkInvestmentActivation(investmentId: number): Promise<void>;
  getInvestmentVotes(investmentId: number): Promise<any>;
  getUserVoteForInvestment(investmentId: number, userId: number): Promise<any>;

  // Group performance operations
  getLatestGroupPerformance(): Promise<GroupPerformance | undefined>;
  updateGroupPerformance(performance: InsertGroupPerformance): Promise<GroupPerformance>;

  // Monthly performance operations
  getMonthlyPerformance(limit: number): Promise<MonthlyPerformance[]>;
  addMonthlyPerformance(performance: InsertMonthlyPerformance): Promise<MonthlyPerformance>;
  
  // Member operations
  getAllMembers(): Promise<User[]>;
  getMemberContributionHistory(userId: number, year?: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private investments: Map<number, Investment>;
  private groupPerformanceData: Map<number, GroupPerformance>;
  private monthlyPerformanceData: Map<number, MonthlyPerformance>;

  private userIdCounter: number;
  private transactionIdCounter: number;
  private investmentIdCounter: number;
  private groupPerformanceIdCounter: number;
  private monthlyPerformanceIdCounter: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.investments = new Map();
    this.groupPerformanceData = new Map();
    this.monthlyPerformanceData = new Map();

    this.userIdCounter = 1;
    this.transactionIdCounter = 1;
    this.investmentIdCounter = 1;
    this.groupPerformanceIdCounter = 1;
    this.monthlyPerformanceIdCounter = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      lastLogin: now,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (user) {
      const updatedUser = { ...user, lastLogin: new Date() };
      this.users.set(id, updatedUser);
      return updatedUser;
    }
    return undefined;
  }

  // Transaction operations
  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    const now = new Date();
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      date: now
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date desc
  }

  // Balance operations
  async getUserBalance(userId: number): Promise<number> {
    const transactions = await this.getTransactionsByUserId(userId);
    return transactions.reduce((total, transaction) => {
      if (transaction.type === "contribution" || transaction.type === "dividend") {
        return total + transaction.amount;
      } else if (transaction.type === "withdrawal" || transaction.type === "fee") {
        return total - transaction.amount;
      }
      return total;
    }, 0);
  }

  async getUserTotalContributions(userId: number): Promise<number> {
    const transactions = await this.getTransactionsByUserId(userId);
    return transactions
      .filter(transaction => transaction.type === "contribution")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  async getUserTotalEarnings(userId: number): Promise<number> {
    const transactions = await this.getTransactionsByUserId(userId);
    return transactions
      .filter(transaction => transaction.type === "dividend")
      .reduce((total, transaction) => total + transaction.amount, 0);
  }

  // Investment operations
  async createInvestment(insertInvestment: InsertInvestment): Promise<Investment> {
    const id = this.investmentIdCounter++;
    const investment: Investment = {
      ...insertInvestment,
      id
    };
    this.investments.set(id, investment);
    return investment;
  }

  async getActiveInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values()).filter(investment => investment.active);
  }

  async getAllInvestments(): Promise<Investment[]> {
    return Array.from(this.investments.values());
  }

  async voteOnInvestment(vote: InsertInvestmentVote): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async checkInvestmentActivation(investmentId: number): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getInvestmentVotes(investmentId: number): Promise<any> {
    throw new Error("Method not implemented.");
  }
  async getUserVoteForInvestment(investmentId: number, userId: number): Promise<any> {
    throw new Error("Method not implemented.");
  }

  // Group performance operations
  async getLatestGroupPerformance(): Promise<GroupPerformance | undefined> {
    const performances = Array.from(this.groupPerformanceData.values());
    if (performances.length === 0) return undefined;

    return performances.sort((a, b) => b.date.getTime() - a.date.getTime())[0];
  }

  async updateGroupPerformance(insertPerformance: InsertGroupPerformance): Promise<GroupPerformance> {
    const id = this.groupPerformanceIdCounter++;
    const now = new Date();
    const performance: GroupPerformance = {
      ...insertPerformance,
      id,
      date: now
    };
    this.groupPerformanceData.set(id, performance);
    return performance;
  }

  // Monthly performance operations
  async getMonthlyPerformance(limit: number): Promise<MonthlyPerformance[]> {
    return Array.from(this.monthlyPerformanceData.values())
      .sort((a, b) => {
        // Sort by year and month
        if (a.year !== b.year) return b.year - a.year;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(b.month) - months.indexOf(a.month);
      })
      .slice(0, limit);
  }

  async addMonthlyPerformance(insertPerformance: InsertMonthlyPerformance): Promise<MonthlyPerformance> {
    const id = this.monthlyPerformanceIdCounter++;
    const performance: MonthlyPerformance = {
      ...insertPerformance,
      id
    };
    this.monthlyPerformanceData.set(id, performance);
    return performance;
  }

  // Initialize demo data
  private initializeDemoData() {
    // Create demo user
    const demoUser: InsertUser = {
      username: "johndoe",
      password: "password123", // In a real app, this would be hashed
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    };
    this.createUser(demoUser);

    // Create some transactions
    const transactionTypes: Array<"contribution" | "dividend" | "withdrawal" | "fee"> = [
      "contribution", "dividend", "contribution"
    ];

    const amounts = [500, 125.50, 500];
    const dates = [
      new Date("2023-06-01"),
      new Date("2023-05-15"),
      new Date("2023-05-01"),
    ];
    const notes = [
      "Monthly Contribution",
      "Dividend Payment",
      "Monthly Contribution"
    ];
    const paymentMethods = ["Bank Transfer", "Direct Deposit", "Bank Transfer"];

    for (let i = 0; i < 3; i++) {
      const transaction: InsertTransaction = {
        userId: 1,
        amount: amounts[i],
        type: transactionTypes[i],
        note: notes[i],
        paymentMethod: paymentMethods[i]
      };

      // Manually set the date for demo
      const createdTransaction = this.createTransaction(transaction);
      const tx = this.transactions.get(createdTransaction.id);
      if (tx) {
        tx.date = dates[i];
        this.transactions.set(tx.id, tx);
      }
    }

    // Create group performance data
    const groupData: InsertGroupPerformance = {
      totalMembers: 48,
      totalAssets: 245890,
      activeInvestments: 12,
      ytdReturns: 8.2
    };
    this.updateGroupPerformance(groupData);

    // Create monthly performance data
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const returns = [4.2, 3.8, 5.1, 6.2, 7.0, 8.4];

    for (let i = 0; i < months.length; i++) {
      this.addMonthlyPerformance({
        month: months[i],
        year: 2023,
        returnPercentage: returns[i]
      });
    }

    // Create some investment data
    const investmentData: InsertInvestment = {
      name: "Real Estate Fund",
      description: "Commercial real estate investment fund",
      totalAmount: 120000,
      returnRate: 7.5,
      startDate: new Date("2023-01-15"),
      active: true
    };
    this.createInvestment(investmentData);
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserLastLogin(id: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
  }

  async getUserBalance(userId: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`SUM(CASE WHEN type IN ('contribution', 'dividend') THEN amount ELSE -amount END)` })
      .from(transactions)
      .where(eq(transactions.userId, userId));

    return result[0]?.total || 0;
  }

  async getUserTotalContributions(userId: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`SUM(amount)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'contribution')
      ));

    return result[0]?.total || 0;
  }

  async getUserTotalEarnings(userId: number): Promise<number> {
    const result = await db
      .select({ total: sql<number>`SUM(amount)` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'dividend')
      ));

    return result[0]?.total || 0;
  }

  async createInvestment(investment: InsertInvestment): Promise<Investment> {
    const [newInvestment] = await db
      .insert(investments)
      .values({
        ...investment,
        active: false // New investments start as inactive until voted on
      })
      .returning();
    return newInvestment;
  }

  async voteOnInvestment(vote: InsertInvestmentVote) {
    // First, check if user has already voted
    const existingVote = await db
      .select()
      .from(investmentVotes)
      .where(and(
        eq(investmentVotes.investmentId, vote.investmentId),
        eq(investmentVotes.userId, vote.userId)
      ))
      .limit(1);

    if (existingVote.length > 0) {
      // Update existing vote
      const [updatedVote] = await db
        .update(investmentVotes)
        .set({ vote: vote.vote })
        .where(and(
          eq(investmentVotes.investmentId, vote.investmentId),
          eq(investmentVotes.userId, vote.userId)
        ))
        .returning();

      await this.checkInvestmentActivation(vote.investmentId);
      return updatedVote;
    } else {
      // Create new vote
      const [newVote] = await db.insert(investmentVotes).values(vote).returning();
      await this.checkInvestmentActivation(vote.investmentId);
      return newVote;
    }
  }

  async checkInvestmentActivation(investmentId: number) {
    // Get total number of users
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
    const totalUserCount = totalUsers[0].count;

    // Get votes for this investment
    const votes = await db
      .select()
      .from(investmentVotes)
      .where(eq(investmentVotes.investmentId, investmentId));

    const yesVotes = votes.filter(v => v.vote === true).length;
    const requiredVotes = Math.ceil(totalUserCount * 0.8); // 80% threshold

    // Activate investment if it has enough yes votes
    if (yesVotes >= requiredVotes) {
      await db
        .update(investments)
        .set({ active: true })
        .where(eq(investments.id, investmentId));
    }
  }

  async getInvestmentVotes(investmentId: number) {
    return await db
      .select({
        id: investmentVotes.id,
        userId: investmentVotes.userId,
        vote: investmentVotes.vote,
        createdAt: investmentVotes.createdAt,
        firstName: users.firstName,
        lastName: users.lastName
      })
      .from(investmentVotes)
      .leftJoin(users, eq(investmentVotes.userId, users.id))
      .where(eq(investmentVotes.investmentId, investmentId));
  }

  async getUserVoteForInvestment(investmentId: number, userId: number) {
    const vote = await db
      .select()
      .from(investmentVotes)
      .where(and(
        eq(investmentVotes.investmentId, investmentId),
        eq(investmentVotes.userId, userId)
      ))
      .limit(1);

    return vote.length > 0 ? vote[0] : null;
  }

  async getActiveInvestments(): Promise<Investment[]> {
    return db
      .select()
      .from(investments)
      .where(eq(investments.active, true));
  }

  async getAllInvestments(): Promise<Investment[]> {
     return db
      .select()
      .from(investments);
  }

  async getLatestGroupPerformance(): Promise<GroupPerformance | undefined> {
    const [performance] = await db
      .select()
      .from(groupPerformance)
      .orderBy(desc(groupPerformance.date))
      .limit(1);

    return performance;
  }

  async updateGroupPerformance(performance: InsertGroupPerformance): Promise<GroupPerformance> {
    const [newPerformance] = await db
      .insert(groupPerformance)
      .values(performance)
      .returning();
    return newPerformance;
  }

  async getMonthlyPerformance(limit: number): Promise<MonthlyPerformance[]> {
    return db
      .select()
      .from(monthlyPerformance)
      .orderBy(desc(sql`${monthlyPerformance.year}, ${monthlyPerformance.month}`))
      .limit(limit);
  }

  async addMonthlyPerformance(performance: InsertMonthlyPerformance): Promise<MonthlyPerformance> {
    const [newPerformance] = await db
      .insert(monthlyPerformance)
      .values(performance)
      .returning();
    return newPerformance;
  }
  
  async getAllMembers(): Promise<User[]> {
    return db.select().from(users).orderBy(users.firstName, users.lastName);
  }
  
  async getMemberContributionHistory(userId: number, year?: number): Promise<Transaction[]> {
    let query = db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'contribution')
      ))
      .orderBy(desc(transactions.date));
    
    if (year) {
      query = query.where(and(
        eq(transactions.userId, userId),
        eq(transactions.type, 'contribution'),
        sql`EXTRACT(YEAR FROM ${transactions.date}) = ${year}`
      ));
    }
    
    return query;
  }
}

// Switch to using the DatabaseStorage
export const storage = new DatabaseStorage();