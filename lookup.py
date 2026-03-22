#!/usr/bin/env python3
"""
lookup.py — Look up servo specs from the parts database.

Usage:
    python lookup.py SG90
    python lookup.py MG996R --save output/mg996r.json
    python lookup.py --list
    python lookup.py --list --json
"""

import argparse
import json
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / "parts_db" / "servos.json"


def load_db() -> dict:
    if not DB_PATH.exists():
        sys.exit(f"Error: servo database not found at {DB_PATH}")
    with open(DB_PATH) as f:
        return json.load(f)


def find_servo(db: dict, name: str) -> dict | None:
    """Case-insensitive lookup with partial match fallback."""
    servos = db.get("servos", {})

    # exact match first
    if name in servos:
        return servos[name]

    # case-insensitive exact
    name_lower = name.lower()
    for key, val in servos.items():
        if key.lower() == name_lower:
            return val

    # partial match
    matches = {k: v for k, v in servos.items() if name_lower in k.lower()}
    if len(matches) == 1:
        return next(iter(matches.values()))
    if len(matches) > 1:
        print(f"Ambiguous name '{name}'. Matches: {', '.join(matches.keys())}")
        return None

    return None


def print_servo(servo: dict, json_output: bool = False) -> None:
    if json_output:
        print(json.dumps(servo, indent=2))
        return

    name = servo.get("name", "?")
    mfr  = servo.get("manufacturer", "?")
    typ  = servo.get("type", "?")
    print(f"\n{'─'*50}")
    print(f"  {name}  ({mfr})  [{typ}]")
    print(f"{'─'*50}")
    print(f"  Body (L×W×H):        {servo['body_length']} × {servo['body_width']} × {servo['body_height']} mm")
    print(f"  Total with tabs:     {servo.get('total_length_with_tabs', '?')} mm")
    print(f"  Mounting tab:        W={servo['mounting_tab_width']} mm  T={servo['mounting_tab_thickness']} mm")
    print(f"  Hole spacing (c-c):  {servo['mounting_hole_spacing']} mm")
    print(f"  Hole diameter:       {servo['mounting_hole_diameter']} mm")
    print(f"  Shaft diameter:      {servo['shaft_diameter']} mm")
    print(f"  Shaft offset X:      {servo['shaft_offset_from_center']} mm")
    print(f"  Output shaft height: {servo['output_shaft_height']} mm")
    print(f"  Horn clearance r:    {servo['horn_clearance_radius']} mm")
    print(f"  Weight:              {servo['weight_g']} g")
    voltages = servo.get("voltage_v", [])
    if voltages:
        print(f"  Voltage:             {voltages[0]}–{voltages[-1]} V")
    torques = servo.get("torque_kg_cm", [])
    if torques:
        print(f"  Torque:              {torques[0]}–{torques[-1]} kg·cm")
    notes = servo.get("notes", "")
    if notes:
        print(f"  Notes:               {notes}")
    print()


def list_servos(db: dict, json_output: bool = False) -> None:
    servos = db.get("servos", {})
    if json_output:
        print(json.dumps(servos, indent=2))
        return
    print(f"\n{'Servo':<20} {'Type':<20} {'Body L×W×H':<28} {'Weight'}")
    print("─" * 80)
    for key, s in servos.items():
        dims = f"{s['body_length']}×{s['body_width']}×{s['body_height']} mm"
        print(f"{key:<20} {s.get('type',''):<20} {dims:<28} {s['weight_g']} g")
    print()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Look up hobby servo specs from the parts database.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("name", nargs="?", help="Servo name to look up (e.g. SG90, MG996R)")
    parser.add_argument("--list", action="store_true", help="List all known servos")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    parser.add_argument("--save", metavar="FILE", help="Save specs to a JSON file")
    args = parser.parse_args()

    db = load_db()

    if args.list:
        list_servos(db, json_output=args.json)
        return

    if not args.name:
        parser.print_help()
        sys.exit(1)

    servo = find_servo(db, args.name)
    if servo is None:
        print(f"Servo '{args.name}' not found in database.")
        print(f"Known servos: {', '.join(db.get('servos', {}).keys())}")
        sys.exit(1)

    print_servo(servo, json_output=args.json)

    if args.save:
        save_path = Path(args.save)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        with open(save_path, "w") as f:
            json.dump(servo, f, indent=2)
        print(f"Saved to {save_path}")


if __name__ == "__main__":
    main()
