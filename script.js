const canvas = document.getElementById('glitchCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const input = document.getElementById('textInput');
const shredSlider = document.getElementById('shredRange');
let currentPage = 'text';
let manualShred = 150;
let currentAnimShred = 150;
let targetShred = 150;
const speed = 0.2;
const letterSpacing = -10; 

function getRealWidth(text) {
    let width = 0;
    for (let char of text) {
        width += ctx.measureText(char).width + letterSpacing;
    }
    return width - letterSpacing;
}

function draw() {
    const text = input.value || "ELECTRIC";
    const W = 1200, H = 800;
    const padding = 100;
    const maxWidth = W - padding * 2;
    const fontSize = 180;
    const lineHeight = fontSize * 0.8;
    
    canvas.width = W; canvas.height = H;
    ctx.font = `900 ${fontSize}px "Bebas Neue"`;
    ctx.fillStyle = 'black'; ctx.fillRect(0, 0, W, H);

    const paragraphs = text.toUpperCase().split('\n');
    const lines = [];
    paragraphs.forEach(para => {
        const words = para.split(' ');
        let currentLine = words[0] || "";
        for (let i = 1; i < words.length; i++) {
            if (getRealWidth(currentLine + " " + words[i]) < maxWidth) currentLine += " " + words[i];
            else { lines.push(currentLine); currentLine = words[i]; }
        }
        lines.push(currentLine);
    });

    const tCtx = document.createElement('canvas').getContext('2d');
    tCtx.canvas.width = W; tCtx.canvas.height = H;
    tCtx.font = ctx.font; tCtx.fillStyle = 'white';
    
    let startY = H - padding - (lines.length * lineHeight) + lineHeight/3;

    lines.forEach((line, i) => {
        let currentX = W - padding - getRealWidth(line);
        for (let char of line) {
            tCtx.fillText(char, currentX, startY + i * lineHeight);
            currentX += ctx.measureText(char).width + letterSpacing;
        }
    });

    const pixels = tCtx.getImageData(0, 0, W, H).data;
    const shredForce = (currentPage === 'anim') ? currentAnimShred : manualShred;

    for (let x = 0; x < W; x++) {
        const columnShred = Math.pow(Math.random(), 1.5) * shredForce;
        for (let y = 0; y < H; y++) {
            if (pixels[(y * W + x) * 4] > 200 && columnShred > 10) {
                ctx.fillStyle = 'rgba(198, 117, 255, 0.69)'; ctx.fillRect(x, y - columnShred, 1, columnShred);
                ctx.fillStyle = 'rgb(128, 0, 255)'; ctx.fillRect(x-1, y - (columnShred * 0.9), 1, columnShred * 0.7);
                ctx.fillStyle = 'white'; ctx.fillRect(x-1.5, y - (columnShred * 0.4), 1, columnShred * 0.3);
            }
        }
    }
    
    ctx.fillStyle = 'white';
    lines.forEach((line, i) => {
        let currentX = W - padding - getRealWidth(line);
        for (let char of line) {
            ctx.fillText(char, currentX, startY + i * lineHeight);
            currentX += ctx.measureText(char).width + letterSpacing;
        }
    });
}

function animate() {
    if (currentPage === 'anim') {
        if (Math.abs(currentAnimShred - targetShred) < 20) targetShred = [150, 300, 300, 150, 150, 75][Math.floor(Math.random() * 6)];
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
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        if (data[i] === 0 && data[i+1] === 0 && data[i+2] === 0) data[i+3] = 0;
    }
    ctx.putImageData(imageData, 0, 0);
    const link = document.createElement('a');
    link.download = `shred-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    draw();
});

document.fonts.load('900 180px "Bebas Neue"').then(draw);
