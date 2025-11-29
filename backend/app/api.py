from fastapi import APIRouter

from app.controllers import (
    auth_router,
    payment_router,
    subscription_router,
    prediction_router,
    user_router,
    admin_router,
    filter_router,
)

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(payment_router)
api_router.include_router(subscription_router)
api_router.include_router(prediction_router)
api_router.include_router(user_router)
api_router.include_router(admin_router)
api_router.include_router(filter_router)

__all__ = ["api_router"]
