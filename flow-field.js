class FlowField {

    I;
    J;

    vSize = 20;

    cv;

    vectorField = [];

    constructor(i, j, cv) {

        this.I = i;
        this.J = j;
        this.cv = cv;

    }

    getIJ(index) {

        return {
            i : Math.floor(index % this.I),
            j : Math.floor(index / this.I)
        }

    }

    getIndex(i, j) {

        // deal with invalid values
        return j * this.I + i % this.I;
    }

    getVelocity(i, j) {

        const index = this.getIndex(i,j);

        return this.vectorField[index];

    }

    make_random_field() {

        let index = 0;

        for (let i = 0; i < this.I; i++) {

            for (let j = 0; j < this.J; j++) {

                const v = perlin.get( i/this.I , j/this.J );

                const vec = Vec.fromAngle(Math.PI * v * 4);

                this.vectorField.push(vec);


            }

        }

    }

    render_vectors() {

        const ctx = this.cv.ctx;

        this.vectorField.forEach( (vec,index) => {

            const {i, j} = this.getIJ(index);

            const m = this.cv.margin;
            const x = m + i * this.cv.cell_size;
            const y = m + j * this.cv.cell_size;

            ctx.save();
            ctx.strokeStyle = params.VECTOR_COLOR;
            ctx.translate(x, y);
            
            ctx.globalAlpha = 0.5;

            ctx.font = `${this.vSize}px serif`;
            ctx.textBaseline = "middle";

            ctx.rotate(vec.angle);
            ctx.fillStyle = params.VECTOR_COLOR;
            ctx.fillText('→', 0, 0);
            /*
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(vec.x * this.vSize, vec.y * this.vSize);
            ctx.stroke();
            */
            ctx.restore();


        })

    }

}

class Streamline {

    x0;
    y0;

    x_ant;
    y_ant;

    x;
    y;

    color = 'steelblue';

    step_size;

    nof_steps = 0;

    max_steps;

    canvas;

    vectorField;

    outOfBounds = false;

    constructor(x0, y0, step_size, canvas, vectorField, max_steps) {

        x0 = x0 - canvas.margin;
        y0 = y0 - canvas.margin;

        this.x0 = x0;
        this.y0 = y0;
        this.x_ant = x0;
        this.y_ant = y0;
        this.x = x0;
        this.y = y0;
        this.step_size = step_size;
        this.canvas = canvas;
        this.vectorField = vectorField;
        this.max_steps = max_steps;

    }

    getCell(x, y) {

        return this.canvas.getCell(x, y);

    }

    getVector(x, y) {

        const {i, j} = this.getCell(x, y);

        return this.vectorField.getVelocity(i, j);

    }

    integrateRK4_step() {

        const v1 = this.getVector(this.x, this.y);

        const x2 = this.x + this.step_size * v1.x / 2;
        const y2 = this.y + this.step_size * v1.y / 2;

        const v2 = this.getVector(x2, y2);

        const x3 = this.x + this.step_size * v2.x / 2;
        const y3 = this.y + this.step_size * v2.y / 2;

        const v3 = this.getVector(x3, y3);

        const x4 = this.x + this.step_size * v3.x;
        const y4 = this.y + this.step_size * v3.y;

        const v4 = this.getVector(x4, y4);

        const x_next = this.x + this.step_size * ( v1.x / 6 + v2.x / 3 + v3.x / 3 + v4.x / 6);
        const y_next = this.y + this.step_size * ( v1.y / 6 + v2.y / 3 + v3.y / 3 + v4.y / 6);

        //console.log(v1, v2, v3, v4, x_next, y_next);

        this.x_ant = this.x;
        this.y_ant = this.y;

        this.x = x_next;
        this.y = y_next;

        this.nof_steps++;

    }

    treat_edges() {

        const w = this.canvas.w;
        const h = this.canvas.h;

        const m = this.canvas.margin;

        const x = this.x;
        const y = this.y;

        const xant = this.xant;
        const yant = this.yant;

        if (x >= w - m || x <= m) this.outOfBounds = true;
        if (y >= h - m || y <= m) this.outOfBounds = true;

        /*

        // right edge

        if (x > w)  {
            const t = (w - xant) / (x - xant);
            this.x = w;
            this.y = yant * (1 - t) + y * t;
        }
        
        // left edge
        
        if (position[0] < BBoxMin_[0]) {
            double t = (BBoxMin_[0] - prevPos[0]) / (position[0] - prevPos[0]);
            position[0] = BBoxMin_[0];
            position[1] = prevPos[1] * (1 - t) + position[1] * t;
        }
        
        // top edge
        
        if (position[1] > BBoxMax_[1]) {
            double t = (BBoxMax_[1] - prevPos[1]) / (position[1] - prevPos[1]);
            position[0] = prevPos[0] * (1 - t) + position[0] * t;
            position[1] = BBoxMax_[1];
        }
        
        // bottom edge
        
        if (position[1] < BBoxMin_[1]) {
            double t = (BBoxMin_[1] - prevPos[1]) / (position[1] - prevPos[1]);
            position[0] = prevPos[0] * (1 - t) + position[0] * t;
            position[1] = BBoxMin_[1];
        }
        */

    }

    render_step() {

        const m = this.canvas.margin;

        const ctx = this.canvas.ctx;

        ctx.strokeStyle = this.color;
        ctx.alpha = 1;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.globalAlpha = this.alpha;
        cv.ctx.moveTo(m + this.x_ant, m + this.y_ant);
        cv.ctx.lineTo(m + this.x, m +this.y);
        cv.ctx.stroke();
        cv.ctx.closePath();

    }

    draw(steps = this.max_steps) {

        for (let n = 0; n < steps; n++) {

            this.treat_edges();

            if (this.outOfBounds) break;

            this.integrateRK4_step();
            this.render_step();

        }

    }

    

}