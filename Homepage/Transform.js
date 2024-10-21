class Transform {
    constructor() {
        this.position = new Vector3();
        this.scale    = new Vector3();
        this.rotation = {axis: new Vector3(0,0,1), angle: 0};

        this.right    = new Vector3(1,0,0);
        this.up       = new Vector3(0,1,0);
        this.forward  = new Vector3(0,0,1);

        this.matView = new Matrix4();
        this.matNormal = new Float32Array(9);
    }

    updateMatrix() {
        this.matView.reset()
            .vtranslate(this.position)
            .rotateQ(this.rotation.axis, this.rotation.angle)
            .vscale(this.scale);

        Matrix4.normalMat3(this.matNormal, this.matView.raw);

        //Determine Direction after all the transformations.
        Matrix4.transformVec4(this.forward,	[0,0,1,0],this.matView.raw); //Z
        Matrix4.transformVec4(this.up,		[0,1,0,0],this.matView.raw); //Y
        Matrix4.transformVec4(this.right,	[1,0,0,0],this.matView.raw); //X

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