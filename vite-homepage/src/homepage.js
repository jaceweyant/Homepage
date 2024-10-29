import gl from "./gl.js";
import UI from "./UI.js";


import Model from "./comps/Model.js";
import Camera from "./comps/Camera.js";
import Light from "./comps/Light.js";
import ObjLoader from "./comps/attribs/ObjLoader.js";

import Uniforms from "./shading/Uniforms.js";
import Shader from "./shading/Shader.js";
import Material from "./shading/Material.js";

import RenderLoop from "./rendering/RenderLoop.js";
import Render from "./rendering/Render.js";

export default {
    gl : gl,

    Model : Model,
    Light : Light,
    Camera : Camera,
    ObjLoader : ObjLoader,

    Shader : Shader,
    Uniforms : Uniforms,
    Material : Material,

    Render : Render,
    RenderLoop : RenderLoop
}