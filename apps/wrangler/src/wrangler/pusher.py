"""Translate a Command into WLED /json/state bodies and POST them."""

from __future__ import annotations

import json
import logging

import httpx
from pydantic import BaseModel
from wrangled_contracts import (
    EFFECT_FX_ID,
    PRESETS,
    RGB,
    BrightnessCommand,
    ColorCommand,
    Command,
    EffectCommand,
    PowerCommand,
    PresetCommand,
    TextCommand,
    WledDevice,
)

logger = logging.getLogger(__name__)


def _rgb_triplet(color: RGB) -> list[list[int]]:
    return [[color.r, color.g, color.b], [0, 0, 0], [0, 0, 0]]


def _build_color(cmd: ColorCommand) -> dict:
    body: dict = {
        "on": True,
        "seg": [{"id": 0, "fx": 0, "col": _rgb_triplet(cmd.color)}],
    }
    if cmd.brightness is not None:
        body["bri"] = cmd.brightness
    return body


def _build_brightness(cmd: BrightnessCommand) -> dict:
    return {"bri": cmd.brightness}


def _build_power(cmd: PowerCommand) -> dict:
    return {"on": cmd.on}


def _build_effect(cmd: EffectCommand) -> dict:
    # m12=1 ("bar" expansion) makes 1D effects fill the full matrix height.
    # No-op for effects that are already 2D-native.
    seg: dict = {"id": 0, "fx": EFFECT_FX_ID[cmd.name], "m12": 1}
    if cmd.speed is not None:
        seg["sx"] = cmd.speed
    if cmd.intensity is not None:
        seg["ix"] = cmd.intensity
    if cmd.color is not None:
        seg["col"] = _rgb_triplet(cmd.color)
    body: dict = {"on": True, "seg": [seg]}
    if cmd.brightness is not None:
        body["bri"] = cmd.brightness
    return body


def _build_text(cmd: TextCommand) -> dict:
    seg: dict = {
        "id": 0,
        "fx": 122,
        "n": cmd.text,
        "sx": cmd.speed,
        "ix": 128,
        "o1": False,
    }
    if cmd.color is not None:
        seg["col"] = _rgb_triplet(cmd.color)
    body: dict = {"on": True, "seg": [seg]}
    if cmd.brightness is not None:
        body["bri"] = cmd.brightness
    return body


def _build_command_body(command: Command) -> dict:
    """Build a single WLED body for any non-preset Command."""
    match command:
        case ColorCommand():
            return _build_color(command)
        case BrightnessCommand():
            return _build_brightness(command)
        case EffectCommand():
            return _build_effect(command)
        case TextCommand():
            return _build_text(command)
        case PowerCommand():
            return _build_power(command)
        case PresetCommand():
            msg = "cannot build a single body from a PresetCommand"
            raise ValueError(msg)


def _build_preset_bodies(cmd: PresetCommand) -> list[dict]:
    """Expand a PresetCommand into a list of WLED bodies."""
    return [_build_command_body(sub) for sub in PRESETS[cmd.name]]


class PushResult(BaseModel):
    """Outcome of a push_command call."""

    ok: bool
    status: int | None = None
    error: str | None = None


async def _post_one(
    client: httpx.AsyncClient,
    device: WledDevice,
    body: dict,
    *,
    timeout: float,  # noqa: ASYNC109
) -> PushResult:
    url = f"http://{device.ip}/json/state"
    try:
        response = await client.post(
            url,
            content=json.dumps(body).encode(),
            headers={"content-type": "application/json"},
            timeout=timeout,
        )
    except httpx.TimeoutException as exc:
        logger.debug("push %s: timeout: %s", device.ip, exc)
        return PushResult(ok=False, error=f"timeout: {exc}")
    except httpx.HTTPError as exc:
        logger.debug("push %s: transport error: %s", device.ip, exc)
        return PushResult(ok=False, error=str(exc))

    if response.status_code != httpx.codes.OK:
        return PushResult(ok=False, status=response.status_code, error=response.text[:200])
    return PushResult(ok=True, status=response.status_code)


async def push_command(
    client: httpx.AsyncClient,
    device: WledDevice,
    command: Command,
    *,
    timeout: float = 2.0,  # noqa: ASYNC109
) -> PushResult:
    """Send a Command to a WLED device. Never raises."""
    if isinstance(command, PresetCommand):
        bodies = _build_preset_bodies(command)
    else:
        bodies = [_build_command_body(command)]

    last: PushResult = PushResult(ok=True, status=200)
    for body in bodies:
        last = await _post_one(client, device, body, timeout=timeout)
        if not last.ok:
            return last
    return last
