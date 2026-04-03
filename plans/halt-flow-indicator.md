As a user of openscad I could place "!" on a given segment of geometry and have only this piece visible in preview. 

This is cannot be implemented in a meaningful way with the node editor, however using codegen and rapid auto preview, we should be able to do something better. 

Each node should have a toggle visible in the MAIN editor, if toggled, nothing after that point should be rendered. Because of how we write out the code, the code gen would need to be rerun entirely, but essentially we would isolate only the edges/branching of nodes that leads to that point and only allow codegen to create that code alone. 

Example: I have three primitives at origin of node editor, cube, sphere, cylinder. Each branch to a translate and rotate node as well, so 3 parallel chains of geometry being computed. When the user selects the toggle on the rotate node for the cube, only the cube is visible, in its translated and rotated state. If user then clicks the halt toggle on the translate, the rotate transform is no longer applied and now only a translated cube is displayed. 


Example: Two spheres converge in a union, and then a rotation is applied. When user clicks Halt on union, only the geometry of merged spheres remains. User can subsquently halt one edge further up and disable either of the spheres. 
