const params = {
    SPEED_INCREMENT: 100,
    N_PARTICLES: 1,
    ALPHA: 0.3,
    SPREAD: 10,
    PARTICLE_RADIUS: 2,
    MIN_DECAY: 20,
    DECAY_INCREMENT: 100,
    PARTICLE_COLOR: 'firebrick',
    BG: "whitesmoke",
    GRID_COLOR: "#33333350",
    VECTOR_COLOR: "green",
    N_RANDOM: 1000
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
    margin = 20;

    el;

    N;

    constructor(ref) {

        this.el = document.querySelector(ref);
        this.W = 500;//+window.getComputedStyle(this.el).width.slice(0,-2);
        this.H = 500;//+window.getComputedStyle(this.el).height.slice(0,-2);

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

function clearCanvas(alpha) {

    cv.ctx.fillStyle = params.BG;
    cv.ctx.globalAlpha = alpha;
    cv.ctx.fillRect(0,0,cv.W,cv.H);
    
}

const particles = [];

const p = new Particle(100, 190, cv, 1);

particles.push(p);

function draw() {

    clearCanvas(0.05); // com esse, deixa um "rastro"
    //clearCanvas(1);

    //cv.ctx.fill();
    //cv.build_grid();
    //flowField.render_vectors();

    // recover previously saved img;
    cv.ctx.drawImage(bg, 0, 0);

    particles.forEach((p,i) => {
        p.update();
        p.treat_edges();
        p.render();

        //if (p.exit) particles.splice(i, 1);
    })


}

function draw_first() {

    //clearCanvas();
    //cv.ctx.fill();
    //cv.build_grid();
    //flowField.render_vectors();

    particles.forEach(p => {
        p.update();
        p.render();
    })


}

function random_particles() {

    const n = params.N_RANDOM;

    for (let t = 0; t < n; t++) {

        const x = Math.random() * cv.w;// + cv.margin;
        const y = Math.random() * cv.h;// + cv.margin;

        const p = new Particle(x, y, cv, 1); //.5
    
        particles.push(p);

    }

}

function all_particles() {

    for (let i = 0; i < cv.I; i++) {
        for (let j = 0; j < cv.J; j++) {

            console.log(i,j)

            const x = cv.cell_size * i;
            const y = cv.cell_size * j;

            const p = new Particle(x, y, cv, .5);

            particles.push(p);

        }
    }

}

const seeds = [];

function generate_seeds() {

    const n = params.N_RANDOM;

    for (let t = 0; t < n; t++) {

        const x = Math.random() * cv.w + cv.margin;
        const y = Math.random() * cv.h + cv.margin;

        seeds.push({x,y});
    
    }

}

function random_streams() {

    const n = params.N_RANDOM;

    for (let t = 0; t < n; t++) {

        const x = Math.random() * cv.w; + cv.margin;
        const y = Math.random() * cv.h; + cv.margin;

        const s = new Streamline(x, y, 5, cv, flowField, 200);

        s.draw();
    
    }

}

let streamlines = [];

function draw_streams() {
    streamlines.forEach(s => s.draw());
}

function reset_streams() {
    streamlines.forEach(s => s.reset());
}

function generate_streams() {

    seeds.forEach(seed => {

        const {x, y} = seed;
    
        const s = new Streamline(x, y, 5, cv, flowField, 200);
        streamlines.push(s);
    
    })

}

function generate_particles() {

    seeds.forEach(seed => {

        const {x, y} = seed;
    
        const p = new Particle(x - cv.margin, y - cv.margin, cv, 1); //.5
        particles.push(p);
    
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

//draw_first();
//start();

function stop() {
    cancelAnimationFrame(requestID);
}

function setup() {
    cv.build_grid();
    flowField.render_vectors();
}

let imgs = {
    'vectors and streamlines' : null,
    'vectors' : null,
    'streamlines' : null
}

function init_bgs() {

    Object.keys(imgs).forEach(key => {
        imgs[key] = new Image;
    })

}

// gerar as stramlines antes

function setup() {

    init_bgs();

    cv.build_grid();
    flowField.render_vectors();

    imgs['vectors'].src = cv.el.toDataURL();

    generate_seeds();
    generate_streams();
    generate_particles();

    draw_streams();

    imgs['vectors and streamlines'].src = cv.el.toDataURL();

    clearCanvas(1);

    reset_streams();
    draw_streams();

    imgs['streamlines'].src = cv.el.toDataURL();

    clearCanvas(1);

}

function new_start() {
    setup();
    random_streams();
    saveImg();
    random_particles();
    start();
}

function alternate_start() {
    setup();
    //generate_seeds();
    //generate_streams();
    //generate_particles();
    //draw_streams();
    //saveImg();
    start();
}

// controls

class Button {

    el;

    action;

    constructor(ref, action) {

        this.el = document.querySelector(`[data-btn="${ref}"]`);

        this.el.addEventListener('click', action);

    }

}

const btnStart = new Button('start', start);
const btnRandomParticles = new Button('place-random', random_particles);