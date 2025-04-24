export class BaseObject {
    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.isActive = true
    }

    draw(ctx) {
        if (!this.isActive) return
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    collidesWith(other) {
        if (!this.isActive || !other.isActive) return false

        return !(
            this.x > other.x + other.width ||
            this.x + this.width < other.x ||
            this.y > other.y + other.height ||
            this.y + this.height < other.y
        )
    }
}

export class Player extends BaseObject {
    constructor(x, y, width, height, color, speed, canvasWidth, image) {
        super(x, y, width, height, color)
        this.speed = speed
        this.canvasWidth = canvasWidth
        this.lives = 3
        this.image = image
    }

    moveLeft() {
        this.x = Math.max(0, this.x - this.speed)
    }

    moveRight() {
        this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed)
    }

    draw(ctx) {
        if (!this.isActive) return

        if (this.image) {
          
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        } else {
          
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.moveTo(this.x + this.width / 2, this.y)
            ctx.lineTo(this.x + this.width, this.y + this.height)
            ctx.lineTo(this.x, this.y + this.height)
            ctx.closePath()
            ctx.fill()
        }
    }
}

export class Bullet extends BaseObject {
    constructor(x, y, width, height, color, speed, image) {
        super(x, y, width, height, color)
        this.speed = speed
        this.image = image
    }

    update() {
        this.y -= this.speed
        if (this.y + this.height < 0) {
            this.isActive = false
        }
        return this.isActive
    }

    draw(ctx) {
        if (!this.isActive) return

        if (this.image) {
          
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        } else {
          
            ctx.fillStyle = this.color
            ctx.fillRect(this.x, this.y, this.width, this.height)
        }
    }
}

export class Enemy extends BaseObject {
    constructor(x, y, width, height, color, speed, image) {
        super(x, y, width, height, color)
        this.speed = speed
        this.image = image
    }

    update(canvasHeight) {
        this.y += this.speed
        if (this.y > canvasHeight) {
            this.isActive = false
            return true
        }
        return false
    }

    draw(ctx) {
        if (!this.isActive) return

        if (this.image) {
          
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
        } else {
          
            ctx.fillStyle = this.color
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(this.x + this.width, this.y)
            ctx.lineTo(this.x + this.width / 2, this.y + this.height)
            ctx.closePath()
            ctx.fill()
        }
    }
}

export class PowerUp extends BaseObject {
    constructor(x, y, size, type, speed, image) {
      
        const colors = {
            extraLife: "#FF5733",
            speedBoost: "#33FF57",
            weaponUpgrade: "#3357FF",
            shield: "#F033FF",
            scoreMultiplier: "#FFFF33",
        }

        super(x, y, size, size, colors[type] || "#FFFFFF")
        this.type = type
        this.speed = speed
        this.image = image
        this.rotation = 0
        this.rotationSpeed = (Math.random() * 2 - 1) * 0.05
    }

    update(canvasHeight) {
      
        this.y += this.speed

      
        this.rotation += this.rotationSpeed

      
        if (this.y > canvasHeight) {
            this.isActive = false
        }

        return this.isActive
    }

    draw(ctx) {
        if (!this.isActive) return

      
        ctx.save()

      
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2)
        ctx.rotate(this.rotation)

        if (this.image) {
          
            ctx.drawImage(this.image, -this.width / 2, -this.height / 2, this.width, this.height)
        } else {
          
            ctx.fillStyle = this.color

          
            switch (this.type) {
                case "extraLife":
                  
                    ctx.beginPath()
                    ctx.moveTo(0, -this.height / 4)
                    ctx.bezierCurveTo(this.width / 4, -this.height / 2, this.width / 2, -this.height / 4, 0, this.height / 4)
                    ctx.bezierCurveTo(-this.width / 2, -this.height / 4, -this.width / 4, -this.height / 2, 0, -this.height / 4)
                    ctx.fill()
                    break

                case "speedBoost":
                  
                    ctx.beginPath()
                    ctx.moveTo(-this.width / 4, -this.height / 2)
                    ctx.lineTo(this.width / 8, -this.height / 8)
                    ctx.lineTo(-this.width / 8, this.height / 8)
                    ctx.lineTo(this.width / 4, this.height / 2)
                    ctx.lineTo(0, 0)
                    ctx.closePath()
                    ctx.fill()
                    break

                case "weaponUpgrade":
                  
                    ctx.beginPath()
                    for (let i = 0; i < 5; i++) {
                        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2
                        const outerX = Math.cos(angle) * (this.width / 2)
                        const outerY = Math.sin(angle) * (this.height / 2)

                        const innerAngle = angle + Math.PI / 5
                        const innerX = Math.cos(innerAngle) * (this.width / 4)
                        const innerY = Math.sin(innerAngle) * (this.height / 4)

                        if (i === 0) {
                            ctx.moveTo(outerX, outerY)
                        } else {
                            ctx.lineTo(outerX, outerY)
                        }

                        ctx.lineTo(innerX, innerY)
                    }
                    ctx.closePath()
                    ctx.fill()
                    break

                case "shield":
                  
                    ctx.beginPath()
                    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2)
                    ctx.fill()

                  
                    ctx.fillStyle = "#000"
                    ctx.beginPath()
                    ctx.arc(0, 0, this.width / 3, 0, Math.PI * 2)
                    ctx.fill()
                    break

                case "scoreMultiplier":
                  
                    ctx.beginPath()
                    ctx.moveTo(0, -this.height / 2)
                    ctx.lineTo(this.width / 2, 0)
                    ctx.lineTo(0, this.height / 2)
                    ctx.lineTo(-this.width / 2, 0)
                    ctx.closePath()
                    ctx.fill()
                    break

                default:
                  
                    ctx.beginPath()
                    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2)
                    ctx.fill()
            }
        }

      
        ctx.restore()
    }

  
    applyEffect(player) {
      
        console.log(`Power-up of type ${this.type} collected!`)

      
        return this.type
    }
}

export class Explosion {
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.lifetime = 20
        this.particles = []
        this.isActive = true

      
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.x,
                y: this.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: (Math.random() * size) / 2 + 2,
                color: `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
            })
        }
    }

    update() {
        this.lifetime--

        for (const particle of this.particles) {
            particle.x += particle.vx
            particle.y += particle.vy
            particle.size *= 0.95
        }

        if (this.lifetime <= 0) {
            this.isActive = false
        }

        return this.isActive
    }

    draw(ctx) {
        if (!this.isActive) return

        for (const particle of this.particles) {
            ctx.fillStyle = particle.color
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            ctx.fill()
        }
    }
}
