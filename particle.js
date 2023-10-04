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
    speed;

    constructor(x, y, canvas, alpha) {

        this.canvas = canvas;
        this.alpha = alpha;
        this.initial_distance = Math.random() * 10;
        this.arc_length = Math.PI * 2;// Math.random() * Math.PI * 2;
        this.speed = 10;

        this.r = params.PARTICLE_RADIUS;

        this.color = params.PARTICLE_COLOR;//'cyan';//colors[Math.ceil(Math.random() * 3)-1];//'turquoise'; //`rgb(0, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

        this.decay = Math.random() / params.DECAY_INCREMENT + (1 / params.MIN_DECAY);

        this.x = x;
        this.y = y;

        this.x0 = x;
        this.y0 = y;

        const {i, j} = this.getCell();
        this.canvas.highlightCell(i,j);

        this.getVelocity();

        this.xmax = canvas.w;
        this.ymax = canvas.h;

    }

    getCell() {

        return this.canvas.getCell(this.x, this.y);

    }

    getVelocity() {

        const {i, j} = this.getCell();

        return flowField.getVelocity(i, j);

    }

    update() {

        const cell_size = cv.cell_size;

        const v = this.getVelocity();

        const vx = v.x;
        const vy = v.y;

        this.vx = vx;
        this.vy = vy;

        //this.alpha = (1 - this.decay) * this.alpha;
        //this.r = (1 - this.decay) * this.r;

        this.x0 = this.x;
        this.y0 = this.y;

        this.x += vx * this.speed;
        this.y += vy * this.speed;

        if (this.x >= this.xmax) this.x = 1;
        if (this.x <= 0) this.x = this.xmax-1;
        if (this.y >= this.ymax) this.y = 1;
        if (this.y <= 0) this.y = this.ymax-1;

    }

    render() {

        const m = this.canvas.margin;

        const ctx = this.canvas.ctx;
        //cv.ctx.strokeStyle = 'cyan';
        ctx.fillStyle = this.color;//'blue';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        //cv.ctx.moveTo(this.x0, this.y0);
        ctx.arc(m + this.x, m + this.y, this.r, 0, this.arc_length);//Math.PI * 2);
        //cv.ctx.lineTo(this.x, this.y);
        ctx.fill();
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

const Np = 20;

function generate_particles(N, x0, y0) {

    for (let theta = 0; theta < Math.PI * 2; theta += Math.PI * 2 / N) {

        const v = Vec.fromAngle(theta);

        const r = Math.random() * params.SPREAD * cv.cell_size + cv.cell_size;

        const new_p = new Particle(x0 + v.x * r, y0 + v.y * r, cv);

        particles.push(new_p);

    }

}