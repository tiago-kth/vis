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

                const vec = Vec.fromAngle(Math.PI * v);

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

            console.log(vec.angle);

            ctx.save();
            ctx.strokeStyle = params.VECTOR_COLOR;
            ctx.translate(x, y);


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