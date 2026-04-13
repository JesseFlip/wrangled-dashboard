"""Tests for the devices/scan endpoints in wrangler.server.devices."""

from __future__ import annotations

from datetime import UTC, datetime
from ipaddress import IPv4Address
from unittest.mock import AsyncMock

import pytest
from fastapi.testclient import TestClient
from wrangled_contracts import WledDevice

from wrangler.server import create_app
from wrangler.server.registry import Registry


def _dev(mac: str = "aa:bb:cc:dd:ee:ff", ip: str = "10.0.6.207") -> WledDevice:
    return WledDevice(
        ip=IPv4Address(ip),
        name="WLED-Matrix",
        mac=mac,
        version="0.15.0",
        led_count=256,
        matrix=None,
        udp_port=21324,
        raw_info={},
        discovered_via="mdns",
        discovered_at=datetime.now(tz=UTC),
    )


@pytest.fixture
def registry_with_one() -> Registry:
    r = Registry(scanner=AsyncMock(return_value=[_dev()]))
    r.put(_dev())
    return r


@pytest.fixture
def app_with_registry(registry_with_one: Registry):
    return create_app(initial_scan=False, registry=registry_with_one)


# --- Task 4: list / get / scan ---


def test_get_devices_returns_list(app_with_registry) -> None:
    client = TestClient(app_with_registry)
    response = client.get("/api/devices")
    assert response.status_code == 200
    data = response.json()
    assert len(data["devices"]) == 1
    assert data["devices"][0]["mac"] == "aa:bb:cc:dd:ee:ff"


def test_get_device_by_mac_returns_device(app_with_registry) -> None:
    client = TestClient(app_with_registry)
    response = client.get("/api/devices/aa:bb:cc:dd:ee:ff")
    assert response.status_code == 200
    assert response.json()["mac"] == "aa:bb:cc:dd:ee:ff"


def test_get_device_by_mac_404(app_with_registry) -> None:
    client = TestClient(app_with_registry)
    response = client.get("/api/devices/zz:zz:zz:zz:zz:zz")
    assert response.status_code == 404


def test_post_scan_invokes_registry_scan() -> None:
    scanner = AsyncMock(return_value=[_dev("11:22:33:44:55:66", "10.0.6.10")])
    registry = Registry(scanner=scanner)
    app = create_app(initial_scan=False, registry=registry)
    client = TestClient(app)
    response = client.post("/api/scan")
    assert response.status_code == 200
    data = response.json()
    assert len(data["devices"]) == 1
    assert data["devices"][0]["mac"] == "11:22:33:44:55:66"
    scanner.assert_awaited_once()
