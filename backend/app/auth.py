import base64
import hashlib
import hmac
import json
import os
import re
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from google.auth.exceptions import GoogleAuthError, TransportError
from google.oauth2 import id_token
from google.auth.transport.requests import Request

from app.database.mongodb import db


users = db["users"]
bearer_scheme = HTTPBearer(auto_error=False)
TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _auth_secret() -> bytes:
    secret = os.getenv("AUTH_SECRET_KEY", "")
    if len(secret) < 32:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured. Set AUTH_SECRET_KEY to a random value of at least 32 characters.",
        )
    return secret.encode("utf-8")


def ensure_auth_configured() -> None:
    _auth_secret()


def _b64encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _b64decode(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


def issue_access_token(user_id: str) -> str:
    now = int(time.time())
    header = _b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode()
    )
    payload = _b64encode(
        json.dumps(
            {
                "sub": user_id,
                "iat": now,
                "exp": now + TOKEN_LIFETIME_SECONDS,
            },
            separators=(",", ":"),
        ).encode()
    )
    signing_input = f"{header}.{payload}".encode("ascii")
    signature = hmac.new(_auth_secret(), signing_input, hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64encode(signature)}"


def _decode_access_token(token: str) -> dict[str, Any]:
    try:
        header, payload, signature = token.split(".")
        header_data = json.loads(_b64decode(header))
        payload_data = json.loads(_b64decode(payload))
        expected = hmac.new(
            _auth_secret(),
            f"{header}.{payload}".encode("ascii"),
            hashlib.sha256,
        ).digest()
        if header_data.get("alg") != "HS256" or not hmac.compare_digest(
            _b64decode(signature), expected
        ):
            raise ValueError("Invalid token signature")
        if not isinstance(payload_data.get("exp"), int) or payload_data["exp"] <= int(
            time.time()
        ):
            raise ValueError("Expired token")
        if not isinstance(payload_data.get("sub"), str):
            raise ValueError("Invalid token subject")
        return payload_data
    except HTTPException:
        raise
    except (ValueError, TypeError, UnicodeDecodeError, json.JSONDecodeError) as error:
        raise HTTPException(
            status_code=401,
            detail="Your sign-in has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from error


def public_user(user: dict[str, Any]) -> dict[str, str]:
    return {
        "user_id": user["user_id"],
        "email": user["email"],
        "name": user["name"],
    }


def auth_response(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "access_token": issue_access_token(user["user_id"]),
        "token_type": "bearer",
        "user": public_user(user),
    }


def normalize_email(email: str) -> str:
    normalized = email.strip().lower()
    if len(normalized) > 254 or not EMAIL_PATTERN.fullmatch(normalized):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    return normalized


def hash_password(password: str, salt: bytes | None = None) -> tuple[str, str]:
    password_salt = salt or os.urandom(16)
    password_hash = hashlib.scrypt(
        password.encode("utf-8"),
        salt=password_salt,
        n=2**14,
        r=8,
        p=1,
        dklen=64,
    )
    return _b64encode(password_hash), _b64encode(password_salt)


def verify_password(password: str, user: dict[str, Any]) -> bool:
    if not user.get("password_hash") or not user.get("password_salt"):
        return False
    try:
        password_hash, _ = hash_password(
            password, salt=_b64decode(user["password_salt"])
        )
    except (ValueError, TypeError):
        return False
    return hmac.compare_digest(password_hash, user["password_hash"])


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict[str, Any]:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Please sign in to continue.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = _decode_access_token(credentials.credentials)
    user = users.find_one(
        {"user_id": payload["sub"]},
        {"_id": 0, "password_hash": 0, "password_salt": 0},
    )
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Your account could not be found. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def require_owned_game(session_id: str, user: dict[str, Any]) -> dict[str, Any]:
    from app.game.game_engine import get_game_session

    game = get_game_session(session_id)
    if game is None or game.get("player_id") != user["user_id"]:
        raise HTTPException(status_code=404, detail="Game session not found")
    return game


def create_user(
    email: str,
    name: str,
    password: str | None = None,
    google_sub: str | None = None,
) -> dict[str, Any]:
    from uuid import uuid4

    users.create_index("email", unique=True)
    users.create_index("google_sub", unique=True, sparse=True)
    user: dict[str, Any] = {
        "user_id": str(uuid4()),
        "email": email,
        "name": name.strip() or email.split("@", 1)[0],
        "created_at": datetime.now(timezone.utc),
    }
    if password is not None:
        user["password_hash"], user["password_salt"] = hash_password(password)
    if google_sub is not None:
        user["google_sub"] = google_sub
    users.insert_one(user)
    return user


def verify_google_credential(credential: str) -> dict[str, Any]:
    client_id = os.getenv("GOOGLE_CLIENT_ID", "").strip()
    if not client_id:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in is not configured. Set GOOGLE_CLIENT_ID on the backend.",
        )
    try:
        claims = id_token.verify_oauth2_token(
            credential,
            Request(),
            audience=client_id,
        )
    except TransportError as error:
        raise HTTPException(
            status_code=503,
            detail="Google sign-in could not reach the verification service.",
        ) from error
    except (GoogleAuthError, ValueError) as error:
        raise HTTPException(
            status_code=401,
            detail="Google could not verify this sign-in. Please try again.",
        ) from error

    if claims.get("email_verified") is not True:
        raise HTTPException(
            status_code=401,
            detail="Use a verified Google account to sign in.",
        )
    return claims
