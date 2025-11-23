import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend
}) => {
  return (
    <Card className="bg-surface rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-6">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold text-muted-foreground">{title}</CardTitle>
        <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-extrabold text-text mb-2">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-3">
            <span className={`text-sm font-semibold ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-2">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
