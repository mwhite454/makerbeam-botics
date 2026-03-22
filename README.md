# makerbeam-botics

Simple OpenSCAD attachments for MakerBeam aluminium extrusion — servo mounts, motor mounts, and custom connectors — designed with the help of Claude via an [MCP](https://modelcontextprotocol.io/) server.

## What this does

This repository provides:

1. **An MCP server** (`makerbeam_botics.server`) that exposes four tools to Claude:
   - `list_designs` — list all `.scad` files in the `designs/` directory
   - `read_design` — read the OpenSCAD source of a design file
   - `write_design` — create or update a design file
   - `render_design` — render a design to STL, PNG, or other formats using the OpenSCAD CLI

2. **Starter designs** in `designs/`:
   - `makerbeam.scad` — MakerBeam 10×10 mm profile, dimensions, and reusable modules
   - `servo_mount.scad` — Bracket for SG90/MG90S micro-servos on MakerBeam
   - `motor_mount.scad` — Clamp-style bracket for N20 micro gear motors on MakerBeam

## Requirements

- Python 3.10+
- [OpenSCAD](https://openscad.org/downloads.html) installed and on your `PATH` (for rendering)
- [Claude Desktop or claude-code](https://claude.ai) (or any MCP-compatible client) for design sessions

## Installation

```bash
pip install -e .
```

## Connecting to Claude claude-code

Add the server to your MCP client configuration (e.g. Claude Desktop `~/.claude.json` or `claude mcp add`):

```json
{
  "mcpServers": {
    "makerbeam-botics": {
      "command": "makerbeam-botics"
    }
  }
}
```

Or run it directly:

```bash
makerbeam-botics
```

Once connected, Claude can list, read, create, and render OpenSCAD designs using natural language.

## Example session

```
You: Create a bracket to attach a servo to a MakerBeam rail.
Claude: [uses write_design to create servo_mount.scad, then render_design to produce servo_mount.stl]
```

## Development

```bash
pip install -e ".[dev]"
pytest
```

## Hardware notes

- MakerBeam extrusion: 10×10 mm aluminium T-slot, M3 hardware
- Designs are sized for FDM 3D printing with standard 0.4 mm nozzle
- Default tolerance: 0.3 mm for fits, 0.2 mm for printed-to-printed interfaces

