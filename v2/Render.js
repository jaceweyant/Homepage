var Render = function(ary) {
    var material = shader = null

    for (var i=0; i<ary.length; i++) {

        //if (!ary[i].visible) {console.log("in render"); continue;}
        //Check if the next material to use is different from the last
        if (material !== ary[i].material) {

            //console.log("in render material ");

            material = ary[i].material;

            if (!material) {console.error("material: " + material + " not found"); return this};

            //Multiple materials can share the same shader, if new shader, turn it on.
            if (material.shader != shader) shader = material.shader.activate();

            //Turn on/off any gl features
            //if(material.useCulling != CULLING_STATE)	gl[ ( (CULLING_STATE = (!CULLING_STATE))  )?"enable":"disable" ](gl.CULL_FACE);
            //if(material.useBlending != BLENDING_STATE)	gl[ ( (BLENDING_STATE = (!BLENDING_STATE)) )?"enable":"disable" ](gl.BLEND);
        }

        //Prepare Buffers and Uniforms.
        gl.bindVertexArray(ary[i].mesh.vao);
        //if (material.useModelMatrix) material.shader.setUniforms("", ary[i].updateMatrix());

        //Render 
        if (ary[i].mesh.vao.isIndexed)  {console.log("indexed"); material.gl.drawElements(material.drawMode, ary[i].mesh.indexCount, gl.UNSIGNED_SHORT, 0);}
        else                            {material.gl.drawArrays(material.drawMode, 0, ary[i].mesh.vertexCount);}

    }

    //Cleanup
    gl.bindVertexArray(null);
}