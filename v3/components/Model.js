class Model {
    constructor() {
		this.gl =  null;
        this.transform = new Transform();
        this.vao = null;
        this.visible = true;
        this.material = null;
        this.color = new Vector3();
    }

	static create(gl, vao, material) {
		var model = new Model();
		model.gl = gl;
        model.vao = vao;
        model.material = material;

		return model;
	}

    draw() {
        if(this.vao.isIndexed)	gl.drawElements(this.material.drawMode, this.vao.count, gl.UNSIGNED_SHORT, 0); 
        else					gl.drawArrays(this.material.drawMode, 0, this.vao.count);
    }

	// Takes in one argument which is an array of triples which each represent one uniform and its neccessary info
	// ex: [["uName1", "1fv", val1], ["uName2", "3fv", val2]]
	updateUniforms(uniformsArr) {
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

				iLoc = gl.getUniformLocation(this.material.shader.program, iName);
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

    //--------------------------------------------------------------------------
	//Getters/Setters
	setScale(x,y,z){ this.transform.scale.set(x,y,z); return this; }
	setPosition(x,y,z){ this.transform.position.set(x,y,z); return this; }
	setRotation(x,y,z){ this.transform.rotation.set(x,y,z); return this; }

	setColor() {
		if (arguments.length == 3) {
			this.color.set(arguments[0], arguments[1], arguments[2]);
		} else if (arguments.length == 1) {
			var h = arguments[0];
			if (h.length != 7 || h[0] != "#") {console.log("argument format is incorrect. Requires a hex code string ex. '#FF0000'."); return null;}
			this.color.set(
				parseInt(h[0]	+ h[1], 16) / 255.0,
				parseInt(h[2]	+ h[3], 16) / 255.0,
				parseInt(h[4]	+ h[5], 16) / 255.0
			);
		} else {return null;}
		return this;
	}
	

	addScale(x,y,z){	this.transform.scale.x += x;	this.transform.scale.y += y;	this.transform.scale.y += y;	return this; }
	addPosition(x,y,z){	this.transform.position.x += x; this.transform.position.y += y; this.transform.position.z += z; return this; }
	addRotation(x,y,z){	this.transform.rotation.x += x; this.transform.rotation.y += y; this.transform.rotation.z += z; return this; }

	//--------------------------------------------------------------------------
	//Things to do before its time to render
	updateViewMatrix(){ this.transform.updateMatrix(); return this; }
}