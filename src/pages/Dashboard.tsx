import React, { useEffect, useState } from "react";
import PageContainer from "@/components/layout/PageContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProjectsList from "@/components/dashboard/ProjectsList";
import RecentBidsList from "@/components/dashboard/RecentBidsList";
import StatCard from "@/components/dashboard/StatCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import BidWinRateChart from "@/components/dashboard/BidWinRateChart";
import { DollarSign, Building2, HardHat, Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Project } from "@/types/project";
import { dashboardAPI } from "@/api/dashboard";

const Dashboard = () => {
  const { addNotification, notifications, markAsRead } = useNotifications();
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [bidWinRate, setBidWinRate] = useState(0);
  const [period, setPeriod] = useState<'year' | 'month' | 'week'>('month');
  const [chartData, setChartData] = useState<Array<{ name: string; value: number }>>([]);
  const [loading, setLoading] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dataRes, chartsRes] = await Promise.all([
          dashboardAPI.getDashboardData(),
          dashboardAPI.getDashboardCharts(period)
        ]);
        const data = dataRes.data || {};
        setTotalRevenue(Number(data.totalRevenue || 0));
        setActiveProjects(Number(data.activeProjects || 0));
        setBidWinRate(Number(data.bidWinRate || 0));
        setChartData(chartsRes.data || []);
      } catch (e) {
        console.error('Failed to load dashboard:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [period]);

  const formatRevenue = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const recentNotifications = notifications.slice(0, 3);

  return (
    <PageContainer>
      <DashboardHeader />

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-600">Period:</span>
        <Button variant={period==='week'? 'default':'outline'} size="sm" onClick={()=>setPeriod('week')}>Week</Button>
        <Button variant={period==='month'? 'default':'outline'} size="sm" onClick={()=>setPeriod('month')}>Month</Button>
        <Button variant={period==='year'? 'default':'outline'} size="sm" onClick={()=>setPeriod('year')}>Year</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard 
          title="Total Revenue" 
          value={formatRevenue(totalRevenue)} 
          icon={<DollarSign className="h-4 w-4" />}
          trend={{value: 0, isPositive: true}}
          loading={loading}
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects.toString()} 
          icon={<Building2 className="h-4 w-4" />}
          trend={{value: 0, isPositive: true}}
          loading={loading}
        />
        <StatCard 
          title="Bid Win Rate" 
          value={`${bidWinRate}%`} 
          icon={<HardHat className="h-4 w-4" />}
          description="Based on all submitted bids"
          trend={{value: 0, isPositive: true}}
          loading={loading}
        />
      </div>
      
      <div className="mb-8">
        <RevenueChart totalRevenue={totalRevenue} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <BidWinRateChart winRate={bidWinRate} />
        </div>
        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Bell className="h-4 w-4 mr-2 text-bidgenius-600" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {recentNotifications.length > 0 ? (
                <div className="space-y-2">
                  {recentNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-2 rounded-md cursor-pointer ${
                        !notification.read
                          ? 'bg-muted/30 hover:bg-muted/50'
                          : 'hover:bg-muted/30'
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <h5 className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                          {notification.title}
                        </h5>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(notification.date, { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <p className="text-sm">No recent notifications</p>
                </div>
              )}
              <div className="mt-4 text-right">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/notifications">
                    View all
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <ProjectsList />
        </div>
        <div>
          <RecentBidsList />
        </div>
      </div>
    </PageContainer>
  );
};

export default Dashboard;
