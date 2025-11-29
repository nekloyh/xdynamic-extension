from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_id
from app.schemas.user import UserProfileUpdate, UserSettingsUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api/user", tags=["User"])


def _success_response(data: object) -> dict:
    return {
        "success": True,
        "data": data,
        "metadata": {"timestamp": datetime.utcnow().isoformat()},
    }


@router.get("/profile")
def get_profile(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = UserService(db)
    try:
        profile = service.get_profile(user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    return _success_response(profile)


@router.put("/profile")
def update_profile(
    payload: UserProfileUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = UserService(db)
    try:
        profile = service.update_profile(user_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _success_response(profile)


@router.get("/settings")
def get_settings(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = UserService(db)
    settings = service.get_settings(user_id)
    return _success_response(settings)


@router.put("/settings")
def update_settings(
    payload: UserSettingsUpdate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = UserService(db)
    settings = service.update_settings(user_id, payload)
    return _success_response(settings)


@router.get("/statistics")
def get_statistics(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = UserService(db)
    stats = service.get_statistics(user_id)
    return _success_response(stats)
