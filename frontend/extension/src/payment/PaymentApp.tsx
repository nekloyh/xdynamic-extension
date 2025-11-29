import React, { useState } from "react";
import { logger, redirectToPage } from "../utils";
import BillOverviewScreen from "./screens/BillOverviewScreen";
import PaymentScreen from "./screens/PaymentScreen";
import PaymentConfirmationScreen from "./screens/PaymentConfirmationScreen";

import { paymentService, Bill, PaymentData } from "../services/payment.service";

type PaymentStep = "overview" | "payment" | "confirmation";

const PaymentApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PaymentStep>("overview");
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentResult, setPaymentResult] = useState<PaymentData | null>(null);

  // Check URL parameters for direct navigation
  React.useEffect(() => {
    const init = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const mode = urlParams.get("mode");
      
      if (mode === "upgrade") {
        try {
          // Fetch unpaid bills or create a specific upgrade bill context
          // For now, we'll try to fetch bills and find an unpaid one
          const bills = await paymentService.getBills();
          const unpaidBill = bills.find(b => b.status === 'unpaid');
          
          if (unpaidBill) {
            setSelectedBill(unpaidBill);
            setCurrentStep("payment");
          }
        } catch (error) {
          logger.error("Failed to initialize payment flow:", error);
        }
      }
    };
    
    init();
  }, []);

  const handleSelectBill = (bill: Bill) => {
    setSelectedBill(bill);
    setCurrentStep("payment");
  };

  const handlePaymentSuccess = (paymentData: PaymentData) => {
    setPaymentResult(paymentData);
    setCurrentStep("confirmation");
    
    // Update bill status locally if needed, but the confirmation screen usually handles display
    if (selectedBill) {
      // In a real app, we might re-fetch bills or update the local state to reflect the change
      // selectedBill.status = "paid"; 
    }
  };

  const handleBackToOverview = () => {
    setCurrentStep("overview");
    setSelectedBill(null);
  };

  const handleBackToDashboard = () => {
    // Redirect to dashboard
    redirectToPage('DASHBOARD');
  };

  const handleDownloadReceipt = () => {
    if (!paymentResult) return;

    // Generate PDF receipt content
    const receiptContent = `
      XDynamic - Hóa đơn thanh toán
      
      Mã giao dịch: ${paymentResult.transactionId}
      Ngày thanh toán: ${new Date(paymentResult.timestamp).toLocaleDateString("vi-VN")}
      
      Chi tiết:
      - Hóa đơn: ${paymentResult.bill.description}
      - Gói dịch vụ: ${paymentResult.bill.plan}
      - Phương thức: ${paymentResult.method}
      - Số tiền: ${new Intl.NumberFormat("vi-VN").format(paymentResult.amount)}${paymentResult.currency}
      
      Cảm ơn bạn đã sử dụng dịch vụ XDynamic!
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${paymentResult.transactionId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareReceipt = () => {
    if (!paymentResult) return;

    const shareText = `🎉 Đã thanh toán thành công hóa đơn XDynamic!
    
📄 ${paymentResult.bill.description}
💰 ${new Intl.NumberFormat("vi-VN").format(paymentResult.amount)}${paymentResult.currency}
🆔 Mã GD: ${paymentResult.transactionId}

#XDynamic #ThanhToanThanhCong`;

    if (navigator.share) {
      navigator.share({
        title: "Hóa đơn XDynamic",
        text: shareText,
      }).catch((error) => logger.error("Failed to share receipt", error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Đã sao chép thông tin hóa đơn vào clipboard!");
      }).catch(() => {
        alert("Không thể chia sẻ. Vui lòng thử lại.");
      });
    }
  };

  switch (currentStep) {
    case "overview":
      return (
        <BillOverviewScreen
          onSelectBill={handleSelectBill}
          onBack={handleBackToDashboard}
        />
      );

    case "payment":
      if (!selectedBill) {
        setCurrentStep("overview");
        return null;
      }
      return (
        <PaymentScreen
          bill={selectedBill}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={handleBackToOverview}
        />
      );

    case "confirmation":
      if (!paymentResult) {
        setCurrentStep("overview");
        return null;
      }
      return (
        <PaymentConfirmationScreen
          paymentData={paymentResult}
          onBackToDashboard={handleBackToDashboard}
          onDownloadReceipt={handleDownloadReceipt}
          onShareReceipt={handleShareReceipt}
        />
      );

    default:
      return null;
  }
};

export default PaymentApp;