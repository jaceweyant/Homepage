class MouseEffects {
    constructor(gl, object) {

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

		this.lagFactor = 0.3;
		this.deceleration = 0.95;

		this.lagX = 0;
		this.lagY = 0;

		this.p1 = new Vector3(0,0,1);
		this.p2 = new Vector3(0,0,1);

		this.canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
		this.canvas.addEventListener("onclick", this.handleClick.bind(this));

		//Simulate deceleration and update rotation
		//setInterval(this.updateRotation.bind(this), 16);

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

	handleMouseMove_2(e) {
		this.initX = MathUtil.Map(e.pageX, 0, this.canvas.width, -50, 50);
		this.initY = MathUtil.Map(e.pageY, 0, this.canvas.height, -50, 50);
		this.prevX = this.initX;
		this.prevY = this.initY;

		this.p2.set(this.initX, this.initY, 2);
		this.object.transform.rotationTo.p1 = this.p1;
		this.object.transform.rotationTo.p2 = this.p2;
		this.object.updateViewMatrix();

		//this.p1.set(this.prevX, this.prevY, 2);
	}

	handleClick(e) {}

	updateRotation() {
		this.lagX *= this.deceleration;
		this.lagY *= this.deceleration;
		this.object.transform.rotation.y += -this.lagX * (this.rotateRate / this.canvas.width);
		this.object.transform.rotation.x += -this.lagY * (this.rotateRate / this.canvas.width);

		//this.object.transform.rotationTo.p2 = new Vector3(this.lagX, this.lagY, 1);
		//var prevNormMat = this.object.transform.getNormalMatrix();
		this.object.updateViewMatrix();
		//if (this.object.transform.getNormalMatrix() == prevNormMat) console.log("equal");
	}



}