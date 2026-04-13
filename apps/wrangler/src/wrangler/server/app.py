"""FastAPI app factory for the wrangler agent."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from wrangler.scanner import ScanOptions, scan
from wrangler.server.devices import build_devices_router
from wrangler.server.metadata import build_metadata_router
from wrangler.server.registry import Registry


def create_app(
    *,
    initial_scan: bool = True,
    registry: Registry | None = None,
    scan_options: ScanOptions | None = None,
) -> FastAPI:
    """Build the wrangler FastAPI application.

    Args:
        initial_scan: if True, run a single scan on startup.
        registry: inject a pre-built Registry (tests). If None, a default one
            backed by `wrangler.scanner.scan` is constructed.
        scan_options: passed to the initial scan.
    """
    app = FastAPI(title="wrangler", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    reg = registry if registry is not None else Registry(scanner=scan)
    opts = scan_options or ScanOptions(mdns_timeout=2.0)

    @app.get("/healthz")
    def healthz() -> dict[str, bool]:
        return {"ok": True}

    app.include_router(build_devices_router(reg))
    app.include_router(build_metadata_router())

    if initial_scan:

        @app.on_event("startup")
        async def _initial_scan() -> None:
            await reg.scan(opts)

    static_dir = Path(__file__).resolve().parents[3] / "static" / "wrangler-ui"
    if static_dir.is_dir():
        app.mount(
            "/",
            StaticFiles(directory=static_dir, html=True),
            name="wrangler-ui",
        )

    return app
