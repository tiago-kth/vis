const params = {
    SPEED_INCREMENT: 100,
    N_PARTICLES: 1,
    ALPHA: 0.1,
    SPREAD: 10,
    PARTICLE_RADIUS: 2,
    MIN_DECAY: 20,
    DECAY_INCREMENT: 100,
    PARTICLE_COLOR: 'indigo',
    STREAMLINES_COLOR: '#BF2C62',
    BG: "white",//"white",
    GRID_COLOR: "lightgray",//"#33333350",
    VECTOR_COLOR: "darkgreen",
    N_RANDOM: 1000,
    PARTICLES_MODE: 'random', // 'follow'
    PARTICLE_SPEED: .5,
    EDGES : 'restart' // 'cross'
}

const state = {
    'toggle: show vectors' : true,
    'toggle: show streamlines' : true,
    'clear' : false,
    started : false
}

class Canvas {

    cell_size = 40;
    W;
    H;
    w;
    h;
    I;
    J;
    line = 1;
    margin = 40;

    el;

    N;

    constructor(ref) {

        this.el = document.querySelector(ref);
        this.W = 1200;//+window.getComputedStyle(this.el).width.slice(0,-2);
        this.H = 1200;//+window.getComputedStyle(this.el).height.slice(0,-2);

        this.el.width = this.W;
        this.el.height = this.H;

        this.I = Math.floor( (this.W - this.margin * 2) / this.cell_size);
        this.J = Math.floor( (this.H - this.margin * 2) / this.cell_size);

        this.w = this.cell_size * this.I;
        this.h = this.cell_size * this.J;

        this.N = this.I;

        this.ctx = this.el.getContext('2d');

    }

    build_grid() {

        //let I = 0;
        //let J = 0;

        this.ctx.save();
        this.ctx.strokeStyle = params.GRID_COLOR;
        this.ctx.lineWidth = this.line;

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

        this.ctx.restore();

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

    //cv.ctx.save();
    cv.ctx.fillStyle = params.BG;
    cv.ctx.globalAlpha = alpha;
    cv.ctx.fillRect(0,0,cv.W,cv.H);
    //cv.ctx.restore();
    
}

const particles = [];

const p = new Particle(100, 190, cv, 1);

particles.push(p);

function draw() {


    //clearCanvas(0.05); // com esse, deixa um "rastro"
    //clearCanvas(1);

    //cv.ctx.fill();
    //cv.build_grid();
    //flowField.render_vectors();

    // recover previously saved img;

    cv.ctx.globalAlpha = params.ALPHA;

    if (state["toggle: show streamlines"] && state["toggle: show vectors"]) {

        cv.ctx.drawImage(imgs['vectors and streamlines'], 0, 0);

    } else {

        if (state["toggle: show streamlines"]) cv.ctx.drawImage(imgs.streamlines, 0, 0);

        else {
            if (state["toggle: show vectors"]) cv.ctx.drawImage(imgs.vectors, 0 ,0);
            else clearCanvas(params.ALPHA);
        } 

    }

    if (state.clear) {
        console.log('clear!');
        //clearCanvas(1);
        state.clear = false;
    }

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

function play() {

    if (state.started) stop();
    else start();

    state.started = !state.started;

    this.classList.toggle('started');
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
    'nothing' : null,
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

    clearCanvas(1);

    imgs['nothing'].src = cv.el.toDataURL();

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

    cv.build_grid();
    flowField.render_vectors();
    reset_streams();
    draw_streams();



}

function new_start() {
    setup();
    random_streams();
    saveImg();
    random_particles();
    start();
}

function alternate_start() {
    //setup();
    //generate_seeds();
    //generate_streams();
    //generate_particles();
    //draw_streams();
    //saveImg();
    start();
}

setup();

// controls

class Button {

    el;

    action;

    constructor(ref, action) {

        this.el = document.querySelector(`[data-btn="${ref}"]`);

        this.el.addEventListener('click', action);

    }

}

const btnStart = new Button('start', play);
const btnRandomParticles = new Button('place-random', random_particles);
const btnToggles = new Button('toggles', (e) => {

    const toggles = Object.keys(state).filter(k => k.slice(0,6) == 'toggle');

    const tg = e.target.dataset.btn;
    console.log(tg, toggles);

    if (e.target.tagName == 'BUTTON') {

        e.target.classList.toggle('selected');

        state[tg] = !state[tg];

        if (!state[tg]) {
            // if any toggle was de-selected, then send a "clear" signal once, to clear the canvas in one frame
            state.clear = true;
        }

    }

    // if all toggles were de-selected, send the clear signal

    /*
    const all_toggles_disabled = !toggles.map(k => state[k]).reduce( (p,c) => p + c);

    console.log(all_toggles_disabled);

    if (all_toggles_disabled) state.clear = true;
    */

})

function clearTwinButtons(className) {

    document.querySelectorAll("." + className).forEach(btn => btn.classList.remove('selected'));

}

const btnModes = new Button('mode', (e) => {

    if (e.target.tagName == 'BUTTON') {

        clearTwinButtons('mode-btns');

        e.target.classList.add('selected');

        const mode = e.target.dataset.mode;

        params.PARTICLES_MODE = mode;

    }

})

const btnEdges = new Button('edges', (e) => {

    if (e.target.tagName == 'BUTTON') {

        clearTwinButtons('edge-btns');

        e.target.classList.add('selected');

        const edge_behavior = e.target.dataset.edges;

        params.EDGES = edge_behavior;

    }

})

function updateSlider(slider, param) {

    const label = document.querySelector(`[data-slider-label="${slider}"]`);
    const sliderEl = document.querySelector(`[data-slider="${slider}"]`);

    label.innerHTML = params[param];
    sliderEl.value = params[param];

}

class Slider {

    el;
    ref;
    label;
    param_name;

    constructor(slider_ref, param_name) {

        this.ref = slider_ref;
        this.param_name = param_name;

        this.label = document.querySelector(`[data-slider-label="${slider_ref}"]`);
        this.el = document.querySelector(`[data-slider="${slider_ref}"]`);

        this.updateSlider();

        this.el.addEventListener('change', e => this.updateParam(this));

    }

    updateSlider() {

        console.log(this.label, params[this.param_name]);

        this.updateLabel();
        this.el.value = params[this.param_name];

    }

    updateLabel() {

        this.label.innerHTML = Number.parseFloat(params[this.param_name]).toFixed(2);

    }

    updateParam(obj) {

        console.log(this, obj);

        params[obj.param_name] = obj.el.value;

        obj.updateLabel();


    }

}

const frameAlphaSlider = new Slider('frame-alpha', 'ALPHA');
const particleSpeedSlider = new Slider('particle-speed', 'PARTICLE_SPEED');