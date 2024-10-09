//##################################################################################################
// MATHS LIBRARY TESTING
//##################################################################################################
/*
import Maths from ".././lib/Maths.js";

// Maths Library Alone
//##################################################################################################
var testLibrary = (function() {
    
    var v1 = new Maths.Vector3(1,0,0),
        axis = new Maths.Vector3(0,1,0),
        angle = -90.0;
    
    console.log("initial vector: "); v1.print();
    console.log("axis of rotation: "); axis.print();
    console.log("angle of rotation: "); console.log(angle);

    var v2 = Maths.Quaternion.rotateVector(v1, axis, angle);
    console.log("rotated vector: "); v2.print();
    

    var p1 = new Maths.Vector3(1,0,0),
        p2 = new Maths.Vector3(0,0,1),
        q  = Maths.Quaternion.createFrom2Vectors(p1, p2);
        q.print();
        m = Maths.Quaternion.rotationMatrix(q),
        out = [0,0,0,0];
    console.log(m.raw.length);
    console.log(Maths.Matrix4.transformVec4(out, [p1.x, p1.y, p1.z, 0], m.raw));

    // IT WORKS !!!!!

})();


// Maths Library in Homepage Namespace
//##################################################################################################
var testHomepage = (function() {

})();
*/