# WrangLED Setup Guide

Hey! You've got yourself a WrangLED matrix — a grid of individually-controllable LEDs
that you (and your daughter) can run from Discord, a phone, or any browser on your home
Wi-Fi. Here's everything you need to get going.

---

## What's in the box

- **The LED panel** — the light matrix itself
- **A power supply** — powers the LEDs (they draw more current than USB can handle)
- **A controller** — either a Raspberry Pi that came with it, or you can run the software
  on any Windows/Mac/Linux PC you have at home

The controller runs a small program called **wrangler** that finds the LED panel on your
network and keeps it talking to everything else.

---

## Step 1 — Plug the LED panel in

1. Connect the LED panel to the power supply and flip it on.
2. Make sure the panel's data wire is connected to whichever computer is running the
   wrangler software (Pi or your PC).
3. Both the panel and the computer need to be on the **same Wi-Fi network**.

---

## Step 2 — Get the wrangler software running

Pick the option that fits your setup:

---

### Option A — Raspberry Pi (if one came with it)

Just plug the Pi into power. Give it about 60 seconds to boot. That's it — it's already
configured and will find the LED panel automatically.

> Keep the Pi plugged in whenever you want to use the lights. It runs silently in the
> background and doesn't need a monitor or keyboard day-to-day.

**If the Pi needs to join your Wi-Fi for the first time**, plug in a keyboard and HDMI
monitor, then run:

```
sudo raspi-config
```

Go to **System Options → Wireless LAN**, enter your network name and password, and reboot.

---

### Option B — Your own PC (Windows, Mac, or Linux)

You'll need **Python 3.11 or newer**. Check by opening a terminal and running:

```
python --version
```

If you don't have it, grab it from https://python.org.

**Then install and start the wrangler:**

```
pip install uv
git clone https://github.com/JesseFlip/wrangled-dashboard.git
cd wrangled-dashboard/apps/wrangler
uv run python -m wrangler serve
```

Leave that terminal window open — it's what keeps the lights running. The wrangler will
scan your network, find the LED panel, and start listening for commands.

> Your PC needs to stay on and connected to Wi-Fi while you're using the lights.
> The LED panel just needs power — it doesn't need to be plugged into the PC directly.

---

## Step 3 — Control the lights

You have two ways to control the lights. Pick whichever one you like.

---

### Option A — From Discord (works from anywhere)

1. Join the Discord server where the bot lives (ask whoever set this up for an invite link).
2. In any channel the bot watches, type a slash command:

| What you want | Command to type |
|---|---|
| Solid color | `/led color red` |
| Pick any color | `/led color #ff6600` |
| Scrolling text | `/led text hello` |
| Cool effects | `/led effect rainbow` |
| Pre-built scenes | `/led preset party` |
| Turn on | `/led on` |
| Turn off | `/led off` |
| Check the status | `/led status` |

**Fun ones to try with your daughter:**

| Emoji | What it does |
|---|---|
| Post `🔥` on its own | Fire effect |
| Post `🌈` on its own | Rainbow mode |
| Post `🐍` on its own | Snake attack (Python joke) |
| `/led text Hi Dad` | Scrolls your message across the panel |
| `/led preset chill` | Calm blue breathing light |
| `/led preset party` | Full rainbow party mode |

> Commands are paced — one every ~7 seconds — so if two people send at the same time,
> they both go through, just one after the other.

---

### Option B — From a browser on your home Wi-Fi

Open a browser on any phone, tablet, or laptop connected to the **same Wi-Fi** and go to:

```
http://wrangler.local:8501
```

You'll see a simple panel with tabs:

- **Color** — pick any color by name or hex code
- **Effect** — choose from a big list of effects (rainbow, fire, sparkle, breathe, matrix...)
- **Text** — type a message and watch it scroll across the panel
- **Preset** — one-tap pre-built scenes
- **Brightness** — slider from dim to full blast

No login, no setup — just open it and click.

> If `wrangler.local` doesn't load, use the IP address of whichever computer is running
> the wrangler software instead (e.g. `http://192.168.1.42:8501`). You can find the IP
> by checking your router's device list, or by running `ipconfig` (Windows) or
> `ifconfig` (Mac/Linux) in a terminal.

---

## Quick command reference

```
/led color red
/led color blue
/led color orange
/led color #ff00aa          ← any hex color
/led brightness 100         ← 0 to 200
/led effect rainbow
/led effect fire
/led effect breathe
/led effect sparkle
/led effect fireworks
/led text hello world       ← scrolls across the panel
/led preset party
/led preset chill
/led preset zen
/led on
/led off
/led status                 ← shows current color, brightness, effect
```

---

## Troubleshooting

**Lights don't respond to commands**
- Make sure the LED panel is powered on
- Make sure the wrangler software is running (Pi is booted, or your PC terminal is open)
- Give it 60 seconds after starting before sending commands

**`wrangler.local` won't load**
- You need to be on the same Wi-Fi network as the computer running wrangler
- Try the computer's IP address directly instead of the `.local` name
- Some older Android devices don't support `.local` addresses — use the IP

**Text looks garbled on the panel**
- The panel uses ASCII only — no emoji, accented letters, or special characters in `/led text`

**It was working, now it's not**
- If using a Pi: unplug it, wait 10 seconds, plug it back in
- If using your PC: close the terminal and re-run `uv run python -m wrangler serve`
- Give it a minute to reconnect

**Discord command says "application did not respond"**
- The bot might be offline — ping whoever manages it to restart the server.

---

## Tips for having fun with it

- Let your daughter type her name: `/led text [her name]`
- `/led effect fireworks` is great for celebrations
- `/led color #ff69b4` is hot pink
- Chain moods — try `chill` at night, `party` on weekends
- If you're watching a movie, `/led brightness 20` keeps it dim and ambient
- `/led off` when you go to bed, `/led on` in the morning

---

Built by Jim Vogel and Jesse Flipowski. Code at https://github.com/JesseFlip/wrangled-dashboard
