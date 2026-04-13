# apps/api — FastAPI Hub

## Status
**Not yet implemented.** Placeholder for milestone 1.

## Intended purpose
FastAPI process that:
- Serves `apps/dashboard/dist/` as static files on `/`.
- Exposes REST under `/api/*`.
- Exposes a WebSocket hub under `/ws` for dashboard browsers and `wrangler` agents.
- Starts a `discord.py` gateway task if `DISCORD_BOT_TOKEN` is set.

## Port
8500.

## Downstream
- Consumes Commands from Discord / dashboard.
- Pushes Commands to `wrangler` over WebSocket.
