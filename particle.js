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
    exit = false;
    steps = 0;

    constructor(x, y, canvas, alpha) {

        this.canvas = canvas;
        this.alpha = alpha;
        this.initial_distance = Math.random() * 10;
        this.arc_length = Math.PI * 2;// Math.random() * Math.PI * 2;
        this.speed = .25;

        this.r = params.PARTICLE_RADIUS;

        this.color = params.PARTICLE_COLOR;//'cyan';//colors[Math.ceil(Math.random() * 3)-1];//'turquoise'; //`rgb(0, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

        this.decay = Math.random() / params.DECAY_INCREMENT + (1 / params.MIN_DECAY);

        this.x = x;
        this.y = y;

        this.x0 = x;
        this.y0 = y;

        const {i, j} = this.getCell();
        //this.canvas.highlightCell(i,j);

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

        this.step++;

    }

    treat_edges() {

        const m = this.canvas.margin;

        if (this.x >= this.xmax - m - 1) {
            this.exit = true;
            this.x = m + 1;
            this.x0 = this.x;
        }

        if (this.x <= m + 1) {
            this.exit = true;
            this.x = this.xmax - m - 1;
            this.x0 = this.x
        }

        if (this.y >= this.ymax - m + 1) {
            this.exit = true;
            this.y = m + 1;
            this.y0 = this.y;
        }

        if (this.y <= m + 1) {
            this.exit = true;
            this.y = this.ymax - m - 1;
            this.y0 = this.y;
        }

    }

    render() {

        const m = this.canvas.margin;

        const ctx = this.canvas.ctx;
        ctx.save();
        //cv.ctx.strokeStyle = 'cyan';
        ctx.fillStyle = this.color;//'blue';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        cv.ctx.moveTo(m + this.x0, m + this.y0);
        //ctx.arc(m + this.x, m + this.y, this.r, 0, this.arc_length);//Math.PI * 2);
        cv.ctx.lineTo(m + this.x, m +this.y);
        //ctx.arc(m + this.x, m + this.y, this.r, 0, this.arc_length);//Math.PI * 2);
        //ctx.fill();
        cv.ctx.strokeStyle = this.color;
        //cv.ctx.filter = "blur(1px)";
        cv.ctx.stroke();
        cv.ctx.closePath();
        ctx.restore();
        //cv.ctx.stroke();

    }

    step(i) {

        this.update();
        this.render();
        //if (this.alpha < 0.001) this.alpha = 0.0001; // makes sure the last alpha is zero, to avoid "shadows" after the particle was removed
        if (this.exit) particles.splice(i, 1); // now that alpha is really zero and the particle was last rendered with this alpha = 0, remove the particle, leaving no traces

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