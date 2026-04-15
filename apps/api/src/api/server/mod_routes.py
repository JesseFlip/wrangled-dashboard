"""Moderation REST routes — admin controls for the operator dashboard."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from wrangled_contracts import PowerCommand

from api.server.auth import AuthChecker, build_rest_auth_dep

if TYPE_CHECKING:
    from api.moderation import ModerationStore
    from api.server.hub import Hub

# ── Request bodies ────────────────────────────────────────────────────


class ConfigUpdate(BaseModel):
    bot_paused: bool | None = None
    preset_only_mode: bool | None = None
    brightness_cap: int | None = Field(default=None, ge=0, le=255)
    cooldown_seconds: int | None = Field(default=None, ge=0, le=60)


class BanBody(BaseModel):
    user_id: str
    username: str = ""
    reason: str = ""


class LockBody(BaseModel):
    reason: str = ""


# ── Router ────────────────────────────────────────────────────────────


def build_mod_router(mod: ModerationStore, hub: Hub, auth: AuthChecker) -> APIRouter:
    dep = build_rest_auth_dep(auth)
    router = APIRouter(prefix="/api/mod", dependencies=[Depends(dep)])

    # Config
    @router.get("/config")
    def get_config() -> dict:
        cfg = mod.get_config()
        cfg.pop("id", None)
        return cfg

    @router.put("/config")
    def put_config(body: ConfigUpdate) -> dict:
        updates = {k: v for k, v in body.model_dump().items() if v is not None}
        cfg = mod.update_config(**updates)
        cfg.pop("id", None)
        return cfg

    # Emergency off
    @router.post("/emergency-off")
    async def emergency_off() -> dict:
        mod.emergency_off()
        # Send power off to every connected device
        import contextlib  # noqa: PLC0415

        for device in hub.all_devices():
            with contextlib.suppress(Exception):
                await hub.send_command(device.mac, PowerCommand(on=False), timeout=3.0)
        return {"ok": True, "message": "All devices off, bot paused"}

    # Command history
    @router.get("/history")
    def get_history(limit: int = 100) -> list[dict]:
        return mod.get_history(limit=min(limit, 500))

    # Device locks
    @router.get("/devices")
    def list_locks() -> list[dict]:
        return mod.list_device_locks()

    @router.post("/device/{mac}/lock")
    def lock_device(mac: str, body: LockBody | None = None) -> dict:
        reason = body.reason if body else ""
        mod.lock_device(mac, reason=reason)
        return {"mac": mac, "locked": True, "reason": reason}

    @router.post("/device/{mac}/unlock")
    def unlock_device(mac: str) -> dict:
        mod.unlock_device(mac)
        return {"mac": mac, "locked": False}

    # Banned users
    @router.get("/banned")
    def list_banned() -> list[dict]:
        return mod.list_banned()

    @router.post("/banned")
    def ban_user(body: BanBody) -> dict:
        mod.ban_user(body.user_id, username=body.username, reason=body.reason)
        return {"ok": True}

    @router.delete("/banned/{user_id}")
    def unban_user(user_id: str) -> dict:
        mod.unban_user(user_id)
        return {"ok": True}

    return router
