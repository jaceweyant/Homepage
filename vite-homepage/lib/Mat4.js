// MATRIX 4X4
//#######################################################################

import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";

class Mat4 {

    // CONSTRUCTOR
    //....................................................................
    constructor(raw) {this.raw = raw || new Float32Array(16);}


    // STATIC CREATE METHODS
    //....................................................................
    static create(raw)   {return new Mat4(raw);}              //Mat4
    static identity() {                                       //RAW
        var raw = new Float32Array(16);
        raw[0] = raw[5] = raw[10] = raw[15] = 1;
        return raw;
    }
    static perspective(out, fovy, aspect, near, far) {        //RAW
        var f = 1.0 / Math.tan(fovy / 2),
            nf = 1 / (near - far);
        out[0] = f/aspect;  out[1] = 0;   out[2] = 0;                 out[3] = 0;
        out[4] = 0;         out[5] = f;   out[6] = 0;                 out[7] = 0;
        out[8] = 0;         out[9] = 0;   out[10] = (far+near)*nf;    out[11] = -1;
        out[12] = 0;        out[13] = 0;  out[14] = (2*far*near)*nf;  out[15] = 0;
        return out;
    }
    static ortho(out, left, right, bottom, top, near, far) {  //RAW
        var lr = 1 / (left - right),
            bt = 1 / (bottom - top),
            nf = 1 / (near - far);
        out[0] = -2*lr;             out[1] = 0;                 out[2] = 0;               out[3] = 0;
        out[4] = 0;                 out[5] = -2*bt;             out[6] = 0;               out[7] = 0;
        out[8] = 0;                 out[9] = 0;                 out[10] = 2*nf;           out[11] = 0;
        out[12] = (left+right)*lr;  out[13] = (top+bottom)*bt;  out[14] = (far+near)*nf;  out[15] = 1;
        return out;
    }
    static normalMat3(out,a) {                                //Float32Array(9) (modifies value of out Arg)
        var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
            a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
            a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
            a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,
        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) return null;
        det = 1.0 / det;
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[3] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[4] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[5] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[6] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[7] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[8] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        return out;
    }


    // TRANSFORM METHODS (Returns Mat4)
    //....................................................................
    translate(v)    {this.raw = Mat4.multiply(this.raw, Mat4.translate(v));  return this;}
    scale(v)        {this.raw = Mat4.multiply(this.raw, Mat4.scale(v));      return this;}
    rotateX(rad)    {this.raw = Mat4.multiply(this.raw, Mat4.rotateX(rad));  return this;}
    rotateY(rad)    {this.raw = Mat4.multiply(this.raw, Mat4.rotateY(rad));  return this;}
    rotateZ(rad)    {this.raw = Mat4.multiply(this.raw, Mat4.rotateZ(rad));  return this;}
    rotate(n,rad)   {this.raw = Mat4.multiply(this.raw, Mat4.rotate(n,rad)); return this;}
    rotateTo(u,v)   {this.raw = Mat4.multiply(this.raw, Mat4.rotateTo(u,v)); return this;}


    // GETTERS & SETTERS
    //....................................................................
    get_raw()     {return this.raw;}
    get_elem(i)   {return this.raw[i];}
    set(raw)      {this.raw = raw; return this;}
    set_elem(i,e) {this.raw[i] = e; return this;}
    reset()       {this.raw = Mat4.identity().raw; return this;}


    // MATRIX ALGEBRA 
    //....................................................................
    static add(a,b) {             //RAW
        var raw = Mat4.identity();
        for (var i=0; i<16; i++) {raw[i] = a[i] + b[i];}
        return raw;
    }
    static subtract(a,b) {        //RAW
        var raw = Mat4.identity();
        for (var i=0; i<16; i++) {raw[i] = a[i] - b[i];}
        return raw;
    }
    static transpose(init) {      //RAW
        var trans = new Float32Array(16);
        var row = col = 0;
        for (var n=0; n<16; n++) {
            row = Math.floor(n/4);
            col = n % 4;
            trans[col*4 + row] = init[row*4 + col];
        }
        return trans;
    }
    static multiply(a,b) {        //RAW
        var raw = Mat4.identity();
        var row = col = 0;
        for (var n=0; n<16; n++) {
            var sum = 0;
            row = Math.floor(n/4);
            col = n % 4;
            for (var i=0; i<4; i++) {sum += a[row*4 + i] * b[i*4 + col];}
            raw[row*4 + col] = sum;
        }
        return raw;
    }
    static multiplyVec(out,m) {   //Vec3 (Modifies Value of out Arg)
        var init = new Float32Array(4);
        init[0] = out.x, init[1] = out.y, init[2] = out.z, init[3] = 1;
        var final = new Float32Array(4);

        var row = col = 0;
        for (var n=0; n<4; n++) {
            var sum = 0;
            row = Math.floor(n/4);
            col = n%4;
            for (var k=0; k<4; k++) {sum += init[k] * m[row*4 + k];}
            final[n] = sum;
        }
        out.set(final[0], final[1], final[2]);
        return out;
    }
    static transformVec4(out, v, m) {   //Float32Array(4) (Modifies Value of out Arg)
        out[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
        out[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
        out[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
        out[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
        return out;
    }
    static invert(mat) {          //RAW
        var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3],
            a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7],
            a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11],
            a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15],
            b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32,
            // Calculate the determinant
            det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {console.error("Determinant does not exist."); return null;}
        det = 1.0 / det;
        var out = Mat4.identity();
        out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
        out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
        out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
        out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
        out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
        out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
        out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
        out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
        out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
        out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
        out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
        out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
        out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
        out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
        out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
        out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
        return out;
    }


    // CREATE TRANSFORMS (Returns Raw)
    //....................................................................
    static translate(v) {   //RAW
        var raw = Mat4.identity();
        raw[3] = v.x, raw[7] = v.y, raw[11] = v.z;
        return raw;
    }
    static scale(v) {       //RAW
        var raw = Mat4.identity();
        raw[0] = v.x, raw[5] = v.y, raw[10] = v.z;
        return raw;
    }
    static rotateX(rad) {   //RAW
        var raw = Mat4.identity(),
            sin = Math.sin(rad), cos = Math.cos(rad);
        raw[5]  = cos,     raw[6]  = sin,
        raw[9]  = -1*sin,  raw[10] = cos;
        return raw;
    }
    static rotateY(rad) {   //RAW
        var raw = Mat4.identity(),
            sin = Math.sin(rad), cos = Math.cos(rad);
        raw[0]  = cos,  raw[2]  = -1*sin,
        raw[8]  = sin,  raw[10] = cos;
        return raw;
    }
    static rotateZ(rad) {   //RAW
        var raw = Mat4.identity(),
            sin = Math.sin(rad), cos = Math.cos(rad);
        raw[0]  = cos,  raw[1]  = -1*sin,
        raw[4]  = sin,  raw[5]  = cos;
        return raw;
    }
    static rotate(n,rad) {return Mat4.quaternionRotationMatrix(Quat.create_rotationQuat(n,rad)).raw;}  //RAW
    static rotateTo(u,v) {return Mat4.quaternionRotationMatrix(Quat.create_fromToQuat(u,v)).raw;}      //RAW


    // STATIC QUATERNIONS => MATRICES METHODS
    //....................................................................
    static leftMatrix(q)     {
        var w = q.w, x = q.v.x, y = q.v.y, z = q.v.z;
        var a = new Float32Array(16);
        a[0]  =  w;   a[1]  =  z;   a[2]  = -y;   a[3]  = -x;
        a[4]  = -z;   a[5]  =  w;   a[6]  =  x;   a[7]  = -y;
        a[8]  =  y;   a[9]  = -x;   a[10] =  w;   a[11] = -z;
        a[12] =  x;   a[13] =  y;   a[14] =  z;   a[15] =  w;
        return new Mat4(a);   
    }
    static rightMatrix(q)    {
        var w = q.w, x = q.v.x, y = q.v.y, z = q.v.z;
        var a = new Float32Array(16);
        a[0]  =  w;   a[1]  = -z;   a[2]  =  y;   a[3]  = -x;
        a[4]  =  z;   a[5]  =  w;   a[6]  = -x;   a[7]  = -y;
        a[8]  = -y;   a[9]  =  x;   a[10] =  w;   a[11] = -z;
        a[12] =  x;   a[13] =  y;   a[14] =  z;   a[15] =  w;
        return new Mat4(a);           
    }
    static quaternionRotationMatrix(q) {return Mat4.multiply(Quat.rightMatrix(Quat.inverse(q)), Quat.leftMatrix(q));}
}

export default Mat4;