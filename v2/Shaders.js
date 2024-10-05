//##################################################################
// NEW SHADER BUILDER
//##################################################################
class ShaderBuilder {
	constructor(gl, vertShader, fragShader, isText) {
		if (!isText) {this.program = ShaderUtil.domShaderProgram(gl, vertShader, fragShader, true);}
		else		 {this.program = ShaderUtil.createProgramFromText(gl, vertShader, fragShader, true);}

		if (this.program != null) {
			this.gl = gl;
			gl.useProgram(this.program);
			this.mUniformList = [];
			this.mTextureList = [];

			this.noCulling = false;
			this.doBlending = false;
		} else {console.log("program not found");}
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

				iLoc = gl.getUniformLocation(this.program, iName);
				if (iLoc != null) {this.mUniformList[i] = {loc:iLoc, type:iType}}
				else {console.log("location of uniform not found: " + iName); return this;}

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
		var iLoc = 0,
			iTex = "";
		var texSlot;
		if (texturesArr.length > 0) {
			for (var i=0; i<texturesArr.length; i++) {
				iTex = this.gl.mTextureCache[texturesArr[i][1]];
				if (iTex === undefined) {console.log("Texture not found in cache: " + texturesArr[i][1]); return this;}
	
				iLoc = gl.getUniformLocation(this.program, texturesArr[i][0]);
				if (iLoc != null) {this.mTextureList.push({loc:iLoc, tex:iTex});}
	
				texSlot = this.gl["TEXTURE" + i];
				this.gl.activeTexture(texSlot);
				this.gl.bindTexture(this.gl.TEXTURE_2D, iTex);
				this.gl.uniform1i(iLoc, i);
			}
		}
		return this;
	}

	//---------------------------------------------------
	// Methods
	//---------------------------------------------------
	activate(){ this.gl.useProgram(this.program); return this; }
	deactivate(){ this.gl.useProgram(null); return this; }

	//function helps clean up resources when shader is no longer needed.
	dispose(){
		//unbind the program if its currently active
		if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
		this.gl.deleteProgram(this.program);
	}

	//Setup custom properties
	preRender(){
		//abstract method, extended object may need need to do some things before rendering.
		return this;
	} 
	
	// Handle rendering a model
	renderModel(model, doShaderClose) {

		this.gl.bindVertexArray(model.mesh.vao);

		if(model.mesh.noCulling || this.noCulling) this.gl.disable(this.gl.CULL_FACE);
		if(model.mesh.doBlending || this.doBlending) this.gl.enable(this.gl.BLEND);

		if(model.mesh.indexCount) this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
		else this.gl.drawArrays(model.mesh.drawMode, 0, model.mesh.vertexCount);

		//Cleanup
		this.gl.bindVertexArray(null);
		if(model.mesh.noCulling || this.noCulling) this.gl.enable(this.gl.CULL_FACE);
		if(model.mesh.doBlending || this.doBlending) this.gl.disable(this.gl.BLEND);

		if(doShaderClose) this.gl.useProgram(null);

		return this;		
	}
}

//##################################################################
// OLD SHADER BUILDER
//##################################################################
class Shader{
	constructor(gl,vertShaderSrc,fragShaderSrc){
		this.program = ShaderUtil.createProgramFromText(gl,vertShaderSrc,fragShaderSrc,true);

		if(this.program != null){
			this.gl = gl;
			gl.useProgram(this.program);
			this.attribLoc = ShaderUtil.getStandardAttribLocations(gl,this.program);
			this.uniformLoc = ShaderUtil.getStandardUniformLocations(gl,this.program);
		}

		//Note :: Extended shaders should deactivate shader when done calling super and setting up custom parts in the constructor.
	}

	//...................................................
	//Methods
	activate(){ this.gl.useProgram(this.program); return this; }
	deactivate(){ this.gl.useProgram(null); return this; }

	setPerspective(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.perspective, false, matData); return this; }
	setModelMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.ModelMatrix, false, matData); return this; }
	setCameraMatrix(matData){	this.gl.uniformMatrix4fv(this.uniformLoc.cameraMatrix, false, matData); return this; }

	//function helps clean up resources when shader is no longer needed.
	dispose(){
		//unbind the program if its currently active
		if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
		this.gl.deleteProgram(this.program);
	}

	//...................................................
	//RENDER RELATED METHODS

	//Setup custom properties
	preRender(){} //abstract method, extended object may need need to do some things before rendering.

	//Handle rendering a Model
	renderModel(Model){
		this.setModelMatrix(Model.transform.getViewMatrix());	//Set the transform, so the shader knows where the Model exists in 3d space
		this.gl.bindVertexArray(Model.mesh.vao);				//Enable VAO, this will set all the predefined attributes for the shader

		if(Model.mesh.noCulling) this.gl.disable(this.gl.CULL_FACE);
		if(Model.mesh.doBlending) this.gl.enable(this.gl.BLEND);

		if(Model.mesh.indexCount) this.gl.drawElements(Model.mesh.drawMode, Model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
		else this.gl.drawArrays(Model.mesh.drawMode, 0, Model.mesh.vertexCount);

		//Cleanup
		this.gl.bindVertexArray(null);
		if(Model.mesh.noCulling) this.gl.enable(this.gl.CULL_FACE);
		if(Model.mesh.doBlending) this.gl.disable(this.gl.BLEND);

		return this;
	}
}

//##################################################################
// SHADER UTILITIES
//##################################################################
class ShaderUtil{
	//-------------------------------------------------
	// Main utility functions
	//-------------------------------------------------

	//get the text of a script tag that are storing shader code.
	static domShaderSrc(elmID){
		var elm = document.getElementById(elmID);
		if(!elm || elm.text == ""){ console.log(elmID + " shader not found or no text."); return null; }
		
		return elm.text;
	}

	//Create a shader by passing in its code and what type
	static createShader(gl,src,type){
		var shader = gl.createShader(type);
		gl.shaderSource(shader,src);
		gl.compileShader(shader);

		//Get Error data if shader failed compiling
		if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
			console.error("Error compiling shader : " + src, gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}

		return shader;
	}

	//Link two compiled shaders to create a program for rendering.
	static createProgram(gl,vShader,fShader,doValidate){
		//Link shaders together
		var prog = gl.createProgram();
		gl.attachShader(prog,vShader);
		gl.attachShader(prog,fShader);

		//Force predefined locations for specific attributes. If the attibute isn't used in the shader its location will default to -1
		gl.bindAttribLocation(prog,ATTR_POSITION_LOC,ATTR_POSITION_NAME);
		gl.bindAttribLocation(prog,ATTR_NORMAL_LOC,ATTR_NORMAL_NAME);
		gl.bindAttribLocation(prog,ATTR_UV_LOC,ATTR_UV_NAME);

		gl.linkProgram(prog);

		//Check if successful
		if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){
			console.error("Error creating shader program.",gl.getProgramInfoLog(prog));
			gl.deleteProgram(prog); return null;
		}

		//Only do this for additional debugging.
		if(doValidate){
			gl.validateProgram(prog);
			if(!gl.getProgramParameter(prog,gl.VALIDATE_STATUS)){
				console.error("Error validating program", gl.getProgramInfoLog(prog));
				gl.deleteProgram(prog); return null;
			}
		}
		
		//Can delete the shaders since the program has been made.
		gl.detachShader(prog,vShader); //TODO, detaching might cause issues on some browsers, Might only need to delete.
		gl.detachShader(prog,fShader);
		gl.deleteShader(fShader);
		gl.deleteShader(vShader);

		return prog;
	}

	//-------------------------------------------------
	// Helper functions
	//-------------------------------------------------
	
	//Pass in Script Tag IDs for our two shaders and create a program from it.
	static domShaderProgram(gl,vectID,fragID,doValidate){
		var vShaderTxt	= ShaderUtil.domShaderSrc(vectID);								if(!vShaderTxt)	return null;
		var fShaderTxt	= ShaderUtil.domShaderSrc(fragID);								if(!fShaderTxt)	return null;
		var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
		var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }
		
		return ShaderUtil.createProgram(gl,vShader,fShader,true);
	}

	static createProgramFromText(gl,vShaderTxt,fShaderTxt,doValidate){
		var vShader		= ShaderUtil.createShader(gl,vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
		var fShader		= ShaderUtil.createShader(gl,fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }
		
		return ShaderUtil.createProgram(gl,vShader,fShader,true);
	}

	//-------------------------------------------------
	// Setters / Getters
	//-------------------------------------------------

	//Get the locations of standard Attributes that we will mostly be using. Location will = -1 if attribute is not found.
	static getStandardAttribLocations(gl,program){
		return {
			position:	gl.getAttribLocation(program,ATTR_POSITION_NAME),
			norm:		gl.getAttribLocation(program,ATTR_NORMAL_NAME),
			uv:			gl.getAttribLocation(program,ATTR_UV_NAME)
		};
	}

	static getStandardUniformLocations(gl,program){
		return {
			perspective:	gl.getUniformLocation(program,"uPMatrix"),
			ModelMatrix:	gl.getUniformLocation(program,"uMVMatrix"),
			cameraMatrix:	gl.getUniformLocation(program,"uCameraMatrix"),
			mainTexture:	gl.getUniformLocation(program,"uMainTex")
		};
	}
}