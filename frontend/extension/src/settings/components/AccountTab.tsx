import React, { useState } from "react";
import { AccountSettings, PrivacySettings } from "../../types/common";
import FormInput from "./FormInput";
import RippleButton from "./RippleButton";

interface AccountTabProps {
  onNavigateToBilling: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => void;
  onSavePrivacy: (settings: PrivacySettings) => void;
  onDeleteAccount: () => void;
  privacySettings: PrivacySettings;
}

const AccountTab: React.FC<AccountTabProps> = ({
  onNavigateToBilling,
  onChangePassword,
  onSavePrivacy,
  onDeleteAccount,
  privacySettings,
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [localPrivacySettings, setLocalPrivacySettings] = useState<PrivacySettings>(privacySettings);

  // Update local state when props change
  React.useEffect(() => {
    setLocalPrivacySettings(privacySettings);
  }, [privacySettings]);

  const [linkedAccounts] = useState([
    { provider: "Google", connected: true, email: "user@gmail.com" },
    { provider: "Facebook", connected: false, email: "" },
    { provider: "Apple", connected: false, email: "" },
  ]);

  const handlePasswordChange = () => {
    if (
      passwordForm.newPassword !== passwordForm.confirmPassword ||
      !passwordForm.oldPassword ||
      !passwordForm.newPassword
    ) {
      alert("Mật khẩu không khớp hoặc thiếu thông tin!");
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

  return (
    <div className="max-w-6xl mx-auto px-6 py-8" role="tabpanel" id="tabpanel-account" aria-labelledby="tab-account">

      {/* Billing Management */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Thanh toán & Đăng ký
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Quản lý phương thức thanh toán và thông tin hóa đơn
        </p>
        <RippleButton
          variant="primary"
          size="lg"
          onClick={onNavigateToBilling}
          className="w-full md:w-auto !bg-gradient-to-r !from-green-500 !to-blue-600 hover:!from-green-600 hover:!to-blue-700 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          <span className="font-semibold">Xem chi tiết thanh toán</span>
        </RippleButton>
      </div>

      {/* Password Management */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Bảo mật tài khoản
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Cập nhật mật khẩu và cài đặt xác thực hai yếu tố
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full md:w-auto px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition-colors"
        >
          Thay đổi mật khẩu
        </button>
      </div>

      {/* Linked Accounts */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          Liên kết tài khoản
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Kết nối với các dịch vụ khác để đăng nhập dễ dàng
        </p>
        <div className="space-y-3">
          {linkedAccounts.map((account) => (
            <div
              key={account.provider}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getProviderIcon(account.provider)}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{account.provider}</p>
                  {account.connected && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{account.email}</p>
                  )}
                </div>
              </div>
              <button
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  account.connected
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {account.connected ? "Ngắt kết nối" : "Kết nối"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className={`${surface} p-6 mb-6`}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Quyền riêng tư
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Kiểm soát cách chúng tôi sử dụng dữ liệu của bạn
        </p>

        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Chia sẻ dữ liệu sử dụng</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Giúp cải thiện sản phẩm bằng dữ liệu ẩn danh
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.dataSharing}
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
                Cho phép theo dõi hành vi sử dụng
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.analytics}
              onChange={(e) =>
                setLocalPrivacySettings({ ...localPrivacySettings, analytics: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Báo cáo lỗi</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Tự động gửi báo cáo lỗi để cải thiện
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.crashReports}
              onChange={(e) =>
                setLocalPrivacySettings({ ...localPrivacySettings, crashReports: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Quảng cáo cá nhân hóa</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Nhận quảng cáo phù hợp với sở thích của bạn
              </p>
            </div>
            <input
              type="checkbox"
              checked={localPrivacySettings.personalizedAds}
              onChange={(e) =>
                setLocalPrivacySettings({ ...localPrivacySettings, personalizedAds: e.target.checked })
              }
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>

        <button
          onClick={handlePrivacySave}
          className="w-full mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
        >
          Lưu cài đặt quyền riêng tư
        </button>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900 rounded-xl border-2 border-red-200 dark:border-red-700 p-6">
        <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Vùng nguy hiểm
        </h2>
        <p className="text-red-700 dark:text-red-300 mb-4">
          Hành động này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa vĩnh viễn.
        </p>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
          >
            Xóa tài khoản
          </button>
        ) : (
          <div className="space-y-3">
            <p className="font-bold text-red-800 dark:text-red-200">
              Bạn có chắc chắn? Hành động này không thể hoàn tác!
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Xác nhận xóa
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${surface} shadow-2xl max-w-md w-full p-6`}>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Thay đổi mật khẩu
            </h3>

            <div className="space-y-4">
              <FormInput
                label="Mật khẩu hiện tại"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, oldPassword: value })
                }
                placeholder="Nhập mật khẩu hiện tại"
                required
              />

              <FormInput
                label="Mật khẩu mới"
                type="password"
                value={passwordForm.newPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, newPassword: value })
                }
                placeholder="Nhập mật khẩu mới"
                required
                validate={(value) => {
                  if (value.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
                  if (!/(?=.*[a-z])/.test(value)) return "Phải có ít nhất 1 chữ thường";
                  if (!/(?=.*[A-Z])/.test(value)) return "Phải có ít nhất 1 chữ hoa";
                  if (!/(?=.*\d)/.test(value)) return "Phải có ít nhất 1 số";
                  return null;
                }}
                validateOnChange
              />

              <FormInput
                label="Xác nhận mật khẩu mới"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(value) =>
                  setPasswordForm({ ...passwordForm, confirmPassword: value })
                }
                placeholder="Nhập lại mật khẩu mới"
                required
                validate={(value) => 
                  value !== passwordForm.newPassword ? "Mật khẩu xác nhận không khớp" : null
                }
                validateOnChange
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handlePasswordChange}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                Lưu
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white rounded-lg font-semibold transition-colors"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountTab;
