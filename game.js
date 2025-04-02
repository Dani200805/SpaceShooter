import Enemy from "./enemy.js"
import Player from "./player.js"
import state from "./state.js"

class Game {
    constructor(canvas) {
        this.ctx = canvas.getContext('2d');
        this.player = new Player(canvas);
        this.projectiles = [];
        this.enemies = [];
        this.enemySpawnRate = 100; // ms
        this.enemyTimer = 0;
        this.score = 0;
        this.isGameOver = false;
        this.canvas = canvas
    }
  
    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 50);
        const y = -50;
        this.enemies.push(new Enemy(this.canvas, x, y));
    }
  
    detectCollisions() {
        this.projectiles.forEach((projectile, pIndex) => {
            this.enemies.forEach((enemy, eIndex) => {
            if (
                projectile.x < enemy.x + enemy.width &&
                projectile.x + projectile.width > enemy.x &&
                projectile.y < enemy.y + enemy.height &&
                projectile.y + projectile.height > enemy.y
            ) {
                this.enemies.splice(eIndex, 1);
                this.projectiles.splice(pIndex, 1);
                this.score += 10;
            }
            });
        });
    }
  
    drawScore() {
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 20, 30);
    }
  
    update() {
        if (this.isGameOver) return;
        if (state.isStopped) {
            requestAnimationFrame(this.update.bind(this));
            return
        };
    
        this.player.move();
        this.projectiles.forEach((projectile, index) => {
            projectile.move();
            if (projectile.isOutOfBounds()) this.projectiles.splice(index, 1);
        });
    
        this.enemies.forEach((enemy, index) => {
            enemy.move();
            if (enemy.isOutOfBounds()) {
            this.enemies.splice(index, 1);
            }
        });
    
        this.detectCollisions();
    
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.player.draw();
        this.projectiles.forEach(projectile => projectile.draw());
        this.enemies.forEach(enemy => enemy.draw());
        this.drawScore();
    
        this.enemyTimer++;
        if (this.enemyTimer >= this.enemySpawnRate) {
            this.spawnEnemy();
            this.enemyTimer = 0;
        }
        
        requestAnimationFrame(this.update.bind(this));
    }
  
    start() {
        this.update();
    }
}

export default Game