import { pgTable, text, serial, integer, boolean, doublePrecision, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  lastLogin: timestamp("last_login").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Transaction type enum
export const transactionTypeEnum = pgEnum("transaction_type", [
  "contribution",
  "dividend",
  "withdrawal",
  "fee",
]);

// Transaction model
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: doublePrecision("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").defaultNow(),
  note: text("note"),
  paymentMethod: text("payment_method"),
});

// Investment model
export const investments = pgTable("investments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  totalAmount: doublePrecision("total_amount").notNull(),
  returnRate: doublePrecision("return_rate").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  active: boolean("active").default(true),
});

// Group performance model for group metrics
export const groupPerformance = pgTable("group_performance", {
  id: serial("id").primaryKey(),
  totalMembers: integer("total_members").notNull(),
  totalAssets: doublePrecision("total_assets").notNull(),
  activeInvestments: integer("active_investments").notNull(),
  ytdReturns: doublePrecision("ytd_returns").notNull(),
  date: timestamp("date").defaultNow(),
});

// Monthly performance for chart data
export const monthlyPerformance = pgTable("monthly_performance", {
  id: serial("id").primaryKey(),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  returnPercentage: doublePrecision("return_percentage").notNull(),
});

// Create Zod schemas for input validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  date: true,
});

export const insertInvestmentSchema = createInsertSchema(investments).omit({
  id: true,
});

export const insertGroupPerformanceSchema = createInsertSchema(groupPerformance).omit({
  id: true,
  date: true,
});

export const insertMonthlyPerformanceSchema = createInsertSchema(monthlyPerformance).omit({
  id: true,
});

// Login schema
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Investment = typeof investments.$inferSelect;
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type GroupPerformance = typeof groupPerformance.$inferSelect;
export type InsertGroupPerformance = z.infer<typeof insertGroupPerformanceSchema>;
export type MonthlyPerformance = typeof monthlyPerformance.$inferSelect;
export type InsertMonthlyPerformance = z.infer<typeof insertMonthlyPerformanceSchema>;
export type Login = z.infer<typeof loginSchema>;
