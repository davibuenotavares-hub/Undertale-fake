const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = 400;

// Estado do Jogo
let gameState = 'EXPLORE'; 
let player = { x: 200, y: 200, size: 12, hp: 20 };
let enemy = { hp: 50, name: "MONSTRO", canSpare: false };
let bullets = [];
let keys = {};

// Configuração de Salas
let currentRoom = 0;
const rooms = [
    { color: '#000', enemies: [{ x: 100, y: 100, active: true }] },
    { color: '#0b0b0b', enemies: [{ x: 300, y: 200, active: true }] }
];

// Controles
const setupControls = () => {
    const btns = ['up', 'down', 'left', 'right'];
    btns.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('touchstart', (e) => { e.preventDefault(); keys[id] = true; });
        el.addEventListener('touchend', () => keys[id] = false);
        el.addEventListener('mousedown', () => keys[id] = true);
        el.addEventListener('mouseup', () => keys[id] = false);
    });
};

function startBattle() {
    gameState = 'BATTLE_PLAYER';
    document.getElementById('msg').innerText = "Um inimigo bloqueia o caminho!";
    document.getElementById('dpad').style.display = 'none';
    document.getElementById('battle-menu').style.display = 'grid';
}

function handleAction(action) {
    if (gameState !== 'BATTLE_PLAYER') return;

    if (action === 'agir') {
        document.getElementById('msg').innerText = "Você contou uma piada. O monstro sorriu.";
        enemy.canSpare = true;
        setTimeout(enemyTurn, 1500);
    } else if (action === 'lutar') {
        enemy.hp -= 10;
        document.getElementById('msg').innerText = "Você atacou! 10 de dano.";
        setTimeout(enemyTurn, 1500);
    } else if (action === 'poupar') {
        if (enemy.canSpare) {
            document.getElementById('msg').innerText = "Você poupou o monstro. Vitória!";
            setTimeout(() => {
                gameState = 'EXPLORE';
                document.getElementById('battle-menu').style.display = 'none';
                document.getElementById('dpad').style.display = 'grid';
            }, 2000);
        } else {
            document.getElementById('msg').innerText = "O monstro ainda quer lutar.";
            setTimeout(enemyTurn, 1000);
        }
    }
}

function enemyTurn() {
    gameState = 'BATTLE_ENEMY';
    bullets = [];
    let start = Date.now();
    player.x = 200; player.y = 200;

    const interval = setInterval(() => {
        if (Date.now() - start > 4000) { // 4 segundos de ataque
            clearInterval(interval);
            gameState = 'BATTLE_PLAYER';
            document.getElementById('msg').innerText = "Sua vez!";
        }
        if (Math.random() < 0.1) {
            bullets.push({ x: Math.random() * 200 + 100, y: 100, speed: 4 });
        }
    }, 50);
}

function update() {
    if (gameState === 'EXPLORE') {
        if (keys.up) player.y -= 3;
        if (keys.down) player.y += 3;
        if (keys.left) player.x -= 3;
        if (keys.right) player.x += 3;

        // Colisão com inimigo
        rooms[currentRoom].enemies.forEach(e => {
            if (e.active && Math.hypot(player.x - e.x, player.y - e.y) < 20) {
                e.active = false;
                startBattle();
            }
        });
    }

    if (gameState === 'BATTLE_ENEMY') {
        bullets.forEach((b, i) => {
            b.y += b.speed;
            if (Math.hypot(player.x - b.x, player.y - b.y) < 10) {
                player.hp -= 0.2;
                document.getElementById('hp').innerText = Math.floor(player.hp);
                bullets.splice(i, 1);
            }
        });
        // Movimento no box de batalha
        if (keys.up && player.y > 110) player.y -= 4;
        if (keys.down && player.y < 290) player.y += 4;
        if (keys.left && player.x > 110) player.x -= 4;
        if (keys.right && player.x < 290) player.x += 4;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'EXPLORE') {
        ctx.fillStyle = rooms[currentRoom].color;
        ctx.fillRect(0, 0, 400, 400);
        // Desenha inimigos
        ctx.fillStyle = "white";
        rooms[currentRoom].enemies.forEach(e => { if(e.active) ctx.fillRect(e.x-10, e.y-10, 20, 20); });
    }

    if (gameState === 'BATTLE_ENEMY') {
        ctx.strokeStyle = "white";
        ctx.strokeRect(100, 100, 200, 200);
        ctx.fillStyle = "white";
        bullets.forEach(b => ctx.fillRect(b.x-5, b.y-5, 10, 10));
    }

    // Desenha Player (Sempre Coração)
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.size/2, 0, Math.PI*2);
    ctx.fill();
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

setupControls();
loop();
          
