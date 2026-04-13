"""Tests for wrangler.pusher."""

from __future__ import annotations

from wrangled_contracts import (
    RGB,
    BrightnessCommand,
    ColorCommand,
    EffectCommand,
    PowerCommand,
    TextCommand,
)

from wrangler.pusher import (
    _build_brightness,
    _build_color,
    _build_effect,
    _build_power,
    _build_text,
)


def test_build_color_includes_brightness_when_set() -> None:
    body = _build_color(ColorCommand(color=RGB(r=10, g=20, b=30), brightness=100))
    assert body == {
        "on": True,
        "bri": 100,
        "seg": [{"fx": 0, "col": [[10, 20, 30], [0, 0, 0], [0, 0, 0]]}],
    }


def test_build_color_omits_brightness_when_absent() -> None:
    body = _build_color(ColorCommand(color=RGB(r=1, g=2, b=3)))
    assert "bri" not in body
    assert body["on"] is True
    assert body["seg"][0]["fx"] == 0
    assert body["seg"][0]["col"] == [[1, 2, 3], [0, 0, 0], [0, 0, 0]]


def test_build_brightness_is_bri_only() -> None:
    assert _build_brightness(BrightnessCommand(brightness=50)) == {"bri": 50}


def test_build_power_on() -> None:
    assert _build_power(PowerCommand(on=True)) == {"on": True}


def test_build_power_off() -> None:
    assert _build_power(PowerCommand(on=False)) == {"on": False}


def test_build_effect_minimal() -> None:
    body = _build_effect(EffectCommand(name="fire"))
    assert body == {"on": True, "seg": [{"fx": 66}]}


def test_build_effect_full() -> None:
    body = _build_effect(
        EffectCommand(
            name="rainbow",
            color=RGB(r=0, g=0, b=255),
            speed=200,
            intensity=150,
            brightness=180,
        ),
    )
    assert body["on"] is True
    assert body["bri"] == 180
    seg = body["seg"][0]
    assert seg["fx"] == 9  # rainbow
    assert seg["sx"] == 200
    assert seg["ix"] == 150
    assert seg["col"] == [[0, 0, 255], [0, 0, 0], [0, 0, 0]]


def test_build_text_uses_fx_122_and_segment_name() -> None:
    body = _build_text(
        TextCommand(text="Hello", color=RGB(r=0, g=0, b=255), speed=160, brightness=150),
    )
    seg = body["seg"][0]
    assert body["on"] is True
    assert body["bri"] == 150
    assert seg["fx"] == 122
    assert seg["n"] == "Hello"
    assert seg["sx"] == 160
    assert seg["o1"] is False
    assert seg["col"] == [[0, 0, 255], [0, 0, 0], [0, 0, 0]]


def test_build_text_without_color_omits_col() -> None:
    body = _build_text(TextCommand(text="hi"))
    seg = body["seg"][0]
    assert "col" not in seg
    assert seg["fx"] == 122
    assert seg["n"] == "hi"
