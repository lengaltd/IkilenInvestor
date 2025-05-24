import { Link } from "wouter";
import { ArrowUp10, ReceiptCent, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Transaction } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'contribution':
        return (
          <div className="flex-shrink-0 rounded-full bg-green-100 p-2">
            <ArrowUp10 className="text-green-600 h-4 w-4" />
          </div>
        );
      case 'dividend':
        return (
          <div className="flex-shrink-0 rounded-full bg-blue-100 p-2">
            <ReceiptCent className="text-blue-600 h-4 w-4" />
          </div>
        );
      default:
        return (
          <div className="flex-shrink-0 rounded-full bg-gray-100 p-2">
            <ArrowUp10 className="text-gray-600 h-4 w-4" />
          </div>
        );
    }
  };

  const getTransactionAmount = (transaction: Transaction) => {
    const isPositive = ['contribution', 'dividend'].includes(transaction.type);
    return (
      <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? '+' : '-'}{formatCurrency(transaction.amount)}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg">Recent Transactions</CardTitle>
        <CardDescription>Your latest activities</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-3 overflow-hidden">
        <div className="flow-root">
          <ul role="list" className="-my-5 divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <li key={transaction.id} className="py-4">
                  <div className="flex items-center space-x-4">
                    {getTransactionIcon(transaction.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {transaction.note || transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {formatDate(new Date(transaction.date))}
                      </p>
                    </div>
                    {getTransactionAmount(transaction)}
                  </div>
                </li>
              ))
            ) : (
              <li className="py-4 text-center text-gray-500">
                No recent transactions
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 rounded-b-lg">
        <div className="text-sm">
          <Link href="/history">
            <a className="font-medium text-primary-800 hover:text-primary-900 flex items-center">
              View all transactions
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
