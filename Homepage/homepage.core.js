//###################################//
// HOMEPAGE WEBGL NAMESPACE          //
// Author: Jace Weyant               //
// Repo: "Homepage"                  //
// Branch: "dev/v14/namespacing"     //
// File: "homepage.core.js"          //
// Date Created: Oct 5, 2024         //
//###################################//

var Homepage = (function() {

  // PRIVATE SCOPE VARIABLES 
  //#######################################################################
    var gl = null;


  // GL CONTEXT SETUP
  //#######################################################################

    function Init(canvasID) {
        if (Homepage.gl != null) return Homepage.gl;

        var canvas = document.getElementById(canvasID),
		gl = canvas.getContext("webgl2");

        if(!gl){ console.error("WebGL context is not available."); return null; }

        //...................................................
        //Setup custom properties
        gl.mMeshCache = [];	//Cache all the mesh structs, easy to unload buffers if they all exist in one place.
        gl.mTextureCache = [];

        //...................................................
        //Setup GL, Set all the default configurations we need.
        gl.cullFace(gl.BACK);								//Back is also default
        gl.frontFace(gl.CCW);								//Dont really need to set it, its ccw by default.
        gl.enable(gl.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
        gl.enable(gl.CULL_FACE);							//Cull back face, so only show triangles that are created clockwise
        gl.depthFunc(gl.LEQUAL);							//Near things obscure far things
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending
        //gl.clearColor(1.0,1.0,1.0,1.0);	//Set clear color
        gl.clearColor(1.0,1.0,1.0,0.0);	//Set clear color

        //...................................................
        //Methods
        
        //Reset the canvas with our set background color.	
        gl.fClear = function(){ this.clear(this.COLOR_BUFFER_BIT | this.DEPTH_BUFFER_BIT); return this; }

        //Create and fill our Array buffer.
        gl.fCreateArrayBuffer = function(floatAry,isStatic){
            if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

            var buf = this.createBuffer();
            this.bindBuffer(this.ARRAY_BUFFER,buf);
            this.bufferData(this.ARRAY_BUFFER, floatAry, (isStatic)? this.STATIC_DRAW : this.DYNAMIC_DRAW );
            this.bindBuffer(this.ARRAY_BUFFER,null);
            return buf;
        }

        //Turns arrays into GL buffers, then setup a VAO that will predefine the buffers to standard shader attributes.
        gl.fCreateMeshVAO = function(name,aryInd,aryVert,aryNorm,aryUV,vertLen){ //TODO : ADDED VERT LEN
            var rtn = { drawMode:this.TRIANGLES };

            //Create and bind vao
            rtn.vao = this.createVertexArray();															
            this.bindVertexArray(rtn.vao);	//Bind it so all the calls to vertexAttribPointer/enableVertexAttribArray is saved to the vao.

            //.......................................................
            //Set up vertices
            if(aryVert !== undefined && aryVert != null){
                rtn.bufVertices = this.createBuffer();													//Create buffer...
                rtn.vertexComponentLen = vertLen || 3;													//How many floats make up a vertex
                rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;								//How many vertices in the array

                this.bindBuffer(this.ARRAY_BUFFER, rtn.bufVertices);
                this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryVert), this.STATIC_DRAW);		//then push array into it.
                this.enableVertexAttribArray( Homepage.ATTR_POSITION_LOC);										//Enable Attribute location
                //this.vertexAttribPointer( Homepage.ATTR_POSITION_LOC,3,this.FLOAT,false,0,0);						//Put buffer at location of the vao\
                this.vertexAttribPointer( Homepage.ATTR_POSITION_LOC,rtn.vertexComponentLen,this.FLOAT,false,0,0);						//Put buffer at location of the vao
            }

            //.......................................................
            //Setup normals
            if(aryNorm !== undefined && aryNorm != null){
                rtn.bufNormals = this.createBuffer();
                this.bindBuffer(this.ARRAY_BUFFER, rtn.bufNormals);
                this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryNorm), this.STATIC_DRAW);
                this.enableVertexAttribArray( Homepage.ATTR_NORMAL_LOC);
                this.vertexAttribPointer( Homepage.ATTR_NORMAL_LOC,3,this.FLOAT,false, 0,0);
            }

            //.......................................................
            //Setup UV
            if(aryUV !== undefined && aryUV != null){
                rtn.bufUV = this.createBuffer();
                this.bindBuffer(this.ARRAY_BUFFER, rtn.bufUV);
                this.bufferData(this.ARRAY_BUFFER, new Float32Array(aryUV), this.STATIC_DRAW);
                this.enableVertexAttribArray( Homepage.ATTR_UV_LOC);
                this.vertexAttribPointer( Homepage.ATTR_UV_LOC,2,this.FLOAT,false,0,0);	//UV only has two floats per component
            }

            //.......................................................
            //Setup Index.
            if(aryInd !== undefined && aryInd != null){
                rtn.bufIndex = this.createBuffer();
                rtn.indexCount = aryInd.length;
                this.bindBuffer(this.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);  
                this.bufferData(this.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), this.STATIC_DRAW);
                //this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null); //TODO REMOVE THIS AND ADD TO CLEANUP
            }

            //Clean up
            this.bindVertexArray(null);					//Unbind the VAO, very Important. always unbind when your done using one.
            this.bindBuffer(this.ARRAY_BUFFER,null);	//Unbind any buffers that might be set
            if(aryInd != null && aryInd !== undefined)  this.bindBuffer(this.ELEMENT_ARRAY_BUFFER,null);
            
            this.mMeshCache[name] = rtn;
            return rtn;
        }

        gl.fLoadTexture = function(name,img,doYFlip){
            var tex = this.createTexture();
            if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, true);	//Flip the texture by the Y Position, So 0,0 is bottom left corner.

            this.bindTexture(this.TEXTURE_2D, tex);														//Set text buffer for work
            this.texImage2D(this.TEXTURE_2D, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, img);			//Push image to GPU.
            
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MAG_FILTER, this.LINEAR);					//Setup up scaling
            this.texParameteri(this.TEXTURE_2D, this.TEXTURE_MIN_FILTER, this.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
            this.generateMipmap(this.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.

            this.bindTexture(this.TEXTURE_2D,null);									//Unbind
            this.mTextureCache[name] = tex;											//Save ID for later unloading
            
            if(doYFlip == true) this.pixelStorei(this.UNPACK_FLIP_Y_WEBGL, false);	//Stop flipping textures
            return tex;		
        };

        //imgAry must be 6 elements long and images placed in the right order
        //RIGHT,LEFT,TOP,BOTTOM,BACK,FRONT
        gl.fLoadCubeMap = function(name,imgAry){
            if(imgAry.length != 6) return null;

            //Cube Constants values increment, so easy to start with right and just add 1 in a loop
            //To make the code easier costs by making the imgAry coming into the function to have
            //the images sorted in the same way the constants are set.
            //	TEXTURE_CUBE_MAP_POSITIVE_X - Right	:: TEXTURE_CUBE_MAP_NEGATIVE_X - Left
            //	TEXTURE_CUBE_MAP_POSITIVE_Y - Top 	:: TEXTURE_CUBE_MAP_NEGATIVE_Y - Bottom
            //	TEXTURE_CUBE_MAP_POSITIVE_Z - Back	:: TEXTURE_CUBE_MAP_NEGATIVE_Z - Front

            var tex = this.createTexture();
            this.bindTexture(this.TEXTURE_CUBE_MAP,tex);

            //push image to specific spot in the cube map.
            for(var i=0; i < 6; i++){
                this.texImage2D(this.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, this.RGBA, this.RGBA, this.UNSIGNED_BYTE, imgAry[i]);
            }

            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MAG_FILTER, this.LINEAR);	//Setup up scaling
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_MIN_FILTER, this.LINEAR);	//Setup down scaling
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_S, this.CLAMP_TO_EDGE);	//Stretch image to X position
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_T, this.CLAMP_TO_EDGE);	//Stretch image to Y position
            this.texParameteri(this.TEXTURE_CUBE_MAP, this.TEXTURE_WRAP_R, this.CLAMP_TO_EDGE);	//Stretch image to Z position
            //this.generateMipmap(this.TEXTURE_CUBE_MAP);

            this.bindTexture(this.TEXTURE_CUBE_MAP,null);
            this.mTextureCache[name] = tex;
            return tex;
        };

        //...................................................
        //Setters - Getters

        //Set the size of the canvas html element and the rendering view port
        gl.fSetSize = function(w,h){
            //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
            this.canvas.style.width = w + "px";
            this.canvas.style.height = h + "px";
            this.canvas.width = w;
            this.canvas.height = h;

            //when updating the canvas size, must reset the viewport of the canvas 
            //else the resolution webgl renders at will not change
            this.viewport(0,0,w,h);
            return this;
        }

        //Set the size of the canvas to fill a % of the total screen.
        gl.fFitScreen = function(wp,hp){ return this.fSetSize(window.innerWidth * (wp || 1),window.innerHeight * (hp || 1)); }

        return Homepage.gl = gl;
    }


  // MATHS LIBRARY
  //#######################################################################

    class Util {

        //Convert Hex colors to float arrays, can batch process a list into one big array.
        //example : Fungi.Util.rgbArray("#FF0000","00FF00","#0000FF");
        static rgbArray(){
            if(arguments.length == 0) return null;
            var rtn = [];

            for(var i=0,c,p; i < arguments.length; i++){
                if(arguments[i].length < 6) continue;
                c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
                p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

                rtn.push(
                    parseInt(c[p]	+c[p+1],16)	/ 255.0,
                    parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
                    parseInt(c[p+4]	+c[p+5],16)	/ 255.0
                );
            }
            return rtn;
        }        

        //Normalize x value to x range, then normalize to lerp the z range.
        static map(x, xMin,xMax, zMin,zMax){ return (x - xMin) / (xMax - xMin) * (zMax-zMin) + zMin; }
        static clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
        static smoothStep(edge1, edge2, val){ 
            var x = Math.max(0, Math.min(1, (val-edge1)/(edge2-edge1)));
            return x*x*(3-2*x);
        }
        static to_rad(deg) {return deg * PI*2 / 360;}
        static fRound(n, p) {return Math.round(n * Math.pow(10,p)) / 100;}
    }
    Util.DEG2RAD = Math.PI/180;

    class Vector3 {
        constructor(x,y,z) {this.x = x || 0.0;	this.y = y || 0.0;	this.z = z || 0.0;}

        // Getters/Setters
        //....................................................................
        set(x,y,z) 	{this.x = x; this.y = y; this.z = z; return this;}
        clone() 	{return new Vector3(this.x,this.y,this.z);}

        getArray() 		{return [Util.fRound(this.x,2), Util.fRound(this.y,2), Util.fRound(this.z,2)];}
        getFloatArray() {return new Float32Array([this.x,this.y,this.z]);}

        magnitude(v) {
            //Only get the magnitude of this vector
            if(v === undefined) return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );
            //Get magnitude based on another vector
            var x = v.x - this.x, y = v.y - this.y, z = v.y - this.z;
            return Math.sqrt( x*x + y*y + z*z );
        }

        // Transformations
        //....................................................................
        normalize()  {var mag = this.magnitude(); this.x /= mag; this.y /= mag; this.z /= mag; return this;}

        // Vector Algebra Methods
        //....................................................................
        add(b)	 {this.x += b.x; this.y += b.y; this.z += b.z; return this;}
        sub(b)	 {this.x -= b.x; this.y -= b.y; this.z -= b.z; return this;}
        sMult(s) {this.x *= s; this.y *= s; this.z *= s; return this;}

        dot(b)	 {return this.x*b.x + this.y*b.y + this.z*b.z;}		
        cross(b) {
            this.x = this.y*b.z - this.z*b.y;
            this.y = this.z*b.x - this.x*b.z;
            this.z = this.x*b.y - this.y*b.x;
            return this;
        }

        //Static Vector Algebra Methods
        //....................................................................
        static add(a,b)    {var v = new Vector3(a.x+b.x, a.y+b.y, a.z*b.z); return v;}
        static scalar(s,v) {var v = new Vector3(s*v.x, s*v.y, s*v.z); return v;}
        static dot(a,b)    {return a.x*b.x + a.y*b.y + a.z*b.z;}
        static cross(a,b)  {var v = new Vector3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x); return v;} 
            
    }

    class Matrix4 {
        constructor(raw){ this.raw = raw || Matrix4.identity(); }	// Added new optional argument to allow for cloning

        //##################################################################################################
        //Transformation Methods
        //##################################################################################################
    
        vtranslate(v)	  {Matrix4.translate(this.raw,v.x,v.y,v.z); return this;}
        translate(x,y,z)  {Matrix4.translate(this.raw,x,y,z); 		return this;}
    
        vscale(vec3) 	  {Matrix4.scale(this.raw,vec3.x,vec3.y,vec3.z); return this;}
        scale(x,y,z) 	  {Matrix4.scale(this.raw,x,y,z); 				 return this;}
    
        rotateY(rad)	  {Matrix4.rotateY(this.raw,rad); 		return this;}
        rotateX(rad)	  {Matrix4.rotateX(this.raw,rad); 		return this;}
        rotateZ(rad)	  {Matrix4.rotateZ(this.raw,rad); 		return this;}
    
        rotateA(axis,rad) {Matrix4.rotate(this.raw, rad, axis); return this;}
        //rotateTo(v,u)	  {Matrix4.rotateTo_1(this.raw, v, u);  return this;}		// Using Rodriguez
        rotateTo(v,u)     {Matrix4.rotateTo_2(this.raw, v, u);  return this;}
        
        invert()	 	  {Matrix4.invert(this.raw); return this;}
        
        clone() 	 	  {new Matrix4(this.raw); return this;}
        
        
        //##################################################################################################
        //Reset Methods
        //##################################################################################################
    
        //Bring is back to identity without changing the transform values.
        resetRotation() {	
            for(var i=0; i < this.raw.length; i++){
                if(i >= 12 && i <= 14) continue;
                this.raw[i] = (i % 5 == 0)? 1 : 0;  //only positions 0,5,10,15 need to be 1 else 0.
            }
            return this;
        }
        //reset data back to identity.
        reset() { 
            for (var i=0; i < this.raw.length; i++) {this.raw[i] = (i % 5 == 0)? 1 : 0;} //only positions 0,5,10,15 need to be 1 else 0.
            return this;
        }
    
        //##################################################################################################
        //Static Get Specific Matrices Methods
        //##################################################################################################
    
        // Get an identity matrix
        static identity() {
            var a = new Float32Array(16);
            a[0] = a[5] = a[10] = a[15] = 1;
            return a;
        }
    
        //get a perspective projection matrix
        static perspective(out, fovy, aspect, near, far) {
            var f = 1.0 / Math.tan(fovy / 2),
                nf = 1 / (near - far);
            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = (2 * far * near) * nf;
            out[15] = 0;
        }
    
        //get an orthographic projection matrix
        static ortho(out, left, right, bottom, top, near, far) {
            var lr = 1 / (left - right),
                bt = 1 / (bottom - top),
                nf = 1 / (near - far);
            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (far + near) * nf;
            out[15] = 1;
        };
    
        //get a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
        static normalMat3(out,a) {
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
    
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,
    
            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
            if (!det) return null;
    
            det = 1.0 / det;
    
            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    
            out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    
            out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            return out;
        }
    
        //get skew-symmetric cross product matrix of a vector
        static skewMat4(v) {
            var m = new Matrix4();
    
            m[0] = 0;     m[1] = v.z;   m[2] = v.y;  m[3] = 0;
            m[4] = -v.z;  m[5] = 0;     m[6] = v.x;  m[7] = 0;
            m[8] = -v.y;  m[9] = -v.x;  m[10] = 0;   m[11] = 0;
            m[12] = 0;    m[13] = 0;    m[14] = 0;   m[15] = 0;
    
            return m;
        }
    
        static axisangleMat4(n,rad) {
            var c = Math.cos(rad),
                s = Math.sin(rad),
                t = 1 - c,
                x = x / n.magnitude(),
                y = y / n.magnitude(),
                z = z / n.magnitude();
    
            var m = new Matrix4();
            m[0] = t*x*x + c;    m[1] = t*x*y - z*s;  m[2] = t*x*z + y*s;  m[3] = 0;
            m[4] = t*x*y + z*s;  m[5] = t*y*y + c;    m[6] = t*y*z - x*s;  m[7] = 0;
            m[8] = t*x*z - y*s;  m[9] = t*y*z + x*s;  m[10] = t*z*z + c;   m[11] = 0;
            m[12] = 0;           m[13] = 0;           m[14] = 0;           m[15] = 0;
    
            return m;
        }
    
        //get a Rodriguez Rotation Matrix
        static rodriquezMat4(a,b) {
            return Matrix4.add(
                Matrix4.scalar(Vector3.dot(a,b), Matrix4.identity()),
                Matrix4.skewMat4(vector3.cross(a,b)),
                Matrix4.scalar(
                    -1*Vector3.dot(a,b) / Math.pow(Vector3.cross(a,b).mag(), 2),
                    Matrix4.multiplyCovectors(Vector3.cross(a,b), Vector3.cross(a,b))
                )
            );
        }
    
    
        //##################################################################################################
        //Static Matrix Algebra Methods
        //##################################################################################################
    
        //make the rows into the columns
        static transpose(out, a) {
            //If we are transposing ourselves we can skip a few steps but have to cache some values
            if (out === a) {
                var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a01;
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a02;
                out[9] = a12;
                out[11] = a[14];
                out[12] = a03;
                out[13] = a13;
                out[14] = a23;
            }else{
                out[0] = a[0];
                out[1] = a[4];
                out[2] = a[8];
                out[3] = a[12];
                out[4] = a[1];
                out[5] = a[5];
                out[6] = a[9];
                out[7] = a[13];
                out[8] = a[2];
                out[9] = a[6];
                out[10] = a[10];
                out[11] = a[14];
                out[12] = a[3];
                out[13] = a[7];
                out[14] = a[11];
                out[15] = a[15];
            }
    
            return out;
        }
        
        // ???
        //https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
        static multiplyVector(mat4, v) {
            var x = v[0], y = v[1], z = v[2], w = v[3];
            var c1r1 = mat4[ 0], c2r1 = mat4[ 1], c3r1 = mat4[ 2], c4r1 = mat4[ 3],
                c1r2 = mat4[ 4], c2r2 = mat4[ 5], c3r2 = mat4[ 6], c4r2 = mat4[ 7],
                c1r3 = mat4[ 8], c2r3 = mat4[ 9], c3r3 = mat4[10], c4r3 = mat4[11],
                c1r4 = mat4[12], c2r4 = mat4[13], c3r4 = mat4[14], c4r4 = mat4[15];
    
            return [
                x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
                x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
                x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
                x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
            ];
        }
    
        //transform a vec4 array with a matrix
        //https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/vec4.js, vec4.transformMat4
        static transformVec4(out, v, m) {
            out[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
            out[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
            out[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
            out[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
            return out;
        }
    
        static add(a,b) {
            var m = new Matrix4();
            for (var i=0; i<arguments.length; i++) {if (arguments[i+1]) {for (var j=0; j<m.raw.length; j++) {
                        m.raw[j] = arguments[i].raw[j] + arguments[i+1].raw[j];
            }}};
            return m;
        }
    
        static scalar(s, out) {
            for (var i=0; i<m.raw.length; i++) {
                out[i] = s * out[i];
            }
            return out;
        }
    
        //Multiply two mat4 together (From glMatrix)
        static mult(out, a, b) { 
            var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    
            // Cache only the current line of the second matrix
            var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
            out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    
            b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
            out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    
            b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
            out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    
            b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
            out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
            out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
            out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
            out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
            return out;	
        }
    
        static multiplyCovectors(v,u) {
            var m = new Matrix4();
            m[0] = v.x*u.x;  m[1] = v.x*u.y;  m[2] = v.x*u.z;  m[3] = 0;
            m[4] = v.y*u.x;  m[5] = v.y*u.y;  m[6] = v.y*u.z;  m[7] = 0;
            m[8] = v.z*u.x;  m[9] = v.z*u.y;  m[10] = v.z*u.z; m[11] = 0;
            m[12] = 0;   	 m[13] = 0;    	  m[14] = 0;       m[15] = 0;
            return m;
        }
    
        
        //##################################################################################################
        //Static Matrix Transforms
        //##################################################################################################
    
        //translate x,y,z transform
        static translate(out,x,y,z) {
            out[12] = out[0] * x + out[4] * y + out[8]	* z + out[12];
            out[13] = out[1] * x + out[5] * y + out[9]	* z + out[13];
            out[14] = out[2] * x + out[6] * y + out[10]	* z + out[14];
            out[15] = out[3] * x + out[7] * y + out[11]	* z + out[15];
        }
    
        //scale x,y,z transform
        static scale(out,x,y,z) {
            out[0] *= x;
            out[1] *= x;
            out[2] *= x;
            out[3] *= x;
            out[4] *= y;
            out[5] *= y;
            out[6] *= y;
            out[7] *= y;
            out[8] *= z;
            out[9] *= z;
            out[10] *= z;
            out[11] *= z;
            return out;
        };
    
        // Rotation matrix transformations --------------------------------
        static rotateY(out,rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = out[0],
                a01 = out[1],
                a02 = out[2],
                a03 = out[3],
                a20 = out[8],
                a21 = out[9],
                a22 = out[10],
                a23 = out[11];
    
            // Perform axis-specific matrix multiplication
            out[0] = a00 * c - a20 * s;
            out[1] = a01 * c - a21 * s;
            out[2] = a02 * c - a22 * s;
            out[3] = a03 * c - a23 * s;
            out[8] = a00 * s + a20 * c;
            out[9] = a01 * s + a21 * c;
            out[10] = a02 * s + a22 * c;
            out[11] = a03 * s + a23 * c;
            return out;
        }
        static rotateX(out,rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a10 = out[4],
                a11 = out[5],
                a12 = out[6],
                a13 = out[7],
                a20 = out[8],
                a21 = out[9],
                a22 = out[10],
                a23 = out[11];
    
            // Perform axis-specific matrix multiplication
            out[4] = a10 * c + a20 * s;
            out[5] = a11 * c + a21 * s;
            out[6] = a12 * c + a22 * s;
            out[7] = a13 * c + a23 * s;
            out[8] = a20 * c - a10 * s;
            out[9] = a21 * c - a11 * s;
            out[10] = a22 * c - a12 * s;
            out[11] = a23 * c - a13 * s;
            return out;
        }
        static rotateZ(out,rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad),
                a00 = out[0],
                a01 = out[1],
                a02 = out[2],
                a03 = out[3],
                a10 = out[4],
                a11 = out[5],
                a12 = out[6],
                a13 = out[7];
    
            // Perform axis-specific matrix multiplication
            out[0] = a00 * c + a10 * s;
            out[1] = a01 * c + a11 * s;
            out[2] = a02 * c + a12 * s;
            out[3] = a03 * c + a13 * s;
            out[4] = a10 * c - a00 * s;
            out[5] = a11 * c - a01 * s;
            out[6] = a12 * c - a02 * s;
            out[7] = a13 * c - a03 * s;
            return out;
        }
    
        //General rotation matrix method -- could suffer from gimbal lock
        static rotate(out, rad, axis) {
            var x = axis[0], y = axis[1], z = axis[2],
                len = Math.sqrt(x * x + y * y + z * z),
                s, c, t,
                a00, a01, a02, a03,
                a10, a11, a12, a13,
                a20, a21, a22, a23,
                b00, b01, b02,
                b10, b11, b12,
                b20, b21, b22;
    
            if (Math.abs(len) < 0.000001) { return null; }
    
            len = 1 / len;
            x *= len;
            y *= len;
            z *= len;
    
            s = Math.sin(rad);
            c = Math.cos(rad);
            t = 1 - c;
    
            a00 = out[0]; a01 = out[1]; a02 = out[2]; a03 = out[3];
            a10 = out[4]; a11 = out[5]; a12 = out[6]; a13 = out[7];
            a20 = out[8]; a21 = out[9]; a22 = out[10]; a23 = out[11];
    
            // Construct the elements of the rotation matrix
            b00 = x * x * t + c; b01 = y * x * t + z * s; b02 = z * x * t - y * s;
            b10 = x * y * t - z * s; b11 = y * y * t + c; b12 = z * y * t + x * s;
            b20 = x * z * t + y * s; b21 = y * z * t - x * s; b22 = z * z * t + c;
    
            // Perform rotation-specific matrix multiplication
            out[0] = a00 * b00 + a10 * b01 + a20 * b02;
            out[1] = a01 * b00 + a11 * b01 + a21 * b02;
            out[2] = a02 * b00 + a12 * b01 + a22 * b02;
            out[3] = a03 * b00 + a13 * b01 + a23 * b02;
            out[4] = a00 * b10 + a10 * b11 + a20 * b12;
            out[5] = a01 * b10 + a11 * b11 + a21 * b12;
            out[6] = a02 * b10 + a12 * b11 + a22 * b12;
            out[7] = a03 * b10 + a13 * b11 + a23 * b12;
            out[8] = a00 * b20 + a10 * b21 + a20 * b22;
            out[9] = a01 * b20 + a11 * b21 + a21 * b22;
            out[10] = a02 * b20 + a12 * b21 + a22 * b22;
            out[11] = a03 * b20 + a13 * b21 + a23 * b22;
        }
    
        //Rotation bringing vector p1 to vector p2 using the Rodriguex Rotation Matrix
        static rotateTo_1(out, p1, p2) {
            var a = out,
                b =  Matrix4.rodriquezMat4(p1,p2).raw;
            Matrix4.mult(out,a,b);
            return out;	
    
        }
    
        //Rotation bringing vector p1 to vector p2 using the Axis-Angle Rotation Matrix
        static rotateTo_2(out, v, u) {
            var axis = Vector3.cross(v,u).normalize(),
                angle = Math.acos(Vector3.dot(v.normalize(),u.normalize())),
                a = out,
                b = Matrix4.axisangleMat4(axis, angle).raw;
            Matrix4.mult(out,a,b);
            return out;
        }
    
        //???Not quite sure what this does???
        static invert(out,mat) {
            if(mat === undefined) mat = out; //If input isn't sent, then output is also input
    
            var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
                a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
                a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
                a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],
    
                b00 = a00 * a11 - a01 * a10,
                b01 = a00 * a12 - a02 * a10,
                b02 = a00 * a13 - a03 * a10,
                b03 = a01 * a12 - a02 * a11,
                b04 = a01 * a13 - a03 * a11,
                b05 = a02 * a13 - a03 * a12,
                b06 = a20 * a31 - a21 * a30,
                b07 = a20 * a32 - a22 * a30,
                b08 = a20 * a33 - a23 * a30,
                b09 = a21 * a32 - a22 * a31,
                b10 = a21 * a33 - a23 * a31,
                b11 = a22 * a33 - a23 * a32,
    
                // Calculate the determinant
                det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    
            if (!det) return false;
            det = 1.0 / det;
    
            out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
            out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
            out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
            out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
            out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
            out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
            out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
            out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
            out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
            out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
            out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
            out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
            out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
            out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
            out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
            out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    
            return true;
        }
    }


  // COMPONENT UTILITIES & CONTROLLERS
  //#######################################################################

    class Transform {
        constructor(){
            //transform vectors
            this.position	= new Vector3(0,0,0);	//Traditional X,Y,Z 3d position
            this.scale		= new Vector3(1,1,1);	//How much to scale a mesh. Having a 1 means no scaling is done.
            this.rotation	= new Vector3(0,0,0);	//Hold rotation values based on degrees, Object will translate it to radians
            this.matView 	= new Matrix4();		//Cache the results when calling updateMatrix
            this.matNormal	= new Float32Array(9);	//This is a Mat3, raw array to hold the values is enough for what its used for

            this.rotationTo = {p1: new Vector3(0,0,1), p2: new Vector3(0,0,1)};

            //quaternion rotation pars
            this.axis		= new Vector3(1,0,0);
            this.angle		= 0;

            //Direction Vectors, Need 4 elements for math operations with matrices
            this.forward	= new Float32Array(4);	//When rotating, keep track of what the forward direction is
            this.up			= new Float32Array(4);	//what the up direction is, invert to get bottom
            this.right		= new Float32Array(4);	//what the right direction is, invert to get left
        }

        //--------------------------------------------------------------------------
        //Methods
        updateMatrix(){
            this.matView.reset() //Order is very important!!
                .vtranslate(this.position)
                .rotateX(this.rotation.x * Util.DEG2RAD)
                .rotateZ(this.rotation.z * Util.DEG2RAD)
                .rotateY(this.rotation.y * Util.DEG2RAD)
                //.rotateTo(this.rotationTo.p1, this.rotationTo.p2)
                .vscale(this.scale);

            //Calcuate the Normal Matrix which doesn't need translate, then transpose and inverses the mat4 to mat3
            Matrix4.normalMat3(this.matNormal,this.matView.raw);

            //Determine Direction after all the transformations.
            Matrix4.transformVec4(this.forward,	[0,0,1,0],this.matView.raw); //Z
            Matrix4.transformVec4(this.up,		[0,1,0,0],this.matView.raw); //Y
            Matrix4.transformVec4(this.right,	[1,0,0,0],this.matView.raw); //X

            return this.matView.raw;
        }

        updateDirection(){
            Matrix4.transformVec4(this.forward,	[0,0,1,0],this.matView.raw);
            Matrix4.transformVec4(this.up,		[0,1,0,0],this.matView.raw);
            Matrix4.transformVec4(this.right,	[1,0,0,0],this.matView.raw);
            return this;
        }

        getViewMatrix(){	return this.matView.raw; }
        getNormalMatrix(){  return this.matNormal;}

        reset(){
            this.position.set(0,0,0);
            this.scale.set(1,1,1);
            this.rotation.set(0,0,0);

            this.axis.set(1,0,0);
            this.angle = 0;
        }
    }

    class UI {
        constructor(camera, light, icosModel, nameModel, mouseFX) {
            this.gl = Homepage.gl;           //Do I need ???
            this.camera = camera;
            this.light = light;
            this.icosModel = icosModel;
            this.nameModel = nameModel;
            this.mouseFX = mouseFX;
    
            // CAMERA
            const camPos = this.camera.transform.position;
            document.getElementById("cam-pos-x").addEventListener("change", (e) => {
                camPos.set(parseFloat(e.target.value), camPos.y, camPos.z);
            });
            document.getElementById("cam-pos-y").addEventListener("change", (e) => {
                camPos.set(camPos.x, parseFloat(e.target.value), camPos.z);
            });
            document.getElementById("cam-pos-z").addEventListener("change", (e) => {
                camPos.set(camPos.x, camPos.y, parseFloat(e.target.value));
            });
    
            document.getElementById("cam-fov").addEventListener("change", (e) => {
                this.camera.fov = parseFloat(e.target.value);
                Matrix4.perspective(this.camera.projectionMatrix, this.camera.fov, this.camera.ratio, this.camera.near, this.camera.far); 
            });
    
            // LIGHT
            const lightPos = this.light.transform.position;
            document.getElementById("light-pos-x").addEventListener("change", (e) => {
                lightPos.set(parseFloat(e.target.value), lightPos.y, lightPos.z);
            });
            document.getElementById("light-pos-y").addEventListener("change", (e) => {
                lightPos.set(lightPos.x, parseFloat(e.target.value), lightPos.z);
            });
            document.getElementById("light-pos-z").addEventListener("change", (e) => {
                lightPos.set(lightPos.x, lightPos.y, parseFloat(e.target.value));
            });
    
            document.getElementById("light-intensity").addEventListener("change", (e) => {
                this.light.setIntensity(e.target.value);
            });
    
            document.getElementById("light-color-r").addEventListener("change", (e) => {
                this.light.setColor(parseFloat(e.target.value), this.light.color.y, this.light.color.z);
            });
            document.getElementById("light-color-g").addEventListener("change", (e) => {
                this.light.setColor(this.light.color.x, parseFloat(e.target.value), this.light.color.z);
            });
            document.getElementById("light-color-b").addEventListener("change", (e) => {
                this.light.setColor(this.light.color.x, this.light.color.y, parseFloat(e.target.value));
            });
    
            // ICOS MODEL
            const icosPos = this.icosModel.transform.position;
            document.getElementById("icos-pos-x").addEventListener("change", (e) => {
                this.icosModel.setPosition(parseFloat(e.target.value), icosPos.y, icosPos.z)
                    .transform.updateMatrix();
            });
            document.getElementById("icos-pos-y").addEventListener("change", (e) => {
                this.icosModel.setPosition(icosPos.x, parseFloat(e.target.value), icosPos.z)
                    .transform.updateMatrix();
            });
            document.getElementById("icos-pos-z").addEventListener("change", (e) => {
                this.icosModel.setPosition(icosPos.x, icosPos.y, parseFloat(e.target.value))
                    .transform.updateMatrix();
            });
    
            document.getElementById("icos-scale").addEventListener("change", (e) => {
                this.icosModel.setScale(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value))
                    .transform.updateMatrix();
            });
    
            // NAME MODEL
            const namePos = this.nameModel.transform.position;
            document.getElementById("name-pos-x").addEventListener("change", (e) => {
                this.nameModel.setPosition(parseFloat(e.target.value), namePos.y, namePos.z)
                    .transform.updateMatrix();
            });
            document.getElementById("name-pos-y").addEventListener("change", (e) => {
                this.nameModel.setPosition(namePos.x, parseFloat(e.target.value), namePos.z)
                    .transform.updateMatrix();
            });
            document.getElementById("name-pos-z").addEventListener("change", (e) => {
                this.nameModel.setPosition(namePos.x, namePos.y, parseFloat(e.target.value))
                    .transform.updateMatrix();
            });
    
            document.getElementById("name-scale").addEventListener("change", (e) => {
                this.nameModel.setScale(parseFloat(e.target.value), parseFloat(e.target.value), parseFloat(e.target.value))
                    .transform.updateMatrix();
            });
    
        }
    }

    class MouseEffects {
        constructor(object) {
            var gl = Homepage.gl;
            var box = gl.canvas.getBoundingClientRect();
            this.canvas = gl.canvas;		
            this.object = object;				
            
            this.rotateRate = -200;							
    
            this.offsetX = box.left;						
            this.offsetY = box.top;
    
            
            this.initX = 0;									
            this.initY = 0;
            this.prevX = 0;									
            this.prevY = 0;		
    
            this.lagFactor = 0.3;
            this.deceleration = 0.95;
    
            this.lagX = 0;
            this.lagY = 0;
    
            this.p1 = new Vector3(0,0,1);
            this.p2 = new Vector3(0,0,1);
    
            this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
            this.canvas.addEventListener("onclick", this.handleClick.bind(this));
    
            //Simulate deceleration and update rotation
            //setInterval(this.updateRotation.bind(this), 16);
    
        }
    
        static create(gl, object) {
            var fx = new MouseEffects(gl, object);
            return fx;
        }
    
        handleMouseMove(e) {
            this.initX = e.pageX - this.offsetX;
            this.initY = e.pageY - this.offsetY;
    
            var dx = this.initX - this.prevX,
                dy = this.initY - this.prevY;
            
            //Adjust trailing effect
            this.lagX = dx * this.lagFactor;
            this.lagY = dy * this.lagFactor;
    
            this.prevX = this.initX;
            this.prevY = this.initY;
        }
    
        handleMouseMove_2(e) {
            this.initX = Util.map(e.pageX, 0, this.canvas.width, -50, 50);
            this.initY = Util.map(e.pageY, 0, this.canvas.height, -50, 50);
            this.prevX = this.initX;
            this.prevY = this.initY;
    
            this.p2.set(this.initX, this.initY, 2);
            this.object.transform.rotationTo.p1 = this.p1;
            this.object.transform.rotationTo.p2 = this.p2;
            this.object.updateViewMatrix();
    
            //this.p1.set(this.prevX, this.prevY, 2);
        }
    
        handleClick(e) {}
    
        updateRotation() {
            this.lagX *= this.deceleration;
            this.lagY *= this.deceleration;
            this.object.transform.rotation.y += -this.lagX * (this.rotateRate / this.canvas.width);
            this.object.transform.rotation.x += -this.lagY * (this.rotateRate / this.canvas.width);
    
            //this.object.transform.rotationTo.p2 = new Vector3(this.lagX, this.lagY, 1);
            //var prevNormMat = this.object.transform.getNormalMatrix();
            this.object.updateViewMatrix();
            //if (this.object.transform.getNormalMatrix() == prevNormMat) console.log("equal");
        }
    
    
    
    }

    class ObjLoader {
        static domToMesh(meshName,elmID,flipYUV,keepRawData){ 
            var d = ObjLoader.parseFromDom(elmID,flipYUV);
            var mesh = gl.fCreateMeshVAO(meshName,d[0],d[1],d[2],d[3],3);
    
            if(keepRawData){ //Have the option to save the data to use for normal debugging or modifying. TODO
                mesh.aIndex	= d[0];
                mesh.aVert	= d[1];
                mesh.aNorm	= d[2];
            }
    
            return mesh;
        }
    
        static parseFromDom(elmID,flipYUV){ return ObjLoader.parseObjText(document.getElementById(elmID).innerHTML,flipYUV); }
        
        static parseObjText(txt,flipYUV){
            txt = txt.trim() + "\n"; //add newline to be able to access last line in the for loop
    
            var line,				//Line text from obj file
                itm,				//Line split into an array
                ary,				//Itm split into an array, used for faced decoding
                i,
                ind,				//used to calculate index of the cache arrays
                isQuad = false,		//Determine if face is a quad or not
                aCache = [],		//Cache Dictionary key = itm array element, val = final index of the vertice
                cVert = [],			//Cache Vertice array read from obj
                cNorm = [],			//Cache Normal array ...
                cUV = [],			//Cache UV array ...
                fVert = [],			//Final Index Sorted Vertice Array
                fNorm = [],			//Final Index Sorted Normal Array
                fUV = [],			//Final Index Sorted UV array
                fIndex = [],		//Final Sorted index array
                fIndexCnt = 0,		//Final count of unique vertices
                posA = 0,
                posB = txt.indexOf("\n",0);
            
            while(posB > posA){
                line = txt.substring(posA,posB).trim();
    
                switch(line.charAt(0)){
                    //......................................................
                    // Cache Vertex Data for Index processing when going through face data
                    // Sample Data (x,y,z)
                    // v -1.000000 1.000000 1.000000
                    // vt 0.000000 0.666667
                    // vn 0.000000 0.000000 -1.000000
                    case "v":
                        itm = line.split(" "); itm.shift();
                        switch(line.charAt(1)){
                            case " ": cVert.push(parseFloat(itm[0]) , parseFloat(itm[1]) , parseFloat(itm[2]) ); break;		//VERTEX
                            case "t": cUV.push( parseFloat(itm[0]) , parseFloat(itm[1]) );	break;							//UV
                            case "n": cNorm.push( parseFloat(itm[0]) , parseFloat(itm[1]) , parseFloat(itm[2]) ); break;	//NORMAL
                        }
                    break;
    
                    //......................................................
                    // Process face data
                    // All index values start at 1, but javascript array index start at 0. So need to always subtract 1 from index to match things up
                    // Sample Data [Vertex Index, UV Index, Normal Index], Each line is a triangle or quad. 
                    // f 1/1/1 2/2/1 3/3/1 4/4/1
                    // f 34/41/36 34/41/35 34/41/36
                    // f 34//36 34//35 34//36
                    case "f":
                        itm = line.split(" ");
                        itm.shift();
                        isQuad = false;
    
                        for(i=0; i < itm.length; i++){
                            //--------------------------------
                            //In the event the face is a quad
                            if(i == 3 && !isQuad){
                                i = 2; //Last vertex in the first triangle is the start of the 2nd triangle in a quad.
                                isQuad = true;
                            }
    
                            //--------------------------------
                            //Has this vertex data been processed?
                            if(itm[i] in aCache){
                                fIndex.push( aCache[itm[i]] ); //it has, add its index to the list.
                            }else{
                                //New Unique vertex data, Process it.
                                ary = itm[i].split("/");
                                
                                //Parse Vertex Data and save final version ordred correctly by index
                                ind = (parseInt(ary[0])-1) * 3;
                                fVert.push( cVert[ind] , cVert[ind+1] , cVert[ind+2] );
    
                                //Parse Normal Data and save final version ordered correctly by index
                                ind = (parseInt(ary[2])-1) * 3;
                                fNorm.push( cNorm[ind] , cNorm[ind+1] , cNorm[ind+2] );
    
                                //Parse Texture Data if available and save final version ordered correctly by index
                                if(ary[1] != ""){
                                    ind = (parseInt(ary[1])-1) * 2;
                                    fUV.push( cUV[ind] , 
                                        (!flipYUV)? cUV[ind+1] : 1-cUV[ind+1]
                                    );
                                }
    
                                //Cache the vertex item value and its new index.
                                //The idea is to create an index for each unique set of vertex data base on the face data
                                //So when the same item is found, just add the index value without duplicating vertex,normal and texture.
                                aCache[ itm[i] ] = fIndexCnt;
                                fIndex.push(fIndexCnt);
                                fIndexCnt++;
                            }
    
                            //--------------------------------
                            //In a quad, the last vertex of the second triangle is the first vertex in the first triangle.
                            if(i == 3 && isQuad) fIndex.push( aCache[itm[0]] );
                        }
                    break;
                }
    
                //Get Ready to parse the next line of the obj data.
                posA = posB+1;
                posB = txt.indexOf("\n",posA);
            }
            
            return [fIndex,fVert,fNorm,fUV];		
        }
    }


  // COMPONENTS
  //#######################################################################

    class Model {
        constructor(name, meshData, material){
            this.name = name;
            this.transform = new Transform();
            this.color = new Vector3(1,1,1);
            this.mesh = meshData;
            this.material = material;
            //this.get_uniforms = null;
            this.visible = false;
        }

        static create(name, meshData, material) {
            var model = new Model(name, meshData, material);
            Homepage.Res.Models[name] = model;
            return model;
        }

        updateUniforms() {if (this.material.get instanceof Function) {console.log("in Model.updateUniforms: get is a func"); this.material.createUniforms();} else {console.log("in Model.updateUniforms: get not a func"); return this;}}
    
        applyMouseCtrl() {this.mouseCtrl = MouseEffects.create(this); return this;}
    
        updateMouseCtrl() {if (this.mouseCtrl != null) {this.mouseCtrl.updateRotation();} return this;}
    
        //DEPRECIATED
        updateUniforms() {
            if (this.material.uniforms.get instanceof Function) {
                this.material.createUniforms();
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

    class Camera {
        constructor(fov,near,far){
            //Setup the perspective matrix
            this.projectionMatrix = new Float32Array(16);
            this.ratio = gl.canvas.width / gl.canvas.height;
            this.fov = fov || 60;
            this.near = near || 0.1;
            this.far = far || 100.0;
            Matrix4.perspective(this.projectionMatrix, this.fov, this.ratio, this.near, this.far);
    
            this.transform = new Transform();		//Setup transform to control the position of the camera
            this.viewMatrix = new Float32Array(16);	//Cache the matrix that will hold the inverse of the transform.
    
            this.mode = Camera.MODE_ORBIT;			//Set what sort of control mode to use.
        }
    
        setPosition(x,y,z) {this.transform.position.set(x,y,z); return this;}

        setCamSettings(fov, near, far) {
            this.fov = fov;
            Matrix4.perspective(this.projectionMatrix, this.fov, this.ratio, near, far);
            return this;
        }

        panX(v){
            if(this.mode == Camera.MODE_ORBIT) return; // Panning on the X Axis is only allowed when in free mode
            this.updateViewMatrix();
            this.transform.position.x += this.transform.right[0] * v;
            this.transform.position.y += this.transform.right[1] * v;
            this.transform.position.z += this.transform.right[2] * v; 
        }
    
        panY(v){
            this.updateViewMatrix();
            this.transform.position.y += this.transform.up[1] * v;
            if(this.mode == Camera.MODE_ORBIT) return; //Can only move up and down the y axix in orbit mode
            this.transform.position.x += this.transform.up[0] * v;
            this.transform.position.z += this.transform.up[2] * v; 
        }
    
        panZ(v){
            this.updateViewMatrix();
            if(this.mode == Camera.MODE_ORBIT){
                this.transform.position.z += v; //orbit mode does translate after rotate, so only need to set Z, the rotate will handle the rest.
            }else{
                //in freemode to move forward, we need to move based on our forward which is relative to our current rotation
                this.transform.position.x += this.transform.forward[0] * v;
                this.transform.position.y += this.transform.forward[1] * v;
                this.transform.position.z += this.transform.forward[2] * v; 
            }
        }
    
        //To have different modes of movements, this function handles the view matrix update for the transform object.
        updateViewMatrix(){
            //Optimize camera transform update, no need for scale nor rotateZ
            if(this.mode == Camera.MODE_FREE){
                this.transform.matView.reset()
                    .vtranslate(this.transform.position)
                    .rotateX(this.transform.rotation.x * Util.DEG2RAD)
                    .rotateY(this.transform.rotation.y * Util.DEG2RAD);
                    
            }else{
                this.transform.matView.reset()
                    .rotateX(this.transform.rotation.x * Util.DEG2RAD)
                    .rotateY(this.transform.rotation.y * Util.DEG2RAD)
                    .vtranslate(this.transform.position);
    
            }
    
            this.transform.updateDirection();
    
            //Cameras work by doing the inverse transformation on all meshes, the camera itself is a lie :)
            Matrix4.invert(this.viewMatrix,this.transform.matView.raw);
            return this.viewMatrix;
        }
    
        getTranslatelessMatrix(){
            var mat = new Float32Array(this.viewMatrix);
            mat[12] = mat[13] = mat[14] = 0.0; //Reset Translation position in the Matrix to zero.
            return mat;
        }
    }
    Camera.MODE_FREE = 0;	
    Camera.MODE_ORBIT = 1;

    class Light {
    
        constructor() {
            this.transform = new Transform();
            //this.gl = gl;
    
            this.intensity = 1;
            this.color = new Vector3(1,1,1);
            //this.direction = new Vector3(0,0,1);
            //this.lookat = new Vector3(0,0,0);
            //this.mode = Light.MODE_POINT;
        }
    
        setPosition(x,y,z) {this.transform.position.set(x,y,z); return this;}
        setColor(r,g,b) {this.color.set(r,g,b); return this;}
        setIntensity(s) {this.intensity = s; return this;}
    
        updateViewMatrix() {this.transform.updateMatrix();}
    }


  // MATERIALS & SHADERS
  //#######################################################################

    class Shader {
        constructor(name, vertShader, fragShader, isText) {
            gl = Homepage.gl;

            if (!isText) {this.program = ShaderUtil.domShaderProgram(gl, vertShader, fragShader, true);}
            else		 {this.program = ShaderUtil.createProgramFromText(gl, vertShader, fragShader, true);}
    
            if (this.program != null) {
                gl.useProgram(this.program);

                this.name = name;
    
                this.isActive = true;
    
                this.noCulling = false;
                this.doBlending = false;
            } else {console.log("program not found");}
        }
    
        static create(name, vertShader, fragShader, isText) {
            var shader = new Shader(name, vertShader, fragShader, isText);
            Homepage.Res.Shaders[name] = shader;
            return shader;
        }

        //---------------------------------------------------
        // Methods
        //---------------------------------------------------
        activate(){ gl.useProgram(this.program); return this; }
        deactivate(){ gl.useProgram(null); return this; }
    
        //function helps clean up resources when shader is no longer needed.
        dispose(){
            //unbind the program if its currently active
            if (gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
            gl.deleteProgram(this.program);
        }
    }

    class ShaderUtil {
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
        static createShader(gl, src,typeStr){
            if (gl == null) console.log("gl not found");
            var type = gl.VERTEX_SHADER;
            if (typeStr == "fragment_shader") type = gl.FRAGMENT_SHADER;
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
        static createProgram(gl, vShader,fShader,doValidate){
            //Link shaders together
            var prog = gl.createProgram();
            gl.attachShader(prog,vShader);
            gl.attachShader(prog,fShader);
    
            //Force predefined locations for specific attributes. If the attibute isn't used in the shader its location will default to -1
            gl.bindAttribLocation(prog, Homepage.ATTR_POSITION_LOC, Homepage.ATTR_POSITION_NAME);
            gl.bindAttribLocation(prog, Homepage.ATTR_NORMAL_LOC, Homepage.ATTR_NORMAL_NAME);
            gl.bindAttribLocation(prog, Homepage.ATTR_UV_LOC, Homepage.ATTR_UV_NAME);
    
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
        static domShaderProgram(gl, vectID,fragID,doValidate){
            var vShaderTxt	= ShaderUtil.domShaderSrc(vectID);								if(!vShaderTxt)	return null;
            var fShaderTxt	= ShaderUtil.domShaderSrc(fragID);								if(!fShaderTxt)	return null;
            var vShader		= ShaderUtil.createShader(gl, vShaderTxt,"vertex_shader");		if(!vShader)	return null;
            var fShader		= ShaderUtil.createShader(gl, fShaderTxt,"fragment_shader");	if(!fShader){	gl.deleteShader(vShader); return null; }
            
            return ShaderUtil.createProgram(gl, vShader,fShader,true);
        }
    
        static createProgramFromText(gl, vShaderTxt,fShaderTxt,doValidate){
            var vShader		= ShaderUtil.createShader(gl, vShaderTxt,gl.VERTEX_SHADER);		if(!vShader)	return null;
            var fShader		= ShaderUtil.createShader(gl, fShaderTxt,gl.FRAGMENT_SHADER);	if(!fShader){	gl.deleteShader(vShader); return null; }
            
            return ShaderUtil.createProgram(gl, vShader,fShader,true);
        }
    
        //-------------------------------------------------
        // Setters / Getters
        //-------------------------------------------------
    
        //Get the locations of standard Attributes that we will mostly be using. Location will = -1 if attribute is not found.
        static getStandardAttribLocations(gl, program){
            return {
                position:	gl.getAttribLocation(program, Homepage.ATTR_POSITION_NAME),
                norm:		gl.getAttribLocation(program, Homepage.ATTR_NORMAL_NAME),
                uv:			gl.getAttribLocation(program, Homepage.ATTR_UV_NAME)
            };
        }
    
        static getStandardUniformLocations(gl, program){
            return {
                perspective:	gl.getUniformLocation(program,"uPMatrix"),
                ModelMatrix:	gl.getUniformLocation(program,"uMVMatrix"),
                cameraMatrix:	gl.getUniformLocation(program,"uCameraMatrix"),
                mainTexture:	gl.getUniformLocation(program,"uMainTex")
            };
        }
    }

    class Uniforms {
        constructor() {
            this.name = "";
            this.get = null;
            this.ary = [];
        }

        static create(name, f) {
            var uniforms = new Uniforms();
            uniforms.name = name;
            uniforms.get = f;
            Homepage.Res.Uniforms[name] = uniforms;
            return uniforms;
        }

        updateArray() {this.ary = this.get(); return this;}

        getArray() {return this.ary;}
    }

    class Material {
        constructor(name, shader, uniforms, drawMode) {
            this.gl = gl;
            this.name = name;
            this.shader = shader;
            this.uniforms = uniforms;
    
            this.useCulling = gl.CULLING_STATE;
            this.useBlending = gl.BLENDING_STATE;
            this.useModelMatrix = true;
            this.useNormalMatrix = true;
    
            this.drawMode = drawMode || gl.TRIANGLES;
        }
    
        static create(name, shader, uniforms, drawMode) {
            var mat = new Material(name, shader, uniforms, drawMode);
            Homepage.Res.Materials[name] = mat;
            return mat;
        }
    
            //---------------------------------------------------
        // Create the Uniforms/Textures
        //---------------------------------------------------
        // Takes in one argument which is an array of triples which each represent one uniform and its neccessary info
        // ex: [["uName1", "1fv", val1], ["uName2", "3fv", val2]]
        createUniforms() {
            var uniformsAry = this.uniforms.get(), 
                iLoc = 0,
                iName = "",
                iType = "",
                iVal = 0;

            if (uniformsAry.length > 0) {    
                for (var i=0; i<uniformsAry.length; i++) {
                    iName = uniformsAry[i][0];
                    iType = uniformsAry[i][1];
                    iVal = uniformsAry[i][2];
    
                    iLoc = gl.getUniformLocation(this.shader.program, iName);
                    if (iLoc == null) {console.log("location of uniform not found: " + iName); return this;}
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
    
        activateShader()   {this.shader.isActive = true; this.gl.useProgram(this.shader.program); return this; }
        deactivateShader() {this.shader.isActive = false; this.gl.useProgram(null); return this; }
    
        //function helps clean up resources when shader is no longer needed.
        disposeProgram(){
            //unbind the program if its currently active
            if(this.gl.getParameter(this.gl.CURRENT_PROGRAM) === this.program) this.gl.useProgram(null);
            this.gl.deleteProgram(this.program);
        }
    }


  // RENDERING PIPELINE
  //#######################################################################

    class RenderLoop {
        constructor(callback,fps){
            var oThis = this;
            this.msLastFrame = null;	//The time in Miliseconds of the last frame.
            this.callBack = callback;	//What function to call for each frame
            this.isActive = false;		//Control the On/Off state of the render loop
            this.fps = 0;				//Save the value of how fast the loop is going.
    
            //if(!fps && fps > 0){ //Build a run method that limits the framerate
            if(fps != undefined && fps > 0){ //Build a run method that limits the framerate
                this.msFpsLimit = 1000/fps; //Calc how many milliseconds per frame in one second of time.
                this.run = function(){
                    //Calculate Deltatime between frames and the FPS currently.
                    var msCurrent	= performance.now(),
                        msDelta		= (msCurrent - oThis.msLastFrame),
                        deltaTime	= msDelta / 1000.0;		//What fraction of a single second is the delta time
                    
                    if(msDelta >= oThis.msFpsLimit){ //Now execute frame since the time has elapsed.
                        oThis.fps			= Math.floor(1/deltaTime);
                        oThis.msLastFrame	= msCurrent;
                        oThis.callBack(deltaTime);
                    }
    
                    if(oThis.isActive) window.requestAnimationFrame(oThis.run);
                }
            }else{ //Else build a run method thats optimised as much as possible.
                this.run = function(){
                    //Calculate Deltatime between frames and the FPS currently.
                    var msCurrent	= performance.now(),	//Gives you the whole number of how many milliseconds since the dawn of time :)
                        deltaTime	= (msCurrent - oThis.msLastFrame) / 1000.0;	//ms between frames, Then / by 1 second to get the fraction of a second.
    
                    //Now execute frame since the time has elapsed.
                    oThis.fps			= Math.floor(1/deltaTime); //Time it took to generate one frame, divide 1 by that to get how many frames in one second.
                    oThis.msLastFrame	= msCurrent;
    
                    oThis.callBack(deltaTime);
                    if(oThis.isActive) window.requestAnimationFrame(oThis.run);
                }
            }
        }
    
        start(){
            this.isActive = true;
            this.msLastFrame = performance.now();
            window.requestAnimationFrame(this.run);
            return this;
        }
    
        stop(){ this.isActive = false; }
    }

    var Render = function(ary, camera, light) {

        var gl = Homepage.gl;

        camera.updateViewMatrix();
        light.updateViewMatrix();
    
        var material = shader = null;
    
        for (var i=0; i<ary.length; i++) {
    
            ary[0].updateMouseCtrl().updateViewMatrix().updateUniforms();
    
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
            if (ary[i].mesh.vao.isIndexed)  {gl.drawElements(material.drawMode, ary[i].mesh.indexCount, gl.UNSIGNED_SHORT, 0);}
            else                            {gl.drawArrays(material.drawMode, 0, ary[i].mesh.vertexCount);}
    
            //Cleanup
            gl.bindVertexArray(null);
        }
    
    }


  // RETURN OBJECT GIVES ACCESS TO HOMEPAGE CONTENTS IN DOM
  //#######################################################################

    return {

        //STARTUP
        Init:Init, gl:gl, Util:Util, UI:UI,

        //RESOURCES CACHE
        Res : {Models:[], Materials:[], Shaders:[], Uniforms:[], Textures:[]},

        //MATH OBJECTS
        Maths : {Vector3:Vector3, Matrix4:Matrix4},

        //MODEL CTRL HANDLERS
        Transform:Transform, ObjLoader:ObjLoader, MouseEffects:MouseEffects,

        //COMPONENTS
        Model:Model, Camera:Camera, Light:Light,

        //MATERIAL AND SHADER
        Shader:Shader, Uniforms:Uniforms, Material:Material,

        //RENDERING
        RenderLoop:RenderLoop, Render:Render,

        //GLOBAL CONSTANTS
        ATTR_POSITION_NAME	: "a_position",
        ATTR_POSITION_LOC	: 0,
        ATTR_NORMAL_NAME	: "a_norm",
        ATTR_NORMAL_LOC		: 1,
        ATTR_UV_NAME		: "a_uv",
        ATTR_UV_LOC			: 2,
    };

})();