"""Tests for wrangled_contracts.commands."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from wrangled_contracts import RGB


def test_rgb_accepts_valid_ints() -> None:
    assert RGB(r=1, g=2, b=3).model_dump() == {"r": 1, "g": 2, "b": 3}


@pytest.mark.parametrize("bad", [-1, 256, 1000])
def test_rgb_rejects_out_of_range(bad: int) -> None:
    with pytest.raises(ValidationError):
        RGB(r=bad, g=0, b=0)


def test_rgb_parse_passes_through_rgb() -> None:
    base = RGB(r=10, g=20, b=30)
    assert RGB.parse(base) == base


def test_rgb_parse_accepts_tuple() -> None:
    assert RGB.parse((255, 0, 170)) == RGB(r=255, g=0, b=170)


@pytest.mark.parametrize(
    ("value", "expected"),
    [
        ("#ff00aa", RGB(r=255, g=0, b=170)),
        ("ff00aa", RGB(r=255, g=0, b=170)),
        ("#FFF", RGB(r=255, g=255, b=255)),
        ("FFF", RGB(r=255, g=255, b=255)),
    ],
)
def test_rgb_parse_hex(value: str, expected: RGB) -> None:
    assert RGB.parse(value) == expected


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("red", RGB(r=255, g=0, b=0)),
        ("blue", RGB(r=0, g=0, b=255)),
        ("orange", RGB(r=255, g=100, b=0)),
        ("RED", RGB(r=255, g=0, b=0)),
        ("  green  ", RGB(r=0, g=200, b=0)),
    ],
)
def test_rgb_parse_named(name: str, expected: RGB) -> None:
    assert RGB.parse(name) == expected


@pytest.mark.parametrize(
    ("emoji", "expected"),
    [
        ("🔴", RGB(r=255, g=0, b=0)),
        ("🟢", RGB(r=0, g=200, b=0)),
        ("🔵", RGB(r=0, g=0, b=255)),
        ("🟠", RGB(r=255, g=100, b=0)),
    ],
)
def test_rgb_parse_color_emoji(emoji: str, expected: RGB) -> None:
    assert RGB.parse(emoji) == expected


@pytest.mark.parametrize("bad", ["", "notacolor", "#gg0000", "#12345", "rgb(1,2,3)"])
def test_rgb_parse_rejects_garbage(bad: str) -> None:
    with pytest.raises(ValueError, match="cannot parse"):
        RGB.parse(bad)


def test_rgb_parse_rejects_out_of_range_tuple() -> None:
    with pytest.raises(ValueError, match="cannot parse"):
        RGB.parse((300, 0, 0))
