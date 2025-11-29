from datetime import datetime
from typing import Dict, List
from uuid import uuid4

from sqlalchemy.orm import Session

from app.repositories.user_settings_repository import UserSettingsRepository
from app.services.user_service import UserService
from app.schemas.filter import URLItem


class FilterService:
    """Manage whitelist/blacklist stored inside user_settings.security."""

    def __init__(self, db: Session):
        self.db = db
        self.settings_repo = UserSettingsRepository(db)
        self.default_security = UserService.DEFAULT_SECURITY

    def _ensure_settings(self, user_id: int):
        settings = self.settings_repo.get_by_user_id(user_id)
        if not settings:
            settings = self.settings_repo.create(
                user_id=user_id,
                security=self.default_security,
                privacy=UserService.DEFAULT_PRIVACY,
                notifications=UserService.DEFAULT_NOTIFICATIONS,
                language=UserService.DEFAULT_LANGUAGE,
                theme=UserService.DEFAULT_THEME,
            )

        # Merge defaults to avoid missing keys
        merged_security: Dict[str, object] = {**self.default_security, **(settings.security or {})}
        if merged_security != settings.security:
            settings = self.settings_repo.update_fields(settings, {"security": merged_security})

        return settings

    def _get_list(self, user_id: int, list_key: str) -> List[Dict]:
        settings = self._ensure_settings(user_id)
        security = settings.security or {}
        return list(security.get(list_key, []) or [])

    def get_whitelist(self, user_id: int) -> List[URLItem]:
        items = self._get_list(user_id, "whitelist")
        return [self._normalize_item(item) for item in items]

    def get_blacklist(self, user_id: int) -> List[URLItem]:
        items = self._get_list(user_id, "blacklist")
        return [self._normalize_item(item) for item in items]

    def add_item(self, user_id: int, list_key: str, url: str) -> URLItem:
        settings = self._ensure_settings(user_id)
        security = settings.security or {}
        items: List[Dict] = list(security.get(list_key, []) or [])

        normalized_url = url.strip().lower()
        if any((item.get("url", "").lower() == normalized_url) for item in items):
            # Return existing item to keep behavior idempotent
            existing = next(item for item in items if item.get("url", "").lower() == normalized_url)
            return self._normalize_item(existing)

        new_item = {
            "id": str(uuid4()),
            "url": normalized_url,
            "addedAt": datetime.utcnow().isoformat(),
            "visits": 0,
        }
        items.append(new_item)
        security[list_key] = items
        self.settings_repo.update_fields(settings, {"security": security})
        return self._normalize_item(new_item)

    def remove_item(self, user_id: int, list_key: str, item_id: str) -> bool:
        settings = self._ensure_settings(user_id)
        security = settings.security or {}
        items: List[Dict] = list(security.get(list_key, []) or [])
        filtered = [item for item in items if str(item.get("id")) != str(item_id)]

        if len(filtered) == len(items):
            return False

        security[list_key] = filtered
        self.settings_repo.update_fields(settings, {"security": security})
        return True

    def _normalize_item(self, raw: Dict) -> URLItem:
        try:
            added_at_raw = raw.get("addedAt") or raw.get("created_at") or raw.get("createdAt")
        except AttributeError:
            added_at_raw = None
        try:
            added_at = datetime.fromisoformat(str(added_at_raw))
        except Exception:
            added_at = datetime.utcnow()

        return URLItem(
            id=str(raw.get("id")),
            url=str(raw.get("url", "")).strip(),
            addedAt=added_at,
            visits=int(raw.get("visits", 0) or 0),
        )
