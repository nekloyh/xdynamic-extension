import React, { useState, useEffect } from "react";
import { logger } from "../../utils";
import { Button } from "../../components/ui";
import { UserPlan, Plan, PlanType } from "../../types/common";
import { subscriptionService } from "../../services";

interface PlansOverviewScreenProps {
  onNavigateToUpgrade: () => void;
  onBack: () => void;
}

const PLAN_CATALOG: Record<PlanType, Plan> = {
  free: {
    id: "plan-free",
    type: "free",
    name: "Basic Free",
    nameVi: "Miễn phí",
    price: 0,
    currency: "đ",
    period: "month",
    features: [
      { id: "f1", included: true, text: "Basic content blocking" },
      { id: "f2", included: true, text: "Monthly reports" },
      { id: "f3", included: true, text: "Email support" },
      { id: "f4", included: false, text: "Advanced detection" },
      { id: "f5", included: false, text: "Video streaming protection" },
      { id: "f6", included: false, text: "Priority support 24/7" },
      { id: "f7", included: false, text: "Real-time detailed reports" },
      { id: "f8", included: false, text: "Advanced filter customization" },
    ],
  },
  plus: {
    id: "plan-plus",
    type: "plus",
    name: "Dynamic Plus",
    nameVi: "Plus",
    price: 50000,
    currency: "đ",
    period: "month",
    features: [
      { id: "f1", included: true, text: "Basic content blocking" },
      { id: "f2", included: true, text: "Monthly reports" },
      { id: "f3", included: true, text: "Email support" },
      { id: "f4", included: true, text: "Advanced detection" },
      { id: "f5", included: true, text: "Video streaming protection" },
      { id: "f6", included: false, text: "Priority support 24/7" },
      { id: "f7", included: false, text: "Real-time detailed reports" },
      { id: "f8", included: false, text: "Advanced filter customization" },
    ],
  },
  pro: {
    id: "plan-pro",
    type: "pro",
    name: "Dynamic Pro",
    nameVi: "Pro",
    price: 100000,
    currency: "đ",
    period: "month",
    features: [
      { id: "f1", included: true, text: "Basic content blocking" },
      { id: "f2", included: true, text: "Monthly reports" },
      { id: "f3", included: true, text: "Email support" },
      { id: "f4", included: true, text: "Advanced detection" },
      { id: "f5", included: true, text: "Video streaming protection" },
      { id: "f6", included: true, text: "Priority support 24/7" },
      { id: "f7", included: true, text: "Real-time detailed reports" },
      { id: "f8", included: true, text: "Advanced filter customization" },
    ],
  },
};

const PlansOverviewScreen: React.FC<PlansOverviewScreenProps> = ({
  onNavigateToUpgrade,
  onBack,
}) => {
  const [currentPlan, setCurrentPlan] = useState<UserPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Fetch current plan data
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const subscription = await subscriptionService.getCurrentSubscription();
        // Map subscription to UserPlan format
        const plan: UserPlan = {
          id: subscription.id.toString(),
          userId: subscription.id.toString(),
          plan: {
            id: `plan-${subscription.plan}`,
            type: subscription.plan,
            name: subscription.plan.toUpperCase(),
            nameVi: subscription.plan === 'free' ? 'Miễn phí' : 
                    subscription.plan === 'plus' ? 'Plus' : 'Pro',
            price: subscription.plan === 'free' ? 0 : 
                   subscription.plan === 'plus' ? 99000 : 299000,
            currency: 'đ',
            period: 'month',
            features: [],
          },
          startDate: subscription.created_at,
          endDate: subscription.expires_at || '',
          status: subscription.status === 'active' ? 'active' : 'expired',
          autoRenew: false,
        };
        setCurrentPlan(plan);
      } catch (error) {
        logger.error("Failed to fetch current plan:", error);
        setError("Khong the tai thong tin goi hien tai");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlan();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (amount === 0) return "Miễn phí";
    return new Intl.NumberFormat("vi-VN").format(amount) + currency;
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "plus":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin gói...</p>
        </div>
      </div>
    );
  }

  
  if (!currentPlan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-md w-full p-8 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Chưa có thông tin gói</h2>
          <p className="text-gray-600 text-sm">
            {error || "Bạn chưa chọn gói dịch vụ. Hãy khám phá và nâng cấp để mở khóa thêm tính năng."}
          </p>
          <Button
            onClick={onNavigateToUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
          >
            Chọn gói ngay
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Quản lý gói dịch vụ</h1>
                <p className="text-sm text-gray-600">Xem và nâng cấp gói dịch vụ của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
          {/* Card Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{currentPlan.plan.nameVi}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeColor(currentPlan.plan.type)}`}>
                    {currentPlan.status === "active" ? "Đang hoạt động" : "Không hoạt động"}
                  </span>
                </div>
                <p className="text-blue-100 text-sm">Gói hiện tại của bạn</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(currentPlan.plan.price, currentPlan.plan.currency)}</p>
                <p className="text-blue-100 text-sm">
                  {currentPlan.plan.price === 0 ? "Mãi mãi" : `/ ${currentPlan.plan.period === "month" ? "tháng" : "năm"}`}
                </p>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-8">
            {/* Plan Details */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin gói</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu</p>
                  <p className="font-semibold text-gray-900">{formatDate(currentPlan.startDate)}</p>
                </div>
                {currentPlan.plan.price > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Ngày hết hạn</p>
                    <p className="font-semibold text-gray-900">{formatDate(currentPlan.endDate)}</p>
                  </div>
                )}
                {currentPlan.plan.price > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Tự động gia hạn</p>
                    <p className="font-semibold text-gray-900">{currentPlan.autoRenew ? "Có" : "Không"}</p>
                  </div>
                )}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  <p className={`font-semibold ${currentPlan.status === "active" ? "text-green-600" : "text-red-600"}`}>
                    {currentPlan.status === "active" ? "Hoạt động" : "Không hoạt động"}
                  </p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tính năng gói hiện tại</h3>
              <div className="space-y-3">
                {currentPlan.plan.features.map((feature) => (
                  <div key={feature.id} className="flex items-center space-x-3">
                    {feature.included ? (
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <span className={`text-sm ${feature.included ? "text-gray-900" : "text-gray-400"}`}>
                      {feature.text ?? feature.vi ?? feature.en ?? ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={onNavigateToUpgrade}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 text-lg font-semibold"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Nâng cấp gói dịch vụ
              </Button>
              
              {currentPlan.plan.price > 0 && (
                <Button
                  variant="outline"
                  className="flex-1 py-3"
                  onClick={() => logger.info("Edit plan settings")}
                >
                  Chỉnh sửa cài đặt
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Upgrade Benefits Section */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nâng cấp để mở khóa thêm tính năng
              </h3>
              <p className="text-gray-700 mb-4">
                Trải nghiệm bảo vệ toàn diện với các gói Plus và Pro. 
                Bảo vệ nâng cao, phát hiện video streaming, và hỗ trợ ưu tiên 24/7.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Phát hiện và chặn nội dung nâng cao với AI
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Bảo vệ video streaming trên các nền tảng phổ biến
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hỗ trợ khách hàng ưu tiên 24/7
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlansOverviewScreen;
