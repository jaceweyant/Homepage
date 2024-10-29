import gl from "../gl.js";
import ShaderUtil from "./ShaderUtil.js";

class Shader {
    constructor(name, vertShader, fragShader, isText) {

        if (!isText) {this.program = ShaderUtil.domShaderProgram(gl, vertShader, fragShader, true);}
        else		 {this.program = ShaderUtil.createProgramFromText(gl, vertShader, fragShader, true);}

        if (this.program != null) {
            gl.useProgram(this.program);

            this.name = name;

            this.isActive = true;

            this.noCulling = false;
            this.doBlending = false;
        } else {console.log("program not found");}
    }

    static create(name, vertShader, fragShader, isText) {
        var shader = new Shader(name, vertShader, fragShader, isText);
        Homepage.Res.Shaders[name] = shader;
        return shader;
    }

    //---------------------------------------------------
    // Methods
    //---------------------------------------------------
    activate(){ gl.useProgram(this.program); return this; }
    deactivate(){ gl.useProgram(null); return this; }

    //function helps clean up resources when shader is no longer needed.
    dispose(){
        //unbind the program if its currently active
        if (gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
        gl.deleteProgram(this.program);
    }
}

export default Shader;