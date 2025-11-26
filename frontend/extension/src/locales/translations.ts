import { Translations } from "../types/i18n";

export const translations: Translations = {
  // Common
  "common.save": { en: "Save", vi: "Lưu" },
  "common.cancel": { en: "Cancel", vi: "Hủy" },
  "common.close": { en: "Close", vi: "Đóng" },
  "common.ok": { en: "OK", vi: "Đồng ý" },
  "common.yes": { en: "Yes", vi: "Có" },
  "common.no": { en: "No", vi: "Không" },
  "common.loading": { en: "Loading...", vi: "Đang tải..." },
  "common.error": { en: "Error", vi: "Lỗi" },
  "common.success": { en: "Success", vi: "Thành công" },
  "common.warning": { en: "Warning", vi: "Cảnh báo" },
  "common.on": { en: "On", vi: "Bật" },
  "common.off": { en: "Off", vi: "Tắt" },
  "common.active": { en: "Active", vi: "Bật" },
  "common.inactive": { en: "Inactive", vi: "Tắt" },
  "common.profile": { en: "Profile", vi: "Hồ sơ" },
  "common.login": { en: "Login", vi: "Đăng nhập" },
  "common.requireLogin": { en: "Login Required", vi: "Cần đăng nhập" },
  "common.premium": { en: "Premium", vi: "Tính năng cao cấp" },

  // Auth
  "auth.login": { en: "Login", vi: "Đăng nhập" },
  "auth.logout": { en: "Logout", vi: "Đăng xuất" },
  "auth.signIn": { en: "Sign In", vi: "Đăng nhập" },
  "auth.signOut": { en: "Sign Out", vi: "Đăng xuất" },
  "auth.register": { en: "Sign Up", vi: "Đăng ký" },
  "auth.name": { en: "Name", vi: "Tên" },
  "auth.namePlaceholder": { en: "Enter your name", vi: "Nhập tên của bạn" },
  "auth.username": { en: "Username", vi: "Tên đăng nhập" },
  "auth.email": { en: "Email", vi: "Email" },
  "auth.emailPlaceholder": { en: "Enter your email", vi: "Nhập email của bạn" },
  "auth.password": { en: "Password", vi: "Mật khẩu" },
  "auth.passwordPlaceholder": { en: "Enter your password", vi: "Nhập mật khẩu của bạn" },
  "auth.confirmPassword": { en: "Confirm Password", vi: "Xác nhận mật khẩu" },
  "auth.showPassword": { en: "Show", vi: "Hiện" },
  "auth.hidePassword": { en: "Hide", vi: "Ẩn" },
  "auth.rememberMe": { en: "Remember me", vi: "Ghi nhớ đăng nhập" },
  "auth.forgotPassword": { en: "Forgot Password?", vi: "Quên mật khẩu?" },
  "auth.forgotPasswordTitle": { en: "Forgot Password", vi: "Quên mật khẩu" },
  "auth.forgotPasswordDescription": {
    en: "Enter your email to receive reset instructions",
    vi: "Nhập email để nhận hướng dẫn đặt lại mật khẩu",
  },
  "auth.forgotPasswordHelp": {
    en: "You'll receive an email within 5-10 minutes. Check spam if you can't find it.",
    vi: "Bạn sẽ nhận được email trong 5-10 phút. Kiểm tra thư rác nếu không thấy.",
  },
  "auth.sendReset": { en: "Send instructions", vi: "Gửi hướng dẫn" },
  "auth.sendingReset": { en: "Sending...", vi: "Đang gửi..." },
  "auth.resetEmailPlaceholder": {
    en: "your.email@example.com",
    vi: "email.cua.ban@vi.com",
  },
  "auth.signInPrompt": {
    en: "Please sign in to use the extension",
    vi: "Vui lòng đăng nhập để sử dụng tiện ích",
  },
  "auth.withFacebook": {
    en: "Continue with Facebook",
    vi: "Tiếp tục với Facebook",
  },
  "auth.withPhone": {
    en: "Continue with phone",
    vi: "Tiếp tục với số điện thoại",
  },
  "auth.noAccount": {
    en: "Don't have an account?",
    vi: "Bạn chưa có tài khoản?",
  },
  "auth.haveAccount": {
    en: "Already have an account?",
    vi: "Đã có tài khoản?",
  },
  "auth.createAccount": {
    en: "Create account",
    vi: "Tạo tài khoản",
  },
  "auth.backToLogin": { en: "Back to login", vi: "Quay lại đăng nhập" },

  // Settings
  "settings.title": { en: "Settings", vi: "Cài đặt" },
  "settings.theme": { en: "Theme", vi: "Giao diện" },
  "settings.language": { en: "Language", vi: "Ngôn ngữ" },
  "settings.notifications": { en: "Notifications", vi: "Thông báo" },
  "settings.privacy": { en: "Privacy", vi: "Quyền riêng tư" },
  "settings.about": { en: "About", vi: "Giới thiệu" },
  "settings.lightMode": { en: "Light Mode", vi: "Chế độ sáng" },
  "settings.darkMode": { en: "Dark Mode", vi: "Chế độ tối" },

  // Content filtering
  "filter.sensitive": { en: "Sensitive", vi: "Nhạy cảm" },
  "filter.violence": { en: "Violence", vi: "Bạo lực" },
  "filter.toxicity": { en: "Toxicity", vi: "Tiêu cực" },
  "filter.vice": { en: "Vice", vi: "Chất kích thích" },
  "filter.enabled": { en: "Enabled", vi: "Bật" },
  "filter.disabled": { en: "Disabled", vi: "Tắt" },
  "filter.blocked": {
    en: "Blocked {count} harmful media",
    vi: "Đã chặn {count} phương tiện độc hại",
  },
  "filter.report": { en: "Report", vi: "Báo cáo" },

  // Report
  "report.title": { en: "Report", vi: "Báo cáo" },
  "report.button": { en: "Report", vi: "Báo cáo" },

  // Info / Help
  "info.help": { en: "Help & Onboarding", vi: "Trợ giúp & Hướng dẫn" },
  "info.tutorial": { en: "View Tutorial", vi: "Xem hướng dẫn" },
  "info.features": { en: "Learn More", vi: "Tìm hiểu thêm" },

  // Extension
  "extension.title": { en: "XDynamic Extension", vi: "Tiện ích XDynamic" },
  "extension.enabled": { en: "Extension Enabled", vi: "Tiện ích đã bật" },
  "extension.disabled": { en: "Extension Disabled", vi: "Tiện ích đã tắt" },
  "extension.toggle": { en: "Toggle Extension", vi: "Bật/tắt tiện ích" },

  // Statistics
  "stats.blocked": {
    en: "Blocked {count} harmful media",
    vi: "Đã chặn được {count} phương tiện độc hại",
  },
  "stats.blocking": {
    en: "Blocking {count} harmful items",
    vi: "Đang chặn {count} nội dung độc hại",
  },

  // Language
  "language.current": { en: "Current Language", vi: "Ngôn ngữ hiện tại" },
  "language.vietnamese": { en: "Vietnamese", vi: "Tiếng Việt" },
  "language.english": { en: "English", vi: "Tiếng Anh" },
  "language.en": { en: "English", vi: "Tiếng Anh" },
  "language.vi": { en: "Vietnamese", vi: "Tiếng Việt" },

  // Content types
  "content.image": { en: "Image", vi: "Hình ảnh" },
  "content.video": { en: "Video", vi: "Video" },

  // Media types
  "media.images": { en: "Images", vi: "Ảnh" },
  "media.videos": { en: "Videos", vi: "Video" },

  // Plans
  "plan.title": { en: "Plan Management", vi: "Quản lý gói" },
  "plan.current": { en: "Current Plan", vi: "Gói hiện tại" },
  "plan.upgrade": { en: "Upgrade Plan", vi: "Nâng cấp gói" },
  "plan.free": { en: "Free", vi: "Miễn phí" },
  "plan.plus": { en: "Plus", vi: "Plus" },
  "plan.pro": { en: "Pro", vi: "Pro" },
  "plan.month": { en: "month", vi: "tháng" },
  "plan.year": { en: "year", vi: "năm" },
  "plan.features": { en: "Features", vi: "Tính năng" },
  "plan.subscribe": { en: "Subscribe", vi: "Đăng ký" },
  "plan.upgradeSuccess": { en: "Upgrade Successful!", vi: "Nâng cấp thành công!" },
  "plan.promoCode": { en: "Promo Code", vi: "Mã khuyến mại" },
  "plan.applyPromo": { en: "Apply", vi: "Áp dụng" },
  "plan.trialPeriod": { en: "Trial Period", vi: "Dùng thử" },
  "plan.activationDate": { en: "Activation Date", vi: "Ngày kích hoạt" },
  "plan.expirationDate": { en: "Expiration Date", vi: "Ngày hết hạn" },

  // Status
  "status.protected": { en: "Protected", vi: "Được bảo vệ" },
  "status.unknown": { en: "Unknown", vi: "Chưa xác định" },
  "status.blocked": { en: "Blocked", vi: "Đã chặn" },

  // Themes
  "theme.light": { en: "Light", vi: "Sáng" },
  "theme.dark": { en: "Dark", vi: "Tối" },
  "theme.system": { en: "System", vi: "Hệ thống" },

  // Login flow
  "login.title": { en: "Welcome back", vi: "Chào mừng trở lại" },
  "login.subtitle": {
    en: "Sign in to your account",
    vi: "Đăng nhập vào tài khoản của bạn",
  },
  "login.loading": { en: "Signing in...", vi: "Đang đăng nhập..." },
  "login.orContinueWith": {
    en: "or continue with",
    vi: "hoặc tiếp tục với",
  },
  "login.verificationTitle": { en: "Verification", vi: "Xác thực" },
  "login.verificationSubtitle": {
    en: "Enter the code sent to {email}",
    vi: "Vui lòng nhập mã xác thực được gửi đến {email}",
  },
  "login.verificationPlaceholder": {
    en: "Enter verification code",
    vi: "Nhập mã xác thực",
  },
  "login.verificationConfirm": { en: "Confirm", vi: "Xác nhận" },
  "login.verificationBack": { en: "Back to login", vi: "Quay lại đăng nhập" },
  "login.error.invalidCredentials": {
    en: "Login failed. Please check your email and password.",
    vi: "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.",
  },
  "login.error.facebook": {
    en: "Facebook login failed.",
    vi: "Đăng nhập Facebook thất bại.",
  },
  "login.error.phone": {
    en: "Phone login failed.",
    vi: "Đăng nhập bằng số điện thoại thất bại.",
  },
  "login.reset.sent": {
    en: "Password reset instructions sent to {email}.",
    vi: "Đã gửi hướng dẫn đặt lại mật khẩu tới {email}.",
  },
  "login.reset.failed": {
    en: "Could not send reset email. Please try again later.",
    vi: "Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.",
  },
  "login.reset.prompt": {
    en: "Enter your email to receive a reset link",
    vi: "Nhập email của bạn để nhận link đặt lại mật khẩu",
  },
  "login.error.verification": {
    en: "Verification failed. Please try again.",
    vi: "Xác thực thất bại. Vui lòng thử lại.",
  },

  // Errors & validation
  "errors.emailRequired": {
    en: "Please enter your email",
    vi: "Vui lòng nhập email",
  },
  "errors.emailInvalid": {
    en: "Invalid email address",
    vi: "Email không hợp lệ",
  },
  "errors.passwordRequired": {
    en: "Please enter your password",
    vi: "Vui lòng nhập mật khẩu",
  },
  "errors.passwordLength": {
    en: "Password must be at least 6 characters",
    vi: "Mật khẩu phải có ít nhất 6 ký tự",
  },
  "errors.passwordMismatch": {
    en: "Passwords do not match",
    vi: "Mật khẩu không khớp",
  },
  "errors.fullNameRequired": {
    en: "Full name is required",
    vi: "Tên là bắt buộc",
  },
  "errors.resetEmailInvalid": {
    en: "Please enter a valid email to reset your password",
    vi: "Vui lòng nhập email hợp lệ để đặt lại mật khẩu",
  },
  "errors.checkInformation": {
    en: "Please check your information",
    vi: "Vui lòng kiểm tra lại thông tin",
  },

  // Messages
  "messages.registrationSuccess": {
    en: "Registration successful!",
    vi: "Đăng ký thành công!",
  },
  "messages.loginSuccess": {
    en: "Login successful!",
    vi: "Đăng nhập thành công!",
  },
  "messages.resetLinkSent": {
    en: "Password reset link sent to your email",
    vi: "Đường dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
  },
  "messages.genericError": {
    en: "Something went wrong. Please try again.",
    vi: "Có lỗi xảy ra. Vui lòng thử lại.",
  },

  // Languages (alternative labels)
  "lang.english": { en: "English", vi: "Tiếng Anh" },
  "lang.vietnamese": { en: "Vietnamese", vi: "Tiếng Việt" },
};
