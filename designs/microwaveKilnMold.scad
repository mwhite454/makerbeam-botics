include <BOSL2/std.scad>
include <BOSL2/threading.scad>


unit = 25.4;
maxPrintUnits = 10;
microwaveY = 8.5 * unit;
microwaveX = 14.5 * unit;
microwaveZ = 8.5 * unit;
wallThickness = 2 * unit;

kilnHeight = 14;
tpi = 0.8;
handleDepth=3 * unit;

//color("blue")
//cylinder(microwaveX, r = microwaveY / 2, center = true);

color("red")
acme_threaded_rod(d= microwaveY - wallThickness , l=(kilnHeight * unit), tpi=tpi, bevel1 = true, $fn=32);


color("green")
translate([0, 0, ((kilnHeight *  0.4) * unit) ])
cylinder(h=handleDepth, d=(microwaveY * 0.75) - wallThickness, center=true);