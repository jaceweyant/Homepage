//This is not at all correct


class Renderer {

    constructor(gl) {this.gl = gl;}

    	//Setup custom properties
	preRender(){
		//abstract method, extended object may need need to do some things before rendering.
		return this;
	} 
	
	// Handle rendering a model
	renderModel(model, material, doShaderClose) {

		this.gl.bindVertexArray(model.vao.id);

		if(!material.useCulling) this.gl.disable(this.gl.CULL_FACE);
		if(!material.useBlending) this.gl.enable(this.gl.BLEND);

		if(model.vao.indexCount) this.gl.drawElements(material.drawMode, model.vao.count, gl.UNSIGNED_SHORT, 0); 
		else this.gl.drawArrays(material.drawMode, 0, model.vao.count);

		//Cleanup
		this.gl.bindVertexArray(null);
		if(!material.useCulling) this.gl.enable(this.gl.CULL_FACE);
		if(!material.useBlending) this.gl.disable(this.gl.BLEND);

		if(doShaderClose) this.gl.useProgram(null);

		return this;		
	}
}