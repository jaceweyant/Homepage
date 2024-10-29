// VECTOR-3
//#######################################################################

import Util from "./Util.js";

class Vec3 {

    // CONSTRUCTOR
    //....................................................................
    constructor(x,y,z)   {this.x = x || 0.0; this.y = y || 0.0;	this.z = z || 0.0;}
 

    // STATIC CREATION METHODS
    //....................................................................
    static create(x,y,z) {return new Vec3(x,y,z);}
    static copy(v)       {return new Vec3(v.x, v.y, v.z);}
    static zero()        {return new Vec3(0,0,0);}
    static forward()     {return new Vec3(0,0,1);}
    static up()          {return new Vec3(0,1,0);}
    static right()       {return new Vec3(1,0,0);}   
    

    // GETTERS & SETTERS
    //....................................................................
    set(x,y,z) 	     {this.x = x; this.y = y; this.z = z; return this;}
    clone() 	     {return new Vec3(this.x,this.y,this.z);}
    get_array()      {return [Util.fRound(this.x,2), Util.fRound(this.y,2), Util.fRound(this.z,2)];}
    get_floatArray() {return new Float32Array([this.x,this.y,this.z]);}
    magnitude(v) {
        //Only get the magnitude of this vector
        if(v === undefined) return Math.sqrt( this.x*this.x + this.y*this.y + this.z*this.z );
        //Get magnitude based on another vector
        var x = v.x - this.x, y = v.y - this.y, z = v.y - this.z;
        return Math.sqrt( x*x + y*y + z*z );
    }
    print(str) {console.log(str || "" + this.get_array());}


    // VECTOR ALGEBRA
    //....................................................................
    add(b)	     {this.x += b.x; this.y += b.y; this.z += b.z; return this;}
    sub(b)	     {this.x -= b.x; this.y -= b.y; this.z -= b.z; return this;}
    scale(s)     {this.x *= s; this.y *= s; this.z *= s; return this;}
    neg()        {return this.scale(-1);}
    normalize()  {var mag = this.magnitude(); this.x /= mag; this.y /= mag; this.z /= mag; return this;}
    dot(b)	     {return this.x*b.x + this.y*b.y + this.z*b.z;}		
    cross(b)     {
        this.x = this.y*b.z - this.z*b.y;
        this.y = this.z*b.x - this.x*b.z;
        this.z = this.x*b.y - this.y*b.x;
        return this;
    }


    //Static Vector Algebra Methods
    //....................................................................
    static add(a,b)    {return Vec3.create(a.x+b.x, a.y+b.y, a.z*b.z);}
    static scale(s,v)  {return Vec3.create(s*v.x, s*v.y, s*v.z);}
    static scale(s,v)  {return Vec3.create(s*v.x, s*v.y, s*v.z);}
    static dot(a,b)    {return a.x*b.x + a.y*b.y + a.z*b.z;}
    static cross(a,b)  {return Vec3.create(a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x);} 
        
}

export default Vec3;