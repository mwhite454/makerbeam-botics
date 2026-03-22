"""Core functions for reading, writing, and rendering OpenSCAD files."""

import os
import subprocess
from pathlib import Path


# Allowed output formats for rendering
RENDER_FORMATS = {"stl", "png", "svg", "dxf", "off", "amf", "3mf"}


def resolve_designs_dir(designs_dir: str | None = None) -> Path:
    """Return the designs directory path, defaulting to 'designs/' next to this file."""
    if designs_dir is not None:
        return Path(designs_dir).resolve()
    return (Path(__file__).parent.parent / "designs").resolve()


def list_scad_files(designs_dir: str | None = None) -> list[str]:
    """Return a sorted list of .scad filenames in the designs directory."""
    directory = resolve_designs_dir(designs_dir)
    if not directory.is_dir():
        return []
    return sorted(p.name for p in directory.glob("*.scad"))


def read_scad_file(filename: str, designs_dir: str | None = None) -> str:
    """Read and return the contents of an OpenSCAD file.

    Args:
        filename: Name of the .scad file (basename only, no path traversal).
        designs_dir: Optional override for the designs directory.

    Returns:
        The file contents as a string.

    Raises:
        ValueError: If the filename is invalid.
        FileNotFoundError: If the file does not exist.
    """
    _validate_filename(filename)
    path = resolve_designs_dir(designs_dir) / filename
    return path.read_text(encoding="utf-8")


def write_scad_file(filename: str, content: str, designs_dir: str | None = None) -> str:
    """Write content to an OpenSCAD file in the designs directory.

    Args:
        filename: Name of the .scad file to write (basename only, no path traversal).
        content: OpenSCAD source code to write.
        designs_dir: Optional override for the designs directory.

    Returns:
        The absolute path of the written file.

    Raises:
        ValueError: If the filename is invalid.
    """
    _validate_filename(filename)
    directory = resolve_designs_dir(designs_dir)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / filename
    path.write_text(content, encoding="utf-8")
    return str(path)


def render_scad(
    filename: str,
    output_format: str = "stl",
    designs_dir: str | None = None,
    openscad_bin: str = "openscad",
) -> str:
    """Render an OpenSCAD file to the requested output format.

    The output file is placed alongside the source file in the designs directory.

    Args:
        filename: Name of the .scad file to render.
        output_format: Desired output format (stl, png, svg, dxf, off, amf, 3mf).
        designs_dir: Optional override for the designs directory.
        openscad_bin: Path to the OpenSCAD executable.

    Returns:
        The absolute path of the rendered output file.

    Raises:
        ValueError: If the filename or output format is invalid.
        FileNotFoundError: If the source file does not exist.
        RuntimeError: If OpenSCAD is not found or rendering fails.
    """
    _validate_filename(filename)
    fmt = output_format.lower()
    if fmt not in RENDER_FORMATS:
        raise ValueError(
            f"Unsupported output format '{output_format}'. "
            f"Supported formats: {sorted(RENDER_FORMATS)}"
        )

    directory = resolve_designs_dir(designs_dir)
    input_path = directory / filename
    if not input_path.is_file():
        raise FileNotFoundError(f"OpenSCAD file not found: {input_path}")

    stem = Path(filename).stem
    output_path = directory / f"{stem}.{fmt}"

    cmd = [openscad_bin, "-o", str(output_path), str(input_path)]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )
    except FileNotFoundError:
        raise RuntimeError(
            f"OpenSCAD executable not found at '{openscad_bin}'. "
            "Install OpenSCAD from https://openscad.org/downloads.html"
        )
    except subprocess.TimeoutExpired:
        raise RuntimeError(f"OpenSCAD render timed out for '{filename}'")

    if result.returncode != 0:
        raise RuntimeError(
            f"OpenSCAD render failed for '{filename}':\n{result.stderr.strip()}"
        )

    return str(output_path)


def _validate_filename(filename: str) -> None:
    """Validate that a filename is a safe .scad basename with no path traversal."""
    if not filename:
        raise ValueError("Filename must not be empty.")
    p = Path(filename)
    if p.name != filename:
        raise ValueError(
            f"Filename must be a plain basename with no directory components: '{filename}'"
        )
    if p.suffix.lower() != ".scad":
        raise ValueError(f"Filename must end with '.scad', got: '{filename}'")
    if any(part in (".", "..") for part in p.parts):
        raise ValueError(f"Filename must not contain path traversal components: '{filename}'")
