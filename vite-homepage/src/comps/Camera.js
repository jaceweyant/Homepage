import gl from "../gl.js";
import Component from "./Comp.js";
import {Mat4} from "../../lib/Maths.js";

class Camera extends Component{
    constructor(fov,near,far){
        super();
        //Setup the perspective matrix
        this.projectionMatrix = new Float32Array(16);
        this.ratio = gl.canvas.width / gl.canvas.height;
        this.fov = fov || 60;
        this.near = near || 0.1;
        this.far = far || 100.0;
        Mat4.perspective(this.projectionMatrix, this.fov, this.ratio, this.near, this.far);

        this.viewMatrix = new Float32Array(16);	//Cache the matrix that will hold the inverse of the transform.

        this.mode = Camera.MODE_ORBIT;			//Set what sort of control mode to use.
    }

    setPosition(x,y,z) {this.transform.position.set(x,y,z); return this;}

    setCamSettings(fov, near, far) {
        this.fov = fov;
        Mat4.perspective(this.projectionMatrix, this.fov, this.ratio, near, far);
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
                .translate(this.transform.position)
                .rotateX(this.transform.rotation.x * Util.DEG2RAD)
                .rotateY(this.transform.rotation.y * Util.DEG2RAD);
                
        }else{
            this.transform.matView.reset()
                .rotateX(this.transform.rotation.x * Util.DEG2RAD)
                .rotateY(this.transform.rotation.y * Util.DEG2RAD)
                .translate(this.transform.position);

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

export default Camera;