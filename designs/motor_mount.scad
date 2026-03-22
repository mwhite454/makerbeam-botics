// Motor mount for MakerBeam 10x10mm extrusion
// Designed for standard N20 micro gear motors (12mm body diameter)
// Bolt pattern: two M3 holes on one MakerBeam face

use <makerbeam.scad>

// --- N20 motor dimensions ---
MOTOR_DIAM    = 12.0;  // motor body diameter (mm)
MOTOR_LENGTH  = 10.0;  // exposed shaft + gearbox length beyond clamp face (mm)
SHAFT_DIAM    =  3.0;  // output shaft diameter (mm)

// --- Mount parameters ---
WALL         = 3.0;   // wall thickness
MB_BOLT_D    = 3.2;   // M3 clearance hole diameter
MB_BOLT_SPAN = 10.0;  // bolt centres (one MakerBeam face)
CLAMP_BOLT_D = 3.2;   // M3 clamp bolt diameter
TOL          = 0.3;   // motor body tolerance

$fn = 60;

CLAMP_OUTER = MOTOR_DIAM + 2 * TOL + 2 * WALL;
CLAMP_H     = 16.0;   // axial depth of clamp around motor

module motor_clamp_ring() {
    difference() {
        cylinder(h = CLAMP_H, d = CLAMP_OUTER);
        // Motor body bore
        translate([0, 0, -0.5])
        cylinder(h = CLAMP_H + 1, d = MOTOR_DIAM + 2 * TOL);
        // Shaft clearance
        translate([0, 0, -0.5])
        cylinder(h = CLAMP_H + 2, d = SHAFT_DIAM + TOL * 2);
        // Clamp split slot
        translate([-0.6, -(CLAMP_OUTER / 2 + 1), -0.5])
        cube([1.2, CLAMP_OUTER + 2, CLAMP_H + 1]);
        // Clamp bolt holes (perpendicular to split)
        translate([0, 0, CLAMP_H / 2])
        rotate([0, 90, 0])
        cylinder(h = CLAMP_OUTER + 2, d = CLAMP_BOLT_D, center = true);
    }
}

module makerbeam_channel_and_bolts(bracket_w) {
    // Rectangular channel to slide over MakerBeam
    translate([0, MB_SIZE / 2, 0])
    rotate([0, 90, 0])
    cube([MB_SIZE + TOL * 2, MB_SIZE + TOL * 2, bracket_w + 2], center = true);

    // Two M3 clamping bolt holes
    for (dx = [-MB_BOLT_SPAN / 2, MB_BOLT_SPAN / 2])
        translate([dx, MB_SIZE / 2, MB_SIZE / 2])
        rotate([90, 0, 0])
        cylinder(h = MB_SIZE + 4, d = MB_BOLT_D, center = true);
}

module motor_mount() {
    BRACKET_W = CLAMP_OUTER + 2 * WALL;
    BRACKET_D = MB_SIZE + WALL + CLAMP_OUTER / 2;
    BRACKET_H = CLAMP_OUTER;

    difference() {
        union() {
            // Base plate bridging MakerBeam channel and clamp ring
            cube([BRACKET_W, BRACKET_D, BRACKET_H], center = false);
        }

        // MakerBeam channel
        translate([BRACKET_W / 2, 0, MB_SIZE / 2])
        makerbeam_channel_and_bolts(BRACKET_W);

        // Clamp ring bore centred on the face opposite MakerBeam
        translate([BRACKET_W / 2, BRACKET_D, BRACKET_H / 2])
        rotate([90, 0, 0])
        cylinder(h = BRACKET_D - MB_SIZE - WALL + 1, d = MOTOR_DIAM + 2 * TOL);

        // Clamp split slot
        translate([BRACKET_W / 2 - 0.6, MB_SIZE + WALL - 0.5, -0.5])
        cube([1.2, BRACKET_D + 1, BRACKET_H + 1]);

        // Clamp bolt hole
        translate([BRACKET_W / 2, MB_SIZE + WALL + (BRACKET_D - MB_SIZE - WALL) / 2, BRACKET_H / 2])
        rotate([0, 90, 0])
        cylinder(h = BRACKET_W + 2, d = CLAMP_BOLT_D, center = true);
    }
}

// Centre on origin for preview
translate([-( CLAMP_OUTER + 2 * WALL) / 2, -(MB_SIZE + WALL + CLAMP_OUTER / 2) / 2, -(CLAMP_OUTER) / 2])
motor_mount();
