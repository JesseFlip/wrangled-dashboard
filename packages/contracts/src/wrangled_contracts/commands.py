"""Command vocabulary for controlling a WLED device end-to-end.

Every user intent (color change, effect, scrolling text, preset, power)
is expressed as a typed Command variant in a discriminated union. The
wrangler pusher consumes these; the api and Discord bot produce them.
"""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field

_NAMED_COLORS: dict[str, tuple[int, int, int]] = {
    "red": (255, 0, 0),
    "green": (0, 200, 0),
    "blue": (0, 0, 255),
    "orange": (255, 100, 0),
    "yellow": (255, 220, 0),
    "cyan": (0, 200, 200),
    "magenta": (255, 0, 180),
    "pink": (255, 120, 180),
    "purple": (180, 0, 255),
    "white": (255, 255, 255),
    "black": (0, 0, 0),
    "teal": (0, 180, 180),
    "brown": (130, 70, 20),
}

_COLOR_EMOJI: dict[str, tuple[int, int, int]] = {
    "🔴": (255, 0, 0),
    "🟢": (0, 200, 0),
    "🔵": (0, 0, 255),
    "🟠": (255, 100, 0),
    "🟡": (255, 220, 0),
    "🟣": (180, 0, 255),
    "⚫": (0, 0, 0),
    "⚪": (255, 255, 255),
    "🟤": (130, 70, 20),
    "🟥": (255, 0, 0),
    "🟩": (0, 200, 0),
    "🟦": (0, 0, 255),
    "🟧": (255, 100, 0),
    "🟨": (255, 220, 0),
    "🟪": (180, 0, 255),
    "🟫": (130, 70, 20),
}


_HEX_SHORT = 3
_HEX_LONG = 6
_CHAN_MAX = 255


def _hex_to_tuple(value: str) -> tuple[int, int, int] | None:
    s = value.lstrip("#")
    if len(s) == _HEX_SHORT and all(c in "0123456789abcdefABCDEF" for c in s):
        return (int(s[0] * 2, 16), int(s[1] * 2, 16), int(s[2] * 2, 16))
    if len(s) == _HEX_LONG and all(c in "0123456789abcdefABCDEF" for c in s):
        return (int(s[0:2], 16), int(s[2:4], 16), int(s[4:6], 16))
    return None


class RGB(BaseModel):
    """An RGB color, each channel 0-255."""

    model_config = ConfigDict(frozen=True)

    r: int = Field(ge=0, le=255)
    g: int = Field(ge=0, le=255)
    b: int = Field(ge=0, le=255)

    @classmethod
    def parse(cls, value: object) -> RGB:
        """Parse any supported color input to RGB.

        Accepted forms:
        - RGB instance (returned as-is)
        - dict with r/g/b keys
        - tuple/list of 3 ints 0-255
        - CSS-style named color ("red", "orange", "magenta"...)
        - Hex string with or without '#', 3 or 6 chars
        - Single color emoji (🔴🟢🔵🟠🟡🟣⚫⚪🟤 and the 🟥 family)

        Raises ValueError on unparseable input.
        """
        if isinstance(value, cls):
            return value
        if isinstance(value, dict):
            return cls.model_validate(value)
        if isinstance(value, (tuple, list)):

            def _valid_chan(v: object) -> bool:
                return isinstance(v, int) and 0 <= v <= _CHAN_MAX

            if len(value) != _HEX_SHORT or not all(_valid_chan(v) for v in value):
                msg = f"cannot parse RGB from tuple: {value!r}"
                raise ValueError(msg)
            r, g, b = value
            return cls(r=r, g=g, b=b)
        if isinstance(value, str):
            stripped = value.strip()
            if not stripped:
                msg = "cannot parse RGB from empty string"
                raise ValueError(msg)
            if stripped in _COLOR_EMOJI:
                r, g, b = _COLOR_EMOJI[stripped]
                return cls(r=r, g=g, b=b)
            lowered = stripped.lower()
            if lowered in _NAMED_COLORS:
                r, g, b = _NAMED_COLORS[lowered]
                return cls(r=r, g=g, b=b)
            hex_parsed = _hex_to_tuple(stripped)
            if hex_parsed is not None:
                r, g, b = hex_parsed
                return cls(r=r, g=g, b=b)
        msg = f"cannot parse RGB from {value!r}"
        raise ValueError(msg)


from typing import Annotated, Literal  # noqa: E402

EffectName = Literal[
    "solid",
    "breathe",
    "rainbow",
    "fire",
    "sparkle",
    "fireworks",
    "matrix",
    "pride",
    "chase",
    "noise",
]

PresetName = Literal["pytexas", "party", "chill"]


class ColorCommand(BaseModel):
    """Set solid color (and optionally brightness)."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["color"] = "color"
    color: RGB
    brightness: int | None = Field(default=None, ge=0, le=200)


class BrightnessCommand(BaseModel):
    """Change brightness only."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["brightness"] = "brightness"
    brightness: int = Field(ge=0, le=200)


class EffectCommand(BaseModel):
    """Run a named effect (optionally with color / speed / intensity / brightness)."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["effect"] = "effect"
    name: EffectName
    color: RGB | None = None
    speed: int | None = Field(default=None, ge=0, le=255)
    intensity: int | None = Field(default=None, ge=0, le=255)
    brightness: int | None = Field(default=None, ge=0, le=200)


class TextCommand(BaseModel):
    """Scroll a short text message across the matrix."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["text"] = "text"
    text: str = Field(max_length=64, min_length=1)
    color: RGB | None = None
    speed: int = Field(default=128, ge=32, le=240)
    brightness: int | None = Field(default=None, ge=0, le=200)


class PresetCommand(BaseModel):
    """Apply a named preset scene (expands to multiple commands)."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["preset"] = "preset"
    name: PresetName


class PowerCommand(BaseModel):
    """Toggle power on/off."""

    model_config = ConfigDict(frozen=True)

    kind: Literal["power"] = "power"
    on: bool


Command = Annotated[
    ColorCommand | BrightnessCommand | EffectCommand | TextCommand | PresetCommand | PowerCommand,
    Field(discriminator="kind"),
]


EFFECT_FX_ID: dict[EffectName, int] = {
    "solid": 0,
    "breathe": 2,
    "rainbow": 9,
    "fire": 149,  # Firenoise (2D-native); fx 66 "Fire 2012" is 1D-only
    "sparkle": 20,
    "fireworks": 42,
    "matrix": 63,
    "pride": 93,
    "chase": 28,
    "noise": 70,
}

# Per-effect default parameter overrides.
# Applied by the pusher *only* when the EffectCommand leaves those fields as None.
# Tuned by taste — primary goal: avoid seizure-inducing defaults at the conference.
EFFECT_DEFAULTS: dict[EffectName, dict[str, int]] = {
    "solid": {},
    "breathe": {"speed": 48},
    "rainbow": {"speed": 140},
    "fire": {"speed": 160, "intensity": 128},
    "sparkle": {"speed": 180, "intensity": 100, "brightness": 140},
    "fireworks": {"speed": 200, "intensity": 180, "brightness": 140},
    "matrix": {"speed": 10, "intensity": 128},
    "pride": {"speed": 140},
    "chase": {"speed": 150},
    "noise": {"speed": 80},
}


def _color(r: int, g: int, b: int) -> ColorCommand:
    return ColorCommand(color=RGB(r=r, g=g, b=b))


EMOJI_COMMANDS: dict[str, Command] = {
    "🔥": EffectCommand(name="fire"),
    "🌈": EffectCommand(name="rainbow"),
    "⚡": EffectCommand(name="sparkle", speed=220),
    "🎉": EffectCommand(name="fireworks"),
    "🐍": EffectCommand(name="matrix"),
    "❤️": _color(255, 0, 0),
    "💙": _color(0, 0, 255),
    "💚": _color(0, 200, 0),
    "💜": _color(180, 0, 255),
    "🧡": _color(255, 100, 0),
    "🖤": PowerCommand(on=False),
    "🔴": _color(255, 0, 0),
    "🟢": _color(0, 200, 0),
    "🔵": _color(0, 0, 255),
    "🟠": _color(255, 100, 0),
    "🟡": _color(255, 220, 0),
    "🟣": _color(180, 0, 255),
    "⚫": PowerCommand(on=False),
    "⚪": _color(255, 255, 255),
    "🟤": _color(130, 70, 20),
    "🟥": _color(255, 0, 0),
    "🟩": _color(0, 200, 0),
    "🟦": _color(0, 0, 255),
    "🟧": _color(255, 100, 0),
    "🟨": _color(255, 220, 0),
    "🟪": _color(180, 0, 255),
    "🟫": _color(130, 70, 20),
}


PRESETS: dict[PresetName, list[Command]] = {
    "pytexas": [
        ColorCommand(color=RGB(r=191, g=87, b=0), brightness=180),
        TextCommand(
            text="PyTexas 2026",
            color=RGB(r=255, g=100, b=0),
            speed=160,
        ),
    ],
    "party": [EffectCommand(name="rainbow", speed=240, brightness=200)],
    "chill": [
        EffectCommand(
            name="breathe",
            color=RGB(r=0, g=60, b=180),
            speed=48,
            brightness=120,
        ),
    ],
}


def command_from_emoji(emoji: str) -> Command | None:
    """Resolve a single emoji to its mapped Command, or None if unknown."""
    stripped = emoji.strip()
    return EMOJI_COMMANDS.get(stripped)
