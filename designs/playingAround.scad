mb_measure = 15;
tolerance = 0.3;
mb = mb_measure + tolerance;
centerPoint = (mb_measure + tolerance) / 2;
boltHoles = 3.2;
centerStrip = 3.0;
servoWidth = 20 + tolerance;
servoLength = 40 + tolerance;
servoLedge = 8;
servoLedgeHeight = 27.6;
servoMntHoles = 2.5;
servoHoleXOnCenter = 10;
servoHoleYOnCenter = 50;
threadedInsertDiameter = 4;
threadedInsertRadius = threadedInsertDiameter / 2;
threadedInsertDepth = 5;
$fn = 25;



////
difference() {

    hull(){
        translate([0, servoLedge - servoWidth, servoLedgeHeight])
            cube([servoWidth,servoLedge, 1],center=true);
        
        cube([servoWidth, servoWidth + mb, 1], center=true);
    }

    color("teal")
        translate([-1 * (servoHoleXOnCenter/2), servoLedge - servoWidth, servoLedgeHeight - (0.8 * threadedInsertDepth) ])
            cylinder(h = threadedInsertDepth, r = threadedInsertRadius);
    
    color("red")
        translate([(servoHoleXOnCenter/2),  (servoLedge - servoWidth) , servoLedgeHeight - (0.8 * threadedInsertDepth)  ])
            cylinder(h = threadedInsertDepth, r = threadedInsertRadius);

}

    
    color("green")
        translate([0, 0, -1])
        cylinder(h = (servoLedgeHeight + 2), r = (boltHoles / 2));

    
    color("green")
        translate([0, mb * 0.8, -1])
        cylinder(h = (servoLedgeHeight + 2), r = (boltHoles / 2));