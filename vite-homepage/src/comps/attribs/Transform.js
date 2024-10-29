import {Util, Vec3, Quat, Mat4} from "../../../lib/Maths.js";

class Transform {
    constructor() {
        this.position  = new Vec3(0,0,0);	
        this.scale	   = new Vec3(1,1,1);
        this.rotation  = new Vec3(0,0,0);

        this.forward   = new Float32Array(4);
        this.up        = new Float32Array(4);
        this.right     = new Float32Array(4);

        this.axis      = new Vec3();
        this.angle     = 0;
        this.from      = new Vec3(0,0,1);
        this.to        = new Vec3(0,0,1);

        this.matView   = new Mat4();		
        this.matNormal = new Float32Array(9);
    }

    updateMatrix() {
        this.matView.reset()
            .translate(this.position)
            .rotateX(this.rotation.x * Util.DEG2RAD)
            .rotateY(this.rotation.y * Util.DEG2RAD)
            .rotateZ(this.rotation.z * Util.DEG2RAD)
            .rotate(this.axis, this.angle * Util.DEG2RAD)
            .rotateTo(this.from, this.to)
            .scale(this.scale);

        Mat4.normalMat3(this.matNormal, this.matView.raw);

        //Determine Direction after all the transformations.
        Mat4.transformVec4(this.forward, [0,0,1,0], this.matView.raw); //Z
        Mat4.transformVec4(this.up,		 [0,1,0,0], this.matView.raw); //Y
        Mat4.transformVec4(this.right,	 [1,0,0,0], this.matView.raw); //X

        return this.matView.raw;

    }

    updateDirection(){
        Mat4.transformVec4(this.forward, [0,0,1,0], this.matView.raw);
        Mat4.transformVec4(this.up,		 [0,1,0,0], this.matView.raw);
        Mat4.transformVec4(this.right,	 [1,0,0,0], this.matView.raw);
        return this;
    }

    getViewMatrix(){	return this.matView.raw; }
    getNormalMatrix(){  return this.matNormal;}

    reset(){
        this.position.set(0,0,0);
        this.scale.set(1,1,1);
        this.rotation.set(0,0,0);

        this.forward = [0,0,1,0];
        this.up      = [0,1,0,0];
        this.right   = [1,0,0,0];

        this.axis.set(1,0,0);
        this.angle = 0;
        this.from.set(0,0,1);
        this.to.set(0,0,1);
    }

}

export default Transform;