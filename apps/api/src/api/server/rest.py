"""REST routes for external callers."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from wrangled_contracts import (
    EFFECT_FX_ID,
    EMOJI_COMMANDS,
    PRESETS,
    ColorCommand,
    Command,
    EffectCommand,
    PowerCommand,
    PushResult,
    WledDevice,
)

from api.server.auth import build_rest_auth_dep
from api.server.hub import (
    NoWranglerForDeviceError,
    WranglerTimeoutError,
)

if TYPE_CHECKING:
    from api.server.auth import AuthChecker
    from api.server.hub import Hub


def _summarize(cmd: Command) -> str:
    if isinstance(cmd, EffectCommand):
        return cmd.name
    if isinstance(cmd, ColorCommand):
        return f"color({cmd.color.r},{cmd.color.g},{cmd.color.b})"
    if isinstance(cmd, PowerCommand):
        return f"power({'on' if cmd.on else 'off'})"
    return cmd.kind


class _RenameBody(BaseModel):
    name: str = Field(min_length=1, max_length=32)


def build_metadata_router() -> APIRouter:
    """Read-only metadata routes — no auth, no hub dependency."""
    router = APIRouter(prefix="/api")

    @router.get("/effects")
    def list_effects() -> dict[str, list[str]]:
        return {"effects": list(EFFECT_FX_ID.keys())}

    @router.get("/presets")
    def list_presets() -> dict[str, list[str]]:
        return {"presets": list(PRESETS.keys())}

    @router.get("/emoji")
    def list_emoji() -> dict[str, dict[str, str]]:
        return {"emoji": {k: _summarize(v) for k, v in EMOJI_COMMANDS.items()}}

    return router


def build_rest_router(hub: Hub, auth: AuthChecker) -> APIRouter:  # noqa: C901
    dep = build_rest_auth_dep(auth)
    router = APIRouter(prefix="/api", dependencies=[Depends(dep)])

    @router.get("/devices")
    def list_devices() -> dict[str, list[WledDevice]]:
        return {"devices": hub.all_devices()}

    @router.get("/devices/{mac}")
    def get_device(mac: str) -> WledDevice:
        device = hub.find_device(mac)
        if device is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        return device

    @router.get("/devices/{mac}/state")
    async def get_state(mac: str) -> dict:
        if hub.find_device(mac) is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        try:
            state = await hub.get_state(mac)
        except NoWranglerForDeviceError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except WranglerTimeoutError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc
        return {"state": state}

    @router.post("/devices/{mac}/commands")
    async def post_command(mac: str, command: Command) -> PushResult:
        if hub.find_device(mac) is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        try:
            return await hub.send_command(mac, command)
        except NoWranglerForDeviceError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except WranglerTimeoutError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @router.put("/devices/{mac}/name")
    async def put_name(mac: str, body: _RenameBody) -> WledDevice:
        if hub.find_device(mac) is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        try:
            return await hub.send_rename(mac, body.name)
        except NoWranglerForDeviceError as exc:
            raise HTTPException(status_code=404, detail=str(exc)) from exc
        except WranglerTimeoutError as exc:
            raise HTTPException(status_code=502, detail=str(exc)) from exc

    @router.post("/scan")
    async def run_scan() -> dict[str, list[WledDevice]]:
        devices = await hub.rescan_all()
        return {"devices": devices}

    @router.get("/wranglers")
    def wranglers() -> list[dict]:
        return hub.wranglers_summary()

    return router
