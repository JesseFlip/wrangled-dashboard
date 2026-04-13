"""Wrangler command-line interface."""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from collections.abc import Sequence  # noqa: TC003
from ipaddress import IPv4Network

from wrangled_contracts import WledDevice  # noqa: TC002

from wrangler.scanner import ScanOptions, scan


def _build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="wrangler", description="WrangLED Pi-side agent.")
    sub = parser.add_subparsers(dest="command", required=True)

    scan_parser = sub.add_parser("scan", help="Discover WLEDs on the LAN.")
    scan_parser.add_argument(
        "--sweep",
        action="store_true",
        help="Force IP-range sweep in addition to mDNS.",
    )
    scan_parser.add_argument(
        "--no-mdns",
        dest="use_mdns",
        action="store_false",
        help="Skip mDNS; sweep only.",
    )
    scan_parser.add_argument(
        "--subnet",
        type=IPv4Network,
        default=None,
        help="Override subnet to sweep (e.g. 10.0.6.0/24).",
    )
    scan_parser.add_argument(
        "--timeout",
        type=float,
        default=2.0,
        help="Per-host probe timeout seconds (default: 2.0).",
    )
    scan_parser.add_argument(
        "--mdns-timeout",
        type=float,
        default=3.0,
        help="mDNS listen duration (default: 3.0).",
    )
    scan_parser.add_argument(
        "--concurrency",
        type=int,
        default=32,
        help="Max concurrent probes during sweep (default: 32).",
    )
    scan_parser.add_argument(
        "--json",
        dest="as_json",
        action="store_true",
        help="Emit results as JSON instead of a table.",
    )
    return parser


def _opts_from_args(args: argparse.Namespace) -> ScanOptions:
    return ScanOptions(
        use_mdns=args.use_mdns,
        mdns_timeout=args.mdns_timeout,
        sweep=True if args.sweep else None,
        sweep_subnet=args.subnet,
        probe_timeout=args.timeout,
        probe_concurrency=args.concurrency,
    )


def _print_table(devices: list[WledDevice]) -> None:
    if not devices:
        print("0 devices found.")
        return
    header = (
        f"{'IP':<15} {'NAME':<20} {'MAC':<18} {'VER':<10} {'LEDS':>5}  {'MATRIX':<7} {'VIA':<6}"
    )
    print(header)
    for d in devices:
        matrix = f"{d.matrix.width}x{d.matrix.height}" if d.matrix else "-"
        print(
            f"{d.ip!s:<15} {d.name[:20]:<20} {d.mac:<18} {d.version:<10} "
            f"{d.led_count:>5}  {matrix:<7} {d.discovered_via:<6}",
        )
    print(f"\n{len(devices)} device{'s' if len(devices) != 1 else ''}.")


def _print_json(devices: list[WledDevice]) -> None:
    payload = [d.model_dump(mode="json") for d in devices]
    print(json.dumps(payload, indent=2))


async def _run_scan(opts: ScanOptions, *, as_json: bool) -> int:
    devices = await scan(opts)
    if as_json:
        _print_json(devices)
    else:
        _print_table(devices)
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    args = _build_parser().parse_args(argv)
    if args.command == "scan":
        return asyncio.run(_run_scan(_opts_from_args(args), as_json=args.as_json))
    return 1


if __name__ == "__main__":  # pragma: no cover
    sys.exit(main())
