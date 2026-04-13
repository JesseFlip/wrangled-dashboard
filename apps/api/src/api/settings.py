"""Env-driven configuration."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class ApiSettings(BaseSettings):
    """Runtime settings for the api process."""

    model_config = SettingsConfigDict(env_prefix="WRANGLED_", env_file=".env", extra="ignore")

    auth_token: str | None = None
    host: str = "127.0.0.1"
    port: int = 8500
