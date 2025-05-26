import { Link, useLocation } from "wouter";
import { 
  WalletMinimal, 
  PiggyBank, 
  TrendingUp, 
  ArrowUp10, 
  ArrowRight 
} from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface AccountSummaryProps {
  balance: number;
  totalContributions: number;
  totalEarnings: number;
}

export function AccountSummary({ balance, totalContributions, totalEarnings }: AccountSummaryProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Balance Card */}
      <Card onClick={() => setLocation("/history")} className="cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
              <WalletMinimal className="text-primary-800 h-5 w-5" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Your Balance</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {formatCurrency(balance)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-4 py-4">
          <div className="text-sm">
              <span className="font-medium text-primary-800 hover:text-primary-900 flex items-center">
                View transactions
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
          </div>
        </CardFooter>
      </Card>

      {/* Contributions Card */}
      <Card onClick={() => {
        setLocation("/");
        setTimeout(() => {
          document.getElementById("contribute-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }} className="cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-secondary-100 rounded-md p-3">
              <PiggyBank className="text-secondary-700 h-5 w-5" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Contributions</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalContributions)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-4 py-4">
          <div className="text-sm">
              <span className="font-medium text-secondary-700 hover:text-secondary-800 flex items-center">
                Make a contribution
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
          </div>
        </CardFooter>
      </Card>

      {/* Earnings Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-accent-300 rounded-md p-3">
              <TrendingUp className="text-accent-700 h-5 w-5" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Earnings</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900">
                    {formatCurrency(totalEarnings)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 px-4 py-4">
          <div className="text-sm flex items-center">
            <span className="text-green-500 font-medium flex items-center mr-1">
              <ArrowUp10 className="h-3 w-3" />7.2%
            </span>
            <span className="text-gray-500">from last month</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}