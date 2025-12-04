import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/DashboardLayout';
import { 
  Users, 
  DollarSign, 
  Shield, 
  Activity,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  adminService, 
  OverviewStats, 
  ApiError,
  RevenueOvertime,
  NewUsersOvertime,
  UserPredictCallsList,
  UserPaymentTotalList,
  SystemStatus
} from '../services/admin.service';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/Toast';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueOvertime | null>(null);
  const [newUsersData, setNewUsersData] = useState<NewUsersOvertime | null>(null);
  const [predictCallsData, setPredictCallsData] = useState<UserPredictCallsList | null>(null);
  const [paymentData, setPaymentData] = useState<UserPaymentTotalList | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [predictPage, setPredictPage] = useState(1);
  const [paymentPage, setPaymentPage] = useState(1);
  const { toasts, error } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [statsData, revenue, newUsers, predictCalls, payments, status] = await Promise.all([
        adminService.getOverviewStats(),
        adminService.getRevenueOvertime(30),
        adminService.getNewUsersOvertime(30),
        adminService.getUserPredictCalls(1, 10, true),
        adminService.getUserPaymentTotals(1, 10, true),
        adminService.getSystemStatus()
      ]);
      setStats(statsData);
      setRevenueData(revenue);
      setNewUsersData(newUsers);
      setPredictCallsData(predictCalls);
      setPaymentData(payments);
      setSystemStatus(status);
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

  const fetchPredictCalls = useCallback(async (page: number) => {
    try {
      const data = await adminService.getUserPredictCalls(page, 10, true);
      setPredictCallsData(data);
      setPredictPage(page);
    } catch (err) {
      console.error('Failed to fetch predict calls', err);
    }
  }, []);

  const fetchPayments = useCallback(async (page: number) => {
    try {
      const data = await adminService.getUserPaymentTotals(page, 10, true);
      setPaymentData(data);
      setPaymentPage(page);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    }
  }, []);

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
              {/* API Server */}
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                systemStatus?.api_server === 'operational' ? 'bg-gray-50' :
                systemStatus?.api_server === 'degraded' ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemStatus?.api_server === 'operational' ? 'bg-green-500' :
                    systemStatus?.api_server === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">API Server</span>
                </div>
                <span className={`text-sm font-medium capitalize ${
                  systemStatus?.api_server === 'operational' ? 'text-green-600' :
                  systemStatus?.api_server === 'degraded' ? 'text-amber-600' : 'text-red-600'
                }`}>{systemStatus?.api_server ?? 'Checking...'}</span>
              </div>
              
              {/* Database */}
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                systemStatus?.database === 'operational' ? 'bg-gray-50' :
                systemStatus?.database === 'degraded' ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemStatus?.database === 'operational' ? 'bg-green-500' :
                    systemStatus?.database === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">Database</span>
                </div>
                <span className={`text-sm font-medium capitalize ${
                  systemStatus?.database === 'operational' ? 'text-green-600' :
                  systemStatus?.database === 'degraded' ? 'text-amber-600' : 'text-red-600'
                }`}>{systemStatus?.database ?? 'Checking...'}</span>
              </div>
              
              {/* ML Inference */}
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                systemStatus?.ml_inference === 'operational' ? 'bg-gray-50' :
                systemStatus?.ml_inference === 'degraded' ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemStatus?.ml_inference === 'operational' ? 'bg-green-500' :
                    systemStatus?.ml_inference === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">ML Inference</span>
                </div>
                <span className={`text-sm font-medium capitalize ${
                  systemStatus?.ml_inference === 'operational' ? 'text-green-600' :
                  systemStatus?.ml_inference === 'degraded' ? 'text-amber-600' : 'text-red-600'
                }`}>{systemStatus?.ml_inference ?? 'Checking...'}</span>
              </div>
              
              {/* Payment Gateway */}
              <div className={`flex items-center justify-between p-4 rounded-lg ${
                systemStatus?.payment_gateway === 'operational' ? 'bg-gray-50' :
                systemStatus?.payment_gateway === 'degraded' ? 'bg-amber-50 border border-amber-200' :
                'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    systemStatus?.payment_gateway === 'operational' ? 'bg-green-500' :
                    systemStatus?.payment_gateway === 'degraded' ? 'bg-amber-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                </div>
                <span className={`text-sm font-medium capitalize ${
                  systemStatus?.payment_gateway === 'operational' ? 'text-green-600' :
                  systemStatus?.payment_gateway === 'degraded' ? 'text-amber-600' : 'text-red-600'
                }`}>{systemStatus?.payment_gateway ?? 'Checking...'}</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Actions</h2>
            <div className="space-y-4">
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

        {/* Revenue Cumulative Chart */}
        {revenueData && revenueData.data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">📊 Revenue Overtime (Cumulative)</h2>
              <span className="text-sm text-gray-500">
                Total: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(revenueData.total_revenue)}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: number) => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return String(value);
                  }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value),
                    name === 'cumulative_revenue' ? 'Cumulative' : 'Daily'
                  ]}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString('vi-VN')}
                />
                <Bar dataKey="cumulative_revenue" fill="#10B981" name="Cumulative Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* New Users Overtime Chart */}
        {newUsersData && newUsersData.data.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">👥 New Users Overtime</h2>
              <span className="text-sm text-gray-500">
                Total Users: {newUsersData.total_users}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={[...newUsersData.data].reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'cumulative_count' ? 'Cumulative' : 'Daily'
                  ]}
                  labelFormatter={(label: string) => new Date(label).toLocaleDateString('vi-VN')}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={false}
                  name="Daily New Users"
                />
                <Line 
                  type="monotone" 
                  dataKey="cumulative_count" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Cumulative"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tables Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Predict Calls Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">🔮 Predict API Calls per User</h2>
              {predictCallsData && (
                <span className="text-sm text-gray-500">
                  Total: {predictCallsData.total} users
                </span>
              )}
            </div>
            {predictCallsData ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Calls</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {predictCallsData.data.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{user.user_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-blue-600">
                            {user.total_calls.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Page {predictPage} of {Math.ceil(predictCallsData.total / 10)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchPredictCalls(predictPage - 1)}
                      disabled={predictPage <= 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchPredictCalls(predictPage + 1)}
                      disabled={predictPage >= Math.ceil(predictCallsData.total / 10)}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            )}
          </div>

          {/* User Payment Totals Table */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">💰 Payment per User</h2>
              {paymentData && (
                <span className="text-sm text-gray-500">
                  Total: {paymentData.total} users
                </span>
              )}
            </div>
            {paymentData ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentData.data.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            #{user.user_id}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-semibold text-green-600">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(user.total_amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="text-sm text-gray-500">
                    Page {paymentPage} of {Math.ceil(paymentData.total / 10)}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => fetchPayments(paymentPage - 1)}
                      disabled={paymentPage <= 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fetchPayments(paymentPage + 1)}
                      disabled={paymentPage >= Math.ceil(paymentData.total / 10)}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
