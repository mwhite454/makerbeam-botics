As a user of openscad I could place "!" on a given segment of geometry and have only this piece visible in preview. 

This is cannot be implemented in a meaningful way with the node editor, however using codegen and rapid auto preview, we should be able to do something better. 

Each node should have a toggle visible in the MAIN editor, if toggled, nothing after that point should be rendered. Because of how we write out the code, the code gen would need to be rerun entirely, but essentially we would isolate only the edges/branching of nodes that leads to that point and only allow codegen to create that code alone. 