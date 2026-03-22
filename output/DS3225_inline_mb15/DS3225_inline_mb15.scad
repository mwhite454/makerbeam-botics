include </home/user/makerbeam-botics/scad/servo_mount.scad>

servo_mount(
    style="inline",
    profile_size=15,
    wall=2.4,
    tolerance=0.3,
    bolt_count=2,
    include_tab_holes=true,
    gussets=true,
    body_length=40.0,
    body_width=20.0,
    body_height=44.0,
    tab_width=7.0,
    tab_thickness=2.5,
    tab_height=37.0,
    hole_spacing=49.0,
    hole_d=3.0,
    shaft_dia=6.4,
    shaft_off_x=0.0,
    shaft_off_y=0.0,
    shaft_height=8.0,
    horn_radius=20.0
);