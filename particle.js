const colors = ['#00FF99', '#99FFD3', '#00FFFF'];

class Particle {

    vx;
    vy;
    x;
    y;
    x0;
    y0;
    canvas;
    alpha;
    decay;
    color;
    r;
    arc_length;

    constructor(x, y, canvas) {

        this.canvas = canvas;
        this.alpha = 1;
        this.initial_distance = Math.random() * 10;
        this.arc_length = Math.PI * 2;// Math.random() * Math.PI * 2;

        this.r = params.PARTICLE_RADIUS;


        this.color = params.PARTICLE_COLOR;//'cyan';//colors[Math.ceil(Math.random() * 3)-1];//'turquoise'; //`rgb(0, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

        this.decay = Math.random() / params.DECAY_INCREMENT + (1 / params.MIN_DECAY);

        this.x = x;
        this.y = y;

        this.x0 = x;
        this.y0 = y;

        

        this.getVelocity();

        /*
        console.log(this.vx, this.vy);
        this.vx += vx0 * 10;
        this.vy += vy0 * 10;
        console.log(this.vx, this.vy);
        */


        this.xmax = canvas.W;
        this.ymax = canvas.H;

    }

    getCell() {

        const cell_size = this.canvas.cell_size;

        return {

            i : Math.floor(this.x / cell_size),
            j : Math.floor(this.y / cell_size)

        }

    }

    getVelocity() {

        const {i, j} = this.getCell();

        const n = fluid.getIndex(i, j);
        
        this.vx = fluid.Vx[n];
        this.vy = fluid.Vy[n];

        console.log(i, j, n, this.vx, this.vy)


    }

    update() {

        const cell_size = cv.cell_size;

        this.getVelocity();

        //this.alpha = (1 - this.decay) * this.alpha;
        //this.r = (1 - this.decay) * this.r;

        this.x0 = this.x;
        this.y0 = this.y;

        this.x += this.vx * 1;
        this.y += this.vy * 1;

        if (this.x >= this.xmax) this.x = 1;
        if (this.x <= 0) this.x = this.xmax-1;
        if (this.y >= this.ymax) this.y = 1;
        if (this.y <= 0) this.y = this.ymax-1;

    }

    render() {

        //cv.ctx.strokeStyle = 'cyan';
        cv.ctx.fillStyle = this.color;//'blue';
        cv.ctx.lineWidth = 1;
        cv.ctx.beginPath();
        cv.ctx.globalAlpha = this.alpha;
        //cv.ctx.moveTo(this.x0, this.y0);
        cv.ctx.arc(this.x, this.y, this.r, 0, this.arc_length);//Math.PI * 2);
        //cv.ctx.lineTo(this.x, this.y);
        cv.ctx.fill();
        //cv.ctx.strokeStyle = 'white';
        //cv.ctx.filter = "blur(1px)";
        //cv.ctx.stroke();
        cv.ctx.closePath();
        //cv.ctx.stroke();

    }

    step(i) {

        this.update();
        this.render();
        if (this.alpha < 0.001) this.alpha = 0.0001; // makes sure the last alpha is zero, to avoid "shadows" after the particle was removed
        if (this.alpha <= 0.0001) particles.splice(i, 1); // now that alpha is really zero and the particle was last rendered with this alpha = 0, remove the particle, leaving no traces

    }


}

let particles = [];

const Np = 20;

function generate_particles(N, x0, y0) {

    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI * 2 / N) {

        const v = Vec.fromAngle(theta);

        const r = Math.random() * params.SPREAD * cv.cell_size + cv.cell_size;

        //console.log(v);

        const new_p = new Particle(x0 + v.x * r, y0 + v.y * r, cv);

        particles.push(new_p);

    }

}