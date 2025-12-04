from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional
import random

from app.models.user import User
from app.models.usage_log import UsageLog
from app.schemas.admin import (
    OverviewStats, UsageStats, UsageDataPoint, AccuracyStats,
    TopCategory, Activity, ActivityType, Report, ReportStatus, ReportAction,
    AdminUser, AdminUserList, AdminUserUpdate, SystemSettingItem, SystemSettingsUpdate,
    RevenueDataPoint, RevenueOvertime, NewUsersDataPoint, NewUsersOvertime,
    UserPredictCalls, UserPredictCallsList, UserPaymentTotal, UserPaymentTotalList
)
from app.models.transaction import Transaction, TransactionStatus, TransactionType
from app.models.system_setting import SystemSetting
import json

# Mock Data Store for Reports (In-memory for demo purposes)
# In a real app, this would be a database table
MOCK_REPORTS = []

def _generate_mock_reports():
    if MOCK_REPORTS:
        return
    
    categories = ["Nudity", "Violence", "Hate Speech", "Spam", "Harassment"]
    statuses = [ReportStatus.PENDING, ReportStatus.APPROVED, ReportStatus.REJECTED, ReportStatus.REVIEWED]
    
    for i in range(50):
        report_id = f"rpt_{i+100}"
        MOCK_REPORTS.append(Report(
            id=report_id,
            content_preview=f"https://example.com/content/{i}.jpg" if i % 2 == 0 else f"Offensive comment #{i}",
            report_reason=random.choice(["Inappropriate Content", "Spam", "Harassment", "Hate Speech"]),
            reporter=f"user_{random.randint(1, 100)}",
            submission_date=datetime.utcnow() - timedelta(days=random.randint(0, 30)),
            status=random.choice(statuses),
            category=random.choice(categories)
        ))

_generate_mock_reports()

class AdminService:
    
    @staticmethod
    def get_overview_stats(db: Session) -> OverviewStats:
        total_users = db.query(User).count()
        
        today = datetime.utcnow().date()
        active_today = db.query(UsageLog.user_id).filter(
            func.date(UsageLog.created_at) == today
        ).distinct().count()
        
        # Real count: blocked content from usage_logs meta_data
        # Check for "blocked": true or "blocked":true patterns
        content_blocked = db.query(UsageLog).filter(
            (UsageLog.meta_data.like('%"blocked": true%')) | 
            (UsageLog.meta_data.like('%"blocked":true%'))
        ).count()
        
        # Calculate total revenue
        total_revenue = db.query(func.sum(Transaction.amount)).filter(
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).scalar() or 0.0

        # Calculate blocked images count (same as content_blocked for now)
        blocked_images_count = content_blocked

        return OverviewStats(
            total_users=total_users,
            active_today=active_today,
            content_blocked=content_blocked,
            total_revenue=total_revenue,
            blocked_images_count=blocked_images_count
        )

    @staticmethod
    def get_usage_stats(db: Session, range_str: str = "30d") -> UsageStats:
        # Simple implementation for 30d
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        logs = db.query(
            func.date(UsageLog.created_at).label("date"),
            func.count(UsageLog.id).label("count")
        ).filter(
            UsageLog.created_at >= start_date
        ).group_by(
            func.date(UsageLog.created_at)
        ).all()
        
        usage_map = {str(log.date): log.count for log in logs}
        usage_over_time = []
        
        current = start_date
        while current <= end_date:
            date_str = str(current.date())
            usage_over_time.append(UsageDataPoint(
                date=date_str,
                value=usage_map.get(date_str, 0)
            ))
            current += timedelta(days=1)
            
        return UsageStats(
            usage_over_time=usage_over_time,
            growth_percentage=12.5 # Mock growth
        )

    @staticmethod
    def get_accuracy_stats(db: Session, range_str: str = "30d") -> AccuracyStats:
        # Fully mock for now as we don't store prediction feedback loop yet
        return AccuracyStats(
            accuracy_percentage=95.2,
            last_30_days_change=1.5,
            accurate_count=950,
            inaccurate_count=48
        )

    @staticmethod
    def get_top_categories(db: Session, range_str: str = "30d") -> List[TopCategory]:
        # Mock categories
        return [
            TopCategory(category="Hate Speech", percentage=30.0),
            TopCategory(category="Violence", percentage=25.0),
            TopCategory(category="Nudity", percentage=20.0),
            TopCategory(category="Misinformation", percentage=15.0),
            TopCategory(category="Spam", percentage=10.0),
        ]

    @staticmethod
    def get_recent_activities(db: Session, limit: int = 5) -> List[Activity]:
        activities = []
        
        # Get recent logins/usage
        recent_logs = db.query(UsageLog).order_by(UsageLog.created_at.desc()).limit(limit).all()
        
        for log in recent_logs:
            activities.append(Activity(
                id=str(log.id),
                content=log.endpoint,
                user=f"User {log.user_id}",
                date=log.created_at,
                action="Accessed",
                type=ActivityType.LOGIN
            ))
            
        # Add some mock report activities
        for i, report in enumerate(MOCK_REPORTS[:2]):
             activities.append(Activity(
                id=f"act_rpt_{i}",
                content=report.report_reason,
                user=report.reporter,
                date=report.submission_date,
                action="Reported",
                type=ActivityType.REPORT
            ))
            
        # Sort by date desc and limit
        activities.sort(key=lambda x: x.date, reverse=True)
        return activities[:limit]

    @staticmethod
    def get_reports(
        db: Session, 
        page: int = 1, 
        limit: int = 10, 
        status: Optional[str] = None,
        date_range: Optional[str] = None,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> dict:
        filtered = MOCK_REPORTS
        
        if status and status != "all":
            filtered = [r for r in filtered if r.status == status]
            
        if category and category != "all":
            filtered = [r for r in filtered if r.category == category]
            
        if search:
            search = search.lower()
            filtered = [r for r in filtered if search in r.report_reason.lower() or search in r.reporter.lower()]
            
        # Pagination
        total = len(filtered)
        start = (page - 1) * limit
        end = start + limit
        
        return {
            "data": filtered[start:end],
            "total": total,
            "page": page,
            "limit": limit
        }



    @staticmethod
    def get_users(
        db: Session, 
        page: int = 1, 
        limit: int = 10, 
        search: Optional[str] = None,
        status: Optional[str] = None,
        role: Optional[str] = None
    ) -> AdminUserList:
        query = db.query(User)
        
        if search:
            search = f"%{search}%"
            query = query.filter(
                (User.email.ilike(search)) | (User.name.ilike(search))
            )
            
        if status:
            if status == "Active":
                query = query.filter(User.is_active == True)
            elif status == "Banned":
                query = query.filter(User.is_active == False)
                
        if role:
            if role == "Admin":
                query = query.filter(User.is_admin == True)
            elif role == "User":
                query = query.filter(User.is_admin == False)
                
        total = query.count()
        users = query.offset((page - 1) * limit).limit(limit).all()
        
        admin_users = []
        for user in users:
            admin_users.append(AdminUser(
                id=user.id,
                email=user.email,
                full_name=user.name,
                is_active=user.is_active,
                is_admin=user.is_admin,
                created_at=user.created_at,
                last_login=datetime.utcnow() # Mock for now as User model might not have last_login
            ))
            
        return AdminUserList(
            users=admin_users,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def update_user_status(db: Session, user_id: int, update_data: AdminUserUpdate):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
            
        if update_data.is_active is not None:
            user.is_active = update_data.is_active
            
        if update_data.is_admin is not None:
            user.is_admin = update_data.is_admin
            
        db.commit()
        db.refresh(user)
        return {"success": True, "message": "User updated successfully"}

    @staticmethod
    def delete_user(db: Session, user_id: int):
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        
        # Delete related records first (usage logs, transactions, etc.)
        db.query(UsageLog).filter(UsageLog.user_id == user_id).delete()
        db.query(Transaction).filter(Transaction.user_id == user_id).delete()
        
        # Delete the user
        db.delete(user)
        db.commit()
        
        return {"success": True, "message": "User deleted successfully"}

    @staticmethod
    def get_system_settings(db: Session) -> List[SystemSettingItem]:
        settings = db.query(SystemSetting).all()
        return [
            SystemSettingItem(key=s.key, value=s.value, description=s.description)
            for s in settings
        ]

    @staticmethod
    def update_system_settings(db: Session, settings_update: SystemSettingsUpdate):
        for item in settings_update.settings:
            setting = db.query(SystemSetting).filter(SystemSetting.key == item.key).first()
            if setting:
                setting.value = item.value
                if item.description:
                    setting.description = item.description
            else:
                new_setting = SystemSetting(
                    key=item.key,
                    value=item.value,
                    description=item.description
                )
                db.add(new_setting)
        
        db.commit()
        return {"success": True, "message": "Settings updated successfully"}

    @staticmethod
    def get_charts_data(db: Session, days: int = 30):
        """Get revenue and user registration data grouped by day for charts"""
        from app.schemas.admin import ChartDataPoint, ChartsData
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get revenue by day (only successful transactions)
        revenue_query = db.query(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.amount).label("total")
        ).filter(
            Transaction.created_at >= start_date,
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).group_by(
            func.date(Transaction.created_at)
        ).all()
        
        revenue_map = {str(r.date): float(r.total or 0) for r in revenue_query}
        
        # Get new users by day
        users_query = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        ).filter(
            User.created_at >= start_date
        ).group_by(
            func.date(User.created_at)
        ).all()
        
        users_map = {str(u.date): u.count for u in users_query}
        
        # Build chart data for each day
        chart_data = []
        current = start_date
        while current <= end_date:
            date_str = str(current.date())
            chart_data.append(ChartDataPoint(
                date=date_str,
                revenue=revenue_map.get(date_str, 0),
                users=users_map.get(date_str, 0)
            ))
            current += timedelta(days=1)
        
        # Calculate totals
        total_revenue = db.query(func.sum(Transaction.amount)).filter(
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).scalar() or 0.0
        
        total_users = db.query(User).count()
        
        return ChartsData(
            data=chart_data,
            total_revenue=float(total_revenue),
            total_users=total_users
        )

    @staticmethod
    def get_revenue_overtime(db: Session, days: int = 30) -> RevenueOvertime:
        """Get daily and cumulative revenue over time"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get daily revenue (only successful transactions)
        revenue_query = db.query(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.amount).label("total")
        ).filter(
            Transaction.created_at >= start_date,
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).group_by(
            func.date(Transaction.created_at)
        ).order_by(
            func.date(Transaction.created_at)
        ).all()
        
        revenue_map = {str(r.date): float(r.total or 0) for r in revenue_query}
        
        # Build cumulative data
        chart_data = []
        cumulative = 0
        current = start_date
        
        while current <= end_date:
            date_str = str(current.date())
            daily = revenue_map.get(date_str, 0)
            cumulative += daily
            chart_data.append(RevenueDataPoint(
                date=date_str,
                daily_revenue=daily,
                cumulative_revenue=cumulative
            ))
            current += timedelta(days=1)
        
        # Get total revenue
        total_revenue = db.query(func.sum(Transaction.amount)).filter(
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).scalar() or 0.0
        
        return RevenueOvertime(
            data=chart_data,
            total_revenue=float(total_revenue)
        )

    @staticmethod
    def get_new_users_overtime(db: Session, days: int = 30) -> NewUsersOvertime:
        """Get new user registrations over time (sorted descending)"""
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        # Get new users by day
        users_query = db.query(
            func.date(User.created_at).label("date"),
            func.count(User.id).label("count")
        ).filter(
            User.created_at >= start_date
        ).group_by(
            func.date(User.created_at)
        ).order_by(
            func.date(User.created_at)
        ).all()
        
        users_map = {str(u.date): u.count for u in users_query}
        
        # Build cumulative data
        chart_data = []
        cumulative = 0
        current = start_date
        
        while current <= end_date:
            date_str = str(current.date())
            daily = users_map.get(date_str, 0)
            cumulative += daily
            chart_data.append(NewUsersDataPoint(
                date=date_str,
                count=daily,
                cumulative_count=cumulative
            ))
            current += timedelta(days=1)
        
        # Sort descending by date
        chart_data.reverse()
        
        total_users = db.query(User).count()
        
        return NewUsersOvertime(
            data=chart_data,
            total_users=total_users
        )

    @staticmethod
    def get_user_predict_calls(
        db: Session,
        page: int = 1,
        limit: int = 10,
        sort_desc: bool = True
    ) -> UserPredictCallsList:
        """Get total predict API calls per user"""
        # Query usage logs for predict endpoints
        subquery = db.query(
            UsageLog.user_id,
            func.count(UsageLog.id).label("total_calls")
        ).filter(
            UsageLog.endpoint.like("%predict%")
        ).group_by(
            UsageLog.user_id
        ).subquery()
        
        # Join with users
        query = db.query(
            User.id,
            User.email,
            User.name,
            func.coalesce(subquery.c.total_calls, 0).label("total_calls")
        ).outerjoin(
            subquery, User.id == subquery.c.user_id
        )
        
        # Sort
        if sort_desc:
            query = query.order_by(func.coalesce(subquery.c.total_calls, 0).desc())
        else:
            query = query.order_by(func.coalesce(subquery.c.total_calls, 0).asc())
        
        # Get total count
        total = query.count()
        
        # Pagination
        results = query.offset((page - 1) * limit).limit(limit).all()
        
        data = [
            UserPredictCalls(
                user_id=r.id,
                email=r.email,
                name=r.name,
                total_calls=r.total_calls
            )
            for r in results
        ]
        
        return UserPredictCallsList(
            data=data,
            total=total,
            page=page,
            limit=limit
        )

    @staticmethod
    def get_user_payment_totals(
        db: Session,
        page: int = 1,
        limit: int = 10,
        sort_desc: bool = True
    ) -> UserPaymentTotalList:
        """Get total payment amount per user"""
        # Query successful transactions
        subquery = db.query(
            Transaction.user_id,
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("transaction_count")
        ).filter(
            Transaction.status == TransactionStatus.SUCCESS,
            Transaction.type.in_([TransactionType.TOPUP, TransactionType.PURCHASE])
        ).group_by(
            Transaction.user_id
        ).subquery()
        
        # Join with users
        query = db.query(
            User.id,
            User.email,
            User.name,
            func.coalesce(subquery.c.total_amount, 0).label("total_amount"),
            func.coalesce(subquery.c.transaction_count, 0).label("transaction_count")
        ).outerjoin(
            subquery, User.id == subquery.c.user_id
        )
        
        # Sort
        if sort_desc:
            query = query.order_by(func.coalesce(subquery.c.total_amount, 0).desc())
        else:
            query = query.order_by(func.coalesce(subquery.c.total_amount, 0).asc())
        
        # Get total count
        total = query.count()
        
        # Pagination
        results = query.offset((page - 1) * limit).limit(limit).all()
        
        data = [
            UserPaymentTotal(
                user_id=r.id,
                email=r.email,
                name=r.name,
                total_amount=float(r.total_amount),
                transaction_count=r.transaction_count
            )
            for r in results
        ]
        
        return UserPaymentTotalList(
            data=data,
            total=total,
            page=page,
            limit=limit
        )
