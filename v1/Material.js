class Material {
    constructor() {
        this.gl = null;
        this.name = "";
        this.shader = null;
        this.uniformsAry = [];

        this.useCulling = CULLING_STATE;
        this.useBlending = BLENDING_STATE;
        this.useModelMatrix = true;
        this.useNormalMatrix = false;

        this.drawMode = gl.TRIANGLES;
    }

    static create(gl, name, shader, uniformsAry, useModelMatrix, useNormalMatrix) {
        var m = new Material();
        m.gl = gl;
        m.name = name;
        m.shader = shader;
        m.uniformsAry = uniformsAry;
        m.useModelMatrix = useModelMatrix || true;
        m.useNormalMatrix = useNormalMatrix || false;
        return m;
    }


    createUniforms() {
        if (!this.uniformsAry.isArray) {console.log("argument needs to be an array"); return this;}

        var iLoc = 0,
            iName = "",
            iType = "",
            iVal = 0;
            
        if (this.uniformsAry.length > 0) {
            for (var i=0; i<this.uniformsAry.length; i++) {
                iName = this.uniformsAry[i][0];
                iType = this.uniformsAry[i][1];
                iVal = this.uniformsAry[i][2];
                iLoc = this.gl.getUniformLocation(this.shader.program, iName);

                //if (iLoc != null) {this.uniforms[i] = {loc:iLoc, type:iType}}
                //else {console.log("location of uniform not found: " + iName); return this;}

                switch(iType) {
                    case "1f":		{this.gl.uniform1f(iLoc, iVal); break;}
                    case "2fv": 	{this.gl.uniform2fv(iLoc, new Float32Array(iVal)); break;}
                    case "3fv": 	{this.gl.uniform3fv(iLoc, new Float32Array(iVal)); break;}
                    case "4fv": 	{this.gl.uniform4fv(iLoc, new Float32Array(iVal)); break;}
                    case "mat3": 	{this.gl.uniformMatrix3fv(iLoc, false, iVal); break;}
                    case "mat4": 	{this.gl.uniformMatrix4fv(iLoc, false, iVal); break;}
                    default: 		{console.log("unknown uniform type for " + iName + ": " + iType);}
                }
            }
        }
        return this;
    }
}
