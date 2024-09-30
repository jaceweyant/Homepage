class Model {
    constructor(vao, material) {
        this.transform = new Transform();
        this.vao = vao;
        this.visible = true;
        this.material = material;
        this.color = new Vector3();
    }

    draw() {
        if(this.vao.isIndexed)	gl.drawElements(this.material.drawMode, this.vao.count, gl.UNSIGNED_SHORT, 0); 
        else					gl.drawArrays(this.material.drawMode, 0, this.vao.count);
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