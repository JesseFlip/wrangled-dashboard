"""Pydantic models describing WLED devices and their topology."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class WledMatrix(BaseModel):
    """Dimensions of a WLED 2D matrix, in LED count."""

    model_config = ConfigDict(frozen=True)

    width: int = Field(gt=0, description="Columns of LEDs.")
    height: int = Field(gt=0, description="Rows of LEDs.")
