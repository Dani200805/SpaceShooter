import Game from "./game.js"
import Projectile from "./projectile.js"
import state from "./state.js"

const canvas = document.getElementById('gameCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;


const game = new Game(canvas);

let fireRate = 3

setInterval(() => {
    game.projectiles.push(new Projectile(canvas, game.player.x + game.player.width / 2 - 2.5, game.player.y));
}, fireRate * 100);

window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        game.player.setDirection(e.key);
    }
    if (e.key == 'Escape') {
        if (state.isStopped) {
            state.isStopped = false;
        }
        else {
            state.isStopped = true;
        }
        console.debug(state.isStopped)
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        game.player.stop();
    }
});


game.start();
