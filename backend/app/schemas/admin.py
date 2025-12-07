from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from enum import Enum

class OverviewStats(BaseModel):
    total_users: int
    active_today: int
    content_blocked: int
    total_revenue: float
    blocked_images_count: int

class UsageDataPoint(BaseModel):
    date: str
    value: int

class ChartDataPoint(BaseModel):
    date: str
    revenue: float
    users: int

class ChartsData(BaseModel):
    data: List[ChartDataPoint]
    total_revenue: float
    total_users: int

class UsageStats(BaseModel):
    usage_over_time: List[UsageDataPoint]
    growth_percentage: float

class AccuracyStats(BaseModel):
    accuracy_percentage: float
    last_30_days_change: float
    accurate_count: int
    inaccurate_count: int

class TopCategory(BaseModel):
    category: str
    percentage: float

class ActivityType(str, Enum):
    FILTERED_CONTENT = "filtered_content"
    LOGIN = "login"
    REPORT = "report"

class Activity(BaseModel):
    id: str
    content: str
    user: str
    date: datetime
    action: str
    type: ActivityType

class ReportStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVIEWED = "reviewed"

class Report(BaseModel):
    id: str
    content_preview: str # URL or text snippet
    report_reason: str
    reporter: str
    submission_date: datetime
    status: ReportStatus
    category: Optional[str] = None

class ReportAction(BaseModel):
    report_ids: List[str]
    action: str


class AdminUser(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime
    last_login: Optional[datetime]

class AdminUserList(BaseModel):
    users: List[AdminUser]
    total: int
    page: int
    limit: int

class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None

class SystemSettingItem(BaseModel):
    key: str
    value: Optional[str]
    description: Optional[str]

class SystemSettingsUpdate(BaseModel):
    settings: List[SystemSettingItem]


# ===== NEW ANALYTICS SCHEMAS =====

class RevenueDataPoint(BaseModel):
    date: str
    daily_revenue: float
    cumulative_revenue: float

class RevenueOvertime(BaseModel):
    data: List[RevenueDataPoint]
    total_revenue: float

class NewUsersDataPoint(BaseModel):
    date: str
    count: int
    cumulative_count: int

class NewUsersOvertime(BaseModel):
    data: List[NewUsersDataPoint]
    total_users: int

class UserPredictCalls(BaseModel):
    user_id: int
    email: str
    name: Optional[str]
    total_calls: int

class UserPredictCallsList(BaseModel):
    data: List[UserPredictCalls]
    total: int
    page: int
    limit: int

class UserPaymentTotal(BaseModel):
    user_id: int
    email: str
    name: Optional[str]
    total_amount: float
    transaction_count: int

class UserPaymentTotalList(BaseModel):
    data: List[UserPaymentTotal]
    total: int
    page: int
    limit: int
