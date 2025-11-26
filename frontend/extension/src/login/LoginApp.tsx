import React, { useState } from "react";
import { logger, navigateToPage } from "../utils";
import { useAuth } from "../hooks";
import { useLanguageContext } from "../providers/LanguageProvider";
import LoginScreen from "./components/LoginScreen";
import ForgotPasswordModal from "./components/ForgotPasswordModal";

type LoginStep = "login" | "verification";

interface LoginState {
  currentStep: LoginStep;
  email: string;
  password: string;
  rememberMe: boolean;
  needsVerification: boolean;
}

const LoginApp: React.FC = () => {
  const { signIn } = useAuth();
  const { t } = useLanguageContext();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [loginState, setLoginState] = useState<LoginState>({
    currentStep: "login",
    email: "",
    password: "",
    rememberMe: false,
    needsVerification: false,
  });

  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (email && password.length >= 6) {
        const needs2FA = email.includes("2fa") || password.includes("2fa");

        if (needs2FA) {
          setLoginState({
            ...loginState,
            currentStep: "verification",
            email,
            password,
            rememberMe,
            needsVerification: true,
          });
        } else {
          const userData = {
            id: "user-" + Date.now(),
            email,
            fullName: "Demo User",
            hasCompletedOnboarding: true,
          };

          signIn(userData);

          if (rememberMe) {
            chrome.storage.local.set({ rememberLogin: true });
          }

          navigateToPage("DASHBOARD");
        }
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (error) {
      logger.error("Login failed", error);
      alert(
        t(
          "login.error.invalidCredentials",
          "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: "fb-user-" + Date.now(),
        email: "user@facebook.com",
        fullName: "Facebook User",
        hasCompletedOnboarding: true,
      };

      signIn(userData);
      navigateToPage("DASHBOARD");
    } catch (error) {
      logger.error("Facebook login failed", error);
      alert(t("login.error.facebook", "Đăng nhập Facebook thất bại."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: "phone-user-" + Date.now(),
        email: "user@phone.com",
        fullName: "Phone User",
        hasCompletedOnboarding: true,
      };

      signIn(userData);
      navigateToPage("DASHBOARD");
    } catch (error) {
      logger.error("Phone login failed", error);
      alert(
        t(
          "login.error.phone",
          "Đăng nhập bằng số điện thoại thất bại."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (email: string) => {
    setIsSendingReset(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      logger.info("Password reset email sent to:", email);

      alert(
        t(
          "login.reset.sent",
          `Đã gửi hướng dẫn đặt lại mật khẩu đến ${email}. Vui lòng kiểm tra email của bạn.`
        ).replace("{email}", email)
      );

      setShowForgotPasswordModal(false);
    } catch (error) {
      logger.error("Failed to send password reset email", error);
      alert(
        t(
          "login.reset.failed",
          "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau."
        )
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleCreateAccount = () => {
    navigateToPage("ONBOARDING");
  };

  const handleVerificationComplete = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const userData = {
        id: "verified-user-" + Date.now(),
        email: loginState.email,
        fullName: "Verified User",
        hasCompletedOnboarding: true,
      };

      signIn(userData);

      if (loginState.rememberMe) {
        chrome.storage.local.set({ rememberLogin: true });
      }

      navigateToPage("DASHBOARD");
    } catch (error) {
      logger.error("Verification failed", error);
      alert(
        t(
          "login.error.verification",
          "Xác thực thất bại. Vui lòng thử lại."
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationBack = () => {
    setLoginState({
      ...loginState,
      currentStep: "login",
    });
  };

  if (loginState.currentStep === "verification") {
    const verificationMessage = t(
      "login.verificationSubtitle",
      `Vui lòng nhập mã xác thực được gửi đến ${loginState.email}`
    ).replace("{email}", loginState.email);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {t("login.verificationTitle", "Xác thực")}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {verificationMessage}
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder={t(
                "login.verificationPlaceholder",
                "Nhập mã xác thực"
              )}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={6}
            />

            <button
              onClick={handleVerificationComplete}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {t("login.verificationConfirm", "Xác nhận")}
            </button>

            <button
              onClick={handleVerificationBack}
              className="w-full text-gray-600 hover:text-gray-800 py-2"
            >
              {t("login.verificationBack", "Quay lại đăng nhập")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LoginScreen
        onLogin={handleLogin}
        onFacebookLogin={handleFacebookLogin}
        onGoogleLogin={handleGoogleLogin}
        onForgotPassword={handleForgotPassword}
        onCreateAccount={handleCreateAccount}
        isLoading={isLoading}
      />

      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
        onSubmit={handleForgotPasswordSubmit}
        isLoading={isSendingReset}
      />
    </>
  );
};

export default LoginApp;
