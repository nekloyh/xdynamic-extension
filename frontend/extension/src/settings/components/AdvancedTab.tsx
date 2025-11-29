import React, { useState } from "react";
import { LogLevel, ActivityLog, SecuritySettings } from "../../types/common";

interface AdvancedTabProps {
  onExportSettings: (format: "json" | "csv") => void | Promise<void>;
  onImportSettings: (file: File) => void | Promise<void>;
  isLoading?: {
    saving: boolean;
    resetting: boolean;
    exporting: boolean;
    importing: boolean;
  };
  customFilters: string[];
  vpnEnabled?: boolean;
  onUpdateSecurity: (updates: Partial<SecuritySettings>) => void;
}

const AdvancedTab: React.FC<AdvancedTabProps> = ({
  onExportSettings,
  onImportSettings,
  isLoading = { saving: false, resetting: false, exporting: false, importing: false },
  customFilters,
  vpnEnabled = false,
  onUpdateSecurity,
}) => {
  const [logLevel, setLogLevel] = useState<LogLevel>("info");
  const [newFilter, setNewFilter] = useState("");

  const handleAddFilter = () => {
    if (newFilter.trim() && !customFilters.includes(newFilter.trim())) {
      onUpdateSecurity({ customFilters: [...customFilters, newFilter.trim()] });
      setNewFilter("");
    }
  };

  const handleRemoveFilter = (filter: string) => {
    onUpdateSecurity({ customFilters: customFilters.filter((f) => f !== filter) });
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportSettings(file);
    }
  };

  const surface = "bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/70 backdrop-blur";
  const softSurface = "bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 shadow-sm backdrop-blur";

  // Mock activity logs
  const activityLogs: ActivityLog[] = [
    {
      id: "1",
      timestamp: new Date().toISOString(),
      level: "info",
      message: "Bảo vệ thời gian thực đã được bật",
      details: "User enabled real-time protection",
    },
    {
      id: "2",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: "warning",
      message: "Phát hiện 5 mối đe dọa",
      details: "5 threats detected and blocked",
    },
    {
      id: "3",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      level: "error",
      message: "Không thể cập nhật bộ lọc",
      details: "Failed to update filter database",
    },
  ];

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "debug":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8" role="tabpanel" id="tabpanel-advanced" aria-labelledby="tab-advanced">
      {/* Advanced Features Card */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Tính năng nâng cao
        </h2>

        {/* VPN Toggle */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-white rounded-2xl border border-blue-200/60 dark:border-slate-700 mb-4 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center mb-1">
              <svg className="w-5 h-5 mr-2 text-blue-700 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="font-semibold text-gray-900 dark:text-white">VPN Bảo Mật</h3>
              <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">PRO</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200">
              Mã hóa kết nối và ẩn địa chỉ IP của bạn
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={vpnEnabled}
              onChange={(e) => onUpdateSecurity({ vpnEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Custom Filters */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Bộ lọc tùy chỉnh</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Thêm các mẫu URL để chặn hoặc cho phép cụ thể
          </p>
          
          {/* Add Filter Input */}
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newFilter}
              onChange={(e) => setNewFilter(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleAddFilter()}
              placeholder="Nhập pattern (vd: *.example.com)"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAddFilter}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Filter List */}
          <div className="space-y-2">
            {customFilters.map((filter) => (
              <div
                key={filter}
                className={`flex items-center justify-between p-3 ${softSurface}`}
              >
                <span className="font-mono text-sm text-gray-900 dark:text-white">{filter}</span>
                <button
                  onClick={() => handleRemoveFilter(filter)}
                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Import/Export Settings */}
        <div className="border-t border-slate-200/70 dark:border-slate-800/70 pt-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Import/Export Cài Đặt</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 ${softSurface}`}>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Xuất cài đặt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Sao lưu cấu hình hiện tại của bạn
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onExportSettings("json")}
                  disabled={isLoading.exporting}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading.exporting ? (
                    <>
                      <svg className="w-4 h-4 inline mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Xuất...
                    </>
                  ) : (
                    "JSON"
                  )}
                </button>
                <button
                  onClick={() => onExportSettings("csv")}
                  disabled={isLoading.exporting}
                  className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading.exporting ? (
                    <>
                      <svg className="w-4 h-4 inline mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Xuất...
                    </>
                  ) : (
                    "CSV"
                  )}
                </button>
              </div>
            </div>

            <div className={`p-4 ${softSurface}`}>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Nhập cài đặt</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Khôi phục từ file đã sao lưu
              </p>
              <label className={`block w-full px-3 py-2 rounded-lg transition-colors text-sm font-medium text-center cursor-pointer ${
                isLoading.importing 
                  ? "bg-gray-400 text-white cursor-not-allowed" 
                  : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}>
                <input
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileImport}
                  disabled={isLoading.importing}
                  className="hidden"
                />
                {isLoading.importing ? (
                  <>
                    <svg className="w-4 h-4 inline mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang nhập...
                  </>
                ) : (
                  "Chọn file"
                )}
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Logs Card */}
      <div className={`${surface} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Activity Logs
          </h2>
          
          {/* Log Level Selector */}
          <select
            value={logLevel}
            onChange={(e) => setLogLevel(e.target.value as LogLevel)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        {/* Logs List */}
        <div className="space-y-3">
          {activityLogs.map((log) => (
            <div
              key={log.id}
              className={`p-4 ${softSurface} border-l-4 border-blue-500`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getLevelColor(log.level)}`}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(log.timestamp).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white mb-1">{log.message}</p>
                  {log.details && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{log.details}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Export Logs Button */}
        <button
          onClick={() => onExportSettings("csv")}
          className="w-full mt-4 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors font-medium"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Xuất logs (CSV/PDF)
        </button>
      </div>
    </div>
  );
};

export default React.memo(AdvancedTab);
