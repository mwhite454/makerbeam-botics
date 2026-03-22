"""MCP server exposing OpenSCAD tools to Claude for designing MakerBeam parts."""

import os
import sys
from pathlib import Path

from mcp.server.fastmcp import FastMCP

from makerbeam_botics.openscad_tools import (
    list_scad_files,
    read_scad_file,
    render_scad,
    write_scad_file,
)

mcp = FastMCP(
    "makerbeam-botics",
    instructions=(
        "You are a 3D design assistant for MakerBeam aluminium extrusion projects. "
        "Use the provided tools to create, read, and render OpenSCAD designs for "
        "MakerBeam attachments such as servo mounts, motor mounts, brackets, and "
        "custom connectors. "
        "MakerBeam uses 10×10 mm aluminium extrusion with M3 hardware. "
        "Always include appropriate tolerances and fillet/chamfer edges for printability."
    ),
)


@mcp.tool()
def list_designs() -> str:
    """List all OpenSCAD design files in the designs directory.

    Returns a newline-separated list of .scad filenames, or a message if none exist.
    """
    files = list_scad_files()
    if not files:
        return "No .scad design files found in the designs directory."
    return "\n".join(files)


@mcp.tool()
def read_design(filename: str) -> str:
    """Read and return the OpenSCAD source code of a design file.

    Args:
        filename: The name of the .scad file to read (e.g. 'servo_mount.scad').

    Returns:
        The OpenSCAD source code as a string.
    """
    try:
        return read_scad_file(filename)
    except (ValueError, FileNotFoundError) as exc:
        return f"Error: {exc}"


@mcp.tool()
def write_design(filename: str, content: str) -> str:
    """Create or overwrite an OpenSCAD design file with the given content.

    Args:
        filename: The name of the .scad file to write (e.g. 'my_bracket.scad').
        content: The complete OpenSCAD source code to save.

    Returns:
        A success message with the path of the saved file, or an error message.
    """
    try:
        path = write_scad_file(filename, content)
        return f"Design saved to: {path}"
    except ValueError as exc:
        return f"Error: {exc}"


@mcp.tool()
def render_design(filename: str, output_format: str = "stl") -> str:
    """Render an OpenSCAD design file to the specified output format.

    Requires OpenSCAD to be installed and available on PATH.

    Args:
        filename: The name of the .scad file to render (e.g. 'servo_mount.scad').
        output_format: Output format - one of: stl, png, svg, dxf, off, amf, 3mf.
                       Defaults to 'stl'.

    Returns:
        A success message with the path of the rendered file, or an error message.
    """
    try:
        path = render_scad(filename, output_format)
        return f"Rendered to: {path}"
    except (ValueError, FileNotFoundError, RuntimeError) as exc:
        return f"Error: {exc}"


def main() -> None:
    """Entry point for the MCP server."""
    mcp.run()


if __name__ == "__main__":
    main()
