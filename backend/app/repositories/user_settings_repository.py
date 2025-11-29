from typing import Any, Dict, Optional

from sqlalchemy.orm import Session

from app.models.user_settings import UserSettings


class UserSettingsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: int) -> Optional[UserSettings]:
        return self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()

    def create(
        self,
        user_id: int,
        security: Dict[str, Any],
        privacy: Dict[str, Any],
        notifications: bool,
        language: str,
        theme: str,
    ) -> UserSettings:
        settings = UserSettings(
            user_id=user_id,
            security=security,
            privacy=privacy,
            notifications=notifications,
            language=language,
            theme=theme,
        )
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update_fields(self, settings: UserSettings, updates: Dict[str, Any]) -> UserSettings:
        for key, value in updates.items():
            setattr(settings, key, value)
        self.db.commit()
        self.db.refresh(settings)
        return settings
