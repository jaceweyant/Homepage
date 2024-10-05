const Debug = {

    Materials : {

        // Boolean Checks for Sameness
        areSame :                function(mat1, mat2) {console.log("materials are same: " + (mat1 == mat2)); return this;},
        haveSameShader :         function(mat1, mat2) {console.log("materials have same shader: " + (mat1.shader == mat2.shader)); return this;},
        haveSameShaderProgram :  function(mat1, mat2) {console.log("materials have same shader program: " + (mat1.shader.program == mat2.shader.program)); return this;},
        haveSameUniforms :       function(mat1, mat2) {console.log("materials have same uniforms: " + (mat1.uniforms == mat2.uniforms)); return this;},

        // Uniforms Looking
        hasUniforms :           function(mat) {console.log("material " + mat.name + " has uniforms: " + (mat != null)); return this;},
        checkUniforms :         function(mat) {console.log("material " + mat.name + " has these uniforms: " + mat.uniforms); return this;},
    },

    Models : {

        // Boolean Checks for Existence
        doesExist :             function(model)         {console.log("model named " + model.name + "exists? " + (model != null)); return this;},
        hasMaterial :           function(model)         {console.log("model named " + model.name + "has material? " + (model.material != null)); return this;},
        hasThisMaterial :       function(model, matName){console.log("model named " + model.name + "has material named " + model.material.matName + "? " + (model.material.name == matName)); return this;},
        hasUniforms :           function(model)         {console.log("model named " + model.name + "has uniforms array? " 
                                                                    + (model.material.uniforms != null 
                                                                        && model.material.uniforms.length >= 1
                                                                        && model.material.uniforms[0].length == 3)); 
                                                         return this;},
                                
        // Look at Properties
        //checkUniforms :         function(model) {console.log("model named " + model.name + " has material named " + model.material.name + "with uniforms: "); console.log(model.material.uniforms); return this;} 
        checkUniforms :         function(model) {console.log("model named " + model.name + " has material named " + model.material.name + "with uniforms: "); 
                                                 Debug.printAry(model.material.uniforms); 
                                                 return this;},
        checkShader :           function(model) {console.log("model " + model.name + " has an existing activated shader? " + (model.material.shader != null && model.material.shader.isActive)); return this;},
        isVisible :             function(model) {console.log("model " + model.name + "is visible? " + (model.visible)); return this;},

        // Compare Model Properties
        areSame :               function(model1, model2) {console.log("models are same: " + (model1 == model2)); return this;},
        haveSameMaterial :      function(model1, model2) {console.log("materials are same: " + (model1.material == model2.material)); return this;},
        haveSameShader :        function(model1, model2) {console.log("materials have same shader: " + (model1.material.shader == model2.material.shader)); return this;},
        haveSameShaderProgram : function(model1, model2) {console.log("materials have same shader program: " + (model1.material.shader.program == model2.material.shader.program)); return this;},
        haveSameUniforms :      function(model1, model2) {console.log("materials have same uniforms: " + (model1.material.uniforms == model2.material.uniforms)); return this;},
    },

    // Helper Functions
    printAry : function(ary) {
        if (ary != null && ary.length > 0) {
            for (var i=0; i<ary.length; i++) {
                console.log(ary[i]);
            }
        }
    },
};