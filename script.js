const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player = { x: 180, y: 500, width: 40, height: 40, speed: 5 };
let bullets = [];
let enemies = [];
let score = 0;
let health = 3;
let paused = false;
let enemySpeed = 2;

function drawPlayer() {
  ctx.fillStyle = "cyan";
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
  ctx.fillStyle = "yellow";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, 4, 10));
}

function drawEnemies() {
  ctx.fillStyle = "red";
  enemies.forEach(e => ctx.fillRect(e.x, e.y, 40, 40));
}

function moveBullets() {
  bullets.forEach(b => b.y -= 7);
  bullets = bullets.filter(b => b.y > 0);
}

function moveEnemies() {
  enemies.forEach(e => e.y += enemySpeed);
  enemies = enemies.filter(e => e.y < canvas.height);
}

function spawnEnemy() {
  const x = Math.random() * (canvas.width - 40);
  enemies.push({ x, y: -40 });
}

function detectCollision() {
  enemies.forEach((e, ei) => {
    bullets.forEach((b, bi) => {
      if (b.x < e.x + 40 && b.x + 4 > e.x && b.y < e.y + 40 && b.y + 10 > e.y) {
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
        document.getElementById("score").innerText = score;
      }
    });

    if (
      e.x < player.x + player.width &&
      e.x + 40 > player.x &&
      e.y < player.y + player.height &&
      e.y + 40 > player.y
    ) {
      enemies.splice(ei, 1);
      health--;
      document.getElementById("health").innerText = health;
      if (health <= 0) gameOver();
    }
  });
}

function gameOver() {
  alert("Game Over! Final Score: " + score);
  score = 0;
  health = 3;
  enemySpeed = 2;
  enemies = [];
  bullets = [];
  document.getElementById("score").innerText = score;
  document.getElementById("health").innerText = health;
}

function update() {
  if (paused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawBullets();
  drawEnemies();
  moveBullets();
  moveEnemies();
  detectCollision();

  if (Math.random() < 0.02) spawnEnemy();
  if (score > 0 && score % 100 === 0) enemySpeed += 0.5; // harder every 100 pts

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
  if (e.key === "ArrowRight" && player.x < canvas.width - player.width) player.x += player.speed;
  if (e.key === " " || e.key === "ArrowUp") {
    bullets.push({ x: player.x + player.width / 2, y: player.y });
  }
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  paused = !paused;
  document.getElementById("pauseBtn").innerText = paused ? "▶️" : "⏸️";
  if (!paused) update();
});

update();