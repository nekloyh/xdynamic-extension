import sys
import os
import hashlib
import bcrypt
from sqlalchemy.orm import Session

# Add current directory to path to allow imports from app
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.user import User
from app.models.subscription import Subscription, PlanType
from app.config import get_settings

settings = get_settings()

def hash_password(password: str) -> str:
    password_sha256 = hashlib.sha256(password.encode('utf-8')).hexdigest()
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_sha256.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_user(db: Session, email: str, password: str, name: str, is_admin: bool = False):
    hashed_password = hash_password(password)
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        print(f"User {email} already exists. Updating password and admin status.")
        existing_user.hashed_password = hashed_password
        existing_user.is_admin = 1 if is_admin else 0
        db.commit()
        return existing_user
    user = User(
        email=email,
        name=name,
        hashed_password=hashed_password,
        is_admin=1 if is_admin else 0,
        credits=100000.0 # Give some credits for testing
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create subscription
    from datetime import datetime, timedelta
    from app.models.subscription import SubscriptionStatus
    
    expires_at = datetime.utcnow() + timedelta(days=30) if is_admin else None
    
    subscription = Subscription(
        user_id=user.id,
        plan=PlanType.PRO if is_admin else PlanType.FREE,
        monthly_quota=settings.PLAN_PRO_MONTHLY_QUOTA if is_admin else settings.PLAN_FREE_MONTHLY_QUOTA,
        status=SubscriptionStatus.ACTIVE,
        expires_at=expires_at,
        used_quota=0
    )
    db.add(subscription)
    db.commit()
    
    print(f"Created user: {email}")
    return user

def main():
    db = SessionLocal()
    try:
        # Create Admin accounts
        create_user(db, "admin@gmail.com", "admin123", "Admin User", is_admin=True)
        create_user(db, "phutuan@gmail.com", "phutuan123", "Phu Tuan", is_admin=True)
        
        # Create Regular User
        create_user(db, "user@gmail.com", "user123", "Regular User", is_admin=False)
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
