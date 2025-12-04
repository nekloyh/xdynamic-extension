from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.services.admin_service import AdminService
from app.schemas.admin import (
    OverviewStats, UsageStats, AccuracyStats, TopCategory, 
    Activity, Report, ReportAction,
    AdminUserList, AdminUserUpdate, SystemSettingItem, SystemSettingsUpdate,
    ChartsData, RevenueOvertime, NewUsersOvertime, UserPredictCallsList, UserPaymentTotalList
)
# Assuming there is a get_current_user dependency, likely in app.controllers.auth_controller or app.middleware
# Based on user_controller.py check, I will find out where it is.
# For now I will assume it's available or I'll check user_controller first.
from app.controllers.auth_controller import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    responses={404: {"description": "Not found"}},
)

# Admin dependency (simple check for now, can be expanded)
def get_current_admin(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return current_user

@router.get("/stats/overview", response_model=OverviewStats)
def get_overview_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_overview_stats(db)

@router.get("/stats/usage", response_model=UsageStats)
def get_usage_stats(
    range: str = "30d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_usage_stats(db, range)

@router.get("/stats/accuracy", response_model=AccuracyStats)
def get_accuracy_stats(
    range: str = "30d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_accuracy_stats(db, range)

@router.get("/stats/top-categories", response_model=List[TopCategory])
def get_top_categories(
    range: str = "30d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_top_categories(db, range)

@router.get("/activities", response_model=List[Activity])
def get_recent_activities(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_recent_activities(db, limit)

@router.get("/reports")
def get_reports(
    page: int = 1,
    limit: int = 10,
    status: Optional[str] = None,
    date_range: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_reports(db, page, limit, status, date_range, category, search)


@router.get("/stats/charts", response_model=ChartsData)
def get_charts_data(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get revenue and user registration data for charts"""
    return AdminService.get_charts_data(db, days)


@router.get("/users", response_model=AdminUserList)
def get_users(
    page: int = 1,
    limit: int = 10,
    search: Optional[str] = None,
    status: Optional[str] = None,
    role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_users(db, page, limit, search, status, role)

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    update_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.update_user_status(db, user_id, update_data)

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    # Prevent admin from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    return AdminService.delete_user(db, user_id)

@router.get("/settings", response_model=List[SystemSettingItem])
def get_system_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.get_system_settings(db)

@router.put("/settings")
def update_system_settings(
    settings_update: SystemSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    return AdminService.update_system_settings(db, settings_update)


# ===== NEW ANALYTICS ENDPOINTS =====

@router.get("/stats/revenue-overtime", response_model=RevenueOvertime)
def get_revenue_overtime(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get daily and cumulative revenue over time"""
    return AdminService.get_revenue_overtime(db, days)


@router.get("/stats/new-users-overtime", response_model=NewUsersOvertime)
def get_new_users_overtime(
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get new user registrations over time (sorted descending)"""
    return AdminService.get_new_users_overtime(db, days)


@router.get("/stats/user-predict-calls", response_model=UserPredictCallsList)
def get_user_predict_calls(
    page: int = 1,
    limit: int = 10,
    sort_desc: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get total predict API calls per user"""
    return AdminService.get_user_predict_calls(db, page, limit, sort_desc)


@router.get("/stats/user-payments", response_model=UserPaymentTotalList)
def get_user_payment_totals(
    page: int = 1,
    limit: int = 10,
    sort_desc: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    """Get total payment amount per user"""
    return AdminService.get_user_payment_totals(db, page, limit, sort_desc)
