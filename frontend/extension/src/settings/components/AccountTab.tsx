import React, { useState, useEffect } from "react";
import { Plan, PrivacySettings, Subscription } from "../../types/common";
import FormInput from "./FormInput";
import RippleButton from "./RippleButton";
import UpgradeScreen from "../../plan/screens/UpgradeScreen";
import { subscriptionService } from "../../services/subscription.service";
import { logger } from "../../utils";
import PaymentConfirmationScreen from "../../payment/screens/PaymentConfirmationScreen";
import { PaymentResult } from "../../services/payment.service";
import { useLanguageContext } from "../../providers/LanguageProvider";
import { Language } from "../../types";

interface AccountTabProps {
  onNavigateToBilling: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => void;
  onSavePrivacy: (settings: PrivacySettings) => void;
  onDeleteAccount: () => void;
  privacySettings: PrivacySettings;
  userCredits?: number;
  onRefreshProfile?: () => void;
}

const AccountTab: React.FC<AccountTabProps> = ({
  onNavigateToBilling,
  onChangePassword,
  onSavePrivacy,
  onDeleteAccount,
  privacySettings,
  userCredits = 0,
  onRefreshProfile,
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  const [showUpgradeScreen, setShowUpgradeScreen] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [upgradeResult, setUpgradeResult] = useState<PaymentResult | null>(null);
  const [showUpgradeResult, setShowUpgradeResult] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [localPrivacySettings, setLocalPrivacySettings] = useState<PrivacySettings>({
    ...privacySettings,
    dataSharing: privacySettings.dataSharing ?? true,
    analytics: privacySettings.analytics ?? true,
    crashReports: false,
    personalizedAds: false,
  });
  const { language } = useLanguageContext();
  const tr = (vi: string, en: string) => (language === "vi" ? vi : en);

  // Update local state when props change
  useEffect(() => {
    setLocalPrivacySettings({
      ...privacySettings,
      dataSharing: privacySettings.dataSharing ?? true,
      analytics: privacySettings.analytics ?? true,
      crashReports: false,
      personalizedAds: false,
    });
  }, [privacySettings]);

  // Fetch subscription on mount
  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    setIsLoadingSubscription(true);
    try {
      const sub = await subscriptionService.getCurrentSubscription();
      setSubscription(sub);
    } catch (error) {
      logger.error("Failed to fetch subscription", error);
    } finally {
      setIsLoadingSubscription(false);
    }
  };

  const handlePlanSelection = async (plan: Plan, promoCode?: string) => {
    setIsProcessingUpgrade(true);
    try {
      logger.info("User selected plan from upgrade screen", { plan: plan.type, promoCode });

      if (plan.type === "free") {
        await subscriptionService.cancelSubscription();
        setUpgradeResult({
          transactionId: `SUB-${Date.now()}`,
          status: "success",
          message: tr("Đã chuyển về gói FREE", "Switched to FREE plan"),
          timestamp: new Date().toISOString(),
          amount: 0,
          currentPlan: "free",
        });
      } else {
        await subscriptionService.purchasePlan(plan.type);
        setUpgradeResult({
          transactionId: `SUB-${Date.now()}`,
          status: "success",
          message: tr(`Nâng cấp gói ${plan.nameVi} thành công!`, `Upgraded plan ${plan.name} successfully!`),
          timestamp: new Date().toISOString(),
          amount: plan.price || 0,
          currentPlan: plan.type,
        });
      }

      await fetchSubscription();
      if (onRefreshProfile) onRefreshProfile();
      setShowUpgradeScreen(false);
      setShowUpgradeResult(true);
    } catch (error: any) {
      logger.error("Failed to update plan", error);
      setUpgradeResult({
        transactionId: `SUB-${Date.now()}`,
        status: "failed",
        message: error?.message || tr("Có lỗi khi cập nhật gói dịch vụ", "Error updating plan"),
        timestamp: new Date().toISOString(),
        amount: plan.price || 0,
        failureReason: "unknown",
        currentPlan: subscription?.plan,
      });
      setShowUpgradeResult(true);
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  const handleCancel = async () => {
    try {
      if (confirm(tr("Bạn có chắc chắn muốn hủy gói đăng ký hiện tại? Bạn sẽ trở về gói FREE.", "Are you sure you want to cancel the current plan? You will return to FREE."))) {
        await subscriptionService.cancelSubscription();
        await fetchSubscription();
        if (onRefreshProfile) onRefreshProfile();
        alert(tr("Hủy gói thành công!", "Plan cancelled successfully!"));
      }
    } catch (error: any) {
      logger.error("Failed to cancel subscription", error);
      alert(error.message || tr("Hủy gói thất bại", "Plan cancellation failed"));
    }
  };

  const [linkedAccounts] = useState([
    { provider: "Google", connected: true, email: "user@gmail.com" },
    { provider: "Facebook", connected: false, email: "" },
    { provider: "Phone", connected: false, email: "" },
  ]);

  const handlePasswordChange = () => {
    if (
      passwordForm.newPassword !== passwordForm.confirmPassword ||
      !passwordForm.oldPassword ||
      !passwordForm.newPassword
    ) {
      alert(tr("Mật khẩu không khớp hoặc thiếu thông tin!", "Passwords do not match or missing fields!"));
      return;
    }

    onChangePassword(passwordForm.oldPassword, passwordForm.newPassword);
    setShowPasswordModal(false);
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
  };

  const handlePrivacySave = () => {
    onSavePrivacy(localPrivacySettings);
  };

  const handleDeleteAccount = () => {
    if (showDeleteConfirm) {
      onDeleteAccount();
      setShowDeleteConfirm(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "Google":
        return (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        );
      case "Facebook":
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case "Apple":
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const surface = "bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800/70 backdrop-blur";
  const unavailableProviders = ["Facebook", "Phone"];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8" role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account">

      {/* Subscription & Billing */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          {tr("Gói đăng ký & Thanh toán", "Subscription & Billing")}
        </h2>
        
        {isLoadingSubscription ? (
          <div className="text-center py-4 text-gray-500">{tr("Đang tải thông tin gói...", "Loading subscription...")}</div>
        ) : subscription ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tr("Gói hiện tại", "Current plan")}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {subscription.plan}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {tr("Hạn mức", "Allowance")}: {subscription.used_quota} / {subscription.monthly_quota} {tr("ảnh/tháng", "images/month")}
                </p>
                {subscription.expires_at && (
                  <p className="text-xs text-gray-400 mt-1">
                    {tr("Hết hạn", "Expires")}: {new Date(subscription.expires_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="text-right">
                {subscription.plan === "free" ? (
                  <button 
                    onClick={() => setShowUpgradeScreen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                    disabled={isProcessingUpgrade}
                  >
                    {tr("Chọn gói nâng cấp", "Upgrade plan")}
                  </button>
                ) : (
                  <div className="space-x-2">
                    <button 
                      onClick={() => setShowUpgradeScreen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
                      disabled={isProcessingUpgrade}
                    >
                      {tr("Đổi gói", "Change plan")}
                    </button>
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      {tr("Hủy gói", "Cancel plan")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{tr("Số dư tài khoản", "Account balance")}</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {new Intl.NumberFormat('vi-VN').format(userCredits)} đ
                    </p>
                  </div>
                </div>
              </div>

              <RippleButton
                variant="primary"
                size="lg"
                onClick={onNavigateToBilling}
                className="w-full md:w-auto !bg-gradient-to-r !from-green-500 !to-blue-600 hover:!from-green-600 hover:!to-blue-700 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="font-semibold">{tr("Nạp thêm tiền vào ví", "Top up wallet")}</span>
              </RippleButton>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-red-500">{tr("Không thể tải thông tin gói", "Unable to load subscription")}</div>
        )}
      </div>

      {/* Password Management */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          {tr("Bảo mật tài khoản", "Account security")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {tr("Cập nhật mật khẩu và cài đặt xác thực hai yếu tố", "Update password and 2FA settings")}
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
        >
          {tr("Thay đổi mật khẩu", "Change password")}
        </button>
      </div>

      {/* Linked Accounts */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          {tr("Liên kết tài khoản", "Linked accounts")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {tr("Kết nối với các dịch vụ khác để đăng nhập dễ dàng", "Connect with other services for easier sign-in")}
        </p>
        <div className="space-y-3">
          {linkedAccounts.map((account) => {
            const isUnavailable = unavailableProviders.includes(account.provider);
            const buttonLabel = isUnavailable
              ? tr("Không khả dụng", "Unavailable")
              : account.connected
              ? tr("Ngắt kết nối", "Disconnect")
              : tr("Kết nối", "Connect");
            const buttonClass = isUnavailable
              ? "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-600 dark:text-gray-300"
              : account.connected
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white";

            return (
              <div
                key={account.provider}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getProviderIcon(account.provider)}
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{account.provider}</p>
                    {isUnavailable ? (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {tr("Hiện không khả dụng", "Currently unavailable")}
                      </p>
                    ) : (
                      account.connected && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{account.email}</p>
                      )
                    )}
                  </div>
                </div>
                <button
                  disabled={isUnavailable}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${buttonClass}`}
                >
                  {buttonLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          {tr("Quyền riêng tư", "Privacy")}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {tr("Kiểm soát cách chúng tôi sử dụng dữ liệu của bạn", "Control how we use your data")}
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{tr("Chia sẻ dữ liệu sử dụng", "Share usage data")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr("Giúp cải thiện sản phẩm bằng dữ liệu ẩn danh", "Help improve the product with anonymous data")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.dataSharing ?? true}
              onChange={(e) =>
                setLocalPrivacySettings({ ...localPrivacySettings, dataSharing: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr("Cho phép theo dõi hành vi sử dụng", "Allow usage analytics")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.analytics ?? true}
              onChange={(e) =>
                setLocalPrivacySettings({ ...localPrivacySettings, analytics: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{tr("Báo cáo lỗi", "Error reporting")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr("Tự động gửi báo cáo lỗi để cải thiện (không khả dụng)", "Automatically send crash reports to improve quality (unavailable)")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={false}
              disabled
              className="w-5 h-5 text-blue-600 rounded bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">{tr("Quảng cáo cá nhân hóa", "Personalized ads")}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tr("Nhận quảng cáo phù hợp với sở thích của bạn (không khả dụng)", "Receive ads tailored to your interests (unavailable)")}
              </p>
            </div>
            <input
              type="checkbox"
              checked={false}
              disabled
              className="w-5 h-5 text-blue-600 rounded bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            />
          </label>
        </div>

        <button
          onClick={handlePrivacySave}
          className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          {tr("Lưu cài đặt quyền riêng tư", "Save privacy settings")}
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900 rounded-xl border-2 border-red-200 dark:border-red-700 p-6">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {tr("Vùng nguy hiểm", "Danger zone")}
        </h2>
        <p className="text-red-700 dark:text-red-300 mb-4">
          {tr("Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.", "This action cannot be undone. All data will be permanently deleted.")}
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            {tr("Xóa tài khoản", "Delete account")}
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-bold text-red-800 dark:text-red-200">
              {tr("Bạn có chắc chắn? Hành động này không thể hoàn tác!", "Are you sure? This cannot be undone!")}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                {tr("Xác nhận xóa", "Confirm delete")}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                {tr("Hủy", "Cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Upgrade Plan Overlay */}
      {showUpgradeScreen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4">
          <div className="relative w-full max-w-6xl">
            <button
              onClick={() => setShowUpgradeScreen(false)}
              className="absolute right-4 top-4 z-10 p-2 rounded-full bg-white/90 text-gray-700 hover:bg-white shadow-lg dark:bg-slate-900 dark:text-white"
              aria-label={tr("Đóng chọn gói", "Close plan selection")}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="overflow-hidden rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 max-h-[90vh]">
              <div className="max-h-[90vh] overflow-y-auto">
                <UpgradeScreen onSelectPlan={handlePlanSelection} onBack={() => setShowUpgradeScreen(false)} />
              </div>
            </div>
            {isProcessingUpgrade && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl w-full h-full flex items-center justify-center">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-white dark:bg-slate-900 rounded-lg shadow-lg text-gray-800 dark:text-white">
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span>{tr("Đang xử lý nâng cấp...", "Processing upgrade...")}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Result Modal */}
      {showUpgradeResult && upgradeResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
            <PaymentConfirmationScreen
              paymentData={upgradeResult}
              onBackToDashboard={() => {
                setShowUpgradeResult(false);
              }}
              onDownloadReceipt={() => setShowUpgradeResult(false)}
              onShareReceipt={() => setShowUpgradeResult(false)}
            />
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${surface} shadow-2xl max-w-md w-full p-6`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {tr("Thay đổi mật khẩu", "Change password")}
            </h3>

            <div className="space-y-4">
              <FormInput
                label={tr("Mật khẩu hiện tại", "Current password")}
                type="password"
                value={passwordForm.oldPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, oldPassword: value })
                }
                placeholder={tr("Nhập mật khẩu hiện tại", "Enter current password")}
                required
              />

              <FormInput
                label={tr("Mật khẩu mới", "New password")}
                type="password"
                value={passwordForm.newPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, newPassword: value })
                }
                placeholder={tr("Nhập mật khẩu mới", "Enter new password")}
                required
                validate={(value) => {
                  if (value.length < 8) return tr("Mật khẩu phải có ít nhất 8 ký tự", "Password must be at least 8 characters");
                  if (!(/(?=.*[a-z])/.test(value))) return tr("Phải có ít nhất 1 chữ thường", "Must include at least one lowercase letter");
                  if (!(/(?=.*[A-Z])/.test(value))) return tr("Phải có ít nhất 1 chữ hoa", "Must include at least one uppercase letter");
                  if (!(/(?=.*\d)/.test(value))) return tr("Phải có ít nhất 1 số", "Must include at least one number");
                  return null;
                }}
                validateOnChange
              />

              <FormInput
                label={tr("Xác nhận mật khẩu mới", "Confirm new password")}
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: value })
                }
                placeholder={tr("Nhập lại mật khẩu mới", "Re-enter new password")}
                required
                validate={(value) => 
                  value !== passwordForm.newPassword ? tr("Mật khẩu xác nhận không khớp", "Confirmation password does not match") : null
                }
                validateOnChange
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {tr("Lưu", "Save")}
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                {tr("Hủy", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AccountTab;
