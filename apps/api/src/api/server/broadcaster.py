"""Broadcaster for Pythoneer Wrangler 2.0.
Handles real-time synchronization of telemetry and commands across all connected dashboard clients.
"""

import asyncio
import json
import logging
from typing import Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class DashboardBroadcaster:
    """The 'Brain' agent's output. Manages WebSocket connections for dashboards."""
    
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.telemetry_data: dict[str, Any] = {
            "fps": 60.0,
            "latency_ms": 15,
            "power_draw_watts": 0.0,
            "temp_c": 42.0
        }

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send initial state
        await self.broadcast_telemetry()

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast_json(self, message: dict):
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to client: {e}")
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_telemetry(self):
        """Broadcasts current telemetry data to all clients."""
        await self.broadcast_json({
            "type": "telemetry",
            "data": self.telemetry_data
        })

    async def update_telemetry(self, key: str, value: Any):
        """Updates a telemetry value and broadcasts if changed."""
        if self.telemetry_data.get(key) != value:
            self.telemetry_data[key] = value
            await self.broadcast_telemetry()

    async def broadcast_log(self, level: str, message: str):
        """Sends a log message to the dashboard consoles."""
        await self.broadcast_json({
            "type": "log",
            "level": level,
            "message": message
        })

# Global instance for the app
broadcaster = DashboardBroadcaster()
