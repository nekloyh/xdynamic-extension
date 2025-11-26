import React, { useState } from "react";
import { logger } from "../../utils";
import type { User } from "../../types/auth";
import { Button, FormInput } from "../../components/ui";
import { isValidEmail } from "../../utils";

interface AccountSetupScreenProps {
  onNext: (userData: Partial<User>) => void;
  onBack: () => void;
}

const AccountSetupScreen: React.FC<AccountSetupScreenProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    phone: "",
    gender: "" as "male" | "female" | "other" | "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const trimmedEmail = formData.email.trim();

    if (!trimmedEmail) {
      newErrors.email = "Email là bắt buộc";
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.fullName) {
      newErrors.fullName = "Tên người dùng là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      try {
        const userData: Partial<User> = {
          email: formData.email.trim(),
          fullName: formData.fullName,
          phone: formData.phone,
          gender: formData.gender || undefined,
        };
        await onNext(userData);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSocialLogin = (provider: string) => {
    logger.info(`Social login initiated with ${provider}`);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
        >
          ←
        </button>
        <span className="text-sm text-gray-500 font-medium">1/4</span>
      </div>

      <div className="flex-1 flex flex-col px-6 py-8 max-w-md mx-auto w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-3">
          Đăng ký tài khoản
        </h1>
        <p className="text-gray-600 text-center text-base mb-8">
          Tạo tài khoản mới cho bạn
        </p>

        <div className="space-y-6 flex-1">
          <FormInput
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <FormInput type="password" placeholder="Mật khẩu" />

          <FormInput type="password" placeholder="Xác nhận mật khẩu" />

          <FormInput
            type="text"
            placeholder="Tên người dùng"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
          />
        </div>

        <div className="space-y-4 mt-8">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Đang xử lý...</span>
              </div>
            ) : (
              "Đăng ký"
            )}
          </Button>

          <Button
            onClick={() => handleSocialLogin("facebook")}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            Đăng ký với Facebook
          </Button>

          <Button
            onClick={() => handleSocialLogin("phone")}
            variant="outline"
            className="w-full h-12 text-base"
            size="lg"
          >
            Đăng ký với số điện thoại
          </Button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Đã có tài khoản?{" "}
            <span className="text-green-500 cursor-pointer hover:underline font-medium">
              Đăng nhập
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountSetupScreen;
