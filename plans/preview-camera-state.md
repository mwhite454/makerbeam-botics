As a user, when I rotate the camera and then make a modification to my geometry, I do not expect to have all my camera movements/zoom levels destroyed. 

EXAMPLE: User has 2 nodes, CUBE -> ROTATE: x - 45. User has rotated camera in preview to view from another angle. User decides 45 degrees is too aggressive and changes to 30, only to have to rotate camera AGAIN, for a very minor change. USER should not have to repeat work over and over.  

Camera state should be stored in such a way that it can survive re-render and be applied when a new render from WASM arrives.

Camera data should include Colors when user applies colors to geometry (not currently working)

Camera/Preview pane should include a "orthogonal gizmo" to show 'global' x, y, z directions to the user.

