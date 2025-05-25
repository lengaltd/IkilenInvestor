import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GroupPerformance as GroupPerformanceType } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface GroupPerformanceProps {
  groupPerformance?: GroupPerformanceType;
}

export function GroupPerformance({ groupPerformance }: GroupPerformanceProps) {
  if (!groupPerformance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Group Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading group performance data...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle>Group Performance</CardTitle>
        <CardDescription>Overview of IKILEN investment group metrics</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Members</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {groupPerformance?.totalMembers || 0}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Group Total Assets</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {formatCurrency(groupPerformance.totalAssets)}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Active Investments</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">
              {performance.activeInvestments}
            </dd>
          </div>
          <div className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">YTD Returns</dt>
            <dd className="mt-1 text-3xl font-semibold text-green-600">
              +{performance.ytdReturns}%
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}