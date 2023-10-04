const params = {
    DIFFUSION: null,
    VISCOSITY: null,
    TIME_STEP: null,
    ITERATIONS: 4,
    SPEED_INCREMENT: 100,
    DENSITY_INCREMENT: 0,
    N_PARTICLES: 1000,
    SPREAD: 10,
    PARTICLE_RADIUS: 1.5,
    MIN_DECAY: 20,
    DECAY_INCREMENT: 100,
    PARTICLE_COLOR: '#40a8ff'
}

class Canvas {

    cell_size = 10;
    W;
    H;
    I;
    J;

    N;

    constructor(ref) {

        this.el = document.querySelector(ref);
        this.W = +window.getComputedStyle(this.el).width.slice(0,-2);
        this.H = +window.getComputedStyle(this.el).height.slice(0,-2);

        this.el.width = this.W;
        this.el.height = this.H;

        this.I = Math.floor(this.W / this.cell_size);
        this.J = Math.floor(this.H / this.cell_size);

        this.N = this.I;

        this.ctx = this.el.getContext('2d');

        this.ctx.strokeStyle = 'green';
        this.ctx.lineWidth = 1;

    }

    build_grid() {

        //let I = 0;
        //let J = 0;

        for (let i = 0; i < this.W; i = i + this.cell_size) {

            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.H);
            this.ctx.stroke();
            //I++

        }

        for (let j = 0; j < this.H; j = j + this.cell_size) {

            this.ctx.beginPath();
            this.ctx.moveTo(0, j);
            this.ctx.lineTo(this.W, j);
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

class Fluid {

    Vx; Vy  // vector field for velocity
    Vx0; Vy0 // previous velocity
    s;  // vector field for dye/plankton density
    density; // previous density?

    diffusion;
    viscosity;
    dt; // time_step

    constructor(diffusion, viscosity, time_step) {

        const size = N * N;

        this.Vx  = new Array(size).fill(0);
        this.Vx0 = new Array(size).fill(0);

        this.Vy  = new Array(size).fill(0);
        this.Vy0 = new Array(size).fill(0);

        this.s  = new Array(size).fill(0);
        this.density = new Array(size).fill(0);

        this.viscosity = viscosity;
        this.diffusion = diffusion;
        this.dt = time_step;

        params.VISCOSITY = viscosity;
        params.DIFFUSION = diffusion;
        params.TIME_STEP = time_step;

    }

    getIndex(x, y) {

        return x + y * N; //nof columns

    }

    addDensity(x, y, amount) {

        const index = this.getIndex(x, y);
        this.density[index] += amount;
        
        this.density[this.getIndex(x, y - 1)] += amount * 0.6;
        this.density[this.getIndex(x, y + 1)] += amount * 0.6;
        this.density[this.getIndex(x -1, y)] += amount * 0.6;
        this.density[this.getIndex(x +1, y)] += amount * 0.6;

    }

    addVelocity(x, y, amount_x, amount_y) {

        const index = this.getIndex(x, y);
        this.Vx[index] += amount_x;
        this.Vy[index] += amount_y;

    }

    step() {

        //const N       = this.size;
        const visc    = params.VISCOSITY;//this.viscosity;
        const diff    = params.DIFFUSION;//this.diffusion;
        //const dt      = this.dt;

        const Vx      = this.Vx;
        const Vy      = this.Vy;

        const Vx0     = this.Vx0;
        const Vy0     = this.Vy0;

        const s       = this.s;
        const density = this.density;
        
        diffuse(1, Vx0, Vx, visc);
        diffuse(2, Vy0, Vy, visc);
        
        project(Vx0, Vy0, Vx, Vy);
        
        advect(1, Vx, Vx0, Vx0, Vy0);
        advect(2, Vy, Vy0, Vx0, Vy0);
        
        project(Vx, Vy, Vx0, Vy0);
        
        diffuse(0, s, density, diff);
        advect(0, density, s, Vx, Vy);
        

    }

    render_density() {

        for (let i = 0; i < N; i++) {

            for (let j = 0; j < N; j++) {

                const x = i * cv.cell_size;
                const y = j * cv.cell_size;
                const index = fluid.getIndex(i, j);
                const density = fluid.density[index];

                //if (density > 0) console.log(i,j);

                //cv.ctx.fillStyle = (`rgb(0, ${density}, ${density})`);
                if (display_density) {

                    cv.ctx.fillStyle = `rgb(0, 0, ${density})`;
                    cv.ctx.fillRect(x, y, cv.cell_size, cv.cell_size);

                }
                
                //cv.ctx.fillStyle = (`rgb(${density}, 0, ${density})`);
                //cv.ctx.fillStyle = 'hotpink';
                //cv.ctx.globalAlpha = density / 1000;

                //if (i + j < 100) console.log(x, y, cv.cell_size);
                
                
                //cv.ctx.fillStyle = (`rgb(${density}, ${density}, ${density})`);
                //cv.ctx.fill();

            }

        }

    }

    getCoords(n) {

        return {
            i : n % N,
            j : Math.floor( n / N )
        }

    }

    display_vectors() {

        cv.ctx.textAlign = 'center';
        cv.ctx.textBaseline = 'middle';

        this.Vx.forEach( (vx, n) => {

            const i = this.getCoords(n).i;
            const j = this.getCoords(n).j;

            const vy = this.Vy[n];

            //const module = Math.sqrt(Math.pow(vx, 2) + Math.pow(vy, 2));

            let angle = Math.atan(vx / vy);

            if ( vx < 0) angle += Math.PI;

            cv.ctx.save();

                cv.ctx.translate(i * cv.cell_size + cv.cell_size/2, j * cv.cell_size + cv.cell_size/2);

                cv.ctx.save();

                //console.log(module, vx, vy);

                    cv.ctx.rotate(angle);
                    cv.ctx.fillStyle = "white";
                    //cv.ctx.font = `${module/10}px serif`;
                    cv.ctx.fillText('→', 0, 0, cv.cell_size);

                cv.ctx.restore();

            cv.ctx.restore();


        })



    }

}

class Controls {

    el;
    display;
    variable;

    constructor(variable) {

        this.variable = variable;
        this.el = document.querySelector('#' + variable);
        // initialize value
        this.el.value = params[variable];
        this.display = document.querySelector(`[data-display="${variable}"]`);
        this.update_display();
        this.el.addEventListener('change', e => this.update(e, this));

    }

    update(e, ref) {
        ref.update_param();
        ref.update_display();
    }

    update_display() {

        this.display.innerText = params[this.variable];

    }

    update_param() {

        let value = this.el.value;
        params[this.variable] = this.variable == 'PARTICLE_COLOR' ? value : +value;

    }

}

function init_controls() {

    const btn = document.querySelector('.toggle-controls');
    const ctrls = document.querySelector('.controls');

    btn.addEventListener('click', e => {

        ctrls.classList.toggle('display');
        
    })

    Object.keys(params).forEach(variable => {
        console.log('Iniciando controle da variavel ', variable);
        if (variable != 'ITERATIONS') return new Controls(variable);
    })

}

function set_initial_density() {

    for (let i = 0; i < N; i++) {

        for (let j = 0; j < N; j++) {

            const index = fluid.getIndex(i, j);

            const noise = perlin.get(i / N, j / N) + 1;

            fluid.density[index] = 50 * noise;

        }

    }

}

let display_vector_field = false;
let display_density = true;

function monitor_button_display_vector() {

    const btn = document.querySelector('.btn-display-vector');
    btn.addEventListener('click', e => display_vector_field = !display_vector_field);

}

function monitor_button_display_density() {

    const btn = document.querySelector('.btn-display-density');
    btn.addEventListener('click', e => display_density = !display_density);

}


/////////////

let count = 0;

const cv = new Canvas('canvas');
const N = cv.N;
const fluid = new Fluid(0.001, 0.01, 0.00001);
console.log(params);
init_controls();
monitor_button_display_vector();
monitor_button_display_density();

//const p = new Particle(cv.W/2, cv.H/2, cv);
//const p2 = new Particle(cv.W/2 + 30, cv.H/2 + 30, cv);
set_initial_density();

let dragging = false;
let mouse_history_x = [];
let mouse_history_y = [];

function update_mouse_history(posX, posY) {

    mouse_history_x.push(posX);
    mouse_history_y.push(posY);

    if (mouse_history_x.length < 2) {

        mouse_history_x.push(posX);
        mouse_history_y.push(posY);

    } else {

        mouse_history_x.splice(0,1);
        mouse_history_y.splice(0,1);

    }

    // I want to keep this arrays as [previous_position, current_position];

}

cv.el.addEventListener('click', splash)

cv.el.addEventListener('mousedown', (e) => {

    console.log('on');
    dragging = true;

});

cv.el.addEventListener('mousemove', (e) => {

    if (dragging) {
        //console.log(e.clientX, e.clientY);

        const i = Math.floor(e.clientX / cv.cell_size);
        const j = Math.floor(e.clientY / cv.cell_size);

        update_mouse_history(e.clientX, e.clientY);

        const displ_x = mouse_history_x[1] - mouse_history_x[0];
        const displ_y = mouse_history_y[1] - mouse_history_y[0];

        //console.log(i, j);
        fluid.addDensity(i, j, params.DENSITY_INCREMENT);
        fluid.addVelocity(i, j, displ_x * params.SPEED_INCREMENT, displ_y * params.SPEED_INCREMENT);

    }

});

cv.el.addEventListener('mouseup', (e) => {

    console.log('off');
    dragging = false;

});

function splash(e) {

    const x = e.clientX;
    const y = e.clientY;

    const { i, j } = cv.getCell(x, y);

    const m = 150;

    fluid.addVelocity(i - 1, j - 1, -m, -m);
    fluid.addVelocity(i    , j - 1,  0, -m);
    fluid.addVelocity(i + 1, j - 1,  m, -m);

    fluid.addVelocity(i - 1, j,     -m,  0);
    fluid.addVelocity(i + 1, j,      m,  0);

    fluid.addVelocity(i - 1, j + 1, -m,  m);
    fluid.addVelocity(i    , j + 1,  0,  m);
    fluid.addVelocity(i + 1, j + 1,  m,  m);

    generate_particles(params.N_PARTICLES, e.clientX, e.clientY);

}

function clearCanvas() {

    cv.ctx.fillStyle = 'black';
    cv.ctx.globalAlpha = 1;
    cv.ctx.fillRect(0,0,cv.W,cv.H);
    
}

function draw() {

    clearCanvas();

    cv.ctx.fill();
    fluid.step();
    fluid.render_density();
    //fluid.display_vectors();
    if (display_vector_field) fluid.display_vectors();
    //p.step();
    //p2.step();
    particles.forEach((p,i) => p.step(i));

    /*
    if (particles.length > 0) {
        // removal criteria here
        if (particles[0].alpha < 0.001) particles.splice(0, params.N_PARTICLES - 1);
    }*/
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

start();