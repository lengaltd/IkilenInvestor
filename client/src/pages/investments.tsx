import { useQuery } from "@tanstack/react-query";
import { Investment } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Investments() {
  const { data: investments, isLoading, error } = useQuery<Investment[]>({
    queryKey: ["/api/investments"],
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="px-4 sm:px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !investments) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800">Error loading investments</h2>
            <p className="mt-2 text-red-700">
              {error instanceof Error ? error.message : "Could not load investment data. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">Investments</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review the group's active investments
        </p>
      </div>

      {investments.length === 0 ? (
        <div className="px-4 sm:px-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">No active investments found</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="px-4 sm:px-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{investment.name}</CardTitle>
                  <Badge variant={investment.active ? "default" : "outline"}>
                    {investment.active ? "Active" : "Closed"}
                  </Badge>
                </div>
                <CardDescription>{investment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Total Amount:</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatCurrency(investment.totalAmount)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Return Rate:</dt>
                    <dd className="text-sm font-medium text-green-600">{investment.returnRate}%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Start Date:</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatDate(new Date(investment.startDate))}</dd>
                  </div>
                  {investment.endDate && (
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">End Date:</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatDate(new Date(investment.endDate))}</dd>
                    </div>
                  )}
                </dl>
              </CardContent>
              <CardFooter className="bg-gray-50 border-t">
                <div className="w-full text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Projected Annual Return:</span>
                    <span className="font-medium text-green-600">{formatCurrency(investment.totalAmount * (investment.returnRate / 100))}</span>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
