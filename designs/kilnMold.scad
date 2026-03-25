include <BOSL/constants.scad>
use <BOSL/transforms.scad>
use <BOSL/masks.scad>

printbedlimit = 256;

wallThickness = 3;
unit = 25.4;
kilnThickness = 2 * unit;
kilnHeight = 8 * unit;
kilnWidth =  9 * unit;
ledgeDepth =  unit;
ridgeSize = 10;
ridgeGap = 10;

      difference(){
          color("blue")
            cube([kilnWidth, kilnHeight, kilnThickness], center = true);
            translate([0, 0, wallThickness])
                fillet(fillet=4, size=[kilnWidth - ledgeDepth, kilnHeight - ledgeDepth, kilnThickness - ledgeDepth], edges=EDGES_ALL - EDGES_TOP ){
                    cube([kilnWidth - ledgeDepth, kilnHeight - ledgeDepth, kilnThickness - ledgeDepth], center = true);}
            translate([0, 0, ledgeDepth]) 
                fillet(fillet=4, size=[kilnWidth - wallThickness, kilnHeight - wallThickness, kilnThickness - wallThickness], edges=EDGES_ALL - EDGES_TOP) 
                    cube([kilnWidth - wallThickness, kilnHeight - wallThickness, kilnThickness - wallThickness], center =  true);    
        }
        
        yspread(ridgeGap  + ridgeSize, n=8 ) {
            fillet(fillet=4, size=[kilnWidth - (2.2* ledgeDepth), ridgeSize, ridgeSize], edges= EDGES_ALL - EDGES_BOTTOM ) 
                cube([kilnWidth - (2.2* ledgeDepth), ridgeSize, ridgeSize], center=true);
        }
    
    







