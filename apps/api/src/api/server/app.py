"""FastAPI app factory for the wrangled api."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import __version__
from api.server.auth import AuthChecker


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
    app.state.auth_checker = checker

    @app.get("/healthz")
    def healthz() -> dict[str, object]:
        return {"ok": True, "wranglers": 0}

    static_dir = Path(__file__).resolve().parents[3] / "static" / "dashboard"
    if static_dir.is_dir():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="dashboard")

    return app
