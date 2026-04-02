As a user, when I drop into a loop or a module editor, the preview immediately breaks. Once we have a working model for halt-flow-indicator, it should be expanded to allow codegen to create code that is only previewing geometry leading into that loop or module...not the processes that happen after it. 

EXAMPLE:
User has node to create geometry, sends into loop for modification, then additional nodes after the loop. In MAIN we preview everything. In the loop, we only see up until we exit the loop. So if the loop applies 5 transforms to the cube node, we only see those mods, not the transformation that occurs after. 

EXAMPLE - generative geometry: 
as a user I have a node that creates geometry inside of a loop. When in the context of the loop editor for that loop, I only want to PREVIEW the geometry created by that loop, not the other geometry. The preview is for the loop, not for the greater MAIN when in this view. 

EXAMPLE - module
Similiar to transforming loops, the preview should only show the geometry up and to the point that it leaves the module. If the module only does math, or file operations in a loop, there is no preview needed, so the PREVIEW pane should not display an error as it currently does. 