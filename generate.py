#!/usr/bin/env python3
"""
generate.py — Generate a MakerBeam servo mount STL and PNG preview.

Usage:
    # From database by name:
    python generate.py --servo SG90 --style top --profile 10

    # From a JSON spec file:
    python generate.py --spec my_servo.json --style side --profile 15

    # Full manual spec:
    python generate.py --servo custom \\
        --body-length 22.2 --body-width 11.8 --body-height 22.7 \\
        --tab-width 5.2 --tab-thickness 2.5 --tab-height 17 \\
        --hole-spacing 28 --hole-d 2 \\
        --shaft-dia 4.7 --shaft-height 5.5 --horn-radius 13 \\
        --style top --profile 10

Output files land in ./output/<servo_name>_<style>_mb<profile>/
"""

import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCAD_MAIN   = Path(__file__).parent / "scad" / "servo_mount.scad"
DB_PATH     = Path(__file__).parent / "parts_db" / "servos.json"
OUTPUT_DIR  = Path(__file__).parent / "output"
OPENSCAD    = shutil.which("openscad") or shutil.which("openscad-nightly") or "openscad"


def load_servo_db() -> dict:
    if not DB_PATH.exists():
        return {}
    with open(DB_PATH) as f:
        return json.load(f).get("servos", {})


def find_servo(db: dict, name: str) -> dict | None:
    if name in db:
        return db[name]
    name_lower = name.lower()
    for key, val in db.items():
        if key.lower() == name_lower:
            return val
    return None


def servo_to_scad_params(s: dict) -> dict:
    """Map servo dict keys to OpenSCAD parameter names."""
    return {
        "body_length":   s["body_length"],
        "body_width":    s["body_width"],
        "body_height":   s["body_height"],
        "tab_width":     s["mounting_tab_width"],
        "tab_thickness": s["mounting_tab_thickness"],
        "tab_height":    s.get("mounting_tab_height", s["body_height"] * 0.75),
        "hole_spacing":  s["mounting_hole_spacing"],
        "hole_d":        s["mounting_hole_diameter"],
        "shaft_dia":     s["shaft_diameter"],
        "shaft_off_x":   s.get("shaft_offset_from_center", 0),
        "shaft_off_y":   s.get("shaft_offset_from_front", 0),
        "shaft_height":  s["output_shaft_height"],
        "horn_radius":   s["horn_clearance_radius"],
    }


def build_scad_source(params: dict, style: str, profile_size: int,
                      wall: float, tolerance: float,
                      bolt_count: int, tab_holes: bool, gussets: bool) -> str:
    """Render an inline SCAD wrapper that calls servo_mount() with all params."""
    include_path = str(SCAD_MAIN).replace("\\", "/")

    def fmt(v):
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, str):
            return f'"{v}"'
        return str(v)

    lines = [f'include <{include_path}>',
             "",
             "servo_mount("]
    kv = {
        "style":             style,
        "profile_size":      profile_size,
        "wall":              wall,
        "tolerance":         tolerance,
        "bolt_count":        bolt_count,
        "include_tab_holes": tab_holes,
        "gussets":           gussets,
        **params,
    }
    for k, v in kv.items():
        lines.append(f"    {k}={fmt(v)},")
    # remove trailing comma from last param
    lines[-1] = lines[-1].rstrip(",")
    lines.append(");")
    return "\n".join(lines)


def run_openscad(scad_file: Path, out_stl: Path, out_png: Path,
                 png_size: tuple = (800, 600)) -> tuple[bool, str]:
    """Call OpenSCAD CLI to render STL and PNG. Returns (success, message)."""
    if not shutil.which(OPENSCAD.split()[0] if " " in OPENSCAD else OPENSCAD):
        return False, (
            f"OpenSCAD not found (looked for '{OPENSCAD}'). "
            "Install from https://openscad.org/ and ensure it is on PATH."
        )

    # STL export
    stl_cmd = [
        OPENSCAD, "-o", str(out_stl), str(scad_file)
    ]
    result = subprocess.run(stl_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return False, f"OpenSCAD STL error:\n{result.stderr}"

    # PNG preview
    png_cmd = [
        OPENSCAD,
        "--render",
        "--colorscheme=Sunset",
        f"--imgsize={png_size[0]},{png_size[1]}",
        "--camera=0,0,0,55,0,25,250",
        "-o", str(out_png),
        str(scad_file),
    ]
    result = subprocess.run(png_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        return False, f"OpenSCAD PNG error:\n{result.stderr}"

    return True, "OK"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate MakerBeam servo mount STL + PNG.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )

    # Servo source
    src = parser.add_mutually_exclusive_group()
    src.add_argument("--servo", metavar="NAME",
                     help="Servo name from database (e.g. SG90, MG996R)")
    src.add_argument("--spec",  metavar="FILE",
                     help="JSON file with servo spec")

    # Manual servo dims (used when --servo gives an unknown name)
    parser.add_argument("--body-length",    type=float, help="Body length (mm)")
    parser.add_argument("--body-width",     type=float, help="Body width (mm)")
    parser.add_argument("--body-height",    type=float, help="Body height (mm)")
    parser.add_argument("--tab-width",      type=float, help="Mounting tab width (mm)")
    parser.add_argument("--tab-thickness",  type=float, help="Mounting tab thickness (mm)")
    parser.add_argument("--tab-height",     type=float, help="Tab Z position above body bottom (mm)")
    parser.add_argument("--hole-spacing",   type=float, help="Mounting hole c-c spacing (mm)")
    parser.add_argument("--hole-d",         type=float, help="Mounting hole diameter (mm)")
    parser.add_argument("--shaft-dia",      type=float, help="Output shaft diameter (mm)")
    parser.add_argument("--shaft-off-x",    type=float, default=0.0, help="Shaft offset X from center (mm)")
    parser.add_argument("--shaft-off-y",    type=float, default=0.0, help="Shaft offset Y from center (mm)")
    parser.add_argument("--shaft-height",   type=float, help="Shaft height above body top (mm)")
    parser.add_argument("--horn-radius",    type=float, help="Horn clearance radius (mm)")

    # Mount options
    parser.add_argument("--style",    default="top",
                        choices=["top", "side", "inline", "bracket"],
                        help="Mount style (default: top)")
    parser.add_argument("--profile",  type=int, default=10, choices=[10, 15],
                        help="MakerBeam profile size in mm (default: 10)")
    parser.add_argument("--wall",     type=float, default=2.4,
                        help="Wall thickness in mm (default: 2.4)")
    parser.add_argument("--tol",      type=float, default=0.3,
                        help="Servo pocket clearance in mm (default: 0.3)")
    parser.add_argument("--bolts",    type=int, default=2, choices=[1, 2],
                        help="Number of MakerBeam bolts (default: 2)")
    parser.add_argument("--no-tab-holes", action="store_true",
                        help="Omit servo mounting tab holes")
    parser.add_argument("--no-gussets",   action="store_true",
                        help="Omit reinforcement gussets")

    # Output
    parser.add_argument("--output-dir", default=str(OUTPUT_DIR),
                        help="Output directory (default: ./output)")
    parser.add_argument("--scad-only",  action="store_true",
                        help="Write SCAD source only, skip OpenSCAD rendering")
    parser.add_argument("--no-stl",     action="store_true", help="Skip STL export")
    parser.add_argument("--no-png",     action="store_true", help="Skip PNG export")

    args = parser.parse_args()

    # ── Resolve servo spec ──────────────────────────────────────────────────
    servo_name = "custom"
    servo_params: dict | None = None

    if args.spec:
        spec_path = Path(args.spec)
        if not spec_path.exists():
            sys.exit(f"Error: spec file '{spec_path}' not found.")
        with open(spec_path) as f:
            raw = json.load(f)
        # support both flat spec and nested {"servos": {...}} from lookup --json
        if "body_length" in raw:
            servo_name = raw.get("name", spec_path.stem)
            servo_params = servo_to_scad_params(raw)
        else:
            sys.exit("Error: spec JSON must have at least a 'body_length' key.")

    elif args.servo:
        servo_name = args.servo
        db = load_servo_db()
        found = find_servo(db, args.servo)
        if found:
            servo_params = servo_to_scad_params(found)
        else:
            print(f"Note: '{args.servo}' not in database — using manual dimensions.")

    # Override / fill with CLI args if provided
    manual_keys = {
        "body_length":  args.body_length,
        "body_width":   args.body_width,
        "body_height":  args.body_height,
        "tab_width":    args.tab_width,
        "tab_thickness":args.tab_thickness,
        "tab_height":   args.tab_height,
        "hole_spacing": args.hole_spacing,
        "hole_d":       args.hole_d,
        "shaft_dia":    args.shaft_dia,
        "shaft_off_x":  args.shaft_off_x,
        "shaft_off_y":  args.shaft_off_y,
        "shaft_height": args.shaft_height,
        "horn_radius":  args.horn_radius,
    }
    if servo_params is None:
        # pure manual mode — all required fields must be present
        required = ["body_length","body_width","body_height","tab_width",
                    "tab_thickness","tab_height","hole_spacing","hole_d",
                    "shaft_dia","shaft_height","horn_radius"]
        missing = [k for k in required if manual_keys.get(k) is None]
        if missing:
            sys.exit(f"Error: missing required dimensions: {', '.join(missing)}\n"
                     "Use --servo <name> or --spec <file>, or provide all dims manually.")
        servo_params = {k: v for k, v in manual_keys.items() if v is not None}
    else:
        # update with any CLI overrides
        for k, v in manual_keys.items():
            if v is not None:
                servo_params[k] = v

    # ── Build SCAD source ───────────────────────────────────────────────────
    scad_source = build_scad_source(
        params      = servo_params,
        style       = args.style,
        profile_size= args.profile,
        wall        = args.wall,
        tolerance   = args.tol,
        bolt_count  = args.bolts,
        tab_holes   = not args.no_tab_holes,
        gussets     = not args.no_gussets,
    )

    # ── Output paths ────────────────────────────────────────────────────────
    safe_name  = servo_name.replace("/", "_").replace(" ", "_")
    folder     = Path(args.output_dir) / f"{safe_name}_{args.style}_mb{args.profile}"
    folder.mkdir(parents=True, exist_ok=True)

    scad_file  = folder / f"{safe_name}_{args.style}_mb{args.profile}.scad"
    stl_file   = folder / f"{safe_name}_{args.style}_mb{args.profile}.stl"
    png_file   = folder / f"{safe_name}_{args.style}_mb{args.profile}.png"

    scad_file.write_text(scad_source)
    print(f"SCAD: {scad_file}")

    if args.scad_only:
        return

    # ── Render ──────────────────────────────────────────────────────────────
    if not args.no_stl or not args.no_png:
        ok, msg = run_openscad(
            scad_file,
            stl_file if not args.no_stl else Path(tempfile.mktemp(suffix=".stl")),
            png_file if not args.no_png else Path(tempfile.mktemp(suffix=".png")),
        )
        if ok:
            if not args.no_stl:
                print(f"STL:  {stl_file}")
            if not args.no_png:
                print(f"PNG:  {png_file}")
        else:
            print(f"Warning: {msg}", file=sys.stderr)
            print("SCAD file was written; render manually with OpenSCAD.")


if __name__ == "__main__":
    main()
