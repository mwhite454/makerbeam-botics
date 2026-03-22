// Servo mount for MakerBeamXL 15x15mm extrusion
// Compatible with standard SG90 / MG90S micro-servos
// Bolt pattern: two M3 holes spanning 15mm centres (matches one MakerBeamXL face)

use <makerbeam.scad>

// --- SG90 / MG90S servo dimensions ---
SERVO_BODY_W  = 22.8;   // body width  (X)
SERVO_BODY_D  = 12.5;   // body depth  (Y)
SERVO_BODY_H  = 22.5;   // body height (Z, above mounting flange)
SERVO_FLANGE_W = 32.0;  // flange width (includes mounting tabs)
SERVO_FLANGE_H =  2.5;  // flange thickness
SERVO_TAB_HOLE_D = 2.1; // M2 screw clearance hole in servo flange
SERVO_TAB_SPAN = 27.7;  // centre-to-centre distance between flange holes
SERVO_OUTPUT_D =  4.8;  // output shaft boss diameter
SERVO_OUTPUT_H =  3.0;  // output shaft boss height above flange top
SERVO_OUTPUT_X = -11.4; // output shaft X offset from body centre

// --- Mount parameters ---
WALL         =  3.0;    // wall thickness
MB_BOLT_D    =  3.2;    // M3 clearance hole diameter
MB_BOLT_SPAN = 15.0;    // bolt hole centres (one MakerBeamXL face width)
FILLET       =  1.5;    // edge fillet radius (for print quality)
TOL          =  0.3;    // servo body pocket tolerance

$fn = 40;

// Overall bracket dimensions
BRACKET_W = SERVO_BODY_W + 2 * WALL + 2 * TOL;
BRACKET_D = SERVO_BODY_D + 2 * WALL + 2 * TOL;
BRACKET_H = MB_SIZE + WALL + SERVO_FLANGE_H + SERVO_BODY_H / 2;

module servo_pocket() {
    // Cavity for the servo body (open top)
    translate([0, 0, MB_SIZE + WALL + SERVO_FLANGE_H])
    cube([SERVO_BODY_W + 2 * TOL, SERVO_BODY_D + 2 * TOL, SERVO_BODY_H + 1], center = true);

    // Flange recess
    translate([0, 0, MB_SIZE + WALL + SERVO_FLANGE_H / 2])
    cube([SERVO_FLANGE_W + 2 * TOL, SERVO_BODY_D + 2 * TOL, SERVO_FLANGE_H + 0.01], center = true);

    // Servo flange screw holes (M2 pass-through)
    for (dx = [-SERVO_TAB_SPAN / 2, SERVO_TAB_SPAN / 2])
        translate([dx, 0, MB_SIZE + WALL - 0.5])
        cylinder(h = SERVO_FLANGE_H + 2, d = SERVO_TAB_HOLE_D, center = false);

    // Output shaft boss clearance
    translate([SERVO_OUTPUT_X, 0, MB_SIZE + WALL - 0.5])
    cylinder(h = SERVO_FLANGE_H + SERVO_OUTPUT_H + 2, d = SERVO_OUTPUT_D + TOL * 2);
}

module makerbeam_bolt_holes() {
    // Two M3 holes to clamp onto a MakerBeamXL face
    for (dx = [-MB_BOLT_SPAN / 2, MB_BOLT_SPAN / 2])
        translate([dx, 0, 0])
        rotate([90, 0, 0])
        cylinder(h = BRACKET_D + 2, d = MB_BOLT_D, center = true);
}

module servo_mount() {
    difference() {
        // Solid bracket body
        cube([BRACKET_W, BRACKET_D, BRACKET_H], center = false,
             $fn = $fn);

        // MakerBeamXL channel
        translate([0, WALL, MB_SIZE / 2])
        rotate([0, 90, 0])
        cube([MB_SIZE + TOL * 2, MB_SIZE + TOL * 2, BRACKET_W + 2], center = true);

        // M3 clamping bolt holes through the MakerBeamXL channel
        translate([BRACKET_W / 2, WALL + (MB_SIZE + TOL * 2) / 2, MB_SIZE / 2])
        makerbeam_bolt_holes();

        // Servo pocket
        translate([BRACKET_W / 2, BRACKET_D / 2, 0])
        servo_pocket();
    }
}

// Place with bracket back face at Y=0
translate([-BRACKET_W / 2, -BRACKET_D / 2, 0])
servo_mount();
