import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Investments from "@/pages/investments";
import History from "@/pages/history";
import Members from "@/pages/members";
import Settings from "@/pages/settings";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Show loading while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <Route path="/">
        {() => (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        )}
      </Route>
      
      <Route path="/dashboard">
        {() => (
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        )}
      </Route>
      
      <Route path="/investments">
        {() => (
          <PrivateRoute>
            <Investments />
          </PrivateRoute>
        )}
      </Route>
      
      <Route path="/history">
        {() => (
          <PrivateRoute>
            <History />
          </PrivateRoute>
        )}
      </Route>
      
      <Route path="/members">
        {() => (
          <PrivateRoute>
            <Members />
          </PrivateRoute>
        )}
      </Route>
      
      <Route path="/settings">
        {() => (
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout() {
  // Don't show navbar/footer on login/register pages
  const isAuthPage = window.location.pathname === "/login" || window.location.pathname === "/register";
  
  if (isAuthPage) {
    return <Router />;
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow bg-gray-50">
        <Router />
      </div>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <AppLayout />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
