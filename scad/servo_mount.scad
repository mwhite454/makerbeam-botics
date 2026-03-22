// servo_mount.scad
// Parametric servo mount for MakerBeam aluminum extrusion.
//
// Styles:
//   "top"     — servo sits on top of beam, shaft pointing up
//   "side"    — servo mounts to side face of beam, shaft pointing out
//   "inline"  — servo axis runs parallel to beam axis, shaft pointing along beam
//   "bracket" — L-bracket, servo perpendicular to beam end
//
// Usage: render via generate.py or directly in OpenSCAD.

include <makerbeam_slot.scad>
include <servo_body.scad>

// ─── Main servo mount module ─────────────────────────────────────────────────
module servo_mount(
    // Mount style
    style                = "top",       // "top" | "side" | "inline" | "bracket"

    // MakerBeam profile
    profile_size         = 10,          // 10 or 15

    // Servo body dimensions
    body_length          = 22.2,
    body_width           = 11.8,
    body_height          = 22.7,
    tab_width            = 5.2,
    tab_thickness        = 2.5,
    tab_height           = 17.0,
    hole_spacing         = 28.0,
    hole_d               = 2.0,
    shaft_dia            = 4.7,
    shaft_off_x          = 0.0,
    shaft_off_y          = 0.0,
    shaft_height         = 5.5,
    horn_radius          = 13.0,

    // Mount parameters
    wall                 = 2.4,         // wall thickness (mm)
    tolerance            = 0.3,         // servo pocket clearance (mm)
    bolt_count           = 2,           // bolts into MakerBeam (1 or 2)
    include_tab_holes    = true,        // whether to drill servo tab holes
    gussets              = true         // reinforcement gussets
) {
    ps   = profile_size;
    bolt_d = 3.2;  // M3 clearance

    if (style == "top") {
        _mount_top(ps, wall, tolerance, bolt_count, bolt_d, include_tab_holes, gussets,
                   body_length, body_width, body_height,
                   tab_width, tab_thickness, tab_height,
                   hole_spacing, hole_d,
                   shaft_dia, shaft_off_x, shaft_off_y, shaft_height, horn_radius);

    } else if (style == "side") {
        _mount_side(ps, wall, tolerance, bolt_count, bolt_d, include_tab_holes, gussets,
                    body_length, body_width, body_height,
                    tab_width, tab_thickness, tab_height,
                    hole_spacing, hole_d,
                    shaft_dia, shaft_off_x, shaft_off_y, shaft_height, horn_radius);

    } else if (style == "inline") {
        _mount_inline(ps, wall, tolerance, bolt_count, bolt_d, include_tab_holes, gussets,
                      body_length, body_width, body_height,
                      tab_width, tab_thickness, tab_height,
                      hole_spacing, hole_d,
                      shaft_dia, shaft_off_x, shaft_off_y, shaft_height, horn_radius);

    } else if (style == "bracket") {
        _mount_bracket(ps, wall, tolerance, bolt_count, bolt_d, include_tab_holes, gussets,
                       body_length, body_width, body_height,
                       tab_width, tab_thickness, tab_height,
                       hole_spacing, hole_d,
                       shaft_dia, shaft_off_x, shaft_off_y, shaft_height, horn_radius);
    }
}

// ─── TOP mount ───────────────────────────────────────────────────────────────
// Servo sits on top of beam, shaft points up (+Z).
// The mount has a base plate that spans the beam, with bolt holes into the T-slot,
// and walls that form a pocket for the servo body.
module _mount_top(ps, wall, tol, bolt_count, bolt_d, inc_tabs, gussets,
                  bl, bw, bh, tw, tt, th, hs, hd, sdiam, sox, soy, sh, hr) {

    base_h    = wall;                       // base plate thickness
    pocket_h  = bh + tol;                  // servo pocket depth
    pocket_bw = bw + 2*tol;
    pocket_bl = bl + 2*tol;
    total_w   = max(pocket_bw + 2*wall, ps + 2*wall);
    total_l   = max(pocket_bl + 2*wall, ps + 4*wall);
    total_h   = base_h + pocket_h;

    // bolt spacing along beam
    b_spacing = (bolt_count == 2) ? ps : 0;

    difference() {
        union() {
            // main block
            translate([-total_w/2, -total_l/2, 0])
                cube([total_w, total_l, total_h]);

            // gussets: triangular ribs on each side
            if (gussets) {
                gw = wall;
                gh = min(pocket_h * 0.6, 10);
                gd = min(total_l * 0.3, 10);
                for (sx = [-1, 1]) {
                    translate([sx * (total_w/2 - gw), -gd/2, base_h])
                        _gusset(gw, gd, gh);
                }
            }
        }

        // ── servo pocket (from top) ──────────────────────────────────
        translate([0, 0, base_h])
            servo_body_void(
                body_length  = bl, body_width = bw, body_height = bh,
                tab_width    = tw, tab_thickness = tt, tab_height = th,
                hole_spacing = hs, hole_d = hd,
                shaft_dia    = sdiam, shaft_off_x = sox, shaft_off_y = soy,
                shaft_height = sh, horn_radius = hr,
                tolerance    = tol,
                include_tabs = inc_tabs,
                include_horn = false
            );

        // ── M3 bolt holes down through base into MakerBeam T-slot ───
        if (bolt_count == 1) {
            translate([0, 0, -1])
                cylinder(d=bolt_d, h=base_h+2, $fn=24);
        } else {
            for (y = [-b_spacing/2, b_spacing/2]) {
                translate([0, y, -1])
                    cylinder(d=bolt_d, h=base_h+2, $fn=24);
            }
        }

        // ── bottom face flat (remove anything below z=0) ────────────
        translate([-100, -100, -50])
            cube([200, 200, 50]);
    }
}

// ─── SIDE mount ──────────────────────────────────────────────────────────────
// Servo mounts to side face of beam, shaft points sideways (+X).
// A plate attaches to the beam face, walls form a pocket open to the side.
module _mount_side(ps, wall, tol, bolt_count, bolt_d, inc_tabs, gussets,
                   bl, bw, bh, tw, tt, th, hs, hd, sdiam, sox, soy, sh, hr) {

    base_h    = wall;
    pocket_w  = bh + tol;   // servo pocket "depth" in X
    pocket_bw = bw + 2*tol;
    pocket_bl = bl + 2*tol;
    total_h   = max(pocket_bw + 2*wall, ps);
    total_l   = max(pocket_bl + 2*wall, ps + 2*wall);
    total_x   = base_h + pocket_w;

    b_spacing = (bolt_count == 2) ? ps : 0;

    difference() {
        union() {
            // base plate against beam face (YZ plane at x=0)
            translate([0, -total_l/2, -total_h/2])
                cube([base_h, total_l, total_h]);

            // pocket walls extending in +X
            translate([base_h, -total_l/2, -total_h/2])
                cube([pocket_w, total_l, wall]);
            translate([base_h, -total_l/2, total_h/2 - wall])
                cube([pocket_w, total_l, wall]);
            translate([base_h, -total_l/2, -total_h/2])
                cube([pocket_w, wall, total_h]);
            translate([base_h, total_l/2 - wall, -total_h/2])
                cube([pocket_w, wall, total_h]);

            if (gussets) {
                gw = wall;
                gh = min(total_h * 0.5, 8);
                gd = min(total_l * 0.25, 8);
                for (sz = [-1, 1]) {
                    translate([0, -gd/2, sz * (total_h/2 - gw)])
                        rotate([0, 90, 0])
                            _gusset(gw, gd, gh);
                }
            }
        }

        // servo pocket (opening in +X direction)
        translate([base_h, 0, 0])
            rotate([0, -90, 0])
                servo_body_void(
                    body_length=bl, body_width=bw, body_height=bh,
                    tab_width=tw, tab_thickness=tt, tab_height=th,
                    hole_spacing=hs, hole_d=hd,
                    shaft_dia=sdiam, shaft_off_x=sox, shaft_off_y=soy,
                    shaft_height=sh, horn_radius=hr,
                    tolerance=tol,
                    include_tabs=inc_tabs,
                    include_horn=false
                );

        // M3 bolt holes through base plate into beam T-slot
        if (bolt_count == 1) {
            translate([-1, 0, 0])
                rotate([0, 90, 0])
                    cylinder(d=bolt_d, h=base_h+2, $fn=24);
        } else {
            for (z = [-b_spacing/2, b_spacing/2]) {
                translate([-1, 0, z])
                    rotate([0, 90, 0])
                        cylinder(d=bolt_d, h=base_h+2, $fn=24);
            }
        }
    }
}

// ─── INLINE mount ────────────────────────────────────────────────────────────
// Servo axis runs parallel to beam axis (Y). Shaft points along Y.
module _mount_inline(ps, wall, tol, bolt_count, bolt_d, inc_tabs, gussets,
                     bl, bw, bh, tw, tt, th, hs, hd, sdiam, sox, soy, sh, hr) {

    base_h   = wall;
    pocket_h = bh + tol;
    pocket_w = bw + 2*tol;
    total_w  = max(pocket_w + 2*wall, ps + 2*wall);
    total_l  = bl + 2*tol + 2*wall;
    total_h  = base_h + pocket_h;

    b_spacing = (bolt_count == 2) ? ps : 0;

    difference() {
        union() {
            translate([-total_w/2, -total_l/2, 0])
                cube([total_w, total_l, total_h]);

            if (gussets) {
                gw = wall;
                gh = min(pocket_h * 0.6, 10);
                gd = min(total_w * 0.3, 8);
                for (sx = [-1, 1]) {
                    translate([sx*(total_w/2 - gw), -gd/2, base_h])
                        _gusset(gw, gd, gh);
                }
            }
        }

        // servo pocket — body axis along Y
        translate([0, 0, base_h])
            rotate([0, 0, 90])
                servo_body_void(
                    body_length=bl, body_width=bw, body_height=bh,
                    tab_width=tw, tab_thickness=tt, tab_height=th,
                    hole_spacing=hs, hole_d=hd,
                    shaft_dia=sdiam, shaft_off_x=sox, shaft_off_y=soy,
                    shaft_height=sh, horn_radius=hr,
                    tolerance=tol,
                    include_tabs=inc_tabs,
                    include_horn=false
                );

        // bolt holes into beam T-slot
        if (bolt_count == 1) {
            translate([0, 0, -1])
                cylinder(d=bolt_d, h=base_h+2, $fn=24);
        } else {
            for (x = [-b_spacing/2, b_spacing/2]) {
                translate([x, 0, -1])
                    cylinder(d=bolt_d, h=base_h+2, $fn=24);
            }
        }

        translate([-100, -100, -50]) cube([200, 200, 50]);
    }
}

// ─── BRACKET mount ───────────────────────────────────────────────────────────
// L-bracket: servo perpendicular to beam end.
// One flange bolts to beam end face; servo sits on the other flange.
module _mount_bracket(ps, wall, tol, bolt_count, bolt_d, inc_tabs, gussets,
                      bl, bw, bh, tw, tt, th, hs, hd, sdiam, sox, soy, sh, hr) {

    base_h    = wall;
    pocket_h  = bh + tol;
    pocket_bw = bw + 2*tol;
    pocket_bl = bl + 2*tol;
    flange_w  = max(ps + 2*wall, pocket_bw + 2*wall);
    flange_l  = max(ps, pocket_bl + 2*wall);
    arm_len   = pocket_h + wall;

    b_spacing = (bolt_count == 2) ? ps : 0;

    difference() {
        union() {
            // vertical flange (bolts to beam end in XZ plane)
            translate([-flange_w/2, -base_h, -flange_l/2])
                cube([flange_w, base_h, flange_l]);

            // horizontal arm extending in +Y
            translate([-flange_w/2, 0, -flange_l/2])
                cube([flange_w, arm_len, base_h]);

            // servo walls on horizontal arm
            translate([-flange_w/2, 0, base_h])
                cube([wall, arm_len, pocket_h]);
            translate([flange_w/2 - wall, 0, base_h])
                cube([wall, arm_len, pocket_h]);

            if (gussets) {
                gw = wall;
                gh = min(arm_len * 0.6, 10);
                gd = min(flange_l * 0.3, 10);
                translate([0, 0, -flange_l/2])
                    rotate([90, 0, 0])
                        _gusset(gw * 2, gd, gh);
            }
        }

        // servo pocket on horizontal arm
        translate([0, arm_len/2, base_h])
            servo_body_void(
                body_length=bl, body_width=bw, body_height=bh,
                tab_width=tw, tab_thickness=tt, tab_height=th,
                hole_spacing=hs, hole_d=hd,
                shaft_dia=sdiam, shaft_off_x=sox, shaft_off_y=soy,
                shaft_height=sh, horn_radius=hr,
                tolerance=tol,
                include_tabs=inc_tabs,
                include_horn=false
            );

        // bolt holes through vertical flange (into beam end)
        if (bolt_count == 1) {
            translate([0, -base_h-1, 0])
                rotate([-90, 0, 0])
                    cylinder(d=bolt_d, h=base_h+2, $fn=24);
        } else {
            for (z = [-b_spacing/2, b_spacing/2]) {
                translate([0, -base_h-1, z])
                    rotate([-90, 0, 0])
                        cylinder(d=bolt_d, h=base_h+2, $fn=24);
            }
        }
    }
}

// ─── Gusset helper ───────────────────────────────────────────────────────────
// A simple right-triangle gusset prism.
module _gusset(width, depth, height) {
    linear_extrude(height=width)
        polygon([[0,0], [depth,0], [0,height]]);
}

// ─── Quick preview ───────────────────────────────────────────────────────────
// Uncomment one to preview:
//
// servo_mount(style="top",     profile_size=10);
// servo_mount(style="side",    profile_size=10);
// servo_mount(style="inline",  profile_size=10);
// servo_mount(style="bracket", profile_size=10);
