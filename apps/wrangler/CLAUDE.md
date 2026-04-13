# apps/wrangler — Pi Agent

## Purpose
Runs on the Raspberry Pi. Responsible for:
- Discovering WLEDs on the LAN (mDNS + sweep).
- Holding a WebSocket connection out to `apps/api` (future milestone).
- Pushing commands to WLEDs via their HTTP JSON API (future milestone).
- Serving `apps/wrangler-ui/dist/` as a local config panel (future milestone).

**Milestone 1 scope:** scanner only (discovery + CLI).

## Run locally

    cd apps/wrangler
    uv sync
    uv run wrangler scan             # mDNS-first with sweep fallback
    uv run wrangler scan --sweep     # force sweep in addition to mDNS
    uv run wrangler scan --no-mdns   # sweep only
    uv run wrangler scan --json      # JSON output

## Test

    uv run pytest                    # unit tests
    uv run pytest -m live            # opt-in live test against 10.0.6.207

## Key modules
- `scanner/mdns.py` — zeroconf-based discovery
- `scanner/sweep.py` — concurrent HTTP probe across a subnet
- `scanner/probe.py` — parses `/json/info` into a `WledDevice`
- `scanner/netinfo.py` — detects the local `/24`
- `scanner/__init__.py` — public `scan(opts)` orchestrator
- `cli.py` — argparse CLI

## Gotchas
- Some networks block mDNS. The scanner falls back to sweep when mDNS returns zero candidates.
- The probe timeout is 2s per device; 32-way concurrency by default.
