import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MonthlyPerformance } from "@/types";

interface InvestmentPerformanceProps {
  monthlyPerformance: MonthlyPerformance[];
}

export function InvestmentPerformance({ monthlyPerformance }: InvestmentPerformanceProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation on mount
    setIsVisible(true);
  }, []);

  // Get the maximum value for chart scaling
  const maxValue = Math.max(...monthlyPerformance.map(data => data.returnPercentage));

  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg">Investment Performance</CardTitle>
        <CardDescription>Group earnings over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="px-4 py-5">
        {/* Chart visualization */}
        <div className="h-[200px] relative" ref={chartRef}>
          {monthlyPerformance.map((data, index) => (
            <div 
              key={data.id}
              className="chart-bar bg-primary-600 rounded-t absolute bottom-0"
              style={{
                left: `${(index * 16.66) + 2}%`,
                width: '6%',
                height: isVisible ? `${(data.returnPercentage / maxValue) * 100}%` : '0',
                transition: 'height 1s ease-in-out',
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 pointer-events-none">
                {data.returnPercentage}%
              </div>
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-6 text-xs text-gray-500 text-center">
          {monthlyPerformance.map(data => (
            <div key={`label-${data.id}`}>{data.month}</div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 rounded-b-lg">
        <div className="text-sm">
          <span className="text-gray-700">Annual projected return: </span>
          <span className="font-medium text-secondary-700">8.4%</span>
        </div>
      </CardFooter>
    </Card>
  );
}
