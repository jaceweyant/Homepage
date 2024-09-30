WEBGL ICOSAHEDRON PROJECT -- WEBSITE HOMEPAGE
CURRENT PROJECT -- ICOS_v6
AUTHOR -- JACE WEYANT

___________________________________________________
Project Description

    This is a practice project for developing dynamic reactive 3D graphics in the browser
    using the WebGL framework. The aim is to create a wireframe icosahedron mesh which
    reacts smoothly and legibly to mouse movement/position. I am trying to figure out how to
    use shaders effectively to create a somewhat realistic eye-catching look to the model with
    lighting and materials. This project is a study for what I invision will be the homepage of
    my artist portfolio website: www.jaceweyant.org


___________________________________________________
Notes to Self

::: NEW :::
    * Working on a rodriguez rotation matrix transformation that rotates based on two vectors which we want to align

::: NOT CURRENTLY WORKING :::
    * The lighting is not staying in one spot - it sort of rotates around as the model rotates
        - this could be a problem with the order of matrix updates (i have explored this somewhat with no luck)
        - could be a problem with the model's normal matrix or even the normals attribute (not likely the attribute)
        - could be that the light position is for some reason moving around with the model
    * The mouse pos controller doesn't really match up in a legible way with the resultant rotation of the model
        - could be something to do with rotation order
        - could be the fact that i used mouse dx,dy instead of just x,y but using x,y caused dif problems
        - I essentially want the model to follow the mouse with its rotation but instead it rotates in somewhat unpredictable ways
        - maybe if I update the model matrix after each rotation it will help? seems like its most likely a prob with the transform
        - I should pay attention to where and when things get changed

::: OTHER ISSUES :::
    * There is a white outline at the edges of all of my models
        - could be something to do with seams in the models when created and exported to .obj from Blender

::: YET TO BE IMPLEMENTED :::
    * More UI project parameter controls - especially concerning the model and the mouse controls
    * Lookat transformations for the light and the camera
    * dif types of lights: point, distant, cone
    * maybe different kinds of camera projections: orthogonal, perspectival*, other
    * MATERIALS

