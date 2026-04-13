"""Translate a Command into WLED /json/state bodies and POST them."""

from __future__ import annotations

import json
import logging

import httpx
from pydantic import BaseModel
from wrangled_contracts import (
    EFFECT_FX_ID,
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
        "seg": [{"fx": 0, "col": _rgb_triplet(cmd.color)}],
    }
    if cmd.brightness is not None:
        body["bri"] = cmd.brightness
    return body


def _build_brightness(cmd: BrightnessCommand) -> dict:
    return {"bri": cmd.brightness}


def _build_power(cmd: PowerCommand) -> dict:
    return {"on": cmd.on}


def _build_effect(cmd: EffectCommand) -> dict:
    seg: dict = {"fx": EFFECT_FX_ID[cmd.name]}
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
    match command:
        case ColorCommand():
            body = _build_color(command)
        case BrightnessCommand():
            body = _build_brightness(command)
        case EffectCommand():
            body = _build_effect(command)
        case TextCommand():
            body = _build_text(command)
        case PowerCommand():
            body = _build_power(command)
        case PresetCommand():
            return PushResult(ok=False, error="PresetCommand not yet supported")
    return await _post_one(client, device, body, timeout=timeout)
