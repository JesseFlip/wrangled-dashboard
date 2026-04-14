"""Tests for GET /api/effects, /api/presets, /api/emoji metadata endpoints."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from api.server import create_app


@pytest.fixture
def client() -> TestClient:
    return TestClient(create_app())


def test_effects_returns_10(client: TestClient) -> None:
    response = client.get("/api/effects")
    assert response.status_code == 200
    data = response.json()
    assert "effects" in data
    assert len(data["effects"]) == 10


def test_presets_returns_3(client: TestClient) -> None:
    response = client.get("/api/presets")
    assert response.status_code == 200
    data = response.json()
    assert "presets" in data
    assert len(data["presets"]) == 3


def test_emoji_has_fire(client: TestClient) -> None:
    response = client.get("/api/emoji")
    assert response.status_code == 200
    data = response.json()
    assert "emoji" in data
    assert "🔥" in data["emoji"]
    assert data["emoji"]["🔥"] == "fire"
