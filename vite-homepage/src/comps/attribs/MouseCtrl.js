import gl from "../../gl.js";
import Component from "../Comp.js";

class MouseCtrl {
    constructor(object) {
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

        this.mousePlane = new Vector3(0,0,0);
        this.axis = new Vector3(0,0,1);
        this.axisX = new Vector3(1,0,0);
        this.axisY = new Vector3(0,1,0);

        this.lagFactor = 0.3;
        this.deceleration = 0.95;

        this.lagX = 0;
        this.lagY = 0;

        this.p1 = new Vector3(0,0,1);
        this.p2 = new Vector3(0,0,1);

        this.canvas.addEventListener("mousemove", this.handleMouseMove_fromTo.bind(this));

        //Simulate deceleration and update rotation
        //setInterval(this.updateRotation.bind(this), 16);

    }

    static create(object) {
        var fx = new MouseCtrl(object);
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

    handleMouseMove_fromTo(e) {
        this.mousePlane.x = Util.map(e.pageX, 0, this.canvas.width, 2, -2);
        this.mousePlane.y = Util.map(e.pageY, 0, this.canvas.height, -2, 2);
        this.mousePlane.z = 2;
        
    }

    handleMouseMove_axisAngle(e) {
        this.mousePlane.x = Util.map(e.pageX, 0, this.canvas.width, -1, 1);
        this.mousePlane.y = Util.map(e.pageY, 0, this.canvas.height, -1, 1);

        this.axis.set(this.mousePlane.x, this.mousePlane.y, 2).normalize();

        this.object.transform.rotation.axis = this.axis;
        this.object.transform.rotation.angle = this.mousePlane.x * 90;
        //console.log(this.object.transform.angle);
        this.object.updateViewMatrix();
    }

    handleClick(e) {}

    updateRotation() {
        //this.lagX *= this.deceleration;
        //this.lagY *= this.deceleration;

        //this.object.transform.rotation.y += -this.lagX * (this.rotateRate / this.canvas.width);
        //this.object.transform.rotation.x += -this.lagY * (this.rotateRate / this.canvas.width);

        this.object.transform.to = this.mousePlane.normalize();

        this.object.updateViewMatrix();
    }

}

export default MouseCtrl;