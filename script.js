const params = {
    SPEED_INCREMENT: 100,
    N_PARTICLES: 1,
    SPREAD: 10,
    PARTICLE_RADIUS: 5,
    MIN_DECAY: 20,
    DECAY_INCREMENT: 100,
    PARTICLE_COLOR: '#40a8ff',
    BG: "white"
}

class Canvas {

    cell_size = 50;
    W;
    H;
    w;
    h;
    I;
    J;
    line = 1;

    N;

    constructor(ref) {

        this.el = document.querySelector(ref);
        this.W = +window.getComputedStyle(this.el).width.slice(0,-2);
        this.H = +window.getComputedStyle(this.el).height.slice(0,-2);

        this.el.width = this.W;
        this.el.height = this.H;

        this.I = Math.floor(this.W / this.cell_size);
        this.J = Math.floor(this.H / this.cell_size);

        this.w = this.cell_size * this.I;
        this.h = this.cell_size * this.J;

        this.N = this.I;

        this.ctx = this.el.getContext('2d');

        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = this.line;



    }

    build_grid() {

        //let I = 0;
        //let J = 0;

        for (let i = 0; i < this.W; i = i + this.cell_size) {

            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.h);
            this.ctx.stroke();
            //I++

        }

        for (let j = 0; j < this.H; j = j + this.cell_size) {

            this.ctx.beginPath();
            this.ctx.moveTo(0, j);
            this.ctx.lineTo(this.w, j);
            this.ctx.stroke();
            //J++

        }

        //this.I = I;
        //this.J = J;

    }

    getDims() {

        return {
            I: this.I,
            J: this.J
        }

    }

    getSize() {

        return this.I * this.J;

    }

    getCell(x, y) {

        const cell_size = this.cell_size;

        return {

            i : Math.floor(x / cell_size),
            j : Math.floor(y / cell_size)

        }

    }

    highlightCell(i, j) {

        const x = i * this.cell_size + this.line;
        const y = j * this.cell_size + this.line;
        const l = this.cell_size - 2 * this.line;

        this.ctx.fillStyle = "yellow";

        this.ctx.beginPath();
        this.ctx.fillRect(x, y, l, l);
        this.ctx.fill();



    }

}

class Vec {

    x;
    y;

    constructor(x, y) {

        this.x = x;
        this.y = y;

    }

    mod() {

        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) )

    }

    add(vec_b) {

        this.x += vec_b.x;
        this.y += vec_b.y

    }

    mult(scalar) {

        this.x *= scalar;
        this.y *= scalar;

    }

    /* this make it possible to use the utility function without instantiating an object */
    static fromAngle(ang) {

        let x = Math.cos(ang);
        let y = Math.sin(ang);

        return new Vec(x, y)

    }

}

/////////////

let count = 0;

const cv = new Canvas('canvas');
const N = cv.N;

function clearCanvas() {

    cv.ctx.fillStyle = params.BG;
    cv.ctx.globalAlpha = 1;
    cv.ctx.fillRect(0,0,cv.W,cv.H);
    
}

function draw() {

    clearCanvas();

    cv.ctx.fill();
    cv.build_grid();

}


/* animation loop */
let previous, elapsed;

function animate(timestamp) {

    if (!previous) previous = timestamp;
    elapsed = timestamp - previous;
    draw();
    previous = timestamp;
    window.requestAnimationFrame(animate);

}

function start() {
    window.requestAnimationFrame(animate);
}

draw();
//start();