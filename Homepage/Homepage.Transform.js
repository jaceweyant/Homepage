Homepage.Transform = class {
    constructor() {
        //transform vectors
        this.position	 = new Vector3(0,0,0);	
        this.scale		 = new Vector3(1,1,1);

        this.orientation = {forward: new Vector3(0,0,1),
                            up:      new Vector3(0,1,0),
                            right:   new Vector3(1,0,0)}

        this.rotationXYZ  = new Vector3(0,0,0);
        this.rotationAxis = {axis: new Vector3(), 
                             angle: 0}
        this.fromVec      = new Vector3(0,0,1);
        this.toVec        = new Vector3(0,0,1);

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
        this.rotationMat.reset()
            .vtranslate(this.position)
            .rotateQ(this.axis, this.angle)
            .rotateB(this.fromVec, this.toVec)
            .vscale(this.scale);

        Matrix4.normalMat3(this.matNormal, this.matView.raw);

        //Determine Direction after all the transformations.
        Matrix4.transformVec4(this.forward,	[0,0,1,0],this.matView.raw); //Z
        Matrix4.transformVec4(this.up,		[0,1,0,0],this.matView.raw); //Y
        Matrix4.transformVec4(this.right,	[1,0,0,0],this.matView.raw); //X

        return this.matView.raw;

    }

}