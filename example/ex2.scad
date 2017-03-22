include <../vfd-frame-m202sd16/tools.scad>;
include <../vfd-frame-m202sd16/junctions.scad>;

tollerance=(0.8*$t);

// Tube dimensions
margin=3;
depth=39;

bodyDiameter=10.6;
bodyDepth=37;

headWidth=13;
headHeight=22;
headDepth=4;

// Holder dimensions
holderWidth=headWidth+margin;
holderHeight=headHeight+margin;
holderDepth=3;

wallThickness=2.5;

// Row and column count
columns=4;
rows=2; 

totalWidth=(holderWidth*columns)+margin;
totalHeight=(holderHeight*rows)+margin;
totalDepth=bodyDepth+holderDepth;




module shell(dimension=[5,5,5]) {
            cube(size=[
                totalWidth-(tollerance*2), 
                totalHeight-(tollerance*2), 
                holderDepth]);
}

// Create the tube holding inlay
module tubeHolder() {
    union() {
        difference () {
            // Make plane
            cube(size=[
                totalWidth-(tollerance*2), 
                totalHeight-(tollerance*2), 
                holderDepth]);


            // Cut holes for tubes
            for (row=[0:(rows-1)]) {
                for (column=[0:(columns-1)]) {
                    x=(headWidth/2)+margin+((headWidth+margin)*column);
                    y=(headHeight/2)+margin+((headHeight+margin)*row);
                    translate([x, y, -1]) {
                        linear_extrude(height=(holderDepth+2)){
                            circle(d=(bodyDiameter+tollerance), center=true, $fn=40);
                        }
                    }
                }
            }
        }

        // Add support walls
        for (row=[0:(rows-2)]) {
            for (column=[0:(columns-2)]) {
                x=(margin+headWidth)+((headWidth+margin)*column);
                translate([x, 0, (1-bodyDepth)]) {
                    cube(size=[wallThickness, totalHeight-(tollerance*2), (bodyDepth+1)]);
                }
            }
        }
        // Add support walls
        for (row=[0:(rows-2)]) {
            for (column=[0:(columns-2)]) {
                    y=(headHeight+margin)+((headHeight+margin)*row);

                translate([0, y, (1-bodyDepth)]) {
                    cube(size=[totalWidth-(tollerance*2), wallThickness, (bodyDepth+1)]);
                }
            }
        }
    }
}



union() {
        
    color("lightGray") {
        *shell([totalWidth,totalHeight,totalDepth+wallThickness]);
        /*echo(str("totalWidth = ", totalWidth+(2*wallThickness)));*/
        /*echo(str("totalHeight = ", totalHeight+(2*wallThickness)));
        echo(str("totalDepth = ", totalDepth+wallThickness));*/
    }
    difference() {
         
        /*
        color("darkGreen") {
            translate([wallThickness+tollerance,wallThickness+tollerance,wallThickness+bodyDepth])
            tubeHolder();
        }#color("orange") {
            if(totalWidth>totalHeight) {
                translate([(totalWidth/2)+wallThickness, (totalHeight/2)+wallThickness, -((totalDepth/100)+wallThickness)]) {
                    scale([1, totalHeight/totalWidth, ((totalDepth+wallThickness)*2)/totalWidth]) {
                        sphere(d=totalWidth-wallThickness);
                    }
                }
            }
            else {
                translate([(totalWidth/2)+wallThickness, (totalHeight/2)+wallThickness, -((totalDepth/100)+wallThickness)]) {
                    scale([totalWidth/totalHeight, 1, ((totalDepth+wallThickness)*2)/totalHeight]) {
                        sphere(d=totalHeight-wallThickness);
                    }
                }
            }
        }*/
    }
}