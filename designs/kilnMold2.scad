// --- Print Settings & Constraints ---
printbedlimit = 256; // Max print bed dimension (unused in current geometry)
wallThickness = 3;   // Wall thickness in mm
unit = 25.4;         // Unit conversion (mm -> inches usually, but here used as mm base?)

// Kiln Dimensions (in mm based on unit)
kilnThickness = 2 * unit;     // ~50.8mm
kilnHeight = 8 * unit;
kilnWidth = 10 * unit;
ledgeDepth = unit;            // 25.4mm
ridgeSize = 10;               // Ridge height/size
ridgeGap = 10;                // Gap between ridges (currently unused in loop step)

// --- Construction Logic ---
difference() {
    // Main Kiln Shell
    color("red") 
    cube([kilnWidth, kilnHeight, kilnThickness], center = true);

//    // Subtract inner cavity/ledges
    color("green")
    translate([0, 0, unit]) // Shift by wall thickness + ledge? (Logic dependent on specific design intent)
    cube([kilnWidth - (1.5 * ledgeDepth), kilnHeight - ledgeDepth, unit], center = true);

//    // Subtract top ledges
    color("yellow") 
    translate([0, 0, ledgeDepth])
    cube([kilnWidth - ledgeDepth, kilnHeight - ledgeDepth, ledgeDepth], center = true);
//    
//    // --- Ridge Generation ---
//    color("brown")
//    for (ridge = [0 : 5]) {
//        // Improved logic to include ridgeGap in the spacing calculation
//        // translate([0, ridge * (ridgeSize + ridgeGap), 0])
//        // If you want ridges tightly packed without gaps: translate([0, ridge * ridgeSize, 0])
//        translate([0, ridge * (ridgeSize + ridgeGap), 0]) {
//            difference() {
//                color("blue")
//                cube([wallThickness, wallThickness, ridgeSize], center = true); // Adjusted size based on input
//
//                // Subtract internal ledge of the ridge
//                color("lightgray")
//                translate([0, unit/2 + wallThickness]) 
//                cube([unit - (1.5 * ledgeDepth), ledgeDepth + 3, wallThickness], center = false);
//
//                // Subtract second ledge layer?
//                color("gray")
//                translate([0, unit/2 + wallThickness + ledgeDepth + 3])
//                cube([unit - (1.5 * ridgeGap), ledgeDepth, wallThickness], center = true);
//            }
//        }
//    }
}