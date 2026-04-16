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
    # Added for PyTexas preset pack
    "plasma",      # 2D Plasma (fx 119)
    "metaballs",   # 2D Metaballs (fx 111)
    "wavingcell",  # 2D Waving Cell (fx 116)
    "blink",       # Blink (fx 1) — Discord alert flash
]

PresetName = Literal[
    # Originals
    "pytexas",
    "party",
    "chill",
    # PyTexas preset pack
    "snake_attack",   # 🐍 idle screen — Python-colored matrix rain
    "code_fire",      # 🔥 high energy between talks
    "lone_star",      # ⭐ Texas pride ambient
    "applause",       # 🎉 end-of-talk celebration
    "crowd_hype",     # 💥 Discord spike trigger
    "howdy",          # 🤠 registration / check-in marquee
    "love_it",       # ❤️ hype / applause alternative
    "pride_ride",     # 🌈 Saturday rooftop party
    "sine_wave",      # 🌊 transition / in-between effect
    "discord_alert",  # ⚡ visual ack when bot receives a command
    "late_night",     # 🌙 Saturday night social
]


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
    "blink": 1,
    "breathe": 2,
    "rainbow": 9,
    "fire": 149,  # Firenoise (2D-native); fx 66 "Fire 2012" is 1D-only
    "sparkle": 20,
    "fireworks": 42,
    "matrix": 63,
    "pride": 93,
    "chase": 28,
    "noise": 70,
    "metaballs": 111,   # 2D Metaballs
    "wavingcell": 116,  # 2D Waving Cell
    "plasma": 119,      # 2D Plasma
}

# Per-effect default parameter overrides.
# Applied by the pusher *only* when the EffectCommand leaves those fields as None.
# Tuned by taste — primary goal: avoid seizure-inducing defaults at the conference.
EFFECT_DEFAULTS: dict[EffectName, dict[str, int]] = {
    "solid": {},
    "blink": {"speed": 255, "intensity": 255},
    "breathe": {"speed": 48},
    "rainbow": {"speed": 140},
    "fire": {"speed": 160, "intensity": 128},
    "sparkle": {"speed": 180, "intensity": 100, "brightness": 140},
    "fireworks": {"speed": 200, "intensity": 180, "brightness": 140},
    "matrix": {"speed": 10, "intensity": 128},
    "pride": {"speed": 140},
    "chase": {"speed": 150},
    "noise": {"speed": 80},
    "plasma": {"speed": 80, "intensity": 160},
    "metaballs": {"speed": 60, "intensity": 100},
    "wavingcell": {"speed": 100, "intensity": 140},
}


def _color(r: int, g: int, b: int) -> ColorCommand:
    return ColorCommand(color=RGB(r=r, g=g, b=b))


EMOJI_COMMANDS: dict[str, Command] = {
    "🔥": EffectCommand(name="fire"),
    "🌈": EffectCommand(name="rainbow"),
    "⚡": EffectCommand(name="sparkle", speed=220),
    "🎉": EffectCommand(name="fireworks"),
    "🐍": PresetCommand(name="snake_attack"),   # !idle
    "💥": PresetCommand(name="crowd_hype"),     # !hype
    "🤠": PresetCommand(name="howdy"),          # !texas / registration
    "⭐": PresetCommand(name="lone_star"),      # !texas ambient
    "🌙": PresetCommand(name="late_night"),     # !chill
    "🌊": PresetCommand(name="sine_wave"),      # !wave transition
    "❤️": PresetCommand(name="love_it"),
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
    # ── Originals ───────────────────────────────────────────────────────────
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
    # ── PyTexas Preset Pack ──────────────────────────────────────────────────
    # 1. 🐍 Snake Attack — idle screen, Python logo colors falling as matrix rain
    "snake_attack": [
        EffectCommand(
            name="matrix",
            color=RGB(r=255, g=212, b=59),   # Python yellow (#FFD43B) primary
            speed=140,
            intensity=200,
            brightness=180,
        ),
    ],
    # 2. 🔥 Code Fire — high energy between talks
    "code_fire": [
        BrightnessCommand(brightness=200),
        EffectCommand(name="fire", speed=150, intensity=200, brightness=200),
    ],
    # 3. ⭐ Lone Star — Texas pride ambient, slow warm plasma
    "lone_star": [
        EffectCommand(
            name="plasma",
            color=RGB(r=191, g=85, b=0),     # burnt orange primary
            speed=80,
            intensity=160,
            brightness=160,
        ),
    ],
    # 4. 🎉 Applause — max-energy end-of-talk celebration
    "applause": [
        BrightnessCommand(brightness=200),
        EffectCommand(name="fireworks", speed=255, intensity=255, brightness=200),
    ],
    # 5. 💥 Crowd Hype — Discord spike trigger, random explosions
    "crowd_hype": [
        BrightnessCommand(brightness=200),
        EffectCommand(name="fireworks", speed=200, intensity=220, brightness=200),
    ],
    # 6. 🤠 Howdy — registration / check-in marquee
    "howdy": [
        ColorCommand(color=RGB(r=26, g=10, b=0), brightness=160),  # dark leather BG
        TextCommand(
            text="PyTexas 2026",
            color=RGB(r=255, g=255, b=255),
            speed=160,
        ),
    ],
    # 7. ❤️ Love It — 💥 replacement with hearts and red text
    "love_it": [
        BrightnessCommand(brightness=200),
        TextCommand(
            text="❤️❤️❤️ Love it ❤️❤️❤️",
            color=RGB(r=255, g=0, b=0),
            speed=160,
        ),
    ],
    # 8. 🌈 Pride Ride — Saturday rooftop party
    "pride_ride": [
        EffectCommand(name="pride", speed=80, intensity=128, brightness=180),
    ],
    # 9. 🌊 Sine Wave — smooth Python-colored transition effect
    "sine_wave": [
        EffectCommand(
            name="wavingcell",
            color=RGB(r=75, g=139, b=190),   # Python blue (#4B8BBE)
            speed=100,
            intensity=140,
            brightness=160,
        ),
    ],
    # 10. ⚡ Discord Alert — 1-2 sec visual ack before switching to requested effect
    "discord_alert": [
        EffectCommand(
            name="blink",
            color=RGB(r=88, g=101, b=242),   # Discord purple (#5865F2)
            speed=255,
            intensity=255,
            brightness=200,
        ),
    ],
    # 11. 🌙 Late Night — Saturday night social, slow cosmic chill
    "late_night": [
        EffectCommand(
            name="metaballs",
            color=RGB(r=75, g=0, b=130),     # deep purple (#4B0082)
            speed=60,
            intensity=100,
            brightness=120,
        ),
    ],
}


def command_from_emoji(emoji: str) -> Command | None:
    """Resolve a single emoji to its mapped Command, or None if unknown."""
    stripped = emoji.strip()
    return EMOJI_COMMANDS.get(stripped)
