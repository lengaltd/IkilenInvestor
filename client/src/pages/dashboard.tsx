import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/types";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

import { AccountSummary } from "@/components/dashboard/account-summary";
import { InvestmentPerformance } from "@/components/dashboard/investment-performance";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ContributionForm } from "@/components/dashboard/contribution-form";
import { GroupPerformance } from "@/components/dashboard/group-performance";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"],
  });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800">Error loading dashboard</h2>
            <p className="mt-2 text-red-700">
              {error instanceof Error ? error.message : "Could not load dashboard data. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Welcome Header */}
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome back, {data.user.firstName}!
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Last login: {formatDate(new Date(data.user.lastLogin))}
        </p>
      </div>

      {/* Account Summary Section */}
      <div className="px-4 sm:px-6 mb-6">
        <AccountSummary 
          balance={data.financials.balance} 
          totalContributions={data.financials.totalContributions} 
          totalEarnings={data.financials.totalEarnings}
        />
      </div>

      {/* Performance and Transactions Section */}
      <div className="px-4 sm:px-6 mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <InvestmentPerformance monthlyPerformance={data.monthlyPerformance} />
        <RecentTransactions transactions={data.transactions} />
      </div>

      {/* Contribution Form Section */}
      <div className="px-4 sm:px-6 mb-6">
        <ContributionForm />
      </div>

      {/* Group Performance Section */}
      <div className="px-4 sm:px-6 mb-6">
        <GroupPerformance groupPerformance={data.groupPerformance} />
      </div>
    </main>
  );
}

// Skeleton loader while data is loading
function DashboardSkeleton() {
  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      {/* Welcome Header Skeleton */}
      <div className="px-4 py-5 sm:px-6">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Account Summary Skeleton */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white shadow rounded-lg">
              <div className="p-5">
                <Skeleton className="h-16 w-full" />
              </div>
              <div className="bg-gray-50 px-4 py-4 rounded-b-lg">
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance and Transactions Skeleton */}
      <div className="px-4 sm:px-6 mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white shadow rounded-lg">
          <div className="p-5 border-b">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-5">
            <Skeleton className="h-[200px] w-full" />
          </div>
        </div>
        <div className="bg-white shadow rounded-lg">
          <div className="p-5 border-b">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-3">
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contribution Form Skeleton */}
      <div className="px-4 sm:px-6 mb-6">
        <div className="bg-white shadow rounded-lg">
          <div className="p-5 border-b">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="p-5">
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </main>
  );
}
