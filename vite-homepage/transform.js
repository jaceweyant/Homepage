import {Util, Vector3, Quaternion, Matrix4} from "./math.js";

class Transform {
    constructor() {
        //transform vectors
        this.position	 = new Vector3(0,0,0);	
        this.scale		 = new Vector3(1,1,1);

        this.orientation = {forward: new Vector3(0,0,1),
                            up:      new Vector3(0,1,0),
                            right:   new Vector3(1,0,0)}

        this.rotation  = new Vector3(0,0,0);

        this.axis         = new Vector3();
        this.angle        = 0;
        this.from      = new Vector3(0,0,1);
        this.to        = new Vector3(0,0,1);

        this.matView 	 = new Matrix4();		
        this.matNormal	 = new Float32Array(9);

        this.translationMat = new Matrix4();
        this.scaleMat = new Matrix4();
        this.rotationMat - new Matrix4();
        this.orientationMat = new Matrix4();

        this.matView = new Matrix4();
        this.matNormal = new Float32Array(9);
    }

    updateMatrix() {
        this.matView.reset()
            .vtranslate(this.position)
            .rotateX(this.rotation.x * Util.DEG2RAD)
            .rotateY(this.rotation.y * Util.DEG2RAD)
            .rotateZ(this.rotation.z)
            .rotateQ(this.axis, this.angle)
            .rotateB(this.from, this.to)
            .vscale(this.scale);

        Matrix4.normalMat3(this.matNormal, this.matView.raw);

        //Determine Direction after all the transformations.
        Matrix4.transformVec4(this.orientation.forward,	[0,0,1,0],this.matView.raw); //Z
        Matrix4.transformVec4(this.orientation.up,		[0,1,0,0],this.matView.raw); //Y
        Matrix4.transformVec4(this.orientation.right,	[1,0,0,0],this.matView.raw); //X

        return this.matView.raw;

    }

    updateDirection(){
        Matrix4.transformVec4(this.orientation.forward,	[0,0,1,0],this.matView.raw);
        Matrix4.transformVec4(this.orientation.up,		[0,1,0,0],this.matView.raw);
        Matrix4.transformVec4(this.orientation.right,	[1,0,0,0],this.matView.raw);
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

export default Transform;