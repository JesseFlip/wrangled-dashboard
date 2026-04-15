"""Discord bot — optional gateway task inside the api process.

Starts only when DISCORD_BOT_TOKEN is set. Registers both slash commands
(/led ...) and message-prefix commands (!led ...).
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import discord
from discord import app_commands
from discord.ext import commands
from wrangled_contracts import (
    RGB,
    BrightnessCommand,
    ColorCommand,
    EffectCommand,
    PowerCommand,
    PresetCommand,
    PushResult,
    TextCommand,
    command_from_emoji,
)

if TYPE_CHECKING:
    from api.server.hub import Hub

logger = logging.getLogger(__name__)

EFFECT_NAMES = [
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
PRESET_NAMES = ["pytexas", "party", "chill"]


def _first_mac(hub: Hub) -> str | None:
    """Get the MAC of the first known device (convenience for single-matrix setups)."""
    devices = hub.all_devices()
    return devices[0].mac if devices else None


async def _send(hub: Hub, command, mac: str | None = None) -> PushResult | str:  # noqa: ANN001
    """Push a command to the hub. Returns PushResult or error string."""
    target = mac or _first_mac(hub)
    if target is None:
        return "No WLED devices connected."
    try:
        return await hub.send_command(target, command)
    except Exception as exc:  # noqa: BLE001
        return str(exc)


def _parse_color(value: str) -> RGB | None:
    """Try to parse a color string (name, hex, emoji)."""
    try:
        return RGB.parse(value.strip())
    except (ValueError, TypeError):
        return None


class WrangledBot(commands.Bot):
    """Discord bot that drives WLED matrices via the Hub."""

    def __init__(self, hub: Hub, guild_id: int | None = None) -> None:
        intents = discord.Intents.default()
        intents.message_content = True
        super().__init__(command_prefix="!", intents=intents)
        self.hub = hub
        self._guild_id = guild_id
        self._setup_slash_commands()

    def _setup_slash_commands(self) -> None:
        led_group = app_commands.Group(name="led", description="Control the WrangLED matrix")

        @led_group.command(name="color", description="Set a solid color")
        @app_commands.describe(color="Color name, #hex, or emoji", brightness="0-200 (optional)")
        async def slash_color(
            interaction: discord.Interaction, color: str, brightness: int | None = None
        ) -> None:
            rgb = _parse_color(color)
            if rgb is None:
                await interaction.response.send_message(f"Unknown color: `{color}`", ephemeral=True)
                return
            cmd = ColorCommand(color=rgb, brightness=brightness)
            result = await _send(self.hub, cmd)
            await interaction.response.send_message(_format_result(result, f"Color → {color}"))

        @led_group.command(name="brightness", description="Set brightness (0-200)")
        @app_commands.describe(level="Brightness level 0-200")
        async def slash_brightness(interaction: discord.Interaction, level: int) -> None:
            cmd = BrightnessCommand(brightness=min(max(level, 0), 200))
            result = await _send(self.hub, cmd)
            await interaction.response.send_message(_format_result(result, f"Brightness → {level}"))

        @led_group.command(name="effect", description="Run a named effect")
        @app_commands.describe(name="Effect name", speed="Speed 0-255", intensity="Intensity 0-255")
        @app_commands.choices(name=[app_commands.Choice(name=n, value=n) for n in EFFECT_NAMES])
        async def slash_effect(
            interaction: discord.Interaction,
            name: app_commands.Choice[str],
            speed: int | None = None,
            intensity: int | None = None,
        ) -> None:
            cmd = EffectCommand(name=name.value, speed=speed, intensity=intensity)
            result = await _send(self.hub, cmd)
            await interaction.response.send_message(
                _format_result(result, f"Effect → {name.value}")
            )

        @led_group.command(name="text", description="Scroll a message across the matrix")
        @app_commands.describe(
            message="Text to display (max 64 chars)",
            color="Color (optional)",
            speed="Scroll speed 32-240",
        )
        async def slash_text(
            interaction: discord.Interaction,
            message: str,
            color: str | None = None,
            speed: int = 128,
        ) -> None:
            rgb = _parse_color(color) if color else None
            cmd = TextCommand(text=message[:64], color=rgb, speed=min(max(speed, 32), 240))
            result = await _send(self.hub, cmd)
            await interaction.response.send_message(
                _format_result(result, f'Text → "{message[:32]}"')
            )

        @led_group.command(name="preset", description="Apply a preset scene")
        @app_commands.choices(name=[app_commands.Choice(name=n, value=n) for n in PRESET_NAMES])
        async def slash_preset(
            interaction: discord.Interaction, name: app_commands.Choice[str]
        ) -> None:
            cmd = PresetCommand(name=name.value)
            result = await _send(self.hub, cmd)
            await interaction.response.send_message(
                _format_result(result, f"Preset → {name.value}")
            )

        @led_group.command(name="on", description="Turn the matrix on")
        async def slash_on(interaction: discord.Interaction) -> None:
            result = await _send(self.hub, PowerCommand(on=True))
            await interaction.response.send_message(_format_result(result, "Power → ON"))

        @led_group.command(name="off", description="Turn the matrix off")
        async def slash_off(interaction: discord.Interaction) -> None:
            result = await _send(self.hub, PowerCommand(on=False))
            await interaction.response.send_message(_format_result(result, "Power → OFF"))

        @led_group.command(name="status", description="Show current matrix state")
        async def slash_status(interaction: discord.Interaction) -> None:
            mac = _first_mac(self.hub)
            if mac is None:
                await interaction.response.send_message("No devices connected.", ephemeral=True)
                return
            try:
                state = await self.hub.get_state(mac)
                on = state.get("on", False)
                bri = state.get("bri", "?")
                seg = state.get("seg", [{}])[0] if state.get("seg") else {}
                fx = seg.get("fx", "?")
                col = seg.get("col", [[0, 0, 0]])[0]
                status_line = (
                    f"{'🟢' if on else '🔴'} {'ON' if on else 'OFF'}"
                    f" · bri {bri} · fx {fx}"
                    f" · rgb({col[0]},{col[1]},{col[2]})"
                )
                await interaction.response.send_message(status_line)
            except Exception as exc:  # noqa: BLE001
                await interaction.response.send_message(
                    f"Could not read state: {exc}", ephemeral=True
                )

        self.tree.add_command(led_group)

    async def setup_hook(self) -> None:
        if self._guild_id:
            guild = discord.Object(id=self._guild_id)
            self.tree.copy_global_to(guild=guild)
            await self.tree.sync(guild=guild)
            logger.info("discord: synced slash commands to guild %s", self._guild_id)
        else:
            await self.tree.sync()
            logger.info("discord: synced slash commands globally (may take ~1h to propagate)")

    async def on_ready(self) -> None:
        logger.info("discord: logged in as %s (id=%s)", self.user, self.user.id)

    async def on_message(self, message: discord.Message) -> None:
        if message.author.bot:
            return
        # Process prefix commands
        await self.process_commands(message)
        # Also check for standalone emoji
        content = message.content.strip()
        max_emoji_len = 4
        if len(content) <= max_emoji_len and not content.startswith("!"):
            cmd = command_from_emoji(content)
            if cmd is not None:
                result = await _send(self.hub, cmd)
                await message.reply(
                    _format_result(result, f"Emoji → {content}"), mention_author=False
                )


def _format_result(result: PushResult | str, action: str) -> str:
    if isinstance(result, str):
        return f"❌ {action}: {result}"
    if result.ok:
        return f"✅ {action}"
    return f"❌ {action}: {result.error or f'status {result.status}'}"


def setup_prefix_commands(bot: WrangledBot) -> None:  # noqa: C901, PLR0915
    """Register !led prefix commands."""

    @bot.command(name="led")
    async def led_command(ctx: commands.Context, *, args: str = "") -> None:  # noqa: C901, PLR0912, PLR0915
        parts = args.strip().split(maxsplit=1)
        if not parts:
            await ctx.reply(
                "Usage: `!led <color|effect|text|preset|on|off|status|brightness> [args]`"
            )
            return

        verb = parts[0].lower()
        rest = parts[1] if len(parts) > 1 else ""

        if verb in ("on", "power-on"):
            result = await _send(bot.hub, PowerCommand(on=True))
            await ctx.reply(_format_result(result, "Power → ON"))
        elif verb in ("off", "power-off"):
            result = await _send(bot.hub, PowerCommand(on=False))
            await ctx.reply(_format_result(result, "Power → OFF"))
        elif verb == "status":
            mac = _first_mac(bot.hub)
            if mac is None:
                await ctx.reply("No devices connected.")
                return
            try:
                state = await bot.hub.get_state(mac)
                on = state.get("on", False)
                bri = state.get("bri", "?")
                seg = state.get("seg", [{}])[0] if state.get("seg") else {}
                fx = seg.get("fx", "?")
                col = seg.get("col", [[0, 0, 0]])[0]
                status_line = (
                    f"{'🟢' if on else '🔴'} {'ON' if on else 'OFF'}"
                    f" · bri {bri} · fx {fx}"
                    f" · rgb({col[0]},{col[1]},{col[2]})"
                )
                await ctx.reply(status_line)
            except Exception as exc:  # noqa: BLE001
                await ctx.reply(f"Could not read state: {exc}")
        elif verb in {"brightness", "bri"}:
            try:
                level = int(rest)
            except ValueError:
                await ctx.reply("Usage: `!led brightness <0-200>`")
                return
            result = await _send(bot.hub, BrightnessCommand(brightness=min(max(level, 0), 200)))
            await ctx.reply(_format_result(result, f"Brightness → {level}"))
        elif verb in {"effect", "fx"}:
            name = rest.strip().lower()
            if name not in EFFECT_NAMES:
                await ctx.reply(f"Unknown effect. Available: {', '.join(EFFECT_NAMES)}")
                return
            result = await _send(bot.hub, EffectCommand(name=name))
            await ctx.reply(_format_result(result, f"Effect → {name}"))
        elif verb == "text":
            if not rest:
                await ctx.reply("Usage: `!led text <message>`")
                return
            result = await _send(bot.hub, TextCommand(text=rest[:64]))
            await ctx.reply(_format_result(result, f'Text → "{rest[:32]}"'))
        elif verb == "preset":
            name = rest.strip().lower()
            if name not in PRESET_NAMES:
                await ctx.reply(f"Unknown preset. Available: {', '.join(PRESET_NAMES)}")
                return
            result = await _send(bot.hub, PresetCommand(name=name))
            await ctx.reply(_format_result(result, f"Preset → {name}"))
        else:
            # Try as a color
            rgb = _parse_color(verb)
            if rgb is not None:
                result = await _send(bot.hub, ColorCommand(color=rgb))
                await ctx.reply(_format_result(result, f"Color → {verb}"))
            else:
                # Try as emoji
                cmd = command_from_emoji(verb)
                if cmd is not None:
                    result = await _send(bot.hub, cmd)
                    await ctx.reply(_format_result(result, f"Emoji → {verb}"))
                else:
                    verbs = "color, effect, text, preset, brightness, on, off, status"
                    await ctx.reply(f"Unknown command: `{verb}`. Try: {verbs}")


async def run_discord_bot(hub: Hub, token: str, guild_id: int | None = None) -> None:
    """Start the Discord bot. Runs forever (call as asyncio.create_task)."""
    bot = WrangledBot(hub, guild_id=guild_id)
    setup_prefix_commands(bot)
    try:
        await bot.start(token)
    except Exception:
        logger.exception("discord bot crashed")
    finally:
        if not bot.is_closed():
            await bot.close()
