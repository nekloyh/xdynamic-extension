from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field


class ApiResponse(BaseModel):
    success: bool = True
    data: Any = None
    error: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None


class SecuritySettings(BaseModel):
    realTimeProtection: bool = True
    autoUpdate: bool = False
    speedLimit: int = 80
    customFilters: list[str] = Field(default_factory=list)
    vpnEnabled: bool = False


class PrivacySettings(BaseModel):
    dataSharing: bool = True
    analytics: bool = False
    crashReports: bool = True
    personalizedAds: bool = False


class UserSettings(BaseModel):
    security: SecuritySettings
    privacy: PrivacySettings
    notifications: bool = True
    language: str = "en"
    theme: str = "light"


class UserSettingsUpdate(BaseModel):
    security: Optional[SecuritySettings] = None
    privacy: Optional[PrivacySettings] = None
    notifications: Optional[bool] = None
    language: Optional[str] = None
    theme: Optional[str] = None


class UserProfile(BaseModel):
    id: int
    fullName: str
    email: EmailStr
    avatar: Optional[str] = None
    plan: str
    planType: str
    credits: float

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    fullName: Optional[str] = None
    name: Optional[str] = None
    avatar: Optional[str] = None
    email: Optional[EmailStr] = None


class UserStatistics(BaseModel):
    totalBlocked: int
    todayBlocked: int
    weeklyBlocked: int
    monthlyBlocked: int
    byCategory: Dict[str, int]
