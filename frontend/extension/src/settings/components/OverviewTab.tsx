import React, { useState } from "react";
import { SecuritySettings } from "../../types/common";
import WebsiteManagement from "./WebsiteManagement";

interface OverviewTabProps {
  settings: SecuritySettings;
  onSave: (settings: SecuritySettings) => void | Promise<void>;
  onViewLogs: () => void;
  onReset: () => void;
  isLoading?: {
    saving: boolean;
    resetting: boolean;
    exporting: boolean;
    importing: boolean;
  };
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  settings: initialSettings,
  onSave,
  onViewLogs,
  onReset,
  isLoading = { saving: false, resetting: false, exporting: false, importing: false },
}) => {
  const [settings, setSettings] = useState<SecuritySettings>(initialSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleToggle = (key: keyof SecuritySettings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setHasChanges(true);
  };

  const handleSpeedLimitChange = (value: number) => {
    setSettings((prev) => ({ ...prev, speedLimit: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
  };

  const handleResetClick = () => {
    onReset();
    setHasChanges(false);
  };

  const surface = "bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/70 backdrop-blur";
  const softSurface = "bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl shadow-sm backdrop-blur";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
      {/* Security Settings Card */}
      <div className={`${surface} p-6 mb-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Cài Đặt Bảo Vệ
          </h2>
          {hasChanges && (
            <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-sm font-medium animate-pulse">
              Có thay đổi chưa lưu
            </span>
          )}
        </div>

        {/* Settings List */}
        <div className="space-y-6">
          {/* Real-time Protection */}
          <div className={`flex items-center justify-between p-4 ${softSurface} hover:bg-slate-50/95 dark:hover:bg-slate-900/70 transition-colors`}>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">Bảo vệ theo thời gian thực</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Chặn nội dung độc hại ngay lập tức
              </p>
              {settings.realTimeProtection && (
                <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Đang hoạt động • 2.4M sites đã chặn hôm nay
                </div>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.realTimeProtection}
                onChange={() => handleToggle("realTimeProtection")}
                className="sr-only peer"
                aria-label="Bật/tắt bảo vệ theo thời gian thực"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Auto Update */}
          <div className={`flex items-center justify-between p-4 ${softSurface} hover:bg-slate-50/95 dark:hover:bg-slate-900/70 transition-colors`}>
            <div className="flex-1">
              <div className="flex items-center mb-1">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <h3 className="font-semibold text-gray-900 dark:text-white">Tự động cập nhật bộ lọc</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Cập nhật danh sách đen tự động mỗi ngày
              </p>
              {settings.autoUpdate && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Lần cập nhật cuối: Hôm nay, 08:30
                </div>
              )}
            </div>
            <label className="relative inline-flex items-center cursor-pointer ml-4">
              <input
                type="checkbox"
                checked={settings.autoUpdate}
                onChange={() => handleToggle("autoUpdate")}
                className="sr-only peer"
                aria-label="Bật/tắt tự động cập nhật"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {/* Speed Limit Slider */}
          <div className={`p-4 ${softSurface}`}>
            <div className="flex items-center mb-3">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white">Độ nhạy lọc nội dung</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Cao hơn = Chặt chẽ hơn, có thể chặn nhầm
            </p>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.speedLimit}
                onChange={(e) => handleSpeedLimitChange(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${settings.speedLimit}%, #E5E7EB ${settings.speedLimit}%, #E5E7EB 100%)`,
                }}
                aria-label="Độ nhạy lọc nội dung"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={settings.speedLimit}
                aria-valuetext={`${settings.speedLimit} phần trăm`}
              />
              <span className="text-lg font-bold text-blue-600 min-w-[60px] text-right">
                {settings.speedLimit}%
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Thấp</span>
              <span>Cao</span>
            </div>
            {settings.speedLimit > 80 && (
              <div className="mt-3 text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Ở mức này, có thể chặn 5% sites lành tính
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-slate-200/70 dark:border-slate-800/70 gap-3">
          <div className="flex space-x-3">
            <button
              onClick={onViewLogs}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors font-medium text-sm"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Xem logs
            </button>
            <button
              onClick={handleResetClick}
              disabled={isLoading.resetting}
              className="px-4 py-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading.resetting ? (
                <>
                  <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang đặt lại...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Đặt lại
                </>
              )}
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={!hasChanges || isLoading.saving}
            className={`px-6 py-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              hasChanges && !isLoading.saving
                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400"
            }`}
          >
            {isLoading.saving ? (
              <>
                <svg className="w-4 h-4 inline mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang lưu...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Lưu cài đặt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-6 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Lưu ý về cài đặt bảo vệ
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-400">
              Việc tắt bảo vệ thời gian thực có thể khiến thiết bị của bạn dễ bị tấn công. 
              Chúng tôi khuyên bạn nên giữ tất cả các tính năng bảo vệ ở trạng thái BẬT để có trải nghiệm an toàn nhất.
            </p>
          </div>
        </div>
      </div>

      {/* Website Management Section */}
      <WebsiteManagement onSave={() => setHasChanges(true)} />
    </div>
  );
};

export default React.memo(OverviewTab);
