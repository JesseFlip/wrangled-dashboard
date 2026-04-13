"""Translate a Command into WLED /json/state bodies and POST them."""

from __future__ import annotations

from wrangled_contracts import (
    EFFECT_FX_ID,
    RGB,
    BrightnessCommand,
    ColorCommand,
    EffectCommand,
    PowerCommand,
    TextCommand,
)


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
