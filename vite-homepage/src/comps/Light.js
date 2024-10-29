import gl from "../gl.js";
import Component from "./Comp.js";

class Light extends Component{
    
    constructor() {
        super();

        this.intensity = 1;
        this.color = new Vector3(1,1,1);
        //this.direction = new Vector3(0,0,1);
        //this.lookat = new Vector3(0,0,0);
        //this.mode = Light.MODE_POINT;
    }

    setColor(r,g,b) {this.color.set(r,g,b); return this;}
    setIntensity(s) {this.intensity = s; return this;}

    updateViewMatrix() {this.transform.updateMatrix();}
}

export default Light;