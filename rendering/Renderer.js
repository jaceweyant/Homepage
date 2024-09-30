class Renderer {

    constructor(gl) {this.gl = gl;}

    	//Setup custom properties
	preRender(){
		//abstract method, extended object may need need to do some things before rendering.
		return this;
	} 
	
	// Handle rendering a model
	renderModel(model, material, doShaderClose) {

		this.gl.bindVertexArray(model.mesh.vao);

		if(!material.useCulling) this.gl.disable(this.gl.CULL_FACE);
		if(!material.useBlending) this.gl.enable(this.gl.BLEND);

		if(model.mesh.indexCount) this.gl.drawElements(model.mesh.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
		else this.gl.drawArrays(material.drawMode, 0, model.mesh.vertexCount);

		//Cleanup
		this.gl.bindVertexArray(null);
		if(!material.useCulling) this.gl.enable(this.gl.CULL_FACE);
		if(!material.useBlending) this.gl.disable(this.gl.BLEND);

		if(doShaderClose) this.gl.useProgram(null);

		return this;		
	}
}