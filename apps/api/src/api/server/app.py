"""FastAPI app factory for the wrangled api."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import __version__
from api.server.auth import AuthChecker
from api.server.hub import Hub
from api.server.rest import build_rest_router
from api.server.ws import build_ws_router


def create_app(*, auth_token: str | None = None) -> FastAPI:
    """Build the wrangled api application."""
    app = FastAPI(title="wrangled-api", version=__version__)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    checker = AuthChecker(auth_token)
    hub = Hub()
    app.state.auth_checker = checker
    app.state.hub = hub

    @app.get("/healthz")
    def healthz() -> dict[str, object]:
        return {"ok": True, "wranglers": len(hub.wranglers_summary())}

    app.include_router(build_ws_router(hub, checker))
    app.include_router(build_rest_router(hub, checker))

    static_dir = Path(__file__).resolve().parents[3] / "static" / "dashboard"
    if static_dir.is_dir():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="dashboard")

    return app
