//import {Util, Vector3, Quaternion, Matrix4} from "./../math.js";
import Transform from "../transform.js";

var test_rotateTo = () => {
    var transform = new Transform();
    console.log("init matview: " + transform.matView.raw);

    transform.to.set(0.2, 0.5, 1.4);
    transform.updateMatrix();
    console.log("rotated matview: " + transform.matView.raw);
}

var main = (function() {
    test_rotateTo();
})();
