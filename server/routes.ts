import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertTransactionSchema,
  insertInvestmentSchema,
  insertInvestmentVoteSchema,
  User
} from "@shared/schema";
import { ZodError } from "zod";
import session from "express-session";
import createMemoryStore from "memorystore";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import ConnectPgSimple from "connect-pg-simple";

const MemoryStore = createMemoryStore(session);
const PgSession = ConnectPgSimple(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ikilen-investment-group-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production", 
        maxAge: 86400000, // 1 day
        httpOnly: true,
        sameSite: 'lax'
      },
      store: new PgSession({
        conObject: {
          connectionString: process.env.DATABASE_URL,
        },
        createTableIfMissing: true,
        tableName: 'session'
      })
    })
  );

  // Configure passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Passport strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (user.password !== password) { // In a real app, use bcrypt.compare
          return done(null, false, { message: "Incorrect password." });
        }
        // Update last login
        await storage.updateUserLastLogin(user.id);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  };

  // Helper to handle zod validation
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: any) => {
      try {
        req.body = schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          res.status(400).json({ 
            message: "Validation error", 
            errors: error.errors 
          });
        } else {
          next(error);
        }
      }
    };
  };

  // Auth routes
  app.post(
    "/api/login",
    validateRequest(loginSchema),
    passport.authenticate("local"),
    (req, res) => {
      const user = req.user as User;
      res.json({
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        lastLogin: user.lastLogin
      });
    }
  );

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/me", isAuthenticated, (req, res) => {
    const user = req.user as User;
    res.json({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      lastLogin: user.lastLogin
    });
  });

  app.post(
    "/api/register",
    validateRequest(insertUserSchema),
    async (req, res) => {
      try {
        // Check if username already exists
        const existingUser = await storage.getUserByUsername(req.body.username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
        
        const user = await storage.createUser(req.body);
        req.login(user, (err) => {
          if (err) {
            return res.status(500).json({ message: "Login failed after registration" });
          }
          return res.status(201).json({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            lastLogin: user.lastLogin
          });
        });
      } catch (error) {
        res.status(500).json({ message: "Registration failed" });
      }
    }
  );

  // User financial data routes
  app.get("/api/dashboard", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const balance = await storage.getUserBalance(user.id);
      const totalContributions = await storage.getUserTotalContributions(user.id);
      const totalEarnings = await storage.getUserTotalEarnings(user.id);
      const transactions = await storage.getTransactionsByUserId(user.id);
      const groupPerformance = await storage.getLatestGroupPerformance();
      const monthlyPerformance = await storage.getMonthlyPerformance(6);
      
      res.json({
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          lastLogin: user.lastLogin,
        },
        financials: {
          balance,
          totalContributions,
          totalEarnings,
        },
        transactions: transactions.slice(0, 5), // Get only the 5 most recent
        groupPerformance,
        monthlyPerformance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const transactions = await storage.getTransactionsByUserId(user.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post(
    "/api/transactions",
    isAuthenticated,
    validateRequest(insertTransactionSchema),
    async (req, res) => {
      try {
        const transaction = await storage.createTransaction(req.body);
        res.status(201).json(transaction);
      } catch (error) {
        res.status(500).json({ message: "Failed to create transaction" });
      }
    }
  );

  app.get("/api/investments", isAuthenticated, async (req, res) => {
    try {
      const investments = await storage.getAllInvestments();
      res.json(investments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch investments" });
    }
  });

  app.post(
    "/api/investments",
    isAuthenticated,
    validateRequest(insertInvestmentSchema),
    async (req, res) => {
      try {
        const investment = await storage.createInvestment(req.body);
        res.status(201).json(investment);
      } catch (error) {
        res.status(500).json({ message: "Failed to create investment" });
      }
    }
  );

  app.post(
    "/api/investments/:id/vote",
    isAuthenticated,
    validateRequest(insertInvestmentVoteSchema),
    async (req, res) => {
      try {
        const investmentId = parseInt(req.params.id);
        const user = req.user as User;
        const vote = await storage.voteOnInvestment({
          ...req.body,
          investmentId,
          userId: user.id
        });
        res.status(201).json(vote);
      } catch (error) {
        res.status(500).json({ message: "Failed to record vote" });
      }
    }
  );

  app.get("/api/investments/:id/votes", isAuthenticated, async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      const votes = await storage.getInvestmentVotes(investmentId);
      res.json(votes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch votes" });
    }
  });

  app.get("/api/investments/:id/my-vote", isAuthenticated, async (req, res) => {
    try {
      const investmentId = parseInt(req.params.id);
      const user = req.user as User;
      const vote = await storage.getUserVoteForInvestment(investmentId, user.id);
      res.json(vote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user vote" });
    }
  });

  app.get("/api/group-performance", isAuthenticated, async (req, res) => {
    try {
      const performance = await storage.getLatestGroupPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group performance" });
    }
  });

  app.get("/api/monthly-performance", isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const performance = await storage.getMonthlyPerformance(limit);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch monthly performance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
