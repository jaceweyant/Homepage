class Mat3 {
    constructor() {this.raw = Mat3.identity();}

    static identity() {}

    static add() {
        var m = new Mat3();
        for (var i=0; i<arguments.length; i++) {if (arguments[i+1]) {for (var j=0; j<m.raw.length; j++) {
                    m.raw[j] = arguments[i].raw[j] + arguments[i+1].raw[j];
        }}};
        return m;
    }
    static scale(s,m) {}
    static transpose(m) {}
    static multiply(a,b) {}
    static multiplyCovectors(v,u) {}

    static get_RodriguezVRM(a,b) {
        return Mat3.add(
            Mat3.scalar(Vec3.dot(a,b), Mat3.identity()),
            Mat3.skewMat(Vec3.cross(a,b)),
            Mat3.scalar(
                -1 * Vec3.dot(a,b) / Math.pow(Vec3.cross(a,b).magnitude(), 2),
                Mat3.multiplyCovectors(Vec3.cross(a,b), Vec3.cross(a,b))
            )
        );
    }
    static get_AxisAngleVRM(d,n) {}

    transpose() {}
    neg() {}
    add() {}
}

class Vec3 {
    constructor() {this.x = this.y = this.z = 0;}

    static add(a,b) {}
}