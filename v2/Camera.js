class Camera{
	constructor(gl,fov,near,far){
		//Setup the perspective matrix
		this.projectionMatrix = new Float32Array(16);
		var ratio = gl.canvas.width / gl.canvas.height;
		this.fov = fov;
		Matrix4.perspective(this.projectionMatrix, this.fov || 45, ratio, near || 0.1, far || 100.0);

		this.transform = new Transform();		//Setup transform to control the position of the camera
		this.viewMatrix = new Float32Array(16);	//Cache the matrix that will hold the inverse of the transform.

		this.mode = Camera.MODE_ORBIT;			//Set what sort of control mode to use.
	}

	setPosition(x,y,z) {this.transform.position.set(x,y,z); return this;}

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
				.rotateX(this.transform.rotation.x * Transform.deg2Rad)
				.rotateY(this.transform.rotation.y * Transform.deg2Rad);
				
		}else{
			this.transform.matView.reset()
				.rotateX(this.transform.rotation.x * Transform.deg2Rad)
				.rotateY(this.transform.rotation.y * Transform.deg2Rad)
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

Camera.MODE_FREE = 0;	//Allows free movement of position and rotation, basicly first person type of camera
Camera.MODE_ORBIT = 1;	//Movement is locked to rotate around the origin, Great for 3d editors or a single model viewer