import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  ArrowUp10, 
  ArrowDown01, 
  ReceiptCent, 
  Receipt,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

export default function History() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: transactions, isLoading, error } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return <ArrowUp10 className="text-green-600 h-5 w-5" />;
      case 'dividend':
        return <ReceiptCent className="text-blue-600 h-5 w-5" />;
      case 'withdrawal':
        return <ArrowDown01 className="text-red-600 h-5 w-5" />;
      case 'fee':
        return <Receipt className="text-orange-500 h-5 w-5" />;
      default:
        return <ArrowUp10 className="text-gray-600 h-5 w-5" />;
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isPositive = ['contribution', 'dividend'].includes(transaction.type);
    return (
      <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
      </span>
    );
  };

  // Filter transactions based on search term and type
  const filteredTransactions = transactions?.filter(transaction => {
    const matchesSearch = 
      searchTerm === "" || 
      transaction.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.paymentMethod && transaction.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = 
      typeFilter === "all" || 
      transaction.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        
        <div className="px-4 sm:px-6">
          <Card className="mb-6">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !transactions) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <h2 className="text-lg font-semibold text-red-800">Error loading transaction history</h2>
            <p className="mt-2 text-red-700">
              {error instanceof Error ? error.message : "Could not load transaction data. Please try again."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-2xl font-semibold text-gray-900">Transaction History</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Review all your past transactions
        </p>
      </div>

      <div className="px-4 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View and filter your transaction history</CardDescription>
            
            <div className="mt-4 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search transactions..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="contribution">Contributions</SelectItem>
                  <SelectItem value="dividend">Dividends</SelectItem>
                  <SelectItem value="withdrawal">Withdrawals</SelectItem>
                  <SelectItem value="fee">Fees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTransactions?.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No transactions found</p>
              </div>
            ) : (
              <div className="flow-root">
                <ul role="list" className="divide-y divide-gray-200">
                  {filteredTransactions?.map((transaction) => (
                    <li key={transaction.id} className="py-4">
                      <div className="flex items-center space-x-4">
                        <div className={`flex-shrink-0 rounded-full p-2 ${
                          transaction.type === 'contribution' ? 'bg-green-100' :
                          transaction.type === 'dividend' ? 'bg-blue-100' :
                          transaction.type === 'withdrawal' ? 'bg-red-100' :
                          'bg-orange-100'
                        }`}>
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transaction.note || transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </p>
                          <div className="flex items-center text-sm text-gray-500">
                            <p className="truncate">{formatDate(new Date(transaction.date))}</p>
                            {transaction.paymentMethod && (
                              <>
                                <span className="mx-1">•</span>
                                <p className="truncate">{transaction.paymentMethod}</p>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          {getTransactionAmount(transaction)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
