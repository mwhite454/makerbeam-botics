// servo_body.scad
// Generates a servo body outline as a void for press-fit or clearance pockets.
// All dimensions in mm. Tolerances should be applied by the caller.
//
// Coordinate convention (body at origin, upright):
//   X: body width  (side-to-side)
//   Y: body length (front-to-back, tabs extend in ±Y)
//   Z: body height (shaft points in +Z)

// ─── Servo body void ────────────────────────────────────────────────────────
// Creates a negative volume representing the servo body + tabs + optional horn
// clearance. The body is centered in X and Y; the bottom of the body is at Z=0.
//
// Parameters:
//   body_length, body_width, body_height     — outer body dimensions
//   tab_width         — tab extension beyond body in ±Y
//   tab_thickness     — tab thickness (in Z, measured from top of body)
//   tab_height        — Z position of tab bottom surface above body bottom
//   hole_spacing      — center-to-center distance between mounting holes (in Y)
//   hole_d            — mounting hole diameter
//   shaft_dia         — output shaft diameter
//   shaft_off_x       — shaft offset from body center in X
//   shaft_off_y       — shaft offset from body center in Y
//   shaft_height      — protrusion of shaft above body top
//   horn_radius       — radius of horn clearance cylinder (0 = omit)
//   horn_height       — height of horn clearance (0 = omit)
//   tolerance         — clearance to add to all body dims (default 0)
//   include_tabs      — whether to include tab voids
//   include_horn      — whether to include horn clearance cylinder

module servo_body_void(
    body_length        = 22.2,
    body_width         = 11.8,
    body_height        = 22.7,
    tab_width          = 5.2,
    tab_thickness      = 2.5,
    tab_height         = 17.0,
    hole_spacing       = 28.0,
    hole_d             = 2.0,
    shaft_dia          = 4.7,
    shaft_off_x        = 0.0,
    shaft_off_y        = 0.0,
    shaft_height       = 5.5,
    horn_radius        = 13.0,
    horn_height        = 15.0,
    tolerance          = 0.0,
    include_tabs       = true,
    include_horn       = false
) {
    t  = tolerance;
    bw = body_width  + 2*t;
    bl = body_length + 2*t;
    bh = body_height + t;  // open at top

    union() {
        // ── Main body pocket ──────────────────────────────────────────
        translate([-bw/2, -bl/2, 0])
            cube([bw, bl, bh]);

        // ── Mounting tabs ─────────────────────────────────────────────
        if (include_tabs) {
            total_l_with_tabs = hole_spacing + 2*(tab_width/2);  // approx
            tw = tab_width + 2*t;
            tt = tab_thickness + t;

            // left tab (−Y side)
            translate([-(bw/2), -(hole_spacing/2 + tw/2), tab_height])
                cube([bw, tw, tt]);

            // right tab (+Y side)
            translate([-(bw/2), hole_spacing/2 - tw/2, tab_height])
                cube([bw, tw, tt]);

            // mounting holes through tabs (bolt from below in Z)
            hole_z = tab_height - 1;
            for (sign = [-1, 1]) {
                translate([0, sign * hole_spacing/2, hole_z])
                    cylinder(d=hole_d + t, h=tab_thickness + t + 2, $fn=20);
            }
        }

        // ── Output shaft stub ─────────────────────────────────────────
        translate([shaft_off_x, shaft_off_y, bh - t])
            cylinder(d=shaft_dia + 2*t, h=shaft_height + t + 1, $fn=20);

        // ── Horn clearance ────────────────────────────────────────────
        if (include_horn && horn_radius > 0 && horn_height > 0) {
            translate([shaft_off_x, shaft_off_y, bh - t])
                cylinder(r=horn_radius + t, h=horn_height + t, $fn=36);
        }
    }
}

// ─── Servo outline preview ──────────────────────────────────────────────────
// Renders a solid approximation of a servo body for visualization purposes.
module servo_body_preview(
    body_length   = 22.2,
    body_width    = 11.8,
    body_height   = 22.7,
    tab_width     = 5.2,
    tab_thickness = 2.5,
    tab_height    = 17.0,
    hole_spacing  = 28.0,
    hole_d        = 2.0,
    shaft_dia     = 4.7,
    shaft_off_x   = 0.0,
    shaft_off_y   = 0.0,
    shaft_height  = 5.5,
    horn_radius   = 13.0
) {
    color("blue", 0.4) {
        union() {
            // body
            translate([-body_width/2, -body_length/2, 0])
                cube([body_width, body_length, body_height]);

            // tabs
            for (sign = [-1, 1]) {
                translate([-body_width/2, sign * hole_spacing/2 - tab_width/2, tab_height])
                    cube([body_width, tab_width, tab_thickness]);
            }

            // shaft
            translate([shaft_off_x, shaft_off_y, body_height])
                cylinder(d=shaft_dia, h=shaft_height, $fn=20);

            // horn
            translate([shaft_off_x, shaft_off_y, body_height + shaft_height])
                cylinder(r=horn_radius, h=3, $fn=36);
        }
    }
}

// ─── Demo ───────────────────────────────────────────────────────────────────
// Uncomment to preview:
// servo_body_preview();
// translate([40, 0, 0])
//   servo_body_preview(body_length=40.7, body_width=19.7, body_height=42.9,
//                       tab_width=6.9, tab_thickness=2.5, tab_height=36.6,
//                       hole_spacing=49.0, hole_d=2.8, shaft_dia=6.3,
//                       shaft_height=7.5, horn_radius=19.0);
