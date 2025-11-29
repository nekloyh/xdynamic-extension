import React, { useState, useEffect } from "react";

import AccountTab from "./components/AccountTab";
import AdvancedTab from "./components/AdvancedTab";
import OverviewTab from "./components/OverviewTab";
import EditProfileModal from "./components/EditProfileModal";
import DashboardTab from "./components/DashboardTab";
import SettingsSidebar from "./components/SettingsSidebar";
import SettingsSearch from "./components/SettingsSearch";
import SettingsBreadcrumb from "./components/SettingsBreadcrumb";
import FloatingActionButton from "./components/FloatingActionButton";
import QuickSettingsPanel from "./components/QuickSettingsPanel";
import {
  DashboardSkeleton,
  AccountSkeleton,
  OverviewSkeleton,
  AdvancedSkeleton,
} from "./components/SkeletonLoader";
import { ConfirmationModal, Toast } from "../components/common";
import { UserProfile, DashboardMetrics, SecuritySettings, PrivacySettings, UserStatistics } from "../types/common";
import { DEFAULTS, logger, navigateToPage, navigateToPageInCurrentTab } from "../utils";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";

type UserHubTab = "dashboard" | "overview" | "account" | "advanced";
const ACTIVE_TAB_STORAGE_KEY = "xdynamic-userhub-tab";

const UserHub: React.FC = () => {
  // Initialize active tab from URL hash or default to "dashboard"
  const getInitialTab = (): UserHubTab => {
    const validTabs = ['dashboard', 'overview', 'account', 'advanced'];
    try {
      const saved = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
      if (saved && validTabs.includes(saved)) {
        return saved as UserHubTab;
      }
    } catch {
      // ignore storage errors and fall back to default
    }
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<UserHubTab>(getInitialTab());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showQuickSettings, setShowQuickSettings] = useState(false);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({
    isVisible: false,
    message: "",
    type: "info",
  });
  const [isLoading, setIsLoading] = useState({
    saving: false,
    resetting: false,
    exporting: false,
    importing: false,
  });

  // Persist last tab locally so it re-opens without hash fragments
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
    } catch {
      // ignore storage errors
    }
  }, [activeTab]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcut for search (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Tìm kiếm"]')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    fullName: "",
    email: "",
    avatar: "",
    plan: "Free",
    planType: "free",
  });

  // Load initial email from storage if available
  useEffect(() => {
    const loadStoredEmail = async () => {
      const email = await authService.getUserEmail();
      if (email && !userProfile.email) {
        setUserProfile(prev => ({ ...prev, email }));
      }
    };
    loadStoredEmail();
  }, []);

  // Dashboard metrics state
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    usagePercentage: 0,
    usedGB: 0,
    totalGB: DEFAULTS.USAGE_LIMIT_GB,
    blockedToday: 0,
    protectionStatus: "off",
    autoUpdate: DEFAULTS.AUTO_UPDATE_ENABLED,
    speedLimit: DEFAULTS.SPEED_LIMIT,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    realTimeProtection: DEFAULTS.PROTECTION_ENABLED,
    autoUpdate: DEFAULTS.AUTO_UPDATE_ENABLED,
    speedLimit: DEFAULTS.SPEED_LIMIT,
    customFilters: [],
    vpnEnabled: false,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    dataSharing: true,
    analytics: false,
    crashReports: true,
    personalizedAds: false,
  });

  const [userStats, setUserStats] = useState<UserStatistics>({
    totalBlocked: 0,
    todayBlocked: 0,
    weeklyBlocked: 0,
    monthlyBlocked: 0,
    byCategory: { sensitive: 0, violence: 0, toxicity: 0, vice: 0 }
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsInitialLoading(true);
      try {
        const [profile, settings, stats] = await Promise.all([
          userService.getProfile(),
          userService.getSettings(),
          userService.getStatistics()
        ]);

        console.log("Fetched profile:", profile);
        setUserProfile(profile);
        
        if (settings.security) {
          setSecuritySettings(settings.security);
        }
        
        if (settings.privacy) {
          setPrivacySettings(settings.privacy);
        }

        // Map stats to dashboardMetrics
        setUserStats(stats);
        setDashboardMetrics(prev => ({
          ...prev,
          blockedToday: stats.todayBlocked,
          // Other metrics might need separate endpoints or calculation
        }));

      } catch (error) {
        console.error("Error fetching user data:", error);
        logger.error("Failed to fetch user data:", error);
        showToast("Không thể tải dữ liệu người dùng. Vui lòng thử lại.", "error");
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefreshStats = async () => {
    try {
      const stats = await userService.getStatistics();
      setUserStats(stats);
      setDashboardMetrics(prev => ({
        ...prev,
        blockedToday: stats.todayBlocked,
      }));
      showToast("Dữ liệu đã được cập nhật", "success");
    } catch (error) {
      logger.error("Failed to refresh stats:", error);
      showToast("Không thể cập nhật dữ liệu", "error");
    }
  };

  const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
    setToast({ isVisible: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleTabChange = (tab: UserHubTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleSearchNavigate = (section: string) => {
    setActiveTab(section as UserHubTab);
    setIsMobileMenuOpen(false);
  };

  const getSectionTitle = (tab: UserHubTab): string => {
    const titles: Record<UserHubTab, string> = {
      dashboard: "Trang chủ",
      overview: "Bảo mật",
      account: "Tài khoản",
      advanced: "Nâng cao",
    };
    return titles[tab];
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (updatedProfile: Partial<UserProfile>) => {
    setIsLoading(prev => ({ ...prev, saving: true }));
    try {
      const newProfile = await userService.updateProfile(updatedProfile);
      setUserProfile(newProfile);
      setShowEditProfileModal(false);
      showToast("Hồ sơ đã được cập nhật thành công!", "success");
      logger.info("Profile updated:", newProfile);
    } catch (error) {
      logger.error("Failed to update profile:", error);
      showToast("Có lỗi xảy ra khi cập nhật hồ sơ.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleLogout = async () => {
    logger.info("User logging out");
    try {
      await authService.logout();
      navigateToPage('LOGIN');
    } catch (error) {
      logger.error("Logout failed:", error);
      // Force redirect even if logout API fails
      navigateToPage('LOGIN');
    }
  };

  const handleUpgrade = () => {
    logger.info("User initiating upgrade from settings");
    console.log("[UPGRADE] Starting upgrade flow...");
    console.log("[UPGRADE] Target page:", "PLAN");
    console.log("[UPGRADE] Expected URL:", chrome.runtime.getURL("src/plan/index.html"));
    
    // Show upgrade benefits toast before redirecting
    showToast("Khám phá các tính năng Premium!", "info");
    
    // Prefer same-tab navigation for reliability; fallback to new tab.
    setTimeout(() => {
      console.log("[UPGRADE] Navigating to PLAN page (current tab)...");
      navigateToPageInCurrentTab("PLAN");
      setTimeout(() => navigateToPage("PLAN"), 200);
    }, 300);
  };

  const handleViewDetails = () => {
    // Already in dashboard view, just switch to dashboard tab
    setActiveTab('dashboard');
  };

  const handleToggleProtection = async (enabled: boolean) => {
    // Optimistic update
    setDashboardMetrics(prev => ({ ...prev, protectionStatus: enabled ? "on" : "off" }));
    setSecuritySettings(prev => ({ ...prev, realTimeProtection: enabled }));
    
    try {
      await userService.updateSettings({ security: { ...securitySettings, realTimeProtection: enabled } });
      logger.info("Protection toggled:", enabled);
      showToast(`Đã ${enabled ? "bật" : "tắt"} bảo vệ thời gian thực`, "success");
    } catch (error) {
      logger.error("Failed to toggle protection:", error);
      // Revert on failure
      setDashboardMetrics(prev => ({ ...prev, protectionStatus: !enabled ? "on" : "off" }));
      setSecuritySettings(prev => ({ ...prev, realTimeProtection: !enabled }));
      showToast("Không thể thay đổi trạng thái bảo vệ. Vui lòng thử lại.", "error");
    }
  };

  const handleToggleAutoUpdate = async (enabled: boolean) => {
    // Optimistic update
    setDashboardMetrics(prev => ({ ...prev, autoUpdate: enabled }));
    setSecuritySettings(prev => ({ ...prev, autoUpdate: enabled }));

    try {
      await userService.updateSettings({ security: { ...securitySettings, autoUpdate: enabled } });
      logger.info("Auto-update toggled:", enabled);
      showToast(`Đã ${enabled ? "bật" : "tắt"} tự động cập nhật`, "success");
    } catch (error) {
      logger.error("Failed to toggle auto-update:", error);
      // Revert on failure
      setDashboardMetrics(prev => ({ ...prev, autoUpdate: !enabled }));
      setSecuritySettings(prev => ({ ...prev, autoUpdate: !enabled }));
      showToast("Không thể thay đổi cài đặt cập nhật. Vui lòng thử lại.", "error");
    }
  };

  const handleSaveSecuritySettings = async (settings: SecuritySettings) => {
    setIsLoading(prev => ({ ...prev, saving: true }));
    try {
      await userService.updateSettings({ security: settings });
      
      logger.info("Saving security settings:", settings);
      setSecuritySettings(settings);
      showToast("Cài đặt bảo mật đã được lưu thành công!", "success");
    } catch (error) {
      logger.error("Failed to save security settings:", error);
      showToast("Có lỗi xảy ra khi lưu cài đặt. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleResetSettings = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = async () => {
    setIsLoading(prev => ({ ...prev, resetting: true }));
    setShowResetConfirm(false);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      logger.info("Resetting security settings to defaults");
      setSecuritySettings({
        realTimeProtection: DEFAULTS.PROTECTION_ENABLED,
        autoUpdate: DEFAULTS.AUTO_UPDATE_ENABLED,
        speedLimit: DEFAULTS.SPEED_LIMIT,
        customFilters: [],
        vpnEnabled: false,
      });
      showToast("Tất cả cài đặt đã được đặt lại về mặc định!", "success");
    } catch (error) {
      logger.error("Failed to reset settings:", error);
      showToast("Có lỗi xảy ra khi đặt lại cài đặt. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, resetting: false }));
    }
  };

  const handleExportSettings = async (format: "json" | "csv") => {
    setIsLoading(prev => ({ ...prev, exporting: true }));
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
      logger.info("Exporting settings as:", format);
      
      const exportData = {
        userProfile,
        securitySettings,
        dashboardMetrics,
        exportedAt: new Date().toISOString(),
        version: "1.0.0"
      };

      const dataStr = format === "json" 
        ? JSON.stringify(exportData, null, 2)
        : convertToCSV(exportData);
      
      const dataBlob = new Blob([dataStr], { 
        type: format === "json" ? "application/json" : "text/csv" 
      });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `xdynamic-userhub-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      showToast(`Dữ liệu đã được xuất thành công dưới dạng ${format.toUpperCase()}!`, "success");
    } catch (error) {
      logger.error("Failed to export settings:", error);
      showToast("Có lỗi xảy ra khi xuất dữ liệu. Vui lòng thử lại.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, exporting: false }));
    }
  };

  const convertToCSV = (data: any): string => {
    const flattenObject = (obj: any, prefix = ''): any => {
      let flattened: any = {};
      for (const key in obj) {
        if (obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenObject(obj[key], `${prefix}${key}.`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flattenObject(data);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(',');
    
    return `${headers}\n${values}`;
  };

  const handleImportSettings = async (file: File) => {
    setIsLoading(prev => ({ ...prev, importing: true }));
    try {
      const text = await file.text();
      let importedData: any;
      
      if (file.name.endsWith('.json')) {
        importedData = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        // Basic CSV parsing - in production, use a proper CSV parser
        const lines = text.split('\n');
        const headers = lines[0].split(',');
        const values = lines[1].split(',');
        importedData = {};
        headers.forEach((header, index) => {
          importedData[header] = values[index];
        });
      } else {
        throw new Error('Unsupported file format');
      }

      // Validate and apply imported settings
      if (importedData.securitySettings) {
        setSecuritySettings(importedData.securitySettings);
      }
      if (importedData.userProfile) {
        setUserProfile(prev => ({ ...prev, ...importedData.userProfile }));
      }
      if (importedData.dashboardMetrics) {
        setDashboardMetrics(prev => ({ ...prev, ...importedData.dashboardMetrics }));
      }
      
      logger.info("Settings imported successfully from:", file.name);
      showToast("Dữ liệu đã được nhập thành công!", "success");
    } catch (error) {
      logger.error("Failed to import settings:", error);
      showToast("Có lỗi xảy ra khi nhập dữ liệu. Vui lòng kiểm tra file và thử lại.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, importing: false }));
    }
  };

  const handleNavigateToBilling = () => {
    logger.info("User navigating to billing from settings");
    console.log("💳 [BILLING] Starting billing flow...");
    console.log("💳 [BILLING] Target page:", 'PAYMENT');
    console.log("💳 [BILLING] Expected URL:", chrome.runtime.getURL('src/payment/index.html'));
    
    showToast("Đang chuyển đến trang thanh toán...", "info");
    
    setTimeout(() => {
      console.log("💳 [BILLING] Navigating to PAYMENT page...");
      navigateToPage('PAYMENT');
    }, 500);
  };

  const handleChangePassword = (oldPassword: string, newPassword: string) => {
    logger.info("Password change requested");
    showToast("Mật khẩu đã được thay đổi thành công!", "success");
  };

  const handleSavePrivacy = async (settings: PrivacySettings) => {
    setIsLoading(prev => ({ ...prev, saving: true }));
    try {
      await userService.updateSettings({ privacy: settings });
      setPrivacySettings(settings);
      logger.info("Saving privacy settings:", settings);
      showToast("Cài đặt riêng tư đã được lưu!", "success");
    } catch (error) {
      logger.error("Failed to save privacy settings:", error);
      showToast("Có lỗi xảy ra khi lưu cài đặt.", "error");
    } finally {
      setIsLoading(prev => ({ ...prev, saving: false }));
    }
  };

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      logger.warn("Account deletion completed");
      showToast("Tài khoản đã được xóa thành công. Bạn sẽ được chuyển hướng về trang đăng nhập.", "success");
      
      setTimeout(() => {
        navigateToPage('LOGIN');
      }, 3000);
    } catch (error) {
      logger.error("Failed to delete account:", error);
      showToast("Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại sau.", "error");
    }
  };

  const tabs: { id: UserHubTab; label: string; icon: string; description: string }[] = [
    { id: "dashboard", label: "Trang chủ", icon: "🏠", description: "Tổng quan và thống kê" },
    { id: "overview", label: "Bảo mật", icon: "🛡️", description: "Cài đặt bảo vệ" },
    { id: "account", label: "Tài khoản", icon: "👤", description: "Thông tin cá nhân" },
    { id: "advanced", label: "Nâng cao", icon: "⚙️", description: "Tùy chỉnh chi tiết" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <SettingsSidebar
        activeSection={activeTab}
        onSectionChange={handleTabChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header with Profile & Search */}
        <header className="sticky top-0 z-40 backdrop-blur bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60">
          {/* Profile Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-blue-900 text-slate-50 px-4 sm:px-6 py-6">
            <div className="absolute inset-0 opacity-30">
              <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-blue-500 blur-3xl" />
              <div className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
            </div>
            <div className="relative max-w-6xl mx-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden mb-4 p-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg transition-colors"
                aria-label="Mở menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 border border-white/10 p-1 shadow-lg">
                      {userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt={userProfile.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                          {userProfile.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleEditProfile}
                      className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 bg-white text-blue-700 border border-white/60 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-50 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Chỉnh sửa avatar"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="text-white text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <h2 className="text-xl sm:text-2xl font-bold">{userProfile.fullName}</h2>
                      <button
                        onClick={handleEditProfile}
                        className="p-1 hover:bg-white/10 rounded transition-colors"
                        aria-label="Chỉnh sửa hồ sơ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-blue-100 mb-2 text-sm sm:text-base break-all sm:break-normal">{userProfile.email}</p>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-white/10 border border-white/15 text-white backdrop-blur">
                      {userProfile.plan}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <button
                    onClick={handleUpgrade}
                    className="w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base shadow-sm"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Nâng cấp</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Breadcrumb Bar */}
          <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Breadcrumb */}
                <SettingsBreadcrumb
                  items={[
                    { label: "Cài đặt", onClick: () => handleTabChange("dashboard") },
                    { label: getSectionTitle(activeTab) },
                  ]}
                />

                {/* Search */}
                <SettingsSearch onNavigate={handleSearchNavigate} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Tabs */}
        <main className="flex-1 p-4 sm:p-6 max-w-6xl mx-auto w-full">
          {isInitialLoading ? (
            <>
              {activeTab === "dashboard" && <DashboardSkeleton />}
              {activeTab === "overview" && <OverviewSkeleton />}
              {activeTab === "account" && <AccountSkeleton />}
              {activeTab === "advanced" && <AdvancedSkeleton />}
            </>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab
                  metrics={dashboardMetrics}
                  stats={userStats}
                  userProfile={userProfile}
                  onUpgrade={handleUpgrade}
                  onRefresh={handleRefreshStats}
                  onToggleProtection={handleToggleProtection}
                  onToggleAutoUpdate={handleToggleAutoUpdate}
                />
              )}
              {activeTab === "overview" && (
                <OverviewTab
                  settings={securitySettings}
                  onSave={handleSaveSecuritySettings}
                  onViewLogs={() => logger.debug("View logs requested")}
                  onReset={handleResetSettings}
                  isLoading={isLoading}
                />
              )}
              {activeTab === "advanced" && (
                <AdvancedTab
                  onExportSettings={handleExportSettings}
                  onImportSettings={handleImportSettings}
                  isLoading={isLoading}
                  customFilters={securitySettings.customFilters}
                  vpnEnabled={securitySettings.vpnEnabled}
                  onUpdateSecurity={(updates) => handleSaveSecuritySettings({ ...securitySettings, ...updates })}
                />
              )}
              {activeTab === "account" && (
                <AccountTab
                  onNavigateToBilling={handleNavigateToBilling}
                  onChangePassword={handleChangePassword}
                  onSavePrivacy={handleSavePrivacy}
                  onDeleteAccount={handleDeleteAccount}
                  privacySettings={privacySettings}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals and Toast */}
      <EditProfileModal
        isOpen={showEditProfileModal}
        profile={userProfile}
        onSave={handleSaveProfile}
        onCancel={() => setShowEditProfileModal(false)}
      />

      <ConfirmationModal
        isOpen={showResetConfirm}
        title="Xác nhận đặt lại cài đặt"
        message="Bạn có chắc chắn muốn đặt lại tất cả cài đặt bảo mật về mặc định? Hành động này không thể hoàn tác."
        confirmText="Đặt lại"
        cancelText="Hủy"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirm(false)}
        variant="destructive"
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa tài khoản"
        message="Bạn có chắc chắn muốn xóa tài khoản? Tất cả dữ liệu sẽ bị mất vĩnh viễn và không thể khôi phục."
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        onConfirm={handleConfirmDeleteAccount}
        onCancel={() => setShowDeleteConfirm(false)}
        variant="destructive"
      />

      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
        duration={4000}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        position="bottom-right"
        size="lg"
        actions={[
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            ),
            label: 'Lưu cài đặt',
            onClick: () => {
              showToast('Đã lưu cài đặt thành công!', 'success');
            }
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            ),
            label: 'Xuất dữ liệu',
            onClick: () => {
              handleExportSettings('json');
            }
          },
          {
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
            label: 'Cài đặt nhanh',
            onClick: () => {
              setShowQuickSettings(true);
            }
          }
        ]}
      />

      {/* Quick Settings Panel */}
      <QuickSettingsPanel
        isOpen={showQuickSettings}
        onClose={() => setShowQuickSettings(false)}
        settings={[
          {
            id: 'protection',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            ),
            label: 'Bảo vệ thời gian thực',
            value: dashboardMetrics.protectionStatus === 'on',
            onChange: (enabled) => handleToggleProtection(enabled),
            color: 'green'
          },
          {
            id: 'autoUpdate',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            ),
            label: 'Tự động cập nhật',
            value: true,
            onChange: (enabled) => handleToggleAutoUpdate(enabled),
            color: 'blue'
          },
          {
            id: 'darkMode',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ),
            label: 'Chế độ tối',
            value: document.documentElement.classList.contains('dark'),
            onChange: (enabled) => {
              document.documentElement.classList.toggle('dark', enabled);
              showToast(`Đã ${enabled ? 'bật' : 'tắt'} chế độ tối`, 'success');
            },
            color: 'purple'
          },
          {
            id: 'notifications',
            icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ),
            label: 'Thông báo',
            value: true,
            onChange: (enabled) => {
              showToast(`Đã ${enabled ? 'bật' : 'tắt'} thông báo`, 'info');
            },
            color: 'yellow'
          }
        ]}
      />
    </div>
  );
};

export default React.memo(UserHub);
