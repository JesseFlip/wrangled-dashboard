"""Devices + scan routes."""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException
from wrangled_contracts import Command, WledDevice  # noqa: TC002

from wrangler.pusher import PushResult, push_command
from wrangler.scanner import ScanOptions
from wrangler.server.registry import Registry  # noqa: TC001
from wrangler.server.wled_client import WledUnreachableError, fetch_state


def build_devices_router(registry: Registry) -> APIRouter:
    router = APIRouter(prefix="/api")

    @router.get("/devices")
    def list_devices() -> dict[str, list[WledDevice]]:
        return {"devices": registry.all()}

    @router.get("/devices/{mac}")
    def get_device(mac: str) -> WledDevice:
        device = registry.get(mac)
        if device is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        return device

    @router.post("/scan")
    async def run_scan() -> dict[str, list[WledDevice]]:
        devices = await registry.scan(ScanOptions(mdns_timeout=2.0))
        return {"devices": devices}

    @router.get("/devices/{mac}/state")
    async def get_state(mac: str) -> dict:
        device = registry.get(mac)
        if device is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        async with httpx.AsyncClient() as client:
            try:
                return await fetch_state(client, device)
            except WledUnreachableError as exc:
                raise HTTPException(status_code=502, detail=str(exc)) from exc

    @router.post("/devices/{mac}/commands")
    async def post_command(mac: str, command: Command) -> PushResult:
        device = registry.get(mac)
        if device is None:
            raise HTTPException(status_code=404, detail=f"unknown device: {mac}")
        async with httpx.AsyncClient() as client:
            return await push_command(client, device, command)

    return router
