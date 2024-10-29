import gl from "../gl.js";
import {Vec3} from "../../lib/Maths.js";
import Component from "./Comp.js";

class Model extends Component {
    constructor(name, meshData, material) {
        super(name);
        this.color = new Vec3(1,1,1);
        this.mesh = meshData || null;
        this.material = material || null;
        this.visible = false;
    }

    static create(name, meshData, material) {
        var model = new Model(name, meshData, material);
        gl.Res.models[name] = model;
        return model;
    }

    updateUniforms() {this.material.createUniforms(); return this;}

    updateViewMatrix(){ this.transform.updateMatrix(); return this; }
}

export default Model;