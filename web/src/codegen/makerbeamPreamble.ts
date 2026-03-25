// Inlined content of designs/makerbeam.scad
// This is prepended to the generated code whenever a MakerBeam node is present,
// so the WASM filesystem doesn't need to resolve external files.

export const MAKERBEAM_PREAMBLE = `// MakerBeamXL base profile and common dimensions
// MakerBeamXL: 15x15mm aluminium extrusion with T-slot groove
// Hardware: M3 bolts and T-slot nuts

// --- Core dimensions ---
MB_SIZE        = 15;   // Extrusion cross-section (mm)
MB_SLOT_WIDTH  = 8.0;  // T-slot opening width (mm)
MB_SLOT_DEPTH  = 6.0;  // T-slot groove depth (mm)
MB_BOLT_DIAM   = 3.2;  // M3 clearance hole diameter (mm)
MB_NUT_WIDTH   = 6.5;  // T-nut width across flats (mm)
MB_NUT_HEIGHT  = 2.4;  // T-nut height (mm)

// --- Print tolerances ---
PRINT_TOL      = 0.2;  // General tolerance for printed-to-printed fits (mm)
SLOT_TOL       = 0.3;  // Extra tolerance for T-slot fits (mm)

// --- Utility modules ---

// A single MakerBeamXL extrusion segment of given length along the Z axis.
module makerbeam(length, color_val = "silver") {
    color(color_val)
    linear_extrude(length)
    difference() {
        square([MB_SIZE, MB_SIZE], center = true);
        // Four T-slot grooves (top, bottom, left, right)
        for (rot = [0, 90, 180, 270]) {
            rotate([0, 0, rot])
            translate([MB_SIZE / 2 - MB_SLOT_DEPTH, 0])
            union() {
                square([MB_SLOT_DEPTH, MB_SLOT_WIDTH], center = true);
                translate([-MB_SLOT_DEPTH / 2, 0])
                square([MB_SLOT_DEPTH / 2, MB_BOLT_DIAM], center = true);
            }
        }
    }
}

// A clearance hole for an M3 bolt.
module m3_hole(depth = 20) {
    cylinder(h = depth, d = MB_BOLT_DIAM, center = true, $fn = 20);
}

// A slot for a MakerBeamXL T-nut (laid flat, bolt axis along Z).
module t_nut_slot(depth = MB_SLOT_DEPTH + SLOT_TOL) {
    cube([MB_NUT_WIDTH + SLOT_TOL, MB_NUT_HEIGHT + SLOT_TOL, depth], center = true);
}
`
