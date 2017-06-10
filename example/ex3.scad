include <tools.scad>;
include <junctions.scad>;

// Display dismensions
pcbWidth=116;
pcbHeight=37;
pcbDepth=1.8;

componentDepth=6.85;

vfdWidth=97;
vfdHeight=25;
vfdDepth=9.1;
vfdXOffset=10.55;
vfdYOffset=6;
vfdZOffset=pcbDepth;

displayAreaWidth=70.75;
displayAreaHeight=11.5;
displayAreaXOffset=23.63;
displayAreaYOffset=12.75;

pinHeaderWidh=10.3;
pinHeaderHeight=5.2;
pinHeaderBottomDepth=9;
pinHeaderTopDepth=1.3;

holeDiameter=3.5;

tollerance=0.8;

topFrameDepth=3.5;


module drawDisplayModule() {
    // PCB
    color("darkGreen") {
        cube(size=[pcbWidth, pcbHeight, pcbDepth]);
    }
    // VFD
    color("gray") {
        translate([vfdXOffset, vfdYOffset, vfdZOffset]) {
            cube(size=[vfdWidth, vfdHeight, vfdDepth]);
        }
    }
    // Keep out area
    translate([0,0,-componentDepth]) {
        %cube(size=[pcbWidth, pcbHeight, componentDepth]);
    }
    // Pin Header Bottom
    translate([(4-(pinHeaderHeight/2)),((pcbHeight/2)-(pinHeaderWidh/2)),-pinHeaderBottomDepth]) {
        #cube(size=[pinHeaderHeight, pinHeaderWidh, pinHeaderBottomDepth]);
    }
    // Pin Header Top
    translate([(4-(pinHeaderHeight/2)),((pcbHeight/2)-(pinHeaderWidh/2)),pcbDepth]) {
        #cube(size=[pinHeaderHeight, pinHeaderWidh, pinHeaderTopDepth]);
    }
}
       /*
module topFrame(shrink=4, size=2, depth=4, t=tollerance) {
    // Frame top
    color("black") {
        CubePoints = [
        [  -(size/2),  -(size/2),  0 ],  //0
        [ vfdWidth+(shrink*4)+(size/2),  -(size/2),  0 ],  //1
        [ vfdWidth+(shrink*4)+(size/2),  vfdHeight+(shrink*4)+(size/2),  0 ],  //2
        [  -(size/2),  vfdHeight+(shrink*4)+(size/2),  0 ],  //3
        [  shrink-(size/2),  shrink-(size/2),  topFrameDepth ],  //4
        [ vfdWidth+(shrink*3)+(size/2),  shrink-(size/2),  topFrameDepth ],  //5
        [ vfdWidth+(shrink*3)+(size/2),  vfdHeight+(shrink*3)+(size/2),  topFrameDepth ],  //6
        [  shrink-(size/2),  vfdHeight+(shrink*3)+(size/2),  topFrameDepth ]]; //7
         CubeFaces = [
        [0,1,2,3],  // bottom
        [4,5,1,0],  // front
        [7,6,5,4],  // top
        [5,6,2,1],  // right
        [6,7,3,2],  // back
        [7,4,0,3]]; // left
        
        difference() {
            polyhedron( CubePoints, CubeFaces );
            translate([(shrink*2)+(displayAreaXOffset-vfdXOffset)+(displayAreaWidth/2), (shrink*2)+(displayAreaYOffset-vfdYOffset)+(displayAreaHeight/2), 0]) {
                
                linear_extrude(height=depth, scale=[vfdWidth/displayAreaWidth,vfdHeight/displayAreaHeight]) {
                    square(size=[displayAreaWidth, displayAreaHeight], center=true);
                }
            }
        }

        snapperWidth=4;
        snapperHeight=12;
        snapperNoseDepth=4;
        snapperBridgeDepth=1;
        snappeWidth=snapperNoseDepth+snapperBridgeDepth; 

        #snapper(
             position=[vfdWidth+(size*2)+5,((vfdHeight+(size*2))/2)+(snapperWidth*2),-snapperHeight],
             rotation=[0 ,0 ,180],
             dimension=[snapperWidth,snapperHeight,snapperBridgeDepth], 
             noseDepth=(snapperNoseDepth), 
             noseHeight=(6)
        )
        {
            x=5;
        }
        
        #snapper()
             position=[vfdWidth+(size*2)+5,((vfdHeight+(size*2))/2)+(snapperWidth*2),-snapperHeight],
             rotation=[0, 0, 180],
             dimension=[snapperWidth,snapperHeight,snapperBridgeDepth], 
             noseDepth=snapperNoseDepth, 
             noseHeight=6
             ) {
        
                // Frame bottom
                difference() {
                    translate([(shrink*2)-size, (shrink*2)-size, -depth]) {
                        cube(size=[vfdWidth+(size*2), vfdHeight+(size*2), depth]);
                    }
                    translate([(shrink*2)-t, (shrink*2)-t, -depth]) {
                        cube(size=[vfdWidth+(t*2), vfdHeight+(t*2), depth]);
                    }
                }
        }
    }
}

module display() {
    // Display module model
    *drillHoles(positions=[
            [4,4,0],
            [4,pcbHeight-4,0],
            [pcbWidth-4,4,0],
            [pcbWidth-4,pcbHeight-4,0]
        ], depth=pcbDepth, diameter=holeDiameter, $fn=50) {
        drawDisplayModule();
    }

    translate([vfdXOffset-8, vfdYOffset-8, pcbDepth+vfdDepth+tollerance]) {
        topFrame();
    }
}

snapperHole(position=[0,25,0],dimension=[4,12,1], noseDepth=4, noseHeight=6) {
*snapper(position=[0,10,0],dimension=[8-(4*$t),12+(4*$t),1], noseDepth=6-(3*$t), noseHeight=6-(2*$t)) {
    // Wall to mount to
    translate([-19, 0, 0]) {
    cube(size=[20, 40, 20]);
    }
}
}
display();

*/
