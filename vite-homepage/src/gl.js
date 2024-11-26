
// GL CONTEXT SETUP
//#######################################################################
var ctx = null;

const ATTR_POSITION_LOC = 0;
const ATTR_NORM_LOC = 1;
const ATTR_UV_LOC = 2;


var Init = function(canvas, wp, hp, bgColor) {
	//........................................
	//Get Context
    if (typeof canvas == "string") {canvas = document.getElementById(canvas);}
    else {console.error("canvas is not tring: " + canvas);}
	ctx = canvas.getContext("webgl2");
	if (!ctx) {console.error("WebGL context is not available."); return;}

	//........................................
	//Setup some defaults
	ctx.cullFace(ctx.BACK);								//Back is also default
	ctx.frontFace(ctx.CCW);								//Dont really need to set it, its ccw by default.
	ctx.enable(ctx.DEPTH_TEST);							//Shouldn't use this, use something else to add depth detection
	ctx.enable(ctx.CULL_FACE);							//Cull back face, so only show trianctxes that are created clockwise
	ctx.depthFunc(ctx.LEQUAL);							//Near things obscure far things
	ctx.blendFunc(ctx.SRC_ALPHA, ctx.ONE_MINUS_SRC_ALPHA);	//Setup default alpha blending

	fFitScreen(wp || 1,hp || 1);							//Set the size of the canvas to a percent of the screen
	fSetClearColor(bgColor || "#ffffff");				//Set clear color
	fClear();											//Clear the canvas

	return ctx;
};

//Reset the canvas with our set background color.	
var fClear = function(){ ctx.clear(ctx.COLOR_BUFFER_BIT | ctx.DEPTH_BUFFER_BIT); return ctx; }

function fSetClearColor(hex){
	var a = rgbArray(hex);
	ctx.clearColor(a[0],a[1],a[2],1.0);
	return this;
}


//------------------------------------------------------
//Misc
//------------------------------------------------------
function rgbArray(){
	if(arguments.length == 0) return null;
	var ary = (Array.isArray(arguments[0]))? arguments[0] : arguments;
	var rtn = [];

	for(var i=0,c,p; i < ary.length; i++){
		if(ary[i].length < 6) continue;
		c = ary[i];				//Just an alias(copy really) of the color text, make code smaller.
		p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

		rtn.push(
			parseInt(c[p]	+c[p+1],16)	/ 255.0,
			parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
			parseInt(c[p+4]	+c[p+5],16)	/ 255.0
		);
	}
	return rtn;
}


//Create and fill our Array buffer.
var fCreateArrayBuffer = function(floatAry,isStatic){
    if(isStatic === undefined) isStatic = true; //So we can call this function without setting isStatic

    var buf = ctx.createBuffer();
    ctx.bindBuffer(ctx.ARRAY_BUFFER,buf);
    ctx.bufferData(ctx.ARRAY_BUFFER, floatAry, (isStatic)? ctx.STATIC_DRAW : ctx.DYNAMIC_DRAW );
    ctx.bindBuffer(ctx.ARRAY_BUFFER,null);
    return buf;
}

//Turns arrays into GL buffers, then setup a VAO that will predefine the buffers to standard shader attributes.
var fCreateMeshVAO = function(name,aryInd,aryVert,aryNorm,aryUV,vertLen){ //TODO : ADDED VERT LEN
    var rtn = { drawMode:ctx.TRIANGLES };

    //Create and bind vao
    rtn.vao = ctx.createVertexArray();															
    ctx.bindVertexArray(rtn.vao);	//Bind it so all the calls to vertexAttribPointer/enableVertexAttribArray is saved to the vao.

    //.......................................................
    //Set up vertices
    if(aryVert !== undefined && aryVert != null){
        rtn.bufVertices = ctx.createBuffer();													//Create buffer...
        rtn.vertexComponentLen = vertLen || 3;													//How many floats make up a vertex
        rtn.vertexCount = aryVert.length / rtn.vertexComponentLen;								//How many vertices in the array

        ctx.bindBuffer(ctx.ARRAY_BUFFER, rtn.bufVertices);
        ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(aryVert), ctx.STATIC_DRAW);		//then push array into it.
        ctx.enableVertexAttribArray( Homepage.ATTR_POSITION_LOC);										//Enable Attribute location
        //ctx.vertexAttribPointer( Homepage.ATTR_POSITION_LOC,3,ctx.FLOAT,false,0,0);						//Put buffer at location of the vao\
        ctx.vertexAttribPointer( Homepage.ATTR_POSITION_LOC,rtn.vertexComponentLen,ctx.FLOAT,false,0,0);						//Put buffer at location of the vao
    }

    //.......................................................
    //Setup normals
    if(aryNorm !== undefined && aryNorm != null){
        rtn.bufNormals = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, rtn.bufNormals);
        ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(aryNorm), ctx.STATIC_DRAW);
        ctx.enableVertexAttribArray( Homepage.ATTR_NORMAL_LOC);
        ctx.vertexAttribPointer( Homepage.ATTR_NORMAL_LOC,3,ctx.FLOAT,false, 0,0);
    }

    //.......................................................
    //Setup UV
    if(aryUV !== undefined && aryUV != null){
        rtn.bufUV = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, rtn.bufUV);
        ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(aryUV), ctx.STATIC_DRAW);
        ctx.enableVertexAttribArray( Homepage.ATTR_UV_LOC);
        ctx.vertexAttribPointer( Homepage.ATTR_UV_LOC,2,ctx.FLOAT,false,0,0);	//UV only has two floats per component
    }

    //.......................................................
    //Setup Index.
    if(aryInd !== undefined && aryInd != null){
        rtn.bufIndex = ctx.createBuffer();
        rtn.indexCount = aryInd.length;
        ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, rtn.bufIndex);  
        ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryInd), ctx.STATIC_DRAW);
        //ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER,null); //TODO REMOVE ctx AND ADD TO CLEANUP
    }

    //Clean up
    ctx.bindVertexArray(null);					//Unbind the VAO, very Important. always unbind when your done using one.
    ctx.bindBuffer(ctx.ARRAY_BUFFER,null);	//Unbind any buffers that might be set
    if(aryInd != null && aryInd !== undefined)  ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER,null);
    
    ctx.mMeshCache[name] = rtn;
    return rtn;
}

var fLoadTexture = function(name,img,doYFlip){
    var tex = ctx.createTexture();
    if(doYFlip == true) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);	//Flip the texture by the Y Position, So 0,0 is bottom left corner.

    ctx.bindTexture(ctx.TEXTURE_2D, tex);														//Set text buffer for work
    ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, img);			//Push image to GPU.
    
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);					//Setup up scaling
    ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR_MIPMAP_NEAREST);	//Setup down scaling
    ctx.generateMipmap(ctx.TEXTURE_2D);	//Precalc different sizes of texture for better quality rendering.

    ctx.bindTexture(ctx.TEXTURE_2D,null);									//Unbind
    ctx.mTextureCache[name] = tex;											//Save ID for later unloading
    
    if(doYFlip == true) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);	//Stop flipping textures
    return tex;		
}

//imgAry must be 6 elements long and images placed in the right order
//RIGHT,LEFT,TOP,BOTTOM,BACK,FRONT
var fLoadCubeMap = function(name,imgAry){
    if(imgAry.length != 6) return null;

    //Cube Constants values increment, so easy to start with right and just add 1 in a loop
    //To make the code easier costs by making the imgAry coming into the function to have
    //the images sorted in the same way the constants are set.
    //	TEXTURE_CUBE_MAP_POSITIVE_X - Right	:: TEXTURE_CUBE_MAP_NEGATIVE_X - Left
    //	TEXTURE_CUBE_MAP_POSITIVE_Y - Top 	:: TEXTURE_CUBE_MAP_NEGATIVE_Y - Bottom
    //	TEXTURE_CUBE_MAP_POSITIVE_Z - Back	:: TEXTURE_CUBE_MAP_NEGATIVE_Z - Front

    var tex = ctx.createTexture();
    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP,tex);

    //push image to specific spot in the cube map.
    for(var i=0; i < 6; i++){
        ctx.texImage2D(ctx.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, imgAry[i]);
    }

    ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);	//Setup up scaling
    ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);	//Setup down scaling
    ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);	//Stretch image to X position
    ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);	//Stretch image to Y position
    ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_WRAP_R, ctx.CLAMP_TO_EDGE);	//Stretch image to Z position
    //ctx.generateMipmap(ctx.TEXTURE_CUBE_MAP);

    ctx.bindTexture(ctx.TEXTURE_CUBE_MAP,null);
    ctx.mTextureCache[name] = tex;
    return tex;
};

//...................................................
//Setters - Getters

//Set the size of the canvas html element and the rendering view port
var fSetSize = function(w,h){
    //set the size of the canvas, on chrome we need to set it 3 ways to make it work perfectly.
    ctx.canvas.style.width = w + "px";
    ctx.canvas.style.height = h + "px";
    ctx.canvas.width = w;
    ctx.canvas.height = h;

    //when updating the canvas size, must reset the viewport of the canvas 
    //else the resolution webgl renders at will not change
    ctx.viewport(0,0,w,h);
    return ctx;
}

//Set the size of the canvas to fill a % of the total screen.
var fFitScreen = function(wp,hp) {return fSetSize(window.innerWidth * (wp || 1),window.innerHeight * (hp || 1)); }

var gl = {
    set:Init,
    ctx:ctx,
    width:0,
    height:0,

    fClear:fClear,
    fCreateArrayBuffer:fCreateArrayBuffer,
    fCreateMeshVAO:fCreateMeshVAO,
    fLoadTexture:fLoadTexture,

    Res:{textures:[], videos:[], images:[], models:[], shaders:[], vao:[], materials:[]}
}

export default gl;

export {
    ATTR_POSITION_LOC,	
    ATTR_NORM_LOC,
    ATTR_UV_LOC
}
