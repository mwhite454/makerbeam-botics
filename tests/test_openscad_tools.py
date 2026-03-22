"""Tests for makerbeam_botics.openscad_tools."""

import os
import subprocess
from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from makerbeam_botics.openscad_tools import (
    RENDER_FORMATS,
    list_scad_files,
    read_scad_file,
    render_scad,
    resolve_designs_dir,
    write_scad_file,
    _validate_filename,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

@pytest.fixture()
def tmp_designs(tmp_path):
    """A temporary directory that acts as the designs directory."""
    return str(tmp_path)


# ---------------------------------------------------------------------------
# _validate_filename
# ---------------------------------------------------------------------------

class TestValidateFilename:
    def test_valid(self):
        _validate_filename("my_design.scad")

    def test_empty_raises(self):
        with pytest.raises(ValueError, match="empty"):
            _validate_filename("")

    def test_non_scad_extension_raises(self):
        with pytest.raises(ValueError, match=r"\.scad"):
            _validate_filename("my_design.stl")

    def test_path_traversal_raises(self):
        with pytest.raises(ValueError):
            _validate_filename("../secret.scad")

    def test_subdirectory_raises(self):
        with pytest.raises(ValueError, match="basename"):
            _validate_filename("subdir/file.scad")


# ---------------------------------------------------------------------------
# resolve_designs_dir
# ---------------------------------------------------------------------------

class TestResolveDesignsDir:
    def test_default_is_sibling_designs_dir(self):
        expected = (Path(__file__).parent.parent / "designs").resolve()
        assert resolve_designs_dir() == expected

    def test_override(self, tmp_path):
        assert resolve_designs_dir(str(tmp_path)) == tmp_path.resolve()


# ---------------------------------------------------------------------------
# list_scad_files
# ---------------------------------------------------------------------------

class TestListScadFiles:
    def test_empty_directory(self, tmp_designs):
        assert list_scad_files(tmp_designs) == []

    def test_missing_directory(self, tmp_path):
        missing = str(tmp_path / "nonexistent")
        assert list_scad_files(missing) == []

    def test_returns_only_scad_files(self, tmp_designs):
        designs = Path(tmp_designs)
        (designs / "a.scad").write_text("// a")
        (designs / "b.scad").write_text("// b")
        (designs / "readme.txt").write_text("text file")
        (designs / "model.stl").write_bytes(b"binary")
        result = list_scad_files(tmp_designs)
        assert result == ["a.scad", "b.scad"]

    def test_result_is_sorted(self, tmp_designs):
        designs = Path(tmp_designs)
        for name in ("z.scad", "a.scad", "m.scad"):
            (designs / name).write_text("// file")
        assert list_scad_files(tmp_designs) == ["a.scad", "m.scad", "z.scad"]


# ---------------------------------------------------------------------------
# write_scad_file
# ---------------------------------------------------------------------------

class TestWriteScadFile:
    def test_creates_file(self, tmp_designs):
        content = "cube([10, 10, 10]);"
        path = write_scad_file("test.scad", content, tmp_designs)
        assert Path(path).read_text() == content

    def test_returns_absolute_path(self, tmp_designs):
        path = write_scad_file("test.scad", "", tmp_designs)
        assert os.path.isabs(path)

    def test_overwrites_existing_file(self, tmp_designs):
        write_scad_file("test.scad", "old content", tmp_designs)
        write_scad_file("test.scad", "new content", tmp_designs)
        path = Path(tmp_designs) / "test.scad"
        assert path.read_text() == "new content"

    def test_invalid_filename_raises(self, tmp_designs):
        with pytest.raises(ValueError):
            write_scad_file("../evil.scad", "", tmp_designs)

    def test_creates_directory_if_missing(self, tmp_path):
        nested = str(tmp_path / "new_designs")
        write_scad_file("test.scad", "// hello", nested)
        assert (Path(nested) / "test.scad").exists()


# ---------------------------------------------------------------------------
# read_scad_file
# ---------------------------------------------------------------------------

class TestReadScadFile:
    def test_reads_content(self, tmp_designs):
        content = "sphere(r = 5);"
        write_scad_file("sphere.scad", content, tmp_designs)
        assert read_scad_file("sphere.scad", tmp_designs) == content

    def test_missing_file_raises(self, tmp_designs):
        with pytest.raises(FileNotFoundError):
            read_scad_file("missing.scad", tmp_designs)

    def test_invalid_filename_raises(self, tmp_designs):
        with pytest.raises(ValueError):
            read_scad_file("../secret.scad", tmp_designs)


# ---------------------------------------------------------------------------
# render_scad
# ---------------------------------------------------------------------------

class TestRenderScad:
    def test_invalid_filename_raises(self, tmp_designs):
        with pytest.raises(ValueError):
            render_scad("../bad.scad", designs_dir=tmp_designs)

    def test_invalid_format_raises(self, tmp_designs):
        write_scad_file("test.scad", "cube([1,1,1]);", tmp_designs)
        with pytest.raises(ValueError, match="Unsupported output format"):
            render_scad("test.scad", "exe", designs_dir=tmp_designs)

    def test_missing_source_raises(self, tmp_designs):
        with pytest.raises(FileNotFoundError):
            render_scad("nonexistent.scad", designs_dir=tmp_designs)

    def test_missing_openscad_raises(self, tmp_designs):
        write_scad_file("test.scad", "cube([1,1,1]);", tmp_designs)
        with pytest.raises(RuntimeError, match="OpenSCAD executable not found"):
            render_scad("test.scad", designs_dir=tmp_designs, openscad_bin="no_such_binary")

    def test_openscad_error_raises(self, tmp_designs):
        write_scad_file("bad.scad", "this is not valid openscad {{{", tmp_designs)
        mock_result = MagicMock()
        mock_result.returncode = 1
        mock_result.stderr = "parse error"
        with patch("subprocess.run", return_value=mock_result):
            with pytest.raises(RuntimeError, match="render failed"):
                render_scad("bad.scad", designs_dir=tmp_designs)

    def test_successful_render_returns_path(self, tmp_designs):
        write_scad_file("cube.scad", "cube([10, 10, 10]);", tmp_designs)
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stderr = ""
        with patch("subprocess.run", return_value=mock_result) as mock_run:
            output_path = render_scad("cube.scad", "stl", designs_dir=tmp_designs)
        assert output_path.endswith("cube.stl")
        mock_run.assert_called_once()
        cmd = mock_run.call_args[0][0]
        assert "-o" in cmd
        assert "cube.stl" in cmd[-2]
        assert "cube.scad" in cmd[-1]

    def test_all_supported_formats_accepted(self, tmp_designs):
        write_scad_file("test.scad", "cube([1,1,1]);", tmp_designs)
        mock_result = MagicMock()
        mock_result.returncode = 0
        mock_result.stderr = ""
        with patch("subprocess.run", return_value=mock_result):
            for fmt in RENDER_FORMATS:
                output_path = render_scad("test.scad", fmt, designs_dir=tmp_designs)
                assert output_path.endswith(f".{fmt}")

    def test_timeout_raises(self, tmp_designs):
        write_scad_file("big.scad", "cube([1,1,1]);", tmp_designs)
        with patch("subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="openscad", timeout=120)):
            with pytest.raises(RuntimeError, match="timed out"):
                render_scad("big.scad", designs_dir=tmp_designs)
