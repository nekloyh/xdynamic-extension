from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.middleware.auth_middleware import get_current_user_id
from app.schemas.filter import URLCreate, URLItem, ApiResponse
from app.services.filter_service import FilterService

router = APIRouter(prefix="/api/filter", tags=["Filter"])


def _success(data) -> ApiResponse:
    return ApiResponse(
        success=True,
        data=data,
        metadata={"timestamp": datetime.utcnow().isoformat()},
    )


@router.get("/whitelist", response_model=ApiResponse)
def get_whitelist(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    items = service.get_whitelist(user_id)
    return _success(items)


@router.post("/whitelist", response_model=ApiResponse)
def add_to_whitelist(
    payload: URLCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    item: URLItem = service.add_item(user_id, "whitelist", payload.url)
    return _success(item)


@router.delete("/whitelist/{item_id}", response_model=ApiResponse)
def remove_from_whitelist(
    item_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    removed = service.remove_item(user_id, "whitelist", item_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Item not found")
    return _success(True)


@router.get("/blacklist", response_model=ApiResponse)
def get_blacklist(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    items = service.get_blacklist(user_id)
    return _success(items)


@router.post("/blacklist", response_model=ApiResponse)
def add_to_blacklist(
    payload: URLCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    item: URLItem = service.add_item(user_id, "blacklist", payload.url)
    return _success(item)


@router.delete("/blacklist/{item_id}", response_model=ApiResponse)
def remove_from_blacklist(
    item_id: str,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    service = FilterService(db)
    removed = service.remove_item(user_id, "blacklist", item_id)
    if not removed:
        raise HTTPException(status_code=404, detail="Item not found")
    return _success(True)
