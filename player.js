class Player {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d');
        this.width = 75;
        this.height = 75;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 20;
        this.speed = 5;
        this.dx = 0;

        this.image = new Image();
        this.image.src = '/img/spacefighter1.png';
    }
  
    move() {
        if (this.x + this.dx > 0 && this.x + this.dx < this.canvas.width - this.width) {
            this.x += this.dx;
        }
    }
  
    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  
    setDirection(keyCode) {
        if (keyCode === 'ArrowLeft') this.dx = -this.speed;
        if (keyCode === 'ArrowRight') this.dx = this.speed;
    }
  
    stop() {
        this.dx = 0;
    }
}

export default Player
  