var Primitives = {};

Primitives.Hypersphere = class {
    constructor(length) {
        this.length = length;
        this.aIndex = [];
        this.aVert = [];
        this.aUV = [];
    }
    static createModel(gl) {return new Model(Primitives.Hypersphere.createMesh(gl));}
    static createMesh() {
        var aVert = createVertices();
        //var aUV = createUVs();

        var mesh = gl.fCreateMeshVAO("Hypersphere", null, aVert, null, null);
        mesh.noCulling = true;
        mesh.doBlending = true;
        return mesh;
    }

    createVertices() {
        var verts = [];
        var list = this.makeList();
        for (var i=0; i<this.length; i++) {
            for (var j=0; j<this.length; j++) {
                for (var k=0; k<this.length; k++) {
                    verts.push(list[i], list[j], list[k]);
                }
            }
        }
        return verts;
    }

    makeList() {
        var list = [];
        var step = 1 / this.length;
        var val = 0;
        for (var i=0; i<this.length; i++) {
            list.push(val);
            val += step;
        }
        return list;
    }
}