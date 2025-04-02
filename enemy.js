class Enemy {
    constructor(canvas, x, y) {
        this.width = 50;
        this.height = 50;
        this.x = x;
        this.y = y;
        this.speed = 2;
        this.canvas = canvas
        this.ctx = canvas.getContext('2d');
        
        this.image = new Image();
        this.image.src = '/img/enemy1.png';
    }
  
    move() {
        this.y += this.speed;
    }
  
    draw() {
        this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    }
  
    isOutOfBounds() {
        return this.y > this.canvas.height;
    }
}

export default Enemy