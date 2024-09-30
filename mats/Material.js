class Material {

    constructor(gl, name, shader, uniformsAry, texturesAry, drawMode, useModelMatrix, useNormalMatrix) {
        this.gl = gl;
        this.name = name;
        this.shader = shader;
        this.uniformsBlock = Uniforms.create(name, uniformsAry);
        this.texturesAry = texturesAry;

        this.useCulling = CULLING_STATE;
        this.useBlending = BLENDING_STATE;
        this.useModelMatrix = useModelMatrix || true;
        this.useNormalMatrix = useNormalMatrix || false;

        this.drawMode = drawMode || gl.TRIANGLES;
    }

    createUniforms() {

        var uLoc = 0,
            uName = "",
            uType = "",
            uVal = 0;

        if (this.uniformsBlock.length > 0) {
            for (uName in this.uniformsBlock) {
                uType = this.uniformsBlock[uName].type;
                uVal = this.uniformsBlock[uName].val;
                uLoc = this.gl.getUniformLocation(this.shader.program, uName);

                //if (iLoc != null) {this.uniforms[i] = {loc:iLoc, type:iType}}
                //else {console.log("location of uniform not found: " + iName); return this;}

                switch(uType) {
                    case "1f":		{this.gl.uniform1f(uLoc, uVal); break;}
                    case "2fv": 	{this.gl.uniform2fv(uLoc, new Float32Array(uVal)); break;}
                    case "3fv": 	{this.gl.uniform3fv(uLoc, new Float32Array(uVal)); break;}
                    case "4fv": 	{this.gl.uniform4fv(uLoc, new Float32Array(uVal)); break;}
                    case "mat3": 	{this.gl.uniformMatrix3fv(uLoc, false, uVal); break;}
                    case "mat4": 	{this.gl.uniformMatrix4fv(uLoc, false, uVal); break;}
                    default: 		{console.log("unknown uniform type for " + uName + ": " + uType);}
                }
            }
        }
        return this;
    }

	// takes in an argument texturesArr which is an array of doubles each representing one texture
	// ex: [[uniformName, cacheTextureName]]
	createTextures(texturesArr) {
		var iLoc = 0,
			iTex = "";
		var texSlot;
		if (texturesArr.length > 0) {
			for (var i=0; i<texturesArr.length; i++) {
				iTex = this.gl.mTextureCache[texturesArr[i][1]];
				if (iTex === undefined) {console.log("Texture not found in cache: " + texturesArr[i][1]); return this;}
	
				iLoc = gl.getUniformLocation(this.shader.program, texturesArr[i][0]);
				if (iLoc != null) {this.mTextureList.push({loc:iLoc, tex:iTex});}
	
				texSlot = this.gl["TEXTURE" + i];
				this.gl.activeTexture(texSlot);
				this.gl.bindTexture(this.gl.TEXTURE_2D, iTex);
				this.gl.uniform1i(iLoc, i);
			}
		}
		return this;
	}

    activateShader(){ this.gl.useProgram(this.shader.program); return this; }
	deactivateShader(){ this.gl.useProgram(null); return this; }

	//function helps clean up resources when shader is no longer needed.
	disposeProgram(){
		//unbind the program if its currently active
		if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
		this.gl.deleteProgram(this.program);
	}

}

