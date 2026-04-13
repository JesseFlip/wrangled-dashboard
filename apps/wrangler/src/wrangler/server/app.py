"""FastAPI app factory for the wrangler agent."""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles


def create_app(
    *,
    initial_scan: bool = True,
) -> FastAPI:
    """Build the wrangler FastAPI application."""
    app = FastAPI(title="wrangler", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/healthz")
    def healthz() -> dict[str, bool]:
        return {"ok": True}

    static_dir = Path(__file__).resolve().parents[3] / "static" / "wrangler-ui"
    if static_dir.is_dir():
        app.mount(
            "/",
            StaticFiles(directory=static_dir, html=True),
            name="wrangler-ui",
        )

    _ = initial_scan  # wired up in Task 4
    return app
