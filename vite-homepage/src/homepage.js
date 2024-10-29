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

    Model      : Model,
    Light      : Light,
    Camera     : Camera,
    ObjLoader  : ObjLoader,

    Shader     : Shader,
    Uniforms   : Uniforms,
    Material   : Material,

    render     : Render,
    RenderLoop : RenderLoop,

    scene      : [],

    // Initialize the gl context
    init:function() {gl.set("glcanvas"); return this;},

    build:function(renderHandler) {
        this.mainShader = Shader.create("MainShader", "vertex-shader", "fragment-shader", false);

        this.icosUniforms = Uniforms.create("IcosUniforms", function() {return [
            ["uMVMatrix", "mat4", gIcos.transform.getViewMatrix()],
            ["uPMatrix", "mat4", gCamera.projectionMatrix],
            ["uCameraMatrix", "mat4", gCamera.viewMatrix],
            ["uNormMatrix", "mat3", gIcos.transform.getNormalMatrix()],
            ["uCamPos", "3fv", gCamera.transform.position.getArray()],
            ["uLightPos", "3fv", gLight.transform.position.getArray()],
            ["uBaseColor", "3fv", gIcos.color.getArray()],
            ["uLightIntensity", "1f", gLight.intensity]
        ]});
        this.nameUniforms = Uniforms.create("NameUniforms", function() {return [
            ["uMVMatrix", "mat4", gName.transform.getViewMatrix()],
            ["uPMatrix", "mat4", gCamera.projectionMatrix],
            ["uCameraMatrix", "mat4", gCamera.viewMatrix],
            ["uNormMatrix", "mat3", gName.transform.getNormalMatrix()],
            ["uCamPos", "3fv", gCamera.transform.position.getArray()],
            ["uLightPos", "3fv", gLight.transform.position.getArray()],
            ["uBaseColor", "3fv", gName.color.getArray()],
            ["uLightIntensity", "1f", gLight.intensity]
        ]});

        this.icosMat = Material.create("IcosMaterial", gMainShader, gIcosUniforms, Homepage.gl.TRIANGLES);
        this.nameMat = Material.create("NameMaterial", gMainShader, gNameUniforms, Homepage.gl.TRIANGLES);

        this.camera = new Camera(80, 0.1, 100);
		this.camera.setPosition(0, 0, 0);
		
		this.light = Light();
		this.light.setPosition(1,0,4).setIntensity(0.5).setColor(1,1,1);


		this.icosModel = Model.create("IcosModel", ObjLoader.domToMesh("objIcos", "icosObj-file", true, true), this.icosMat);
		this.icosModel.setPosition(0,0,0).setScale(1,1,1).setColor(1,1,1)
			.applyMouseCtrl()
			.updateViewMatrix()
            .updateUniforms();
        this.scene.push(this.icosModel);

		
		this.nameModel = Model.create("NameModel", ObjLoader.domToMesh("objName", "nameObj-file", true, true), this.nameMat);
		this.nameModel.setPosition(0,0,0).setScale(.6, .6, .6).setColor(0.8, 0.24, 0.0)
			 .updateViewMatrix()
             .updateUniforms();
        this.scene.push(this.nameModel);

        this.renderLoop = new RenderLoop(renderHandler, 30).start();
    },

    update:function() {
        gl.fClear().fFitScreen(1.0,1.0);
        return this;
    }

}