import React, { useState, useEffect } from "react";

import AccountTab from "./components/AccountTab";
import AdvancedTab from "./components/AdvancedTab";
import OverviewTab from "./components/OverviewTab";
import EditProfileModal from "./components/EditProfileModal";
import DashboardTab from "./components/DashboardTab";
import SettingsSidebar from "./components/SettingsSidebar";
import SettingsSearch from "./components/SettingsSearch";
import {
  DashboardSkeleton,
  AccountSkeleton,
  OverviewSkeleton,
  AdvancedSkeleton,
} from "./components/SkeletonLoader";
import { ConfirmationModal, Toast } from "../components/common";
import { UserProfile, DashboardMetrics, SecuritySettings, PrivacySettings, UserStatistics, ActivityLog } from "../types/common";
import { DEFAULTS, EXTERNAL_LINKS, logger, navigateToPage, navigateToPageInCurrentTab, STORAGE_KEYS } from "../utils";
import { userService } from "../services/user.service";
import { authService } from "../services/auth.service";
import { readFromStorage, writeToStorage } from "../core/storage";
import { useLanguageContext } from "../providers/LanguageProvider";

type UserHubTab = "dashboard" | "overview" | "account" | "advanced";
const ACTIVE_TAB_STORAGE_KEY = "xdynamic-userhub-tab";

const UserHub: React.FC = () => {
  const { language } = useLanguageContext();
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
  const [sessionLogs, setSessionLogs] = useState<ActivityLog[]>([]);

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
    isAdmin: false,
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
    usageUnit: "GB",
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
        const [profile, settings, stats, extensionEnabled] = await Promise.all([
          userService.getProfile(),
          userService.getSettings(),
          userService.getStatistics(),
          readFromStorage<boolean>(STORAGE_KEYS.EXTENSION_ENABLED)
        ]);

        console.log("Fetched profile:", profile);
        setUserProfile(profile);
        
        const resolvedProtection = extensionEnabled ?? settings.security?.realTimeProtection ?? DEFAULTS.PROTECTION_ENABLED;
        const resolvedAutoUpdate =
          typeof settings.security?.autoUpdate === "boolean"
            ? settings.security.autoUpdate
            : securitySettings.autoUpdate ?? DEFAULTS.AUTO_UPDATE_ENABLED;
        const resolvedSpeedLimit =
          typeof settings.security?.speedLimit === "number"
            ? settings.security.speedLimit
            : securitySettings.speedLimit ?? DEFAULTS.SPEED_LIMIT;

        if (settings.security) {
          // Sync with extension state if available and normalize missing fields
          const syncedSecurity = {
            ...settings.security,
            realTimeProtection: resolvedProtection,
            autoUpdate: resolvedAutoUpdate,
            speedLimit: resolvedSpeedLimit,
          };
          setSecuritySettings(syncedSecurity);
        }
        
        if (settings.privacy) {
          setPrivacySettings(settings.privacy);
        }

        // Map stats to dashboardMetrics
        setUserStats(stats);
        const usedRaw =
          stats.usedQuotaGB ??
          stats.usage?.used ??
          (typeof stats.used_quota === "number" ? stats.used_quota : undefined);

        const totalRaw =
          stats.totalQuotaGB ??
          stats.usage?.total ??
          (typeof stats.total_quota === "number" ? stats.total_quota : undefined);

        const usedGB = typeof usedRaw === "number" ? usedRaw : dashboardMetrics.usedGB;
        const totalGB = typeof totalRaw === "number" ? totalRaw : dashboardMetrics.totalGB;

        const derivedUsagePercentage =
          typeof stats.usagePercentage === "number"
            ? stats.usagePercentage
            : typeof stats.usage?.percent === "number"
              ? stats.usage.percent
              : totalRaw
                ? ((usedRaw ?? 0) / totalRaw) * 100
                : undefined;

        const usageUnit =
          stats.usageUnit ||
          (stats.totalQuotaGB || stats.usedQuotaGB || stats.usage?.total || stats.usage?.used
            ? "GB"
            : (typeof stats.total_quota === "number" || typeof stats.used_quota === "number")
              ? "lần"
              : dashboardMetrics.usageUnit || "GB");

        setDashboardMetrics(prev => ({
          ...prev,
          blockedToday: stats.todayBlocked ?? prev.blockedToday,
          usedGB: usedGB ?? prev.usedGB,
          totalGB: totalGB ?? prev.totalGB,
          usageUnit,
          usagePercentage:
            derivedUsagePercentage ??
            (totalGB ? (usedGB ?? 0) / totalGB * 100 : prev.usagePercentage),
          // Sync protection status with extension state
          protectionStatus: resolvedProtection ? "on" : "off",
          autoUpdate: resolvedAutoUpdate,
          speedLimit: resolvedSpeedLimit,
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

  const refreshProfile = async () => {
    try {
      const profile = await userService.getProfile();
      setUserProfile(profile);
    } catch (error) {
      logger.error("Failed to refresh profile:", error);
    }
  };

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

    const level: ActivityLog["level"] =
      type === "error" ? "error" : type === "warning" ? "warning" : "info";
    const logEntry: ActivityLog = {
      id: `session-${Date.now()}`,
      timestamp: new Date().toISOString(),
      level,
      message,
      details: "",
    };
    setSessionLogs((prev) => [...prev.slice(-49), logEntry]);
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
    setActiveTab("account");
    showToast("Chọn gói nâng cấp phù hợp với bạn", "info");
  };

  const handleOpenAdminDashboard = async () => {
    if (!userProfile.isAdmin) {
      showToast("You need admin access to open the dashboard.", "error");
      return;
    }

    const targetUrl = EXTERNAL_LINKS.ADMIN_DASHBOARD;
    if (!targetUrl) {
      showToast("Admin dashboard URL is not configured.", "error");
      return;
    }

    logger.info("Navigating to admin dashboard from settings", { targetUrl });

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        await chrome.tabs.update(tab.id, { url: targetUrl });
        return;
      }
    } catch (error) {
      logger.error("Failed to navigate to admin dashboard in current tab", error);
    }

    try {
      chrome.tabs.create({ url: targetUrl });
    } catch (error) {
      logger.error("Failed to open admin dashboard in new tab", error);
      showToast("Không mở được trang admin dashboard.", "error");
    }
  };

  const handleToggleProtection = async (enabled: boolean) => {
    // Optimistic update
    setDashboardMetrics(prev => ({ ...prev, protectionStatus: enabled ? "on" : "off" }));
    setSecuritySettings(prev => ({ ...prev, realTimeProtection: enabled }));
    
    try {
      await userService.updateSettings({ security: { ...securitySettings, realTimeProtection: enabled } });
      
      // Sync with extension state (Popup toggle)
      await writeToStorage(STORAGE_KEYS.EXTENSION_ENABLED, enabled);
      
      // Read-modify-write for full state
      try {
        const currentState = await readFromStorage<any>(STORAGE_KEYS.EXTENSION_STATE) || {};
        const newState = { ...currentState, isEnabled: enabled };
        await writeToStorage(STORAGE_KEYS.EXTENSION_STATE, newState);
        await writeToStorage(STORAGE_KEYS.EXTENSION_ENABLED, enabled);
        
        chrome.runtime.sendMessage({
          type: "STATE_UPDATED",
          payload: newState,
        });
      } catch (e) {
        console.error("Failed to sync extension state", e);
      }

      logger.info("Protection toggled:", enabled);
      showToast(enabled ? "Bao ve da duoc bat" : "Bao ve da duoc tat", "success");
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
      
      // Check if realTimeProtection changed and sync if needed
      if (settings.realTimeProtection !== securitySettings.realTimeProtection) {
        const enabled = settings.realTimeProtection;
        
        // Sync with extension storage
        await writeToStorage(STORAGE_KEYS.EXTENSION_ENABLED, enabled);
        
        // Read-modify-write for full state
        try {
          const currentState = await readFromStorage<any>(STORAGE_KEYS.EXTENSION_STATE) || {};
          const newState = { ...currentState, isEnabled: enabled };
          await writeToStorage(STORAGE_KEYS.EXTENSION_STATE, newState);
          
          chrome.runtime.sendMessage({
            type: "STATE_UPDATED",
            payload: newState,
          });
        } catch (e) {
          console.error("Failed to sync extension state in handleSaveSecuritySettings", e);
        }

        // Update dashboard metrics
        setDashboardMetrics(prev => ({ ...prev, protectionStatus: enabled ? "on" : "off" }));
      }

      logger.info("Saving security settings:", settings);
      setSecuritySettings(settings);
      setDashboardMetrics(prev => ({
        ...prev,
        autoUpdate: settings.autoUpdate,
        speedLimit: settings.speedLimit,
        protectionStatus: settings.realTimeProtection ? "on" : "off",
      }));
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
      const resetSecurity = {
        realTimeProtection: DEFAULTS.PROTECTION_ENABLED,
        autoUpdate: DEFAULTS.AUTO_UPDATE_ENABLED,
        speedLimit: DEFAULTS.SPEED_LIMIT,
        customFilters: [],
        vpnEnabled: false,
      };
      setSecuritySettings(resetSecurity);
      setDashboardMetrics(prev => ({
        ...prev,
        protectionStatus: resetSecurity.realTimeProtection ? "on" : "off",
        autoUpdate: resetSecurity.autoUpdate,
        speedLimit: resetSecurity.speedLimit,
      }));
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
      logger.info("Exporting security settings as:", format);
      
      const exportData = {
        securitySettings,
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
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
      link.download = `xdynamic-security-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Cai dat bao mat da duoc xuat dang ${format.toUpperCase()}`, "success");
    } catch (error) {
      logger.error("Failed to export security settings:", error);
      showToast("Da xay ra loi khi xuat cai dat bao mat. Vui long thu lai.", "error");
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

      // Validate and apply imported settings (security only)
      const importedSecurity =
        importedData && typeof importedData === "object" && importedData.securitySettings
          ? importedData.securitySettings
          : importedData;

      if (!importedSecurity || typeof importedSecurity !== "object") {
        throw new Error("Invalid security settings payload");
      }

      setSecuritySettings(prev => ({ ...prev, ...importedSecurity }));
      
      logger.info("Security settings imported successfully from:", file.name);
      showToast("Da nhap cai dat bao mat thanh cong!", "success");
    } catch (error) {
      logger.error("Failed to import security settings:", error);
      showToast("Da xay ra loi khi nhap cai dat bao mat. Vui long kiem tra file va thu lai.", "error");
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
    void oldPassword;
    void newPassword;
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


  return (
    <div className="min-h-screen bg-background flex">
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
        {/* Top Header with Profile & Search */}
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur border-b border-border">
          {/* Profile Section - Minimalist */}
          <div className="px-4 sm:px-6 py-4">
            <div className="max-w-6xl mx-auto">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden mb-4 p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors"
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
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted border border-border p-0.5 shadow-sm overflow-hidden">
                      {userProfile.avatar ? (
                        <img
                          src={userProfile.avatar}
                          alt={userProfile.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold">
                          {userProfile.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleEditProfile}
                    className="absolute bottom-0 right-0 w-5 h-5 bg-card text-primary border border-border rounded-full shadow-sm flex items-center justify-center hover:bg-primary/10 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Chỉnh sửa avatar"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>

                  {/* User Info */}
                  <div className="text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row items-center space-y-1 sm:space-y-0 sm:space-x-2">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground">{userProfile.fullName}</h2>
                      <button
                        onClick={handleEditProfile}
                        className="p-1 text-muted-foreground hover:text-primary hover:bg-muted rounded transition-colors"
                        aria-label="Chỉnh sửa hồ sơ"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <p className="text-muted-foreground text-sm">{userProfile.email}</p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {userProfile.plan}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  {userProfile.isAdmin && (
                    <button
                      onClick={handleOpenAdminDashboard}
                    className="w-full sm:w-auto px-4 py-2 rounded-full border border-border bg-card text-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-sm"
                    >
                      <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l8 4v4c0 4-4 7-8 8-4-1-8-4-8-8v-4l8-4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.5 12.5l2 2 3-3.5" />
                      </svg>
                      <span>Admin</span>
                    </button>
                  )}
                  <button
                    onClick={handleUpgrade}
                    className="w-full sm:w-auto px-4 py-2 bg-primary border border-primary/50 hover:bg-primary/90 text-primary-foreground rounded-full transition-colors flex items-center justify-center space-x-2 text-sm font-semibold shadow-sm shadow-primary/25"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{language === "vi" ? "Nâng cấp" : "Upgrade"}</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full sm:w-auto px-4 py-2 bg-card border border-border hover:border-destructive/50 text-muted-foreground hover:text-destructive rounded-full transition-colors flex items-center justify-center space-x-2 text-sm font-medium shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{language === "vi" ? "Đăng xuất" : "Logout"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Breadcrumb Bar */}
          <div className="bg-card/80 backdrop-blur border-b border-border/50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">


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
                vpnEnabled={securitySettings.vpnEnabled}
                onUpdateSecurity={(updates) => handleSaveSecuritySettings({ ...securitySettings, ...updates })}
                sessionLogs={sessionLogs}
              />
              )}
              {activeTab === "account" && (
                <AccountTab
                  onNavigateToBilling={handleNavigateToBilling}
                  onChangePassword={handleChangePassword}
                  onSavePrivacy={handleSavePrivacy}
                  onDeleteAccount={handleDeleteAccount}
                  privacySettings={privacySettings}
                  userCredits={userProfile.credits}
                  onRefreshProfile={refreshProfile}
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

    </div>
  );
};

export default React.memo(UserHub);
