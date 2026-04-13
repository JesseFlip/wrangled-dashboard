"""Tests for wrangler.server.app."""

from __future__ import annotations

from fastapi.testclient import TestClient

from wrangler.server import create_app


def test_healthz_returns_ok() -> None:
    app = create_app(initial_scan=False)
    client = TestClient(app)
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_static_mount_absent_returns_404_at_root() -> None:
    app = create_app(initial_scan=False)
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 404
