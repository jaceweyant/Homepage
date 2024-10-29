import gl from "../gl.js";

class Uniforms {
    constructor() {
        this.name = "";
        this.get = null;
        this.ary = [];
    }

    static create(name, f) {
        var uniforms = new Uniforms();
        uniforms.name = name;
        uniforms.get = f;
        gl.Res.uniforms[name] = uniforms;
        return uniforms;
    }

    updateArray() {this.ary = this.get(); return this;}

    getArray() {return this.ary;}
}

export default Uniforms;