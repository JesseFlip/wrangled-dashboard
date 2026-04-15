"""FastAPI app factory for the wrangled api."""

from __future__ import annotations

import asyncio
import logging
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import __version__
from api.server.auth import AuthChecker
from api.server.hub import Hub
from api.server.rest import build_metadata_router, build_rest_router
from api.server.ws import build_ws_router

logger = logging.getLogger(__name__)


def create_app(
    *,
    auth_token: str | None = None,
    discord_token: str | None = None,
    discord_guild_id: int | None = None,
) -> FastAPI:
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
        return {
            "ok": True,
            "wranglers": len(hub.wranglers_summary()),
            "discord": discord_token is not None,
        }

    app.include_router(build_ws_router(hub, checker))
    app.include_router(build_rest_router(hub, checker))
    app.include_router(build_metadata_router())

    if discord_token:

        @app.on_event("startup")
        async def _start_discord() -> None:
            from api.discord_bot import run_discord_bot  # noqa: PLC0415

            app.state.discord_task = asyncio.create_task(
                run_discord_bot(hub, discord_token, guild_id=discord_guild_id),
            )
            logger.info("discord bot starting (guild_id=%s)", discord_guild_id)

        @app.on_event("shutdown")
        async def _stop_discord() -> None:
            task = getattr(app.state, "discord_task", None)
            if task is not None:
                task.cancel()

    static_dir = Path(__file__).resolve().parents[3] / "static" / "dashboard"
    if static_dir.is_dir():
        app.mount("/", StaticFiles(directory=static_dir, html=True), name="dashboard")

    return app
