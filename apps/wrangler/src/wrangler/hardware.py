"""Hardware Orchestrator for Pythoneer Wrangler.
Handles low-level GPIO/SPI interface for LED strips with mock support.
"""

import logging
import time
from typing import Protocol

logger = logging.getLogger(__name__)

# Try to import rpi_ws281x for actual hardware control
try:
    from rpi_ws281x import PixelStrip, ws
    HAS_HARDWARE = True
except ImportError:
    HAS_HARDWARE = False
    logger.warning("rpi_ws281x not found. Falling back to MockHardware.")

class LEDInterface(Protocol):
    def begin(self): ...
    def show(self): ...
    def set_pixel_color(self, n: int, r: int, g: int, b: int): ...
    def set_brightness(self, brightness: int): ...
    def num_pixels(self) -> int: ...

class MockHardware:
    def __init__(self, count: int):
        self.count = count
        self.pixels = [(0, 0, 0)] * count
        self.brightness = 255
        logger.info(f"Initialized MockHardware with {count} pixels")

    def begin(self):
        logger.info("MockHardware: LEDs started.")

    def show(self):
        # In a real app, this might push to a local websocket or just log
        pass

    def set_pixel_color(self, n: int, r: int, g: int, b: int):
        if 0 <= n < self.count:
            self.pixels[n] = (r, g, b)

    def set_brightness(self, brightness: int):
        self.brightness = brightness
        logger.debug(f"MockHardware: Brightness set to {brightness}")

    def num_pixels(self) -> int:
        return self.count

class RealHardware:
    def __init__(self, count: int, gpio_pin: int = 18, freq_hz: int = 800000, dma: int = 10, invert: bool = False, brightness: int = 255, channel: int = 0):
        self.strip = PixelStrip(count, gpio_pin, freq_hz, dma, invert, brightness, channel)
        logger.info(f"Initialized RealHardware on GPIO {gpio_pin} with {count} pixels")

    def begin(self):
        self.strip.begin()

    def show(self):
        self.strip.show()

    def set_pixel_color(self, n: int, r: int, g: int, b: int):
        # Note: rpi_ws281x often uses Color(r, g, b) or similar
        # Depending on GRB vs RGB strip, color space conversion may be needed here
        from rpi_ws281x import Color
        self.strip.setPixelColor(n, Color(r, g, b))

    def set_brightness(self, brightness: int):
        self.strip.setBrightness(brightness)

    def num_pixels(self) -> int:
        return self.strip.numPixels()

def get_hardware(count: int = 256) -> LEDInterface:
    if HAS_HARDWARE:
        return RealHardware(count)
    return MockHardware(count)

class HardwareOrchestrator:
    """The 'Pulse' agent logic."""
    def __init__(self, led_count: int = 256):
        self.leds = get_hardware(led_count)
        self.leds.begin()
        self.last_frame_time = time.time()
        self.fps = 0.0

    def update_telemetry(self):
        now = time.time()
        dt = now - self.last_frame_time
        if dt > 0:
            self.fps = 1.0 / dt
        self.last_frame_time = now

    def set_all(self, r: int, g: int, b: int):
        for i in range(self.leds.num_pixels()):
            self.leds.set_pixel_color(i, r, g, b)
        self.leds.show()
        self.update_telemetry()

    def clear(self):
        self.set_all(0, 0, 0)
