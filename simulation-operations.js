
// Adapted from Mike Ash (https://mikeash.com/pyblog/fluid-simulation-for-dummies.html)
function diffuse(b, x, x0, diffusion) {

    const dt = params.TIME_STEP;

    const a = dt * diffusion * (N - 2) * (N - 2);

    solve_linear(b, x, x0, a, 1 + 6 * a);

}

function project(vX, vY, p, div) {

    const iter = params.ITERATIONS;

    for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
            div[fluid.getIndex(i, j)] = -0.5 * (
                     vX[fluid.getIndex(i+1, j  )]
                    -vX[fluid.getIndex(i-1, j  )]
                    +vY[fluid.getIndex(i  , j+1)]
                    -vY[fluid.getIndex(i  , j-1)]
                )/N;
            p[fluid.getIndex(i, j)] = 0;
        }
    }
    set_bnd(0, div); 
    set_bnd(0, p);
    solve_linear(0, p, div, 1, 6);
    
    for (let j = 1; j < N - 1; j++) {
        for (let i = 1; i < N - 1; i++) {
            vX[fluid.getIndex(i, j)] -= 0.5 * (  p[fluid.getIndex(i+1, j)]
                                            -p[fluid.getIndex(i-1, j)]) * N;
            vY[fluid.getIndex(i, j)] -= 0.5 * (  p[fluid.getIndex(i, j+1)]
                                            -p[fluid.getIndex(i, j-1)]) * N;
        }
    }

    set_bnd(1, vX);
    set_bnd(2, vY);

}

function advect(b, d, d0, vX, vY) {

    // b controls the set boundaries

    const dt = params.TIME_STEP;
    
    let i0, i1, j0, j1;
    
    let dtx = dt * (N - 2);
    let dty = dt * (N - 2);
    
    let s0, s1, t0, t1;
    let tmp1, tmp2, x, y;
    
    let Nfloat = N - 2;
    let ifloat, jfloat;
    let i, j;
    
    for(j = 1, jfloat = 1; j < N - 1; j++, jfloat++) { 

        for(i = 1, ifloat = 1; i < N - 1; i++, ifloat++) {

            tmp1 = dtx * vX[fluid.getIndex(i, j)];
            tmp2 = dty * vY[fluid.getIndex(i, j)];

            x    = ifloat - tmp1; 
            y    = jfloat - tmp2;
            
            if(x < 0.5) x = 0.5; 
            if(x > Nfloat + 0.5) x = Nfloat + 0.5; 
            i0 = Math.floor(x); 
            i1 = i0 + 1.0;
            if(y < 0.5) y = 0.5; 
            if(y > Nfloat + 0.5) y = Nfloat + 0.5; 
            j0 = Math.floor(y);
            j1 = j0 + 1.0; 
                
            s1 = x - i0; 
            s0 = 1.0 - s1; 
            t1 = y - j0; 
            t0 = 1.0 - t1;
            
            let i0i = parseInt(i0);
            let i1i = parseInt(i1);
            let j0i = parseInt(j0);
            let j1i = parseInt(j1);
            
            d[fluid.getIndex(i, j)] = 
            
                s0 * ( t0 * d0[fluid.getIndex(i0i, j0i)] + t1 * d0[fluid.getIndex(i0i, j1i)] )
                +
                s1 * ( t0 * d0[fluid.getIndex(i1i, j0i)] + t1 * d0[fluid.getIndex(i1i, j1i)] );
        }

    }

    set_bnd(b, d);
}

function set_bnd(b, x) {

    // reverses the velocities at the boundaries 
    for(let i = 1; i < N - 1; i++) {
        x[fluid.getIndex(i, 0   )] = b == 2 ? -x[fluid.getIndex(i, 1  )] : x[fluid.getIndex(i, 1  )];
        x[fluid.getIndex(i, N-1 )] = b == 2 ? -x[fluid.getIndex(i, N-2)] : x[fluid.getIndex(i, N-2)];
    }
        
    for(let j = 1; j < N - 1; j++) {
        x[fluid.getIndex(0  , j)] = b == 1 ? -x[fluid.getIndex(1  , j)] : x[fluid.getIndex(1  , j)];
        x[fluid.getIndex(N-1, j)] = b == 1 ? -x[fluid.getIndex(N-2, j)] : x[fluid.getIndex(N-2, j)];
    }
    
    x[fluid.getIndex(0, 0)]     = 0.5 * ( x[fluid.getIndex(1, 0)] + x[fluid.getIndex(0, 1)] );

    x[fluid.getIndex(0, N-1)]   = 0.5 * (x[fluid.getIndex(1, N-1)] + x[fluid.getIndex(0, N-2)]);

    x[fluid.getIndex(N-1, 0)]   = 0.5 * (x[fluid.getIndex(N-2, 0)] + x[fluid.getIndex(N-1, 1)]);

    x[fluid.getIndex(N-1, N-1)] = 0.5 * (x[fluid.getIndex(N-2, N-1)] + x[fluid.getIndex(N-1, N-2)]);

}

function solve_linear(b, x, x0, a, c) {

    const iter = params.ITERATIONS;
    const N = cv.N;

    //As stated before, this function is mysterious, but it does some kind of solving. this is done by running through the whole array and setting each cell to a combination of its neighbors. It does this several times; the more iterations it does, the more accurate the results, but the slower things run. In the step function above, four iterations are used. After each iteration, it resets the boundaries so the calculations don't explode.

    const cRecip = 1.0 / c;
    for (let k = 0; k < iter; k++) { // for each iteration
        for (let j = 1; j < N - 1; j++) { // loop through the entire grid (except the boundaries)
            for (let i = 1; i < N - 1; i++) { // ... first along the rows 
                x[fluid.getIndex(i, j)] =
                    (x0[fluid.getIndex(i, j)]
                        + a*(    x[fluid.getIndex(i+1, j  )]
                                +x[fluid.getIndex(i-1, j  )]
                                +x[fluid.getIndex(i  , j+1)]
                                +x[fluid.getIndex(i  , j-1)]
                        )) * cRecip;
            }
        }
        set_bnd(b, x);
    }
}