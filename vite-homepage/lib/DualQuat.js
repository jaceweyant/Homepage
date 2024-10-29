// DUAL QUATERNION (NOT WORKING)
//#######################################################################

import Vec3 from "./Vec3.js";
import Quat from "./Quat.js";

class DualQuat {

    // DUAL QUATERNION CONSTRUCTOR
    //....................................................................
    constructor(real, dual) {
        this.real = real || new Quat();
        this.dual = dual || new Quat();
    }

    // STATIC CREATION METHODS
    //....................................................................
    static create(p,q) {return new DualQuat(p,q);}
    static copy(o)     {return new DualQuat(Quat.copy(o.real), Quat.copy(o.dual));}

    // Creates a dual quaternion rigid displacer with 
        // a rotation described by the rotation quaternion "r" and 
        // a translation denoted by 3-vector "t" which will be used in pure quaternion form
    // I DONT THINK THIS SHOULD WORK BUT TEST AGAINST OTHER ONE
    static create_rigidDisplacer_OLD(r,t) {return DualQuat.create(r, Quat.multiply(Quat.pure(t), r).scale(1/2));}   

    // Creates a dual quaternion rigid displacer with 
        // a rotation of angle "rad" about the 3-vector "u" axis and 
        // a translation by the 3-vector "v"
    static create_rigidDisplacer(u,rad,v) {return DualQuat.create(
        Quat.create(
            Math.cos(rad/2),
            Vec3.scale(Math.sin(rad/2), u)
        ), 
        Quat.create(
            -1 * Math.sin(rad/2) * Vec3.dot(v,u),
            Vec3.add(
                Vec3.scale(Math.cos(rad/2), v),
                Vec3.scale(Math.sin(rad/2), Vec3.cross(v,u))
            )
        ).scale(1/2)
    );}

    static create_RD(r,t) {
        var oRot   = DualQuat.create(r,Quat.zero()),
            oTrans = DualQuat.create(Quat.real(), Quat.pure(Vec3.scale(1/2, t)));
        return DualQuat.multiply(oTrans, oRot);
    }

    // GETTERS & SETTERS
    //....................................................................
    get_real()       {return this.real;}
    get_dual()       {return this.dual;}
    get_rotator()    {return Quat.copy(this.real);}
    get_translator() {return Quat.multiply(Quat.copy(this.dual), Quat.conjugate(this.real)).scale(2);}
    get_array()      {return [this.real.get_array(), this.dual.get_array()];}
    print(str)       {console.log(str || "" + this.get_array());}

    set(real,dual)   {this.real = real; this.dual = dual; return this;}
    copy(o)          {this.real = o.real; this.dual = o.dual; return this;}
    set_real(q)      {this.real = q; return this;}
    set_dual(q)      {this.dual = q; return this;}
    clone()          {return new DualQuat(this.real, this.dual);}

    // STATIC DUAL QUATERNION ALGEBRA METHODS
    //....................................................................
    static add(a,b) {return DualQuat.create(Quat.add(a.real, b.real), Quat.add(a.dual, b.dual));}
    static multiply(a,b) {return DualQuat.create(
        Quat.multiply(a.real, b.real),
        Quat.add(Quat.multiply(a.real, b.dual), Quat.multiply(a.dual, b.real))
    );}
    // Multiply together an unspecified number of dual quaternions as arguments
    static multiMultiply() {
        if (arguments == undefined || arguments.length < 2) {console.error("not enough arguments supplied"); return null;}
        var current = DualQuat.copy(arguments[0]);
        for(var i=1; i<arguments.length; i++) {
            current = DualQuat.multiply(current, arguments[i]);
        }
        return current;
    }

    static dualConjugate(o) {return DualQuat.create(o.real, Quat.neg(o.dual));}
    static quatConjugate(o) {return DualQuat.create(Quat.conjugate(o.real), Quat.conjugate(o.dual));}
    static conjugate(o)     {return DualQuat.create(Quat.conjugate(o.real), Quat.conjugate(o.dual).neg());}

    // for a dual quaternion to be unit, the real part must be a unit quaternion and it must be orthogonal to the dual part
    static isUnit(o) {return DualQuat.multiply(o, DualQuat.quatConjugate(o)) == 1;}


    // POINT RIGID DISPLACEMENT OPERATION METHODS
    //....................................................................
    static operate(v,o) {return DualQuat.multiMultiply(o, DualQuat.create(Quat.real(), Quat.pure(v)), DualQuat.conjugate(o));}
    static operate_quatConjugate(v,o) {return DualQuat.multiMultiply(o, DualQuat.create(Quat.real(), Quat.pure(v)), DualQuat.quatConjugate(o));}

}

export default DualQuat;