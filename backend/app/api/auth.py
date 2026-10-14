from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pymongo.errors import DuplicateKeyError

from app.auth import (
    auth_response,
    create_user,
    ensure_auth_configured,
    get_current_user,
    normalize_email,
    public_user,
    users,
    verify_google_credential,
    verify_password,
)


router = APIRouter(prefix="/auth", tags=["Authentication"])


class AccountCredentials(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=256)


class SignupRequest(AccountCredentials):
    name: str = Field(min_length=1, max_length=80)


class GoogleSignInRequest(BaseModel):
    credential: str = Field(min_length=1, max_length=8192)


def _safe_user(user: dict[str, Any]) -> dict[str, str]:
    return public_user(user)


@router.post("/signup")
def signup(request: SignupRequest):
    ensure_auth_configured()
    email = normalize_email(request.email)
    try:
        user = create_user(email=email, name=request.name, password=request.password)
    except DuplicateKeyError as error:
        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists. Please sign in.",
        ) from error
    return auth_response(user)


@router.post("/login")
def login(request: AccountCredentials):
    ensure_auth_configured()
    email = normalize_email(request.email)
    user = users.find_one({"email": email})
    if user is None or not verify_password(request.password, user):
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return auth_response(user)


@router.post("/google")
def google_sign_in(request: GoogleSignInRequest):
    ensure_auth_configured()
    claims = verify_google_credential(request.credential)
    email = normalize_email(str(claims.get("email", "")))
    google_sub = claims.get("sub")
    if not isinstance(google_sub, str) or not google_sub:
        raise HTTPException(status_code=401, detail="Google returned an invalid account.")

    users.create_index("email", unique=True)
    users.create_index("google_sub", unique=True, sparse=True)
    user = users.find_one({"google_sub": google_sub})
    if user is None:
        user = users.find_one({"email": email})
        if user is not None:
            if user.get("google_sub") not in (None, google_sub):
                raise HTTPException(
                    status_code=409,
                    detail="This email is already linked to a different Google account.",
                )
            users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"google_sub": google_sub}},
            )
            user["google_sub"] = google_sub
        else:
            try:
                user = create_user(
                    email=email,
                    name=str(claims.get("name") or email.split("@", 1)[0]),
                    google_sub=google_sub,
                )
            except DuplicateKeyError as error:
                raise HTTPException(
                    status_code=409,
                    detail="This Google account is already linked to another user.",
                ) from error
    return auth_response(user)


@router.get("/me")
def get_me(user: dict[str, Any] = Depends(get_current_user)):
    return {"user": _safe_user(user)}
