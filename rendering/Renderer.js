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

		if(model.mesh.indexCount) this.gl.drawElements(material.drawMode, model.mesh.indexCount, gl.UNSIGNED_SHORT, 0); 
		else this.gl.drawArrays(material.drawMode, 0, model.mesh.vertexCount);

		//Cleanup
		this.gl.bindVertexArray(null);
		if(!material.useCulling) this.gl.enable(this.gl.CULL_FACE);
		if(!material.useBlending) this.gl.disable(this.gl.BLEND);

		if(doShaderClose) this.gl.useProgram(null);

		return this;		
	}
}

// Takes in an array of models/renderables, prepares the buffers and uniforms, and renders
var Render = (function() {
    var material = shader = null;

    var f = function(renderingObj) {
        var gl = renderingObj.gl,
            ary = renderingObj.renderables,
            components = {};
            uniformsAry = [];

        components.camera = renderingObj.camera;
        components.light = renderingObj.light;

        for (var i=0; i<ary.length; i++) {
            if (!ary[i].visible) continue;

            components.model = ary[i];

            uniformsAry = renderingObj.getUniforms(components);

            ary[i].updateUniforms(uniformsAry);

            //Check if the next material to use is different from the last
            if (material !== ary[i].material) {
                material = ary[i].material;

                if (!material) {console.error("material: " + material + " not found"); return this};

				//Multiple materials can share the same shader, if new shader, turn it on.
                if (material.shader != shader) shader = material.shader.activate();

                //Turn on/off any gl features
				//if(material.useCulling != CULLING_STATE)	gl[ ( (CULLING_STATE = (!CULLING_STATE))  )?"enable":"disable" ](gl.CULL_FACE);
				//if(material.useBlending != BLENDING_STATE)	gl[ ( (BLENDING_STATE = (!BLENDING_STATE)) )?"enable":"disable" ](gl.BLEND);
            }

            //Prepare Buffers and Uniforms.
            gl.bindVertexArray(ary[i].vao.id);
            //if (material.useModelMatrix) material.shader.setUniforms("", ary[i].updateMatrix());

            //Render 
            if (ary[i].vao.isIndexed)  material.gl.drawElements(material.drawMode, ary[i].vao.count, gl.UNSIGNED_SHORT, 0);
            else                       material.gl.drawArrays(material.drawMode, 0, ary[i].vao.count);

        }

        //Cleanup
        gl.bindVertexArray(null);
    };

    return f;
})();