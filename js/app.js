const canvas = document.getElementById('webgl-bg');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported');
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener('resize', resize);
resize();

const vsSource = `
    attribute vec2 aPosition;
    attribute float aSize;
    attribute vec3 aColor;
    varying vec3 vColor;
    void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        gl_PointSize = aSize;
        vColor = aColor;
    }
`;

const fsSource = `
    precision mediump float;
    varying vec3 vColor;
    void main() {
        // Draw nice soft circles instead of hard squares
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) {
            discard;
        }
        float alpha = smoothstep(0.5, 0.1, dist) * 0.4;
        gl_FragColor = vec4(vColor, alpha);
    }
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);

const program = gl.createProgram();
gl.attachShader(program, vs);
gl.attachShader(program, fs);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking failed');
}

gl.useProgram(program);

const numPoints = 120;
const points = [];

for (let i = 0; i < numPoints; i++) {
    points.push({
        x: (Math.random() * 2) - 1,
        y: (Math.random() * 2) - 1,
        vx: (Math.random() - 0.5) * 0.002,
        vy: (Math.random() - 0.5) * 0.002,
        size: Math.random() * 6 + 2,
        color: Math.random() > 0.5 ? [1.0, 0.36, 0.59] : [0.36, 0.83, 1.0]
    });
}

let mouseX = 0, mouseY = 0;
window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
});

const positionBuffer = gl.createBuffer();
const sizeBuffer = gl.createBuffer();
const colorBuffer = gl.createBuffer();

const aPosition = gl.getAttribLocation(program, 'aPosition');
const aSize = gl.getAttribLocation(program, 'aSize');
const aColor = gl.getAttribLocation(program, 'aColor');

gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

function render() {
    gl.clearColor(0.027, 0.035, 0.055, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const positions = [];
    const sizes = [];
    const colors = [];

    points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -1 || p.x > 1) p.vx *= -1;
        if (p.y < -1 || p.y > 1) p.vy *= -1;

        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 0.4) {
            p.x -= dx * 0.01;
            p.y -= dy * 0.01;
        }

        positions.push(p.x, p.y);
        sizes.push(p.size);
        colors.push(...p.color);
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aSize);
    gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aColor);
    gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, numPoints);

    requestAnimationFrame(render);
}

render();