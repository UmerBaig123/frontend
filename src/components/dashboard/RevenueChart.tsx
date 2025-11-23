import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

interface RevenueChartProps {
  totalRevenue: number;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ totalRevenue }) => {
  // Generate revenue trend data based on the total revenue
  const generateTrendData = (total: number) => {
    const currentMonth = new Date().getMonth();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Sort months so the current month is last
    const sortedMonths = [...monthNames];
    const orderedMonths = [
      ...sortedMonths.slice(currentMonth + 1),
      ...sortedMonths.slice(0, currentMonth + 1)
    ];
    
    // Create a gradual trend leading up to the total revenue
    let data = [];
    const baseValue = total * 0.5; // Starting at 50% of current value
    const increment = (total - baseValue) / 11; // Gradual increase
    
    for (let i = 0; i < 12; i++) {
      const value = Math.round(baseValue + (increment * i));
      data.push({
        name: orderedMonths[i],
        value: value
      });
    }
    
    return data;
  };

  const data = generateTrendData(totalRevenue);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="bg-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-lg font-extrabold flex items-center gap-2 text-text">
          <DollarSign className="h-6 w-6 text-accent" />
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 13 }} 
                tickLine={false} 
                axisLine={false}
                className="text-xs text-muted-foreground" 
              />
              <YAxis 
                tickFormatter={(value) => {
                  if (value >= 1000000) {
                    return `$${value/1000000}M`;
                  } else if (value >= 1000) {
                    return `$${value/1000}k`;
                  }
                  return `$${value}`;
                }} 
                tick={{ fontSize: 13 }} 
                tickLine={false} 
                axisLine={false} 
                className="text-xs text-muted-foreground"
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), "Revenue"]} 
                labelStyle={{ color: "#111" }}
                contentStyle={{ 
                  background: "#fff", 
                  border: "1px solid #e5e7eb", 
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
                }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#2563eb" 
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
