// ----- Basic game: player, bullets, enemies, score, lives ----- //
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let W = canvas.width;
let H = canvas.height;

function resizeCanvasToDisplaySize() {
  const ratio = Math.min(window.innerWidth, 820) / 820;
  const newW = Math.floor(720 * ratio);
  const newH = Math.floor(480 * ratio);
  canvas.style.width = newW + 'px';
  canvas.style.height = newH + 'px';
}
window.addEventListener('resize', resizeCanvasToDisplaySize);
resizeCanvasToDisplaySize();

// game state
let scoreEl = document.getElementById('score');
let livesEl = document.getElementById('lives');
let overlay = document.getElementById('overlay');
let finalScore = document.getElementById('finalScore');
let restartBtn = document.getElementById('restartBtn');

let score = 0;
let lives = 3;
let running = true;

function resetGame() {
  score = 0; lives = 3;
  player.x = W/2;
  bullets = [];
  enemies = [];
  enemyTimer = 0;
  running = true;
  overlay.classList.add('hidden');
  updateHUD();
}
restartBtn.addEventListener('click', resetGame);

// player
const player = {
  x: W/2,
  y: H - 50,
  w: 40,
  h: 14,
  speed: 5,
  cooldown: 0
};

// input
let left = false, right = false, shooting = false;
document.addEventListener('keydown', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') left=true;
  if(e.key === 'ArrowRight' || e.key === 'd') right=true;
  if(e.key === ' ' || e.key === 'ArrowUp') shooting=true;
});
document.addEventListener('keyup', e=>{
  if(e.key === 'ArrowLeft' || e.key === 'a') left=false;
  if(e.key === 'ArrowRight' || e.key === 'd') right=false;
  if(e.key === ' ' || e.key === 'ArrowUp') shooting=false;
});

// mobile controls
document.getElementById('leftBtn').addEventListener('touchstart', e=>{ e.preventDefault(); left=true; });
document.getElementById('leftBtn').addEventListener('touchend', e=>{ e.preventDefault(); left=false; });
document.getElementById('rightBtn').addEventListener('touchstart', e=>{ e.preventDefault(); right=true; });
document.getElementById('rightBtn').addEventListener('touchend', e=>{ e.preventDefault(); right=false; });
document.getElementById('shootBtn').addEventListener('touchstart', e=>{ e.preventDefault(); shooting=true; });
document.getElementById('shootBtn').addEventListener('touchend', e=>{ e.preventDefault(); shooting=false; });

// bullets & enemies
let bullets = [];
let enemies = [];
let enemyTimer = 0;
let spawnRate = 60; // frames

function spawnEnemy() {
  const size = 18 + Math.random()*22;
  enemies.push({
    x: 20 + Math.random()*(W-40),
    y: -size,
    w: size,
    h: size,
    speed: 1 + Math.random()*2.2
  });
}

// HUD
function updateHUD(){
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

// game loop
function gameOver(){
  running = false;
  finalScore.textContent = score;
  document.getElementById('endTitle').textContent = 'Game Over';
  overlay.classList.remove('hidden');
}

function loop(){
  if(running){
    // update
    if(left) player.x -= player.speed;
    if(right) player.x += player.speed;
    player.x = Math.max(player.w/2, Math.min(W-player.w/2, player.x));

    // shooting
    if(player.cooldown > 0) player.cooldown--;
    if(shooting && player.cooldown === 0){
      bullets.push({x: player.x, y: player.y - 10, r: 4, speed: -6});
      player.cooldown = 10;
    }

    // update bullets
    for(let i = bullets.length-1; i>=0; i--){
      bullets[i].y += bullets[i].speed;
      if(bullets[i].y < -10) bullets.splice(i,1);
    }

    // spawn enemies
    enemyTimer++;
    if(enemyTimer >= spawnRate){
      enemyTimer = 0;
      spawnEnemy();
      if(spawnRate > 20) spawnRate -= 0.4; // progressively faster
    }

    // update enemies and collisions
    for(let i = enemies.length-1; i>=0; i--){
      enemies[i].y += enemies[i].speed;
      // collision with bullets
      for(let j = bullets.length-1; j>=0; j--){
        const b = bullets[j];
        const e = enemies[i];
        if(b.x > e.x - e.w/2 && b.x < e.x + e.w/2 && b.y > e.y - e.h/2 && b.y < e.y + e.h/2){
          // hit
          bullets.splice(j,1);
          enemies.splice(i,1);
          score += 10;
          updateHUD();
          break;
        }
      }
      // enemy hits bottom
      if(enemies[i] && enemies[i].y > H + enemies[i].h){
        enemies.splice(i,1);
        lives--;
        updateHUD();
        if(lives <= 0) gameOver();
      }
    }
  }

  // draw
  draw();
  requestAnimationFrame(loop);
}

// draw function
function draw(){
  // clear
  ctx.clearRect(0,0,W,H);

  // background grid
  ctx.fillStyle = '#021018';
  ctx.fillRect(0,0,W,H);

  // player
  ctx.save();
  ctx.translate(player.x, player.y);
  // ship body
  ctx.fillStyle = '#3ec1ff';
  ctx.beginPath();
  ctx.moveTo(-player.w/2,0);
  ctx.lineTo(player.w/2,0);
  ctx.lineTo(player.w/2,player.h);
  ctx.lineTo(-player.w/2,player.h);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // bullets
  ctx.fillStyle = '#ffd166';
  bullets.forEach(b=>{
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
    ctx.fill();
  });

  // enemies
  ctx.fillStyle = '#ff5c7c';
  enemies.forEach(e=>{
    ctx.beginPath();
    ctx.rect(e.x - e.w/2, e.y - e.h/2, e.w, e.h);
    ctx.fill();
  });

  // small HUD inside canvas (optional)
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(6,6,110,28);
  ctx.fillStyle = '#fff';
  ctx.font = '12px Arial';
  ctx.fillText('SPlayDforT — Shoot & Survive', 12, 24);
}

// initial
updateHUD();
loop();

// Keep internal canvas size fixed so collisions remain consistent even if display size changes
(function fixCanvasSize(){
  canvas.width = 720;
  canvas.height = 480;
  W = canvas.width;
  H = canvas.height;
})();
