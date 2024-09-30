class Light {
    
    constructor(gl) {
        this.transform = new Transform();
        this.gl = gl;

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

//Light.MODE_POINT = 0;
//Light.MODE_DISTANT = 1;
//Light.MODE_CONE = 2;