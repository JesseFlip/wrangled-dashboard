"""In-memory registry of discovered WLED devices, with serialized scans."""

from __future__ import annotations

import asyncio
from collections.abc import Awaitable, Callable

from wrangled_contracts import WledDevice

from wrangler.scanner import ScanOptions

ScanFn = Callable[[ScanOptions], Awaitable[list[WledDevice]]]


class Registry:
    """Tracks the most recent scan result, keyed by MAC."""

    def __init__(self, *, scanner: ScanFn) -> None:
        self._scanner = scanner
        self._devices: dict[str, WledDevice] = {}
        self._lock = asyncio.Lock()

    def all(self) -> list[WledDevice]:
        """Return all known devices, sorted by IP."""
        return sorted(self._devices.values(), key=lambda d: int(d.ip))

    def get(self, mac: str) -> WledDevice | None:
        return self._devices.get(mac)

    def put(self, device: WledDevice) -> None:
        """Replace (or add) a single device in-place."""
        self._devices[device.mac] = device

    async def scan(self, opts: ScanOptions) -> list[WledDevice]:
        """Run a fresh scan; replace the full registry with the results.

        For each discovered device, the original ``discovered_at`` timestamp is
        preserved when the MAC was already known — this keeps the value stable
        across back-to-back scans of the same set of devices.
        """
        async with self._lock:
            discovered = await self._scanner(opts)
            new_map: dict[str, WledDevice] = {}
            for d in discovered:
                if d.mac in self._devices:
                    # Preserve the original discovery timestamp.
                    d.discovered_at = self._devices[d.mac].discovered_at
                new_map[d.mac] = d
            self._devices = new_map
            return self.all()
