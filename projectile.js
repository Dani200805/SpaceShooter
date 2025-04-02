class Projectile {
    constructor(canvas, x, y) {
        this.width = 25;
        this.height = 50;
        this.x = x;
        this.y = y;
        this.speed = 7;
        this.canvas = this.canvas
        this.ctx = canvas.getContext('2d');

        this.image = new Image();
        this.image.src = '/img/bullet1.png';
    }
  
    move() {
        this.y -= this.speed;
    }
  
    draw() {
        this.ctx.strokeRect(this.x, this.y, this.width, this.height)
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  
    isOutOfBounds() {
        return this.y < 0;
    }
}

export default Projectile