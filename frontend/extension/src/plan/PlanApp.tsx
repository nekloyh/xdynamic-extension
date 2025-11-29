import React, { useState } from "react";
import PlansOverviewScreen from "./screens/PlansOverviewScreen";
import UpgradeScreen from "./screens/UpgradeScreen";
import PlanConfirmationScreen from "./screens/PlanConfirmationScreen";
import { Plan } from "../types/common";
import { redirectToPage, navigateToPage, logger } from "../utils";
import { planService } from "../services/plan.service";

type PlanStep = "overview" | "upgrade" | "confirmation";

interface PlanUpgradeData {
  plan: Plan;
  promoCode?: string;
  discount?: number;
}

const PlanApp: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<PlanStep>("overview");
  const [upgradeData, setUpgradeData] = useState<PlanUpgradeData | null>(null);

  // Check URL parameters for direct navigation
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const step = urlParams.get("step");
    
    if (step === "upgrade") {
      setCurrentStep("upgrade");
    } else if (step === "overview") {
      setCurrentStep("overview");
    }
  }, []);

  const handleNavigateToUpgrade = () => {
    setCurrentStep("upgrade");
  };

  const handleSelectPlan = async (plan: Plan, promoCode?: string) => {
    // Calculate discount based on promo code
    let discount = 0;
    if (promoCode) {
      // In a real app, validate promo code with backend
      if (promoCode.toUpperCase() === "SAVE20") {
        discount = 20;
      } else if (promoCode.toUpperCase() === "FIRST50") {
        discount = 50;
      }
    }

    setUpgradeData({
      plan,
      promoCode,
      discount,
    });

    // Navigate to confirmation
    setCurrentStep("confirmation");
  };

  const handleBackToDashboard = () => {
    // Navigate back to dashboard
    if (chrome?.tabs) {
      navigateToPage('DASHBOARD');
    } else {
      redirectToPage('DASHBOARD');
    }
  };

  const handleViewPlanDetails = () => {
    setCurrentStep("overview");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "upgrade":
        setCurrentStep("overview");
        break;
      case "confirmation":
        setCurrentStep("upgrade");
        break;
      default:
        handleBackToDashboard();
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case "overview":
        return (
          <PlansOverviewScreen
            onNavigateToUpgrade={handleNavigateToUpgrade}
            onBack={handleBackToDashboard}
          />
        );
      case "upgrade":
        return (
          <UpgradeScreen
            onSelectPlan={handleSelectPlan}
            onBack={handleBack}
          />
        );
      case "confirmation":
        return upgradeData ? (
          <PlanConfirmationScreen
            plan={upgradeData.plan}
            promoCode={upgradeData.promoCode}
            discount={upgradeData.discount}
            onBackToDashboard={handleBackToDashboard}
            onViewPlanDetails={handleViewPlanDetails}
          />
        ) : null;
      default:
        return null;
    }
  };

  return <>{renderStep()}</>;
};

export default PlanApp;
