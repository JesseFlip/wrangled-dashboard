"""Devices + scan routes."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from wrangled_contracts import WledDevice  # noqa: TC002

from wrangler.scanner import ScanOptions
from wrangler.server.registry import Registry  # noqa: TC001


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

    return router
