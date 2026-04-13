"""Tests for metadata endpoints."""

from __future__ import annotations

from fastapi.testclient import TestClient

from wrangler.server import create_app


def test_get_effects_returns_curated_list() -> None:
    client = TestClient(create_app(initial_scan=False))
    response = client.get("/api/effects")
    assert response.status_code == 200
    data = response.json()
    expected = {
        "solid",
        "breathe",
        "rainbow",
        "fire",
        "sparkle",
        "fireworks",
        "matrix",
        "pride",
        "chase",
        "noise",
    }
    assert set(data["effects"]) == expected


def test_get_presets_returns_three() -> None:
    client = TestClient(create_app(initial_scan=False))
    response = client.get("/api/presets")
    assert response.status_code == 200
    assert set(response.json()["presets"]) == {"pytexas", "party", "chill"}


def test_get_emoji_returns_mapping() -> None:
    client = TestClient(create_app(initial_scan=False))
    response = client.get("/api/emoji")
    assert response.status_code == 200
    data = response.json()["emoji"]
    assert data["🔥"] == "fire"
    assert data["🌈"] == "rainbow"
    assert data["💙"] == "color(0,0,255)"
    assert data["🖤"] == "power(off)"
