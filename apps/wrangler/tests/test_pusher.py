"""Tests for wrangler.pusher."""

from __future__ import annotations

from datetime import UTC, datetime
from ipaddress import IPv4Address

import httpx
import pytest
import respx
from wrangled_contracts import (
    RGB,
    BrightnessCommand,
    ColorCommand,
    EffectCommand,
    PowerCommand,
    TextCommand,
    WledDevice,
)

from wrangler.pusher import (
    PushResult,
    _build_brightness,
    _build_color,
    _build_effect,
    _build_power,
    _build_text,
    push_command,
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


def _fake_device(ip: str = "10.0.6.207") -> WledDevice:
    return WledDevice(
        ip=IPv4Address(ip),
        name="WLED-Matrix",
        mac="aa:bb:cc:dd:ee:ff",
        version="0.15.0",
        led_count=256,
        matrix=None,
        udp_port=21324,
        raw_info={},
        discovered_via="mdns",
        discovered_at=datetime.now(tz=UTC),
    )


@pytest.mark.asyncio
@respx.mock
async def test_push_color_happy_path() -> None:
    route = respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(200, json={"success": True}),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(
            client,
            _fake_device(),
            ColorCommand(color=RGB(r=10, g=20, b=30), brightness=100),
        )
    assert result == PushResult(ok=True, status=200)
    assert route.called


@pytest.mark.asyncio
@respx.mock
async def test_push_brightness_happy_path() -> None:
    route = respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(200, json={"success": True}),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(client, _fake_device(), BrightnessCommand(brightness=50))
    assert result.ok is True
    assert route.calls.last.request.read() == b'{"bri": 50}'


@pytest.mark.asyncio
@respx.mock
async def test_push_power_off_happy_path() -> None:
    route = respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(200, json={"success": True}),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(client, _fake_device(), PowerCommand(on=False))
    assert result.ok is True
    assert route.calls.last.request.read() == b'{"on": false}'


@pytest.mark.asyncio
@respx.mock
async def test_push_effect_happy_path() -> None:
    respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(200, json={"success": True}),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(
            client,
            _fake_device(),
            EffectCommand(name="fire", speed=200),
        )
    assert result.ok is True


@pytest.mark.asyncio
@respx.mock
async def test_push_text_happy_path() -> None:
    respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(200, json={"success": True}),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(
            client,
            _fake_device(),
            TextCommand(text="hi", color=RGB(r=0, g=0, b=255)),
        )
    assert result.ok is True


@pytest.mark.asyncio
@respx.mock
async def test_push_returns_error_on_timeout() -> None:
    respx.post("http://10.0.6.207/json/state").mock(side_effect=httpx.ReadTimeout)
    async with httpx.AsyncClient() as client:
        result = await push_command(
            client,
            _fake_device(),
            ColorCommand(color=RGB(r=0, g=0, b=0)),
        )
    assert result.ok is False
    assert result.status is None
    assert result.error
    assert "timeout" in result.error.lower()


@pytest.mark.asyncio
@respx.mock
async def test_push_returns_error_on_non_200() -> None:
    respx.post("http://10.0.6.207/json/state").mock(
        return_value=httpx.Response(500, text="oops"),
    )
    async with httpx.AsyncClient() as client:
        result = await push_command(
            client,
            _fake_device(),
            ColorCommand(color=RGB(r=0, g=0, b=0)),
        )
    assert result.ok is False
    assert result.status == 500
