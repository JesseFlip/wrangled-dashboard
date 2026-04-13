"""Tests for wrangled_contracts.wled."""

import pytest
from pydantic import ValidationError

from wrangled_contracts import WledMatrix


def test_wled_matrix_accepts_positive_dimensions() -> None:
    matrix = WledMatrix(width=16, height=16)
    assert matrix.width == 16
    assert matrix.height == 16


def test_wled_matrix_rejects_zero_width() -> None:
    with pytest.raises(ValidationError):
        WledMatrix(width=0, height=16)


def test_wled_matrix_rejects_negative_height() -> None:
    with pytest.raises(ValidationError):
        WledMatrix(width=16, height=-1)
