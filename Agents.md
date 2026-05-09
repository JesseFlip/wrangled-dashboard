# Agent Roles: Pythoneer Wrangler Build

## 1. Hardware_Orchestrator (The "Pulse")
- **Responsibility:** Manages the low-level GPIO/SPI interface. 
- **Focus:** Animation math, color space conversion (RGB to GRB), and framerate stability.
- **Output:** `hardware_bridge.py` (The abstraction layer for LED strips).

## 2. Backend_Architect (The "Brain")
- **Responsibility:** FastAPI server construction and WebSocket state management.
- **Focus:** Handling the "Command Queue," state persistence, and mDNS broadcasting.
- **Output:** `main.py`, `schemas.py`, and `connection_manager.py`.

## 3. Frontend_Specialist (The "Face")
- **Responsibility:** Responsive Tailwind CSS UI and React/Vue components.
- **Focus:** Real-time telemetry charts (Chart.js) and mobile-responsive button grids.
- **Output:** `index.html`, `app.js`, and styling assets.

## 4. Chaos_Monkey (The "Safety")
- **Responsibility:** Unit testing and stress testing the WebSocket connections.
- **Focus:** Validating the "Emergency Off" logic and preventing buffer overflows from text inputs.
- **Output:** `test_suite.py` and hardware limit-testing logs.

## 5. Safety_Moderator (The "Shield")
- **Responsibility:** Content filtering and audience rate-limiting.
- **Focus:** Profanity filtering, duplicate detection, and enforcing the 5-second cooldown.
- **Output:** `moderator.py` (Middleware/Service).

## Handoff Protocol
1. **Hardware_Orchestrator** defines the JSON schema for animations.
2. **Backend_Architect** implements the API endpoints based on that schema.
3. **Frontend_Specialist** binds UI components to the API.
4. **Safety_Moderator** filters and rate-limits the incoming command stream.
5. **Chaos_Monkey** attempts to break the loop and reports latency spikes.
