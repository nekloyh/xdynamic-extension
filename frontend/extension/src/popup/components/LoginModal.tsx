import React, { useState } from "react";
import { FormInput, Button, Modal } from "../../components/ui";
import { logger, STORAGE_KEYS, isValidEmail } from "../../utils";
import { useToast } from "../../providers";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../hooks";
import { useLanguageContext } from "../../providers/LanguageProvider";

interface LoginModalProps {
  onClose: () => void;
  onLoginSuccess: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguageContext();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const validateEmail = (email: string) => {
    const trimmed = email.trim();
    if (!trimmed) {
      return t("errors.emailRequired", "Email là bắt buộc");
    }
    if (!isValidEmail(trimmed)) {
      return t("errors.emailInvalid", "Email không hợp lệ");
    }
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return t("errors.passwordRequired", "Mật khẩu là bắt buộc");
    }
    return "";
  };

  const handleEmailBlur = () => {
    const error = validateEmail(formData.email);
    setErrors((prev) => ({ ...prev, email: error }));
  };

  const handlePasswordBlur = () => {
    const error = validatePassword(formData.password);
    setErrors((prev) => ({ ...prev, password: error }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      showToast("error", t("errors.checkInformation", "Vui lòng kiểm tra lại thông tin"));
      return;
    }

    setIsLoading(true);
    try {
      const trimmedEmail = formData.email.trim();
      const response = await authService.login({
        email: trimmedEmail,
        password: formData.password,
      });

      const username = response.user.email.split("@")[0];
      const capitalizedUsername =
        username.charAt(0).toUpperCase() + username.slice(1);

      const userData = {
        id: response.user.id,
        email: response.user.email,
        fullName: capitalizedUsername,
      };

      signIn(userData);

      chrome.storage.local.set(
        {
          [STORAGE_KEYS.HAS_COMPLETED_ONBOARDING]: true,
          [STORAGE_KEYS.USER]: userData,
        },
        () => {
          chrome.storage.local.remove([STORAGE_KEYS.GUEST_MODE], () => {
            showToast("success", t("messages.loginSuccess", "Đăng nhập thành công!"));
            onLoginSuccess();
          });
        }
      );
    } catch (error) {
      logger.error("Login error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("login.error.invalidCredentials", "Đăng nhập thất bại. Vui lòng thử lại");
      showToast("error", errorMessage);
      setErrors({ password: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmed = resetEmail.trim();
    if (!trimmed || !isValidEmail(trimmed)) {
      showToast("error", t("errors.resetEmailInvalid", "Vui lòng nhập email hợp lệ"));
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.info("Password reset requested for:", trimmed);
      showToast(
        "success",
        t("messages.resetLinkSent", "Link đặt lại mật khẩu đã được gửi đến email của bạn")
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      logger.error("Password reset error:", error);
      showToast("error", t("messages.genericError", "Có lỗi xảy ra. Vui lòng thử lại"));
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <Modal
        isOpen={true}
        onClose={() => setShowForgotPassword(false)}
        title={t("auth.forgotPasswordTitle", "Quên mật khẩu")}
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          {t(
            "login.reset.prompt",
            "Nhập email của bạn để nhận link đặt lại mật khẩu"
          )}
        </p>

        <FormInput
          type="email"
          placeholder={t("auth.emailPlaceholder", "Email")}
          value={resetEmail}
          onChange={(e) => setResetEmail(e.target.value)}
        />

        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowForgotPassword(false)}
            className="flex-1"
          >
            {t("common.cancel", "Hủy")}
          </Button>
          <Button
            onClick={handleForgotPassword}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? t("auth.sendingReset", "Đang gửi...") : t("common.ok", "Gửi")}
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={true} onClose={onClose} title={t("auth.login", "Đăng nhập")} size="sm">
      <div className="space-y-4">
        <FormInput
          type="email"
          placeholder={t("auth.emailPlaceholder", "Email")}
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) {
              setErrors((prev) => ({ ...prev, email: "" }));
            }
          }}
          onBlur={handleEmailBlur}
          error={errors.email}
        />

        <FormInput
          type="password"
          placeholder={t("auth.passwordPlaceholder", "Mật khẩu")}
          value={formData.password}
          onChange={(e) => {
            setFormData({ ...formData, password: e.target.value });
            if (errors.password) {
              setErrors((prev) => ({ ...prev, password: "" }));
            }
          }}
          onBlur={handlePasswordBlur}
          error={errors.password}
        />

        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-sm text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          {t("auth.forgotPassword", "Quên mật khẩu?")}
        </button>
      </div>

      <Button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full mt-6 bg-blue-500 hover:bg-blue-600"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>{t("login.loading", "Đang đăng nhập...")}</span>
          </div>
        ) : (
          t("auth.login", "Đăng nhập")
        )}
      </Button>

      <p className="text-center text-sm text-gray-600 mt-4">
        {t("auth.noAccount", "Chưa có tài khoản?")}{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-blue-600 hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
        >
          {t("auth.register", "Đăng ký ngay")}
        </button>
      </p>
    </Modal>
  );
};

export default LoginModal;
