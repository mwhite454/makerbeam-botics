// makerbeam_slot.scad
// MakerBeam T-slot attachment library
// Provides modules for mounting feet and clamp-style brackets
//
// Usage: include <makerbeam_slot.scad>

// ─── Profile constants ──────────────────────────────────────────────────────
// MakerBeam 10x10mm
MB10_SIZE        = 10.0;
MB10_SLOT_W      = 6.0;
MB10_SLOT_D      = 1.8;
MB10_INNER_W     = 7.5;
MB10_INNER_D     = 3.0;
MB10_TNUT_W      = 5.9;
MB10_TNUT_T      = 1.8;
MB10_TNUT_L      = 6.0;

// MakerBeam XL 15x15mm
MB15_SIZE        = 15.0;
MB15_SLOT_W      = 6.0;
MB15_SLOT_D      = 2.5;
MB15_INNER_W     = 10.0;
MB15_INNER_D     = 4.5;
MB15_TNUT_W      = 5.9;
MB15_TNUT_T      = 2.4;
MB15_TNUT_L      = 7.5;

// ─── Derived profile parameters ─────────────────────────────────────────────
function mb_slot_w(ps)   = (ps == 15) ? MB15_SLOT_W  : MB10_SLOT_W;
function mb_slot_d(ps)   = (ps == 15) ? MB15_SLOT_D  : MB10_SLOT_D;
function mb_inner_w(ps)  = (ps == 15) ? MB15_INNER_W : MB10_INNER_W;
function mb_inner_d(ps)  = (ps == 15) ? MB15_INNER_D : MB10_INNER_D;
function mb_tnut_w(ps)   = (ps == 15) ? MB15_TNUT_W  : MB10_TNUT_W;
function mb_tnut_t(ps)   = (ps == 15) ? MB15_TNUT_T  : MB10_TNUT_T;
function mb_tnut_l(ps)   = (ps == 15) ? MB15_TNUT_L  : MB10_TNUT_L;

// ─── T-nut void ─────────────────────────────────────────────────────────────
// Subtracts a T-nut slot void from a solid, for drop-in nuts.
// Origin: center of bolt hole, flush with face of beam.
// The void extends in the +Z direction (into the part being mounted).
module mb_tnut_void(profile_size=10, bolt_diameter=3.2, extra_depth=0) {
    sw  = mb_slot_w(profile_size);
    sd  = mb_slot_d(profile_size);
    iw  = mb_inner_w(profile_size);
    id  = mb_inner_d(profile_size);
    tw  = mb_tnut_w(profile_size);
    tt  = mb_tnut_t(profile_size);
    tl  = mb_tnut_l(profile_size);

    union() {
        // bolt clearance hole (extends through the foot/wall)
        cylinder(d=bolt_diameter, h=100, center=false, $fn=24);

        // T-nut body void (slot opening and inner channel)
        translate([0, 0, -(sd + id + extra_depth)]) {
            // inner wide channel
            cube([iw, tl + 1, id + extra_depth], center=true);
        }
        // slot neck
        translate([0, 0, -(sd/2)]) {
            cube([sw, tl + 1, sd], center=true);
        }
    }
}

// ─── Bolt-through foot ──────────────────────────────────────────────────────
// A flat mounting foot with one or two M3 bolt holes for attaching to MakerBeam.
// The foot sits flush against the beam face.
// foot_length: along beam axis
// foot_width:  perpendicular to beam (usually = profile_size or slightly wider)
// foot_thickness: height of foot pad
// bolt_count: 1 or 2
// bolt_spacing: distance between bolt centers (only used when bolt_count=2)
module mb_foot(
    profile_size  = 10,
    foot_length   = 20,
    foot_width    = 12,
    foot_thickness = 3.0,
    bolt_diameter  = 3.2,
    bolt_count     = 1,
    bolt_spacing   = 10
) {
    difference() {
        // foot body
        cube([foot_length, foot_width, foot_thickness], center=true);

        // bolt holes
        if (bolt_count == 1) {
            cylinder(d=bolt_diameter, h=foot_thickness + 1, center=true, $fn=24);
        } else {
            for (x = [-bolt_spacing/2, bolt_spacing/2]) {
                translate([x, 0, 0])
                    cylinder(d=bolt_diameter, h=foot_thickness + 1, center=true, $fn=24);
            }
        }
    }
}

// ─── Clamp bracket ──────────────────────────────────────────────────────────
// A U-shaped clamp that wraps around a MakerBeam profile.
// The clamp uses two bolts through the sides to grip the profile.
// Origin: center of profile cross-section, clamp opens toward +Y.
module mb_clamp(
    profile_size   = 10,
    clamp_length   = 20,
    wall           = 2.4,
    bolt_diameter  = 3.2,
    bolt_count     = 1,
    bolt_spacing   = 10
) {
    ps = profile_size;
    // outer dims
    ow = ps + 2 * wall;
    oh = ps + wall;  // 3 sides

    difference() {
        // clamp body (3-sided channel)
        translate([-clamp_length/2, -ps/2 - wall, -ps/2 - wall])
            cube([clamp_length, ow, oh]);

        // profile channel void
        translate([-clamp_length/2 - 1, -ps/2, -ps/2])
            cube([clamp_length + 2, ps, ps]);

        // bolt holes through walls (Y axis)
        if (bolt_count == 1) {
            translate([0, -(ps/2 + wall + 1), 0])
                rotate([-90, 0, 0])
                    cylinder(d=bolt_diameter, h=ow + 2, $fn=24);
        } else {
            for (x = [-bolt_spacing/2, bolt_spacing/2]) {
                translate([x, -(ps/2 + wall + 1), 0])
                    rotate([-90, 0, 0])
                        cylinder(d=bolt_diameter, h=ow + 2, $fn=24);
            }
        }
    }
}

// ─── Demo ───────────────────────────────────────────────────────────────────
// Uncomment to preview:
// mb_foot(profile_size=10, bolt_count=2, bolt_spacing=10);
// translate([30, 0, 0]) mb_clamp(profile_size=15, bolt_count=2, bolt_spacing=15);
