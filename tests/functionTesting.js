class Number {
    constructor(x) {
        this.x = x;
    }

    static neg(n) {return new Number(-n.x);}
    neg() {this.x *= -1; return this;}
    checkX() {console.log(this.x);}
}

var n = new Number(1);

Number.neg(n).checkX();
n.checkX();

var n2 = n.neg();
n.checkX();

// Calling a non-static function does change the value of the obj