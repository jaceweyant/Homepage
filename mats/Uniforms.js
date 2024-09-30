class Uniforms {
    constructor() {
        this.blockName = "";
        this.raw = [];
        this.block = [];
    }

    static create(blockName, ary) {
        this.blockName = blockName;
        this.raw = ary;
        this.block = Uniforms.createBlock(ary);
        Resources.UniformBlocks[blockName] = this.block;
        return this;
    }

    static createBlock(ary) {
        if (!ary) return null;
        var block = [];
        for (var i=0; i<ary.length; i++) {
            if (ary[i].length != 3) return null;
            var uName = ary[i][0],
                uType = ary[i][1];
            block[uName] = {loc:null, type:uType, val:null}
        }
        return block;
    }

    static setValue(block, uName, uVal) {
        block[uName].val = uVal;
    }
}