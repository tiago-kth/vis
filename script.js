const params = {
    SPEED_INCREMENT: 100,
    N_PARTICLES: 1,
    ALPHA: 0.3,
    SPREAD: 10,
    PARTICLE_RADIUS: 2,
    MIN_DECAY: 20,
    DECAY_INCREMENT: 100,
    PARTICLE_COLOR: '#40a8ff',
    BG: "white",
    GRID_COLOR: "#33333350",
    VECTOR_COLOR: "green"
}

class Canvas {

    cell_size = 20;
    W;
    H;
    w;
    h;
    I;
    J;
    line = 1;
    margin = 50;

    el;

    N;

    constructor(ref) {

        this.el = document.querySelector(ref);
        this.W = +window.getComputedStyle(this.el).width.slice(0,-2);
        this.H = +window.getComputedStyle(this.el).height.slice(0,-2);

        this.el.width = this.W;
        this.el.height = this.H;

        this.I = Math.floor( (this.W - this.margin * 2) / this.cell_size);
        this.J = Math.floor( (this.H - this.margin * 2) / this.cell_size);

        this.w = this.cell_size * this.I;
        this.h = this.cell_size * this.J;

        this.N = this.I;

        this.ctx = this.el.getContext('2d');

        this.ctx.strokeStyle = params.GRID_COLOR;
        this.ctx.lineWidth = this.line;



    }

    build_grid() {

        //let I = 0;
        //let J = 0;

        for (let i = 0; i < this.I + 1; i++) {

            this.ctx.beginPath();
            this.ctx.moveTo(this.margin + i * this.cell_size, this.margin);
            this.ctx.lineTo(this.margin + i * this.cell_size, this.h + this.margin);
            this.ctx.stroke();
            //I++

        }

        for (let j = 0; j < this.J + 1; j++) {

            this.ctx.beginPath();
            this.ctx.moveTo(this.margin, this.margin + j * this.cell_size);
            this.ctx.lineTo(this.w + this.margin, this.margin + j * this.cell_size);
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

            i : Math.floor( x / cell_size),
            j : Math.floor( y / cell_size)

        }

    }

    highlightCell(i, j) {

        const x = this.margin + i * this.cell_size + this.line;
        const y = this.margin + j * this.cell_size + this.line;
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
    angle;

    constructor(x, y, angle = false) {

        this.x = x;
        this.y = y;
        this.angle = angle;

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

        return new Vec(x, y, ang)

    }

}

/////////////

let count = 0;

const cv = new Canvas('canvas');
const N = cv.N;

const flowField = new FlowField(cv.I, cv.J, cv);
flowField.make_random_field();

function clearCanvas() {

    cv.ctx.fillStyle = params.BG;
    cv.ctx.globalAlpha = 1;
    cv.ctx.fillRect(0,0,cv.W,cv.H);
    
}

const particles = [];

const p = new Particle(100, 190, cv, 0.5);

particles.push(p);

function draw() {

    //clearCanvas();
    //cv.ctx.fill();
    //cv.build_grid();
    //flowField.render_vectors();

    particles.forEach(p => {
        p.update();
        p.render();
    })


}

function draw_first() {

    //clearCanvas();
    //cv.ctx.fill();
    cv.build_grid();
    flowField.render_vectors();

    particles.forEach(p => {
        p.update();
        p.render();
    })


}

function addParticle(e) {
    console.log(e);

    const x = e.offsetX;
    const y = e.offsetY;

    const p = new Particle(x - cv.margin, y - cv.margin, cv, 0.5);
    
    particles.push(p);
}

cv.el.addEventListener('click', addParticle);


/* animation loop */
let previous, elapsed;

function animate(timestamp) {

    if (!previous) previous = timestamp;
    elapsed = timestamp - previous;
    draw();
    previous = timestamp;
    requestID = window.requestAnimationFrame(animate);

}

let requestID;

function start() {
    requestID = window.requestAnimationFrame(animate);
}

draw_first();
//start();

function stop() {
    cancelAnimationFrame(requestID);
}