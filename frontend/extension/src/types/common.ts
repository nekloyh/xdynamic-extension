// Theme types
export type Theme = "light" | "dark" | "system";

// Language types
export type Language = "en" | "vi";

// Extension state types
export interface ExtensionState {
  isEnabled: boolean;
  filterLevel: FilterLevel;
  theme: Theme;
  language: Language;
  notifications: boolean;
  autoBlock: boolean;
}

// Filter level types
export type FilterLevel = "strict" | "moderate" | "permissive";

// Content detection types
export interface ContentDetection {
  id: string;
  url: string;
  timestamp: number;
  confidence: number;
  category: ContentCategory;
  action: ContentAction;
}

export type ContentCategory = "nsfw" | "violence" | "hate" | "spam" | "safe";
export type ContentAction = "blocked" | "warned" | "allowed";

// Plan types
export type PlanType = "free" | "plus" | "pro";

export interface PlanFeature {
  id: string;
  text?: string;
  included: boolean;
  vi?: string;
  en?: string;
}

export interface Plan {
  id: string;
  type: PlanType;
  name: string;
  nameVi: string;
  price: number;
  currency: string;
  period: "month" | "year";
  features: PlanFeature[];
  isPopular?: boolean;
  trialDays?: number;
}

export interface Subscription {
  id: number;
  plan: "free" | "plus" | "pro";
  status: string;
  monthly_quota: number;
  used_quota: number;
  expires_at: string | null;
  created_at: string;
}

export interface UserPlan {
  id: string;
  userId: string;
  plan: Plan;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "cancelled";
  autoRenew: boolean;
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface GlassComponentProps extends BaseComponentProps {
  variant?: "light" | "medium" | "heavy";
  hover?: boolean;
}

// Navigation types
export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  children: React.ReactNode;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Settings types
export type SettingsTab = "overview" | "advanced" | "account";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  plan: string;
  planType: PlanType;
  credits?: number;
  isAdmin?: boolean;
}

export interface DashboardMetrics {
  usagePercentage: number;
  usedGB: number;
  totalGB: number;
  usageUnit?: string;
  blockedToday: number;
  protectionStatus: "on" | "off";
  autoUpdate: boolean;
  speedLimit: number;
}

export interface SecuritySettings {
  realTimeProtection: boolean;
  autoUpdate: boolean;
  speedLimit: number;
  customFilters: string[];
  vpnEnabled?: boolean;
}

export interface PrivacySettings {
  dataSharing: boolean;
  analytics: boolean;
  crashReports: boolean;
  personalizedAds: boolean;
}

export interface AccountSettings {
  email: string;
  password: string;
  twoFactorEnabled: boolean;
  linkedAccounts: {
    google?: boolean;
    facebook?: boolean;
    apple?: boolean;
  };
}

export interface SettingsState {
  security: SecuritySettings;
  privacy: PrivacySettings;
  account: AccountSettings;
}

export type LogLevel = "debug" | "info" | "warning" | "error";

export interface ActivityLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: string;
}

export interface UserStatistics {
  totalBlocked: number;
  todayBlocked: number;
  weeklyBlocked: number;
  monthlyBlocked: number;
  // Optional usage/quota fields (if backend provides)
  usageUnit?: string;
  usagePercentage?: number;
  usedQuotaGB?: number;
  totalQuotaGB?: number;
  used_quota?: number;
  total_quota?: number;
  usage?: {
    used?: number;
    total?: number;
    percent?: number;
  };
  uptimePercent?: number;
  totalScans?: number;
  lastUpdatedAt?: string;
  byCategory: {
    sensitive: number;
    violence: number;
    toxicity: number;
    vice: number;
  };
}
