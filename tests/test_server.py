"""Tests for the MCP server tool implementations."""

import pytest
from unittest.mock import patch, MagicMock

from makerbeam_botics import server


class TestListDesigns:
    def test_empty_returns_message(self, tmp_path):
        with patch("makerbeam_botics.server.list_scad_files", return_value=[]):
            result = server.list_designs()
        assert "No .scad" in result

    def test_returns_filenames(self):
        files = ["a.scad", "b.scad"]
        with patch("makerbeam_botics.server.list_scad_files", return_value=files):
            result = server.list_designs()
        assert result == "a.scad\nb.scad"


class TestReadDesign:
    def test_returns_content(self):
        with patch("makerbeam_botics.server.read_scad_file", return_value="cube([1,1,1]);"):
            result = server.read_design("test.scad")
        assert result == "cube([1,1,1]);"

    def test_file_not_found_returns_error(self):
        with patch("makerbeam_botics.server.read_scad_file", side_effect=FileNotFoundError("missing")):
            result = server.read_design("missing.scad")
        assert result.startswith("Error:")

    def test_invalid_filename_returns_error(self):
        with patch("makerbeam_botics.server.read_scad_file", side_effect=ValueError("bad name")):
            result = server.read_design("../evil.scad")
        assert result.startswith("Error:")


class TestWriteDesign:
    def test_success_returns_path(self):
        with patch("makerbeam_botics.server.write_scad_file", return_value="/designs/test.scad"):
            result = server.write_design("test.scad", "cube([1,1,1]);")
        assert "test.scad" in result
        assert result.startswith("Design saved to:")

    def test_invalid_filename_returns_error(self):
        with patch("makerbeam_botics.server.write_scad_file", side_effect=ValueError("bad")):
            result = server.write_design("../evil.scad", "")
        assert result.startswith("Error:")


class TestRenderDesign:
    def test_success_returns_path(self):
        with patch("makerbeam_botics.server.render_scad", return_value="/designs/test.stl"):
            result = server.render_design("test.scad")
        assert result.startswith("Rendered to:")
        assert "test.stl" in result

    def test_error_returns_message(self):
        with patch("makerbeam_botics.server.render_scad", side_effect=RuntimeError("OpenSCAD not found")):
            result = server.render_design("test.scad")
        assert result.startswith("Error:")

    def test_default_format_is_stl(self):
        with patch("makerbeam_botics.server.render_scad", return_value="/designs/test.stl") as mock:
            server.render_design("test.scad")
        mock.assert_called_once_with("test.scad", "stl")

    def test_custom_format(self):
        with patch("makerbeam_botics.server.render_scad", return_value="/designs/test.png") as mock:
            server.render_design("test.scad", "png")
        mock.assert_called_once_with("test.scad", "png")
