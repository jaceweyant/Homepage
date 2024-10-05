
class Material {
    constructor(gl, name, shader, drawMode) {
        this.gl = gl;
        this.name = name;
        this.shader = shader;

        this.useCulling = gl.CULLING_STATE;
        this.useBlending = gl.BLENDING_STATE;
        this.useModelMatrix = true;
        this.useNormalMatrix = false;

        this.drawMode = drawMode || gl.TRIANGLES;
    }

        //---------------------------------------------------
	// Create the Uniforms/Textures
	//---------------------------------------------------
	// Takes in one argument which is an array of triples which each represent one uniform and its neccessary info
	// ex: [["uName1", "1fv", val1], ["uName2", "3fv", val2]]
	createUniforms(uniformsArr) {
		//if (!uniformsArr.isArray) {console.log("argument needs to be an array"); return this;}

		var iLoc = 0,
			iName = "",
			iType = "",
			iVal = 0;
		if (uniformsArr.length > 0) {
			for (var i=0; i<uniformsArr.length; i++) {
				iName = uniformsArr[i][0];
				iType = uniformsArr[i][1];
				iVal = uniformsArr[i][2];

				iLoc = gl.getUniformLocation(this.shader.program, iName);
				//if (iLoc != null) {this.mUniformList[i] = {loc:iLoc, type:iType}}
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


	// takes in an argument texturesArr which is an array of doubles each representing one texture
	// ex: [[uniformName, cacheTextureName]]
	createTextures(texturesArr) {
        if (!texturesArr) return null;
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
