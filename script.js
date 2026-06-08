const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const input = document.getElementById('textInput');
const shredSlider = document.getElementById('shredRange');
let currentPage = 'text';
let manualShred = 150;
let currentAnimShred = 150;
let targetShred = 150;
const speed = 0.2;

function drawTextWithSpacing(ctx, text, x, y, spacing) {
    let currentX = x;
    for (let char of text) {
        ctx.fillText(char, currentX, y);
        currentX += ctx.measureText(char).width + spacing;
    }
}

function draw() {
    const lines = (input.value || "ELECTRIC").split('\n');
    const W = 1200; const H = 800;
    canvas.width = W; canvas.height = H;
    const spacing = -15;
    const fontSize = 240;

    ctx.font = `900 ${fontSize}px "Bebas Neue"`;
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, W, H);

    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.canvas.width = W; tCtx.canvas.height = H;
    tCtx.font = ctx.font; tCtx.fillStyle = 'white';

    const startY = H - 80 - ((lines.length - 1) * (fontSize * 0.85));
    lines.forEach((line, i) => {
        const text = line.toUpperCase();
        const totalWidth = text.split('').reduce((acc, char) => acc + tCtx.measureText(char).width, 0) + (text.length - 1) * spacing;
        drawTextWithSpacing(tCtx, text, W/2 - totalWidth/2, startY + (i * fontSize * 0.85), spacing);
    });

    const pixels = tCtx.getImageData(0, 0, W, H).data;
    const shredForce = (currentPage === 'anim') ? currentAnimShred : manualShred;

    for (let x = 0; x < W; x++) {
        const columnShred = Math.pow(Math.random(), 1.5) * shredForce;
        for (let y = 0; y < H; y++) {
            if (pixels[(y * W + x) * 4] > 200 && columnShred > 10) {
                ctx.fillStyle = 'rgba(255, 255, 0, 0.1)'; ctx.fillRect(x, y - columnShred, 1, columnShred);
                ctx.fillStyle = 'rgb(0, 255, 0)'; ctx.fillRect(x-1, y - (columnShred * 0.9), 1, columnShred * 0.7);
                ctx.fillStyle = 'white'; ctx.fillRect(x-1.5, y - (columnShred * 0.4), 1, columnShred * 0.3);
            }
        }
    }
    
    ctx.fillStyle = 'white';
    lines.forEach((line, i) => {
        const text = line.toUpperCase();
        const totalWidth = text.split('').reduce((acc, char) => acc + ctx.measureText(char).width, 0) + (text.length - 1) * spacing;
        drawTextWithSpacing(ctx, text, W/2 - totalWidth/2, startY + (i * fontSize * 0.85), spacing);
    });
}

function animate() {
    if (currentPage === 'anim') {
        if (Math.abs(currentAnimShred - targetShred) < 20) {
            const states = [150, 300, 300, 150, 150, 75];
            targetShred = states[Math.floor(Math.random() * states.length)];
        }
        currentAnimShred += (targetShred - currentAnimShred) * speed;
        draw();
        requestAnimationFrame(animate);
    }
}

function showPage(page) {
    currentPage = page;
    document.body.classList.toggle('anim-mode', page === 'anim');
    document.querySelectorAll('.nav button').forEach(b => b.classList.toggle('active', b.innerText === (page === 'text' ? 'ТЕКСТ' : 'АНИМАЦИЯ')));
    if (page === 'anim') animate();
    else draw();
}

shredSlider.addEventListener('input', (e) => { manualShred = parseInt(e.target.value); draw(); });
input.addEventListener('input', draw);

document.getElementById('saveBtn').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = `shred-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

document.fonts.load('900 240px "Bebas Neue"').then(draw);