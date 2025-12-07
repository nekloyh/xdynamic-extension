import React, { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Loader2, Eye, EyeOff, Mail } from "lucide-react";
import { useLanguageContext } from "../../providers/LanguageProvider";
import { isValidEmail } from "../../utils";

interface LoginScreenProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onGoogleLogin: () => void;
  onForgotPassword: () => void;
  onCreateAccount: () => void;
  isLoading?: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoogleLogin,
  onForgotPassword,
  onCreateAccount,
  isLoading = false,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const { t } = useLanguageContext();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = t("errors.emailRequired", "Vui lòng nhập email");
    } else if (!isValidEmail(trimmedEmail)) {
      newErrors.email = t("errors.emailInvalid", "Email không hợp lệ");
    }

    if (!password.trim()) {
      newErrors.password = t("errors.passwordRequired", "Vui lòng nhập mật khẩu");
    } else if (password.length < 6) {
      newErrors.password = t(
        "errors.passwordLength",
        "Mật khẩu phải có ít nhất 6 ký tự"
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onLogin(email.trim(), password, rememberMe);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="max-w-md w-full shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            {t("login.title", "Chào mừng trở lại")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("login.subtitle", "Đăng nhập vào tài khoản của bạn")}
          </p>
        </CardHeader>
        <CardContent>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("auth.email", "Email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.emailPlaceholder", "Nhập email của bạn")}
              required
            />
            {errors.email && (
              <p className="text-sm font-medium text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{t("auth.password", "Mật khẩu")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder", "Nhập mật khẩu của bạn")}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm font-medium text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(!!checked)}
              />
              <Label htmlFor="remember-me" className="text-sm">
                {t("auth.rememberMe", "Ghi nhớ đăng nhập")}
              </Label>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={onForgotPassword}
              className="px-0 text-sm h-auto"
            >
              {t("auth.forgotPassword", "Quên mật khẩu?")}
            </Button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("login.loading", "Đang đăng nhập...")}
              </>
            ) : (
              t("auth.login", "Đăng nhập")
            )}
          </Button>

          <div className="space-y-3">
            <Separator className="my-4">
              <span className="px-2 text-sm text-muted-foreground">
                {t("login.orContinueWith", "hoặc tiếp tục với")}
              </span>
            </Separator>

            <Button
              type="button"
              variant="outline"
              onClick={onGoogleLogin}
              className="w-full"
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("auth.withGmail", "Tiếp tục với Gmail")}
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {t("auth.noAccount", "Bạn chưa có tài khoản?")}{" "}
            <Button
              type="button"
              variant="link"
              onClick={onCreateAccount}
              className="px-0 h-auto"
            >
              {t("auth.register", "Đăng ký")}
            </Button>
          </div>
        </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginScreen;
