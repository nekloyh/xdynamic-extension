from datetime import datetime, timedelta
from typing import Dict

from sqlalchemy.orm import Session

from app.models.subscription import PlanType
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.repositories.user_settings_repository import UserSettingsRepository
from app.repositories.usage_log_repository import UsageLogRepository
from app.schemas.user import (
    UserProfile,
    UserProfileUpdate,
    UserSettings,
    UserSettingsUpdate,
    UserStatistics,
)
from app.services.subscription_service import SubscriptionService


class UserService:
    DEFAULT_SECURITY: Dict[str, object] = {
        "realTimeProtection": True,
        "autoUpdate": False,
        "speedLimit": 80,
        "customFilters": [],
        "whitelist": [],
        "blacklist": [],
        "vpnEnabled": False,
    }
    DEFAULT_PRIVACY: Dict[str, object] = {
        "dataSharing": True,
        "analytics": False,
        "crashReports": True,
        "personalizedAds": False,
    }
    DEFAULT_NOTIFICATIONS = True
    DEFAULT_LANGUAGE = "en"
    DEFAULT_THEME = "light"

    def __init__(self, db: Session):
        self.db = db
        self.user_repo = UserRepository(db)
        self.settings_repo = UserSettingsRepository(db)
        self.usage_log_repo = UsageLogRepository(db)
        self.subscription_service = SubscriptionService(db)

    def _merge_settings(self, raw_settings) -> dict:
        security = {**self.DEFAULT_SECURITY, **(raw_settings.security or {})}
        privacy = {**self.DEFAULT_PRIVACY, **(raw_settings.privacy or {})}
        return {
            "security": security,
            "privacy": privacy,
            "notifications": raw_settings.notifications if raw_settings.notifications is not None else self.DEFAULT_NOTIFICATIONS,
            "language": raw_settings.language or self.DEFAULT_LANGUAGE,
            "theme": raw_settings.theme or self.DEFAULT_THEME,
        }

    def _ensure_settings(self, user_id: int):
        settings = self.settings_repo.get_by_user_id(user_id)
        if not settings:
            settings = self.settings_repo.create(
                user_id=user_id,
                security=self.DEFAULT_SECURITY,
                privacy=self.DEFAULT_PRIVACY,
                notifications=self.DEFAULT_NOTIFICATIONS,
                language=self.DEFAULT_LANGUAGE,
                theme=self.DEFAULT_THEME,
            )
        merged = self._merge_settings(settings)
        # Persist merged defaults in case any field was missing
        settings = self.settings_repo.update_fields(settings, merged)
        return settings

    def _build_profile(self, user: User) -> UserProfile:
        subscription = self.subscription_service.get_active_subscription(user.id)
        plan_type = subscription.plan.value if subscription else PlanType.FREE.value
        plan_label = {
            PlanType.FREE.value: "Free",
            PlanType.PLUS.value: "Plus",
            PlanType.PRO.value: "Pro",
        }.get(plan_type, "Free")
        full_name = user.name or user.email.split("@")[0]

        return UserProfile(
            id=user.id,
            email=user.email,
            fullName=full_name,
            avatar=user.avatar,
            plan=plan_label,
            planType=plan_type,
            credits=user.credits,
            isAdmin=bool(user.is_admin),
        )

    def get_profile(self, user_id: int) -> UserProfile:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        return self._build_profile(user)

    def update_profile(self, user_id: int, payload: UserProfileUpdate) -> UserProfile:
        user = self.user_repo.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")

        updates = payload.model_dump(exclude_none=True)

        # Handle email change with uniqueness check
        new_email = updates.get("email")
        if new_email and new_email != user.email:
            existing = self.user_repo.get_by_email(new_email)
            if existing and existing.id != user_id:
                raise ValueError("Email already in use")
            user.email = new_email

        # Prefer fullName then name
        name_value = updates.get("fullName") or updates.get("name")
        if name_value is not None:
            user.name = name_value

        if "avatar" in updates:
            user.avatar = updates.get("avatar")

        self.db.commit()
        self.db.refresh(user)
        return self._build_profile(user)

    def get_settings(self, user_id: int) -> UserSettings:
        settings = self._ensure_settings(user_id)
        merged = self._merge_settings(settings)
        return UserSettings(**merged)

    def update_settings(self, user_id: int, payload: UserSettingsUpdate) -> UserSettings:
        settings = self._ensure_settings(user_id)
        updates = {}

        if payload.security:
            current_security = {**self.DEFAULT_SECURITY, **(settings.security or {})}
            updates["security"] = {**current_security, **payload.security.model_dump(exclude_none=True)}

        if payload.privacy:
            current_privacy = {**self.DEFAULT_PRIVACY, **(settings.privacy or {})}
            updates["privacy"] = {**current_privacy, **payload.privacy.model_dump(exclude_none=True)}

        if payload.notifications is not None:
            updates["notifications"] = payload.notifications
        if payload.language is not None:
            updates["language"] = payload.language
        if payload.theme is not None:
            updates["theme"] = payload.theme

        if updates:
            settings = self.settings_repo.update_fields(settings, updates)

        merged = self._merge_settings(settings)
        return UserSettings(**merged)

    def get_statistics(self, user_id: int) -> UserStatistics:
        now = datetime.utcnow()
        start_today = datetime(now.year, now.month, now.day)
        start_week = now - timedelta(days=7)
        start_month = datetime(now.year, now.month, 1)

        stats = UserStatistics(
            totalBlocked=self.usage_log_repo.count_total(user_id),
            todayBlocked=self.usage_log_repo.count_by_user_in_period(user_id, start_today),
            weeklyBlocked=self.usage_log_repo.count_by_user_in_period(user_id, start_week),
            monthlyBlocked=self.usage_log_repo.count_by_user_in_period(user_id, start_month),
            byCategory={"sensitive": 0, "violence": 0, "toxicity": 0, "vice": 0},
        )
        return stats
