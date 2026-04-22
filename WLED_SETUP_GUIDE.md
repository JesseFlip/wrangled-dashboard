# WrangLED Setup Guide

Hey! You've got yourself a WrangLED matrix — a grid of individually-controllable LEDs
that you (and your daughter) can run from Discord, a phone, or any browser on your home
Wi-Fi. Here's everything you need to get going.

---

## What's in the box

- **The LED panel** — the light matrix itself
- **The Raspberry Pi** — a small computer that sits next to the panel and drives it
- **A power supply** — powers the LEDs (they draw more current than USB can handle)

The Pi runs a small program called **wrangler** that discovers the LED controller on
your network and keeps it talking to the outside world.

---

## Step 1 — Plug everything in

1. Connect the LED panel to the power supply.
2. Connect the LED panel's data wire to the Raspberry Pi (already done if pre-wired).
3. Plug the Pi into power — the green light will blink as it boots. Give it about 60 seconds.
4. That's it. If the Pi and the LED panel are on the same Wi-Fi network, they'll find
   each other automatically.

> **Tip:** Keep the Pi plugged in and running whenever you want to use the lights. You don't
> need to log into it or do anything — it just needs power and Wi-Fi.

---

## Step 2 — Connect to your Wi-Fi

If the Pi isn't already set up for your network, connect a keyboard + HDMI monitor and run:

```
sudo raspi-config
```

Go to **System Options → Wireless LAN** and enter your network name and password.
Reboot and you're good. (If it was pre-configured, skip this entirely.)

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

Open a browser on any phone, tablet, or laptop connected to the **same Wi-Fi as the Pi** and go to:

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

> If `wrangler.local` doesn't load, try using the Pi's IP address instead.
> You can find it by logging into your router and looking at connected devices,
> or by plugging a monitor into the Pi and typing `hostname -I`.

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
- Make sure the Pi is powered on (green LED blinking)
- Make sure the LED panel is plugged in
- Wait 60 seconds after powering up the Pi before sending commands

**`wrangler.local` won't load**
- You need to be on the same Wi-Fi network as the Pi
- Try the Pi's IP address directly (check your router for it)
- Some older Android devices don't support `.local` addresses — use the IP instead

**Text looks garbled on the panel**
- The panel uses ASCII only — no emoji, accented letters, or special characters in `/led text`

**It was working, now it's not**
- Unplug the Pi's power, wait 10 seconds, plug it back in
- Give it a minute to reconnect and you should be good

**Discord command says "application did not respond"**
- The bot might be offline — the server it runs on may need a restart. Ping whoever manages it.

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
