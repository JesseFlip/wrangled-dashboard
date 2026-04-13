"""Opt-in live test hitting a real WLED on the LAN.

Run with: `uv run pytest -m live`
Skipped by default (see pytest addopts in pyproject.toml).
"""

from __future__ import annotations

import pytest

from wrangler.scanner import ScanOptions, scan

LIVE_IP = "10.0.6.207"


@pytest.mark.live
@pytest.mark.asyncio
async def test_live_scan_finds_known_device() -> None:
    devices = await scan(ScanOptions(mdns_timeout=3.0))
    found = [d for d in devices if str(d.ip) == LIVE_IP]
    assert found, (
        f"expected to find WLED at {LIVE_IP}; found instead: {[str(d.ip) for d in devices]}"
    )
    device = found[0]
    assert device.mac
    assert device.led_count > 0
