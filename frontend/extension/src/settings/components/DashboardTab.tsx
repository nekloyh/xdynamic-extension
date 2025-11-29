import React, { useState, useEffect } from "react";
import { DashboardMetrics, UserStatistics, UserProfile } from "../../types/common";
import AnimatedCard from "./AnimatedCard";
import ProgressRing from "./ProgressRing";
import RippleButton from "./RippleButton";

interface DashboardTabProps {
  metrics: DashboardMetrics;
  stats: UserStatistics;
  userProfile: UserProfile;
  onUpgrade: () => void;
  onRefresh: () => Promise<void>;
  onToggleProtection: (enabled: boolean) => void;
  onToggleAutoUpdate: (enabled: boolean) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  metrics,
  stats,
  userProfile,
  onUpgrade,
  onRefresh,
  onToggleProtection,
  onToggleAutoUpdate,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [realtimeData, setRealtimeData] = useState({
    currentSpeed: 45,
    avgSpeed: 42,
    uptime: "99.9%",
  });

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimeData(prev => ({
        ...prev,
        currentSpeed: prev.currentSpeed + (Math.random() - 0.5) * 10,
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
      // Simulate network speed variation
      setRealtimeData(prev => ({
        ...prev,
        currentSpeed: 45 + Math.random() * 20,
      }));
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleProtection = () => {
    const enabled = metrics.protectionStatus === "off";
    onToggleProtection(enabled);
  };

  const handleToggleAutoUpdate = () => {
    onToggleAutoUpdate(!metrics.autoUpdate);
  };

  const surface =
    "rounded-2xl border border-slate-200/80 dark:border-slate-800/70 bg-white/90 dark:bg-slate-900/70 shadow-sm backdrop-blur";
  const softSurface =
    "rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-50/80 dark:bg-slate-900/60 shadow-sm backdrop-blur";

  return (
    <div className="space-y-6" role="tabpanel" id="tabpanel-dashboard" aria-labelledby="tab-dashboard">
      {/* Welcome Section */}
      <AnimatedCard delay={0} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border border-blue-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Chào mừng, {userProfile.fullName || userProfile.email || "Người dùng"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Hệ thống bảo vệ đang hoạt động {metrics.protectionStatus === "on" ? "tốt" : "tạm dừng"}
            </p>
          </div>
          <RippleButton
            variant="ghost"
            size="md"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 !bg-white dark:!bg-gray-600 rounded-xl shadow-md hover:shadow-lg disabled:opacity-50"
          >
            <svg
              className={`w-6 h-6 text-blue-600 dark:text-blue-400 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </RippleButton>
        </div>
      </AnimatedCard>

      {/* Quick Stats Grid with Progress Rings */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Data Usage with Progress Ring */}
        <AnimatedCard delay={100} hover className={`${surface} p-6`}>
          <div className="flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Dung lượng sử dụng</h3>
            <ProgressRing 
              percentage={metrics.usagePercentage} 
              size={100}
              strokeWidth={8}
              showLabel
              animated
            />
            <p className="text-xs text-gray-500 mt-2">{metrics.usedGB} / {metrics.totalGB} GB</p>
          </div>
        </AnimatedCard>

        {/* Protection Status */}
        <AnimatedCard delay={200} hover className={`${surface} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Trạng thái bảo vệ</h3>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              metrics.protectionStatus === "on" 
                ? "bg-green-100 dark:bg-green-900" 
                : "bg-red-100 dark:bg-red-900"
            }`}>
              <svg className={`w-4 h-4 ${
                metrics.protectionStatus === "on" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-lg font-bold ${
                metrics.protectionStatus === "on" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {metrics.protectionStatus === "on" ? "BẬT" : "TẮT"}
              </span>
              <button
                onClick={handleToggleProtection}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  metrics.protectionStatus === "on" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    metrics.protectionStatus === "on" ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              {metrics.protectionStatus === "on" ? "Đang bảo vệ tích cực" : "Tạm dừng bảo vệ"}
            </p>
          </div>
        </AnimatedCard>

        {/* Blocked Today */}
        <AnimatedCard delay={300} hover className={`${surface} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Đã chặn hôm nay</h3>
            <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{metrics.blockedToday}</span>
            <p className="text-xs text-gray-500">nội dung không phù hợp</p>
            <div className="flex items-center space-x-1 text-xs text-green-600 dark:text-green-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span>+{stats.todayBlocked} hôm nay</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Speed Monitor */}
        <AnimatedCard delay={400} hover className={`${surface} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tốc độ mạng</h3>
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-end space-x-1">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{Math.round(realtimeData.currentSpeed)}</span>
              <span className="text-sm text-gray-500">Mbps</span>
            </div>
            <p className="text-xs text-gray-500">Trung bình: {realtimeData.avgSpeed} Mbps</p>
            <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12 0m-12 7a9 9 0 019 9H3a9 9 0 019-9z" />
              </svg>
              <span>Uptime: {realtimeData.uptime}</span>
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Protection Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Protection Settings Card */}
          <div className={`${surface} p-6`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Cài đặt bảo vệ
            </h3>
            
            <div className="space-y-4">
              {/* Real-time Protection */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Bảo vệ thời gian thực</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Quét và chặn nội dung ngay lập tức</p>
                </div>
                <button
                  onClick={handleToggleProtection}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    metrics.protectionStatus === "on" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      metrics.protectionStatus === "on" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Auto Update */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Cập nhật tự động</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Tự động cập nhật quy tắc bảo vệ</p>
                </div>
                <button
                  onClick={handleToggleAutoUpdate}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    metrics.autoUpdate ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      metrics.autoUpdate ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Speed Limit */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Giới hạn tốc độ</h4>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{metrics.speedLimit}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${metrics.speedLimit}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Điều chỉnh tốc độ quét để tối ưu hiệu suất
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${surface} p-6`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Hoạt động gần đây
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Đã chặn nội dung không phù hợp</p>
                  <p className="text-xs text-gray-500">facebook.com • 2 phút trước</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Cảnh báo trang web nghi vấn</p>
                  <p className="text-xs text-gray-500">example-ads.com • 5 phút trước</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Cập nhật quy tắc bảo vệ thành công</p>
                  <p className="text-xs text-gray-500">Hệ thống • 10 phút trước</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className={`${surface} p-6`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thao tác nhanh</h3>
            
            {/* Premium Benefits Card */}
            <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Mở khóa Premium
                  </p>
                  <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Dung lượng không giới hạn
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Bảo vệ nâng cao AI
                    </li>
                    <li className="flex items-center">
                      <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Hỗ trợ ưu tiên 24/7
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <RippleButton
                variant="primary"
                size="lg"
                onClick={onUpgrade}
                className="w-full !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 shadow-lg hover:shadow-xl transition-shadow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-bold">Nâng cấp Premium</span>
                <svg className="w-4 h-4 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </RippleButton>
              
              <RippleButton
                variant="secondary"
                size="lg"
                onClick={() => window.open(chrome.runtime.getURL("src/report/index.html"))}
                className="w-full !bg-red-50 dark:!bg-red-900/20 !text-red-600 dark:!text-red-400 hover:!bg-red-100 dark:hover:!bg-red-900/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833-.192 2.5 1.732 2.5z" />
                </svg>
                <span>Báo cáo vấn đề</span>
              </RippleButton>
            </div>
          </div>

          {/* Extended Stats */}
          <div className={`${surface} p-6`}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Thống kê chi tiết</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tổng mối đe dọa đã chặn</span>
                <span className="font-semibold text-gray-900 dark:text-white">{stats.totalBlocked}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Thời gian hoạt động</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{realtimeData.uptime}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Trang web đã quét</span>
                <span className="font-semibold text-gray-900 dark:text-white">1,247</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Cập nhật cuối</span>
                <span className="font-semibold text-gray-900 dark:text-white">Hôm nay</span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-green-200 dark:border-green-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Điểm hiệu suất
            </h3>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">98</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Xuất sắc</p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "98%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DashboardTab);
