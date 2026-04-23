from fastapi import APIRouter, HTTPException, status, Response, Cookie, Depends
from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId

from db import get_db
from auth_utils import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    store_refresh_token,
    revoke_refresh_token,
    is_refresh_token_valid,
    decode_token,
    get_current_user,
    REFRESH_TOKEN_EXPIRE_DAYS,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from models.user import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])


def set_auth_cookies(response: Response, access_token: str, refresh_token: str):
    """Set httpOnly cookies for both tokens."""
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/auth/refresh",
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: UserRegisterRequest, response: Response):
    db = get_db()

    # Check if email already exists
    existing = db["users"].find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists",
        )

    now = datetime.now(timezone.utc)
    user_doc = {
        "name": body.name.strip(),
        "email": body.email.lower().strip(),
        "password_hash": hash_password(body.password),
        "created_at": now,
    }

    result = db["users"].insert_one(user_doc)
    user_id = str(result.inserted_id)

    access_token = create_access_token(user_id, user_doc["email"])
    refresh_token = create_refresh_token(user_id)

    store_refresh_token(user_id, refresh_token)
    set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            name=user_doc["name"],
            email=user_doc["email"],
            created_at=now,
        ),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLoginRequest, response: Response):
    db = get_db()

    user = db["users"].find_one({"email": body.email.lower().strip()})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    user_id = str(user["_id"])
    access_token = create_access_token(user_id, user["email"])
    refresh_token = create_refresh_token(user_id)

    store_refresh_token(user_id, refresh_token)
    set_auth_cookies(response, access_token, refresh_token)

    return TokenResponse(
        access_token=access_token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            created_at=user.get("created_at"),
        ),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
):
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided",
        )

    try:
        payload = decode_token(refresh_token)
    except HTTPException:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    if not is_refresh_token_valid(refresh_token, user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has been revoked",
        )

    db = get_db()
    try:
        user = db["users"].find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )

    # Rotate refresh token
    revoke_refresh_token(refresh_token)

    new_access_token = create_access_token(user_id, user["email"])
    new_refresh_token = create_refresh_token(user_id)

    store_refresh_token(user_id, new_refresh_token)
    set_auth_cookies(response, new_access_token, new_refresh_token)

    return TokenResponse(
        access_token=new_access_token,
        user=UserResponse(
            id=user_id,
            name=user["name"],
            email=user["email"],
            created_at=user.get("created_at"),
        ),
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    response: Response,
    refresh_token: Optional[str] = Cookie(default=None),
    current_user: dict = Depends(get_current_user),
):
    if refresh_token:
        revoke_refresh_token(refresh_token)

    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/auth/refresh")

    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
    )