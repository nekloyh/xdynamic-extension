import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  Users, 
  DollarSign, 
  Shield, 
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { adminService, OverviewStats, ChartsData, ApiError } from '../services/admin.service';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [chartsData, setChartsData] = useState<ChartsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [statsData, charts] = await Promise.all([
        adminService.getOverviewStats(),
        adminService.getChartsData(30)
      ]);
      setStats(statsData);
      setChartsData(charts);
    } catch (err) {
      console.error('Failed to fetch data', err);
      if (err instanceof ApiError) {
        error(err.message);
      } else {
        error('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.total_users ?? '...',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: Users,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-l-4 border-blue-500',
    },
    {
      title: 'Total Revenue',
      value: stats 
        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.total_revenue)
        : '...',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      iconBg: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-l-4 border-green-500',
    },
    {
      title: 'Blocked Content',
      value: stats?.blocked_images_count ?? '...',
      change: '+5.2%',
      changeType: 'negative' as const,
      icon: Shield,
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-l-4 border-red-500',
    },
    {
      title: 'Active Today',
      value: stats?.active_today ?? '...',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: Activity,
      iconBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
      borderColor: 'border-l-4 border-purple-500',
    },
  ];

  return (
    <DashboardLayout>
      <ToastContainer toasts={toasts} />
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-base text-gray-500 mt-2">
            Welcome back! Here's an overview of your system performance.
          </p>
        </div>

        {/* Stats Cards - Enhanced Card-based Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse border-l-4 border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))
          ) : (
            statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className={`bg-white rounded-lg shadow-sm p-6 ${stat.borderColor} hover:shadow-md transition-shadow duration-200`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-3">{stat.value}</p>
                      <p className={`text-sm mt-2 flex items-center ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.changeType === 'positive' ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className={`${stat.iconBg} p-4 rounded-lg flex-shrink-0`}>
                      <Icon className={`w-8 h-8 ${stat.iconColor}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* System Status and Pending Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">API Server</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">ML Inference</span>
                </div>
                <span className="text-sm font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                </div>
                <span className="text-sm font-medium text-amber-600">Degraded</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Actions</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-gray-700">Pending Reports</span>
                </div>
                <span className="text-lg font-bold text-amber-600">
                  {stats?.pending_reports ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">New Users Today</span>
                </div>
                <span className="text-lg font-bold text-blue-600">
                  {stats?.active_today ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Content Blocked Today</span>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {stats?.content_blocked ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section - Only show if there's data */}
        {chartsData && chartsData.data.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Revenue Over Time</h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartsData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value;
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [
                      new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                      'Revenue'
                    ]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* New Users Chart */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">New Users</h2>
                <span className="text-sm text-gray-500">Last 30 days</span>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartsData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip 
                    formatter={(value: number) => [value, 'New Users']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('vi-VN')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
