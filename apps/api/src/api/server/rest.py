"""REST routes for external callers."""

from __future__ import annotations

from typing import TYPE_CHECKING

from fastapi import APIRouter, Depends, HTTPException
from wrangled_contracts import Command, PushResult, WledDevice  # noqa: TC002

from api.server.auth import build_rest_auth_dep
from api.server.hub import (
    NoWranglerForDeviceError,
    WranglerTimeoutError,
)

if TYPE_CHECKING:
    from api.server.auth import AuthChecker
    from api.server.hub import Hub


def build_rest_router(hub: Hub, auth: AuthChecker) -> APIRouter:
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

    @router.post("/scan")
    async def run_scan() -> dict[str, list[WledDevice]]:
        devices = await hub.rescan_all()
        return {"devices": devices}

    @router.get("/wranglers")
    def wranglers() -> list[dict]:
        return hub.wranglers_summary()

    return router
