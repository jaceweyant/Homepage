// QUATERNION
//#######################################################################

import Util from "./Util.js";
import Vec3 from "./Vec3.js";

class Quat {

    // QUATERNION CONSTRUCTOR
    //....................................................................
    constructor(w,v) {
        this.w = w || 0;
        this.v = v || new Vec3();
    }


    // STATIC QUATERNION CREATION
    //....................................................................
    static create(w,v)  {
        var q = new Quat();
        q.w = w;
        q.v = Vec3.copy(v);
        return q;
    }
    static copy(q) {return new Quat(q.w, q.v.clone());}
    static fromComponents(w,x,y,z) {return Quat.create(w, Vec3.create(x,y,z));}

    static zero()  {return Quat.create(0, Vec3.zero());}
    static real()  {return Quat.create(1, Vec3.zero());}
    static pure(v) {return Quat.create(0, v);}

    static create_rotationQuat(n,rad)  {return Quat.create(
        Math.cos(rad/2),
        Vec3.scale(Math.sin(rad/2), n)
    );}
    static create_fromToQuat(u,v)      {return Quat.create_rotationQuat(
        Vec3.cross(u,v).normalize(),
        Math.acos(Vec3.dot(u.normalize(), v.normalize()))
    );}


    // QUATERNION GETTERS & SETTERS
    //....................................................................
    get_real()  {return this.w;}
    get_vec()   {return this.v;}
    get_array() {return [Util.fRound(this.w, 2), Util.fRound(this.v.x, 2), Util.fRound(this.v.y, 2), Util.fRound(this.v.z, 2)];}
    norm()      {return Math.sqrt(Quat.multiply(q, Quat.conjugate(q)).get_real());}     //ANALOGOUS TO MAGNITUDE

    set_real(w) {this.w = w; return this;}
    set_vec(v)  {this.v = v; return this;}
    set(w,v)    {this.w = w; this.v = v; return this;}
    copy(q)     {this.w = q.w; this.v = q.v.clone(); return this;}
    clone()     {return new Quat(this.w, this.v);}


    // NON-STATIC QUATERNION ALGEBRA
    //....................................................................
    add(q)      {this.w += q.w; this.v.add(q.v); return this;}
    multiply(q) {
        var product = Mat4.multiply(this, q);
        this.set(product.w, product.v);
        return this;
    }
    scale(s)    {this.w *= s; this.v.scale(s); return this;}
    neg()       {this.scale(-1); return this;}

    conjugate() {this.copy(Quat.conjugate(this)); return this;}
    inverse()   {this.copy(Quat.inverse(this));   return this;}
    unit()      {this.copy(Quat.unit(this));      return this;}

    print(str)  {console.log(str || "" + this.get_array());}


    // STATIC QUATERNION ALGEBRA METHODS
    //....................................................................
    static add(a,b)      {return Quat.create(a.w + b.w, Vec3.add(a.v, b.v));}
    static multiply(a,b) {return Quat.create(
        a.w*b.w - a.v.x*b.v.x - a.v.y*b.v.y - a.v.z*b.v.z,
        Vec3.create(
            a.w*b.v.x + a.v.x*b.w + a.v.y*b.v.z - a.v.z*b.v.y,
            a.w*b.v.y - a.v.x*b.v.z + a.v.y*b.w + a.v.z*b.v.x,
            a.w*b.v.z + a.v.x*b.v.y - a.v.y*b.v.x + a.v.z*b.w
        )
    );}
    static multiply_usingVecAlg(a,b) {return Quat.create(
        a.w*b.w - Vec3.dot(a.v,b.v),
        Vec3.scale(a.w, b.v) + Vec3.scale(b.w, a.v) + Vec3.cross(a.v, b.v)
    );}
    static scale(s,q)    {return Quat.create(s*q.w, Vec3.scale(s,q.v));}
    static neg(q)        {return Quat.scale(-1, q);}

    static conjugate(q)  {return Quat.create(q.w, Vec3.scale(-1, q.v));}
    static inverse(q)    {return Quat.scale(
        1/Math.pow(q.mag(), 2),
        Quat.conjugate(q)
    );}
    static unit(q)       {return Quat.scale(q.norm(), q);}
}

export default Quat;