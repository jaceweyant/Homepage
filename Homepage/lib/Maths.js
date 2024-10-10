//#######################################################################
// MATHS LIBRARY
//#######################################################################

var Maths = (function() {

    // UTILITIES
  //#######################################################################
    class Util {

        //Convert Hex colors to float arrays, can batch process a list into one big array.
        //example : Fungi.Util.rgbArray("#FF0000","00FF00","#0000FF");
        static rgbArray(){
            if(arguments.length == 0) return null;
            var rtn = [];

            for(var i=0,c,p; i < arguments.length; i++){
                if(arguments[i].length < 6) continue;
                c = arguments[i];		//Just an alias(copy really) of the color text, make code smaller.
                p = (c[0] == "#")?1:0;	//Determine starting position in char array to start pulling from

                rtn.push(
                    parseInt(c[p]	+c[p+1],16)	/ 255.0,
                    parseInt(c[p+2]	+c[p+3],16)	/ 255.0,
                    parseInt(c[p+4]	+c[p+5],16)	/ 255.0
                );
            }
            return rtn;
        }        

        //Normalize x value to x range, then normalize to lerp the z range.
        static map(x, xMin,xMax, zMin,zMax){ return (x - xMin) / (xMax - xMin) * (zMax-zMin) + zMin; }
        static clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
        static smoothStep(edge1, edge2, val){ 
            var x = Math.max(0, Math.min(1, (val-edge1)/(edge2-edge1)));
            return x*x*(3-2*x);
        }
        static to_rad(deg) {return deg * PI*2 / 360;}
        static fRound(n, p) {return Math.round(n * Math.pow(10,p)) / 100;}

    }
    Util.DEG2RAD = Math.PI/180;

    // VECTOR-3
    //#######################################################################
    class Vector3 {
        constructor(x,y,z) {this.x = x || 0.0;	this.y = y || 0.0;	this.z = z || 0.0;}

        // Getters/Setters
        //....................................................................
        set(x,y,z) 	{this.x = x; this.y = y; this.z = z; return this;}
        clone() 	{return new Vector3(this.x,this.y,this.z);}

        getArray() 		{return [Util.fRound(this.x,2), Util.fRound(this.y,2), Util.fRound(this.z,2)];}
        getFloatArray() {return new Float32Array([this.x,this.y,this.z]);}

        magnitude(v) {
            //Only get the magnitude of this vector
            if(v === undefined) return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );
            //Get magnitude based on another vector
            var x = v.x - this.x, y = v.y - this.y, z = v.y - this.z;
            return Math.sqrt( x*x + y*y + z*z );
        }

        print() {console.log([this.x, this.y, this.z]);}

        // Transformations
        //....................................................................
        normalize()  {var mag = this.magnitude(); this.x /= mag; this.y /= mag; this.z /= mag; return this;}

        // Vector Algebra Methods
        //....................................................................
        add(b)	 {this.x += b.x; this.y += b.y; this.z += b.z; return this;}
        sub(b)	 {this.x -= b.x; this.y -= b.y; this.z -= b.z; return this;}
        scale(s) {this.x *= s; this.y *= s; this.z *= s; return this;}

        dot(b)	 {return this.x*b.x + this.y*b.y + this.z*b.z;}		
        cross(b) {
            this.x = this.y*b.z - this.z*b.y;
            this.y = this.z*b.x - this.x*b.z;
            this.z = this.x*b.y - this.y*b.x;
            return this;
        }

        //Static Vector Algebra Methods
        //....................................................................
        static add(a,b)    {var v = new Vector3(a.x+b.x, a.y+b.y, a.z*b.z); return v;}
        static scale(s,v) {var v = new Vector3(s*v.x, s*v.y, s*v.z); return v;}
        static scale(s,v)  {var v = new Vector3(s*v.x, s*v.y, s*v.z); return v;}
        static dot(a,b)    {return a.x*b.x + a.y*b.y + a.z*b.z;}
        static cross(a,b)  {var v = new Vector3(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x); return v;} 
            
    }

    // QUATERNION
    //#######################################################################
    class Quaternion {  // NEW
        // CONSTRUCTOR
        //....................................................................
        constructor(w,x,y,z) {
                this.w = w || 0;
                this.x = x || 0;
                this.y = y || 0;
                this.z = z || 0;
        }


        // GETTERS-SETTERS
        //....................................................................
        getReal()    {return this.w;}
        getVec()     {return new Vector3(this.x, this.y, this.z);}
        magnitude()  {return Math.sqrt(this.w*this.w + this.x*this.x + this.y*this.y + this.z*this.z);}

        setReal(w)   {this.w = w; return this;}
        setVec(v)    {this.x = v.x; this.y = v.y; this.z = v.z; return this;}
        set(w,x,y,z) {this.w = w; this.x = x; this.y = y; this.z = z; return this;}

        clone()      {return new Vector3(this.w, this.x, this.y, this.z);}

        print()      {console.log([Util.fRound(this.w, 2), Util.fRound(this.x, 2), Util.fRound(this.y, 2), Util.fRound(this.z, 2)]);}


        // STATIC QUATERNION CREATION
        //....................................................................
        static createFromVec(w,v) {return new Quaternion(w, v.x, v.y, v.z);}

        static createFromAxisAngle(axis,angle) {
            if (axis == null) {console.error("axis == null -- line 312");}
                var w = Math.cos(Util.DEG2RAD * angle / 2),
                    v = axis.scale(Math.sin(Util.DEG2RAD * angle / 2));
                return Quaternion.createFromVec(w,v);
        }

        static createFrom2Vectors(u,v) {
                var axis = Vector3.cross(u,v).normalize(),
                    angle = Math.acos(Vector3.dot(u.normalize(), v.normalize())) / Util.DEG2RAD;
                return Quaternion.createFromAxisAngle(axis, angle);
        }

    
        // STATIC QUATERNION ALGEBRA
        //....................................................................
        static add(a,b)       {return new Quaternion(a.w+b.w, a.x+b.x, a.y+b.y, a.z+b.z);}
        static subtract(a,b)  {return new Quaternion(a.w-b.w, a.x-b.x, a.y-b.y, a.z-b.z);}
        static scale(s,a)     {return new Quaternion(s*a.w, s*a.x, s*a.y, s*a.z);}

        //Does not use vector algebra
        static multiply(a,b)  {
                return new Quaternion(
                    a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z,
                    a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
                    a.w*b.y - a.x*b.z + a.y*b.w + a.z*b.x,
                    a.w*b.z + a.x*b.y - a.y*b.x + a.z*b.w
                );
        }

        //Uses vector algebra
        static mult(a,b)      {
                var s1 = a.w, s2 = b.w,
                    v1 = a.getVec(), v2 = b.getVec();
                return Quaternion.createFromVec(
                    s1*s2 - Vector3.dot(v1, v2), 
                    v2.scale(s1) + v1.scale(s2) + Vector3.cross(v1, v2)
                );
        }

        static conjugate(q) {return new Quaternion(q.w, -q.x, -q.y, -q.z);}
        static inverse(q)   {return Quaternion.scale(1/Math.pow(q.magnitude(),2), Quaternion.conjugate(q)); return this;}
        static normalize(q) {return Quaternion.scale(q.magnitude(), q);}


        // STATIC GET VECTOR ROTATION
        //....................................................................
        static rotateVector(v, axis, angle) {
                var p1 = Quaternion.createFromVec(0,v);
                var q1 = Quaternion.createFromAxisAngle(axis.normalize(), angle);
                var q2 = Quaternion.inverse(q1);
                var p2 = Quaternion.multiply(Quaternion.multiply(q1, p1), q2);
                return p2.getVec();
        }


        // STATIC GET QUATERNION MATRICES
        //....................................................................
        static leftMatrix(q) {
                var w = q.w, x = q.x, y = q.y, z = q.z;
                var a = new Float32Array(16);
                a[0]  =  w;   a[1]  =  z;   a[2]  = -y;   a[3]  = -x;
                a[4]  = -z;   a[5]  =  w;   a[6]  =  x;   a[7]  = -y;
                a[8]  =  y;   a[9]  = -x;   a[10] =  w;   a[11] = -z;
                a[12] =  x;   a[13] =  y;   a[14] =  z;   a[15] =  w;
                return new Matrix4(a);   
        }

        static rightMatrix(q) {
                var w = q.w, x = q.x, y = q.y, z = q.z;
                var a = new Float32Array(16);
                a[0]  =  w;   a[1]  = -z;   a[2]  =  y;   a[3]  = -x;
                a[4]  =  z;   a[5]  =  w;   a[6]  = -x;   a[7]  = -y;
                a[8]  = -y;   a[9]  =  x;   a[10] =  w;   a[11] = -z;
                a[12] =  x;   a[13] =  y;   a[14] =  z;   a[15] =  w;
                return new Matrix4(a);           
        }

        static rotationMatrix(q) {return Matrix4.multiply(Quaternion.rightMatrix(Quaternion.inverse(q)), Quaternion.leftMatrix(q));}

    }

    // MATRIX 4X4
    //#######################################################################
    class Matrix4 {

        // Constructor
        //##################################################################################################
        constructor(raw){ this.raw = raw || Matrix4.identity(); }	// Added new optional argument to allow for cloning

        
        // Transformation Methods
        //##################################################################################################

        vtranslate(v)	  {Matrix4.translate(this.raw,v.x,v.y,v.z); return this;}
        translate(x,y,z)  {Matrix4.translate(this.raw,x,y,z); 		return this;}

        vscale(vec3) 	  {Matrix4.scale(this.raw,vec3.x,vec3.y,vec3.z); return this;}
        scale(x,y,z) 	  {Matrix4.scale(this.raw,x,y,z); 				 return this;}

        rotateY(rad)	  {Matrix4.rotateY(this.raw,rad); 		 return this;}
        rotateX(rad)	  {Matrix4.rotateX(this.raw,rad); 		 return this;}
        rotateZ(rad)	  {Matrix4.rotateZ(this.raw,rad); 		 return this;}
        rotateQ(axis,rad) {Matrix4.rotateQ(this.raw,axis,rad);   return this;}
        rotateB(u,v)      {Matrix4.rotateB(this.raw,u,v);        return this;}
        
        invert()	 	  {Matrix4.invert(this.raw); return this;}  //Used for Camera Matrix
        
        clone() 	 	  {new Matrix4(this.raw); return this;}
        
        
        // Reset Methods
        //##################################################################################################

        //Bring is back to identity without changing the transform values.
        resetRotation() {	
            for(var i=0; i < this.raw.length; i++){
                if(i >= 12 && i <= 14) continue;
                 this.raw[i] = (i % 5 == 0)? 1 : 0;  //only positions 0,5,10,15 need to be 1 else 0.
            }
            return this;
        }

        //reset data back to identity.
        reset() { 
            for (var i=0; i < this.raw.length; i++) {this.raw[i] = (i % 5 == 0)? 1 : 0;} //only positions 0,5,10,15 need to be 1 else 0.
            return this;
        }

        
        // Static Get Specific Matrices Methods
        //##################################################################################################

        // Get an identity matrix
        static identity() {
                var a = new Float32Array(16);
                a[0] = a[5] = a[10] = a[15] = 1;
                return a;
        }

        //get a perspective projection matrix
        static perspective(out, fovy, aspect, near, far) {
                var f = 1.0 / Math.tan(fovy / 2),
                    nf = 1 / (near - far);
                out[0] = f / aspect;
                out[1] = 0;
                out[2] = 0;
                out[3] = 0;
                out[4] = 0;
                out[5] = f;
                out[6] = 0;
                out[7] = 0;
                out[8] = 0;
                out[9] = 0;
                out[10] = (far + near) * nf;
                out[11] = -1;
                out[12] = 0;
                out[13] = 0;
                out[14] = (2 * far * near) * nf;
                out[15] = 0;
        }

        //get an orthographic projection matrix
        static ortho(out, left, right, bottom, top, near, far) {
                var lr = 1 / (left - right),
                    bt = 1 / (bottom - top),
                    nf = 1 / (near - far);
                out[0] = -2 * lr;
                out[1] = 0;
                out[2] = 0;
                out[3] = 0;
                out[4] = 0;
                out[5] = -2 * bt;
                out[6] = 0;
                out[7] = 0;
                out[8] = 0;
                out[9] = 0;
                out[10] = 2 * nf;
                out[11] = 0;
                out[12] = (left + right) * lr;
                out[13] = (top + bottom) * bt;
                out[14] = (far + near) * nf;
                out[15] = 1;
        };

        //get a 3x3 normal matrix (transpose inverse) from the 4x4 matrix
        static normalMat3(out,a) {
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


        
        // Static Matrix Algebra Methods
        //##################################################################################################

            //make the rows into the columns
        static transpose(out, a) {
                //If we are transposing ourselves we can skip a few steps but have to cache some values
                if (out === a) {
                    var a01 = a[1], a02 = a[2], a03 = a[3], a12 = a[6], a13 = a[7], a23 = a[11];
                    out[1] = a[4];
                    out[2] = a[8];
                    out[3] = a[12];
                    out[4] = a01;
                    out[6] = a[9];
                    out[7] = a[13];
                    out[8] = a02;
                    out[9] = a12;
                    out[11] = a[14];
                    out[12] = a03;
                    out[13] = a13;
                    out[14] = a23;
                }else{
                    out[0] = a[0];
                    out[1] = a[4];
                    out[2] = a[8];
                    out[3] = a[12];
                    out[4] = a[1];
                    out[5] = a[5];
                    out[6] = a[9];
                    out[7] = a[13];
                    out[8] = a[2];
                    out[9] = a[6];
                    out[10] = a[10];
                    out[11] = a[14];
                    out[12] = a[3];
                    out[13] = a[7];
                    out[14] = a[11];
                    out[15] = a[15];
                }

                return out;
        }
        
        // ???
        static multiplyVector(mat4, v) {
                var x = v[0], y = v[1], z = v[2], w = v[3];
                var c1r1 = mat4[ 0], c2r1 = mat4[ 1], c3r1 = mat4[ 2], c4r1 = mat4[ 3],
                    c1r2 = mat4[ 4], c2r2 = mat4[ 5], c3r2 = mat4[ 6], c4r2 = mat4[ 7],
                    c1r3 = mat4[ 8], c2r3 = mat4[ 9], c3r3 = mat4[10], c4r3 = mat4[11],
                    c1r4 = mat4[12], c2r4 = mat4[13], c3r4 = mat4[14], c4r4 = mat4[15];

                return [
                    x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
                    x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
                    x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
                    x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
                ];
        }

        //transform a vec4 array with a matrix
        static transformVec4(out, v, m) {
                out[0] = m[0] * v[0] + m[4] * v[1] + m[8]	* v[2] + m[12] * v[3];
                out[1] = m[1] * v[0] + m[5] * v[1] + m[9]	* v[2] + m[13] * v[3];
                out[2] = m[2] * v[0] + m[6] * v[1] + m[10]	* v[2] + m[14] * v[3];
                out[3] = m[3] * v[0] + m[7] * v[1] + m[11]	* v[2] + m[15] * v[3];
                return out;
        }

        static add(a,b) {
                var m = new Matrix4();
                for (var i=0; i<arguments.length; i++) {if (arguments[i+1]) {for (var j=0; j<m.raw.length; j++) {
                            m.raw[j] = arguments[i].raw[j] + arguments[i+1].raw[j];
                }}};
                return m;
        }

        static scale(s, out) {
                for (var i=0; i<m.raw.length; i++) {
                    out[i] = s * out[i];
                }
                return out;
        }

        //Multiply two mat4 together (From glMatrix)
            //This static method uses an out arguement which is modified inside the function
            //The arguments and return are "raw" arrays, not Matrix4 objects
        static mult(out, a, b) { 
                var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                    a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                    a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

                // Cache only the current line of the second matrix
                var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
                out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
                out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
                out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
                out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
                return out;	
        }

        // NEW
            //Multiply two matrices without having an out matrix that we are changing non-statically
            //The arguments and return are Matrix4 objects, not raw attributes
        static multiply(m1, m2) {      
                var a = m1.raw, b = m2.raw, ary = new Float32Array(16);

                var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
                    a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
                    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
                    a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

                // Cache only the current line of the second matrix
                var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
                ary[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                ary[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                ary[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                ary[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
                ary[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                ary[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                ary[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                ary[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
                ary[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                ary[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                ary[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                ary[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
                ary[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
                ary[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
                ary[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
                ary[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

                return new Matrix4(ary);	
        }

        static multiplyCovectors(v,u) {
                var m = new Matrix4();
                m[0] = v.x*u.x;  m[1] = v.x*u.y;  m[2] = v.x*u.z;  m[3] = 0;
                m[4] = v.y*u.x;  m[5] = v.y*u.y;  m[6] = v.y*u.z;  m[7] = 0;
                m[8] = v.z*u.x;  m[9] = v.z*u.y;  m[10] = v.z*u.z; m[11] = 0;
                m[12] = 0;   	 m[13] = 0;    	  m[14] = 0;       m[15] = 0;
                return m;
        }

        
        
        // Static Matrix Transforms
        //##################################################################################################

            //translate x,y,z transform
        static translate(out,x,y,z) {
                out[12] = out[0] * x + out[4] * y + out[8]	* z + out[12];
                out[13] = out[1] * x + out[5] * y + out[9]	* z + out[13];
                out[14] = out[2] * x + out[6] * y + out[10]	* z + out[14];
                out[15] = out[3] * x + out[7] * y + out[11]	* z + out[15];
        }

        //scale x,y,z transform
        static scale(out,x,y,z) {
                out[0] *= x;
                out[1] *= x;
                out[2] *= x;
                out[3] *= x;
                out[4] *= y;
                out[5] *= y;
                out[6] *= y;
                out[7] *= y;
                out[8] *= z;
                out[9] *= z;
                out[10] *= z;
                out[11] *= z;
                return out;
        };

        // Rotation matrix transformations --------------------------------
        static rotateY(out,rad) {
                var s = Math.sin(rad),
                    c = Math.cos(rad),
                    a00 = out[0],
                    a01 = out[1],
                    a02 = out[2],
                    a03 = out[3],
                    a20 = out[8],
                    a21 = out[9],
                    a22 = out[10],
                    a23 = out[11];

                // Perform axis-specific matrix multiplication
                out[0] = a00 * c - a20 * s;
                out[1] = a01 * c - a21 * s;
                out[2] = a02 * c - a22 * s;
                out[3] = a03 * c - a23 * s;
                out[8] = a00 * s + a20 * c;
                out[9] = a01 * s + a21 * c;
                out[10] = a02 * s + a22 * c;
                out[11] = a03 * s + a23 * c;
                return out;
        }
        static rotateX(out,rad) {
                var s = Math.sin(rad),
                    c = Math.cos(rad),
                    a10 = out[4],
                    a11 = out[5],
                    a12 = out[6],
                    a13 = out[7],
                    a20 = out[8],
                    a21 = out[9],
                    a22 = out[10],
                    a23 = out[11];

                // Perform axis-specific matrix multiplication
                out[4] = a10 * c + a20 * s;
                out[5] = a11 * c + a21 * s;
                out[6] = a12 * c + a22 * s;
                out[7] = a13 * c + a23 * s;
                out[8] = a20 * c - a10 * s;
                out[9] = a21 * c - a11 * s;
                out[10] = a22 * c - a12 * s;
                out[11] = a23 * c - a13 * s;
                return out;
        }
        static rotateZ(out,rad) {
                var s = Math.sin(rad),
                    c = Math.cos(rad),
                    a00 = out[0],
                    a01 = out[1],
                    a02 = out[2],
                    a03 = out[3],
                    a10 = out[4],
                    a11 = out[5],
                    a12 = out[6],
                    a13 = out[7];

                // Perform axis-specific matrix multiplication
                out[0] = a00 * c + a10 * s;
                out[1] = a01 * c + a11 * s;
                out[2] = a02 * c + a12 * s;
                out[3] = a03 * c + a13 * s;
                out[4] = a10 * c - a00 * s;
                out[5] = a11 * c - a01 * s;
                out[6] = a12 * c - a02 * s;
                out[7] = a13 * c - a03 * s;
                return out;
        }

        //NEW
        // TRYING TO DO AXIS-ANGLE-ROTATION AND ROTATE-TO WITHOUT QUATERNIONS
        //##################################################################################################

            //NEW
            //Applies rotation matrix from axis and angle to current matrix
        static rotateQ(out, axis, angle) {
            if (axis == null) {console.error("axis == null -- rotateQ line 630")}

            var a  = new Matrix4(out),
                b  = Matrix4.axisAngleMatrix(axis,angle),
                ab = Matrix4.multiply(a,b);
            

            out = ab.raw;
            return out;
        }

        static rotateB(out, from, to) {
                var a  = new Matrix4(out),
                    b  = Matrix4.fromToMatrix(from,to),
                    ab = Matrix4.multiply(a,b);
                out = ab.raw;
                return out;
        }

        //???Not quite sure what this does???
        static invert(out,mat) {
                if(mat === undefined) mat = out; //If input isn't sent, then output is also input

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

                if (!det) return false;
                det = 1.0 / det;

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

                return true;
        }


        //get skew-symmetric cross product matrix of a vector
        static skewMat4(v) {
                var m = new Matrix4();

                m[0] = 0;     m[1] = v.z;   m[2] = v.y;  m[3] = 0;
                m[4] = -v.z;  m[5] = 0;     m[6] = v.x;  m[7] = 0;
                m[8] = -v.y;  m[9] = -v.x;  m[10] = 0;   m[11] = 0;
                m[12] = 0;    m[13] = 0;    m[14] = 0;   m[15] = 0;

                return m;
        }

        //get a Rodriguez Rotation Matrix
        static rodriquezMat4(a,b) {
                return Matrix4.add(
                    Matrix4.scale(Vector3.dot(a,b), Matrix4.identity()),
                    Matrix4.skewMat4(vector3.cross(a,b)),
                    Matrix4.scale(
                        -1*Vector3.dot(a,b) / Math.pow(Vector3.cross(a,b).magnitude(), 2),
                        Matrix4.multiplyCovectors(Vector3.cross(a,b), Vector3.cross(a,b))
                    )
                );
        }
        

        // NEW STUFF INTEGRATING QUATERNIONS
        //##################################################################################################

        static axisAngleMatrix(axis, angle) {
            if (axis == null) {console.error("axis == null -- line 1484");}
                var q = Quaternion.createFromAxisAngle(axis, angle);
                return Quaternion.rotationMatrix(q);
        }

        static fromToMatrix(from, to) {
                var q = Quaternion.createFrom2Vectors(from, to);
                return Quaternion.rotationMatrix(q);
        }


    }

    // RETURN OBJECT
    //#######################################################################
    return {Util:Util, Vector3:Vector3, Quaternion:Quaternion, Matrix4:Matrix4}

})();

export default Maths;

