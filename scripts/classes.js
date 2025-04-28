export class BaseObject {
    /**
     * @param {number} x x coordinate of the object
     * @param {number} y initial y coordinate of the object
     * @param {number} width fallback witdh of the object
     * @param {number} height fallback height of the object
     * @param {string} color fallback color of the object
     */
    constructor(x, y, width, height, color) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.color = color
        this.isActive = true
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
    draw(ctx) {
        if (!this.isActive) return
        ctx.fillStyle = this.color
        ctx.fillRect(this.x, this.y, this.width, this.height)
    }

    /**
     * @param {BaseObject} other
     */
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
    /**
     * @param {number} x x coordinate of the object
     * @param {number} y initial y coordinate of the object
     * @param {number} width fallback witdh of the object
     * @param {number} height fallback height of the object
     * @param {string} color fallback color of the object
     * @param {number} speed speed of the player
     * @param {number} canvasWidth width of the canvas
     * @param {HTMLImageElement} image image to be used for the player
     */
    constructor(x, y, width, height, color, speed, canvasWidth, image) {
        super(x, y, width, height, color)
        this.speed = speed
        this.canvasWidth = canvasWidth
        this.lives = 3
        this.image = image
    }

    /**
     * @param {number} deltaTime
     */
    moveLeft(deltaTime) {
        this.x = Math.max(0, this.x - this.speed * deltaTime)
    }

    /**
     * @param {number} deltaTime
     */
    moveRight(deltaTime) {
        this.x = Math.min(this.canvasWidth - this.width, this.x + this.speed * deltaTime)
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
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
    /**
     * @param {number} x x coordinate of the object
     * @param {number} y initial y coordinate of the object
     * @param {number} width fallback witdh of the object
     * @param {number} height fallback height of the object
     * @param {string} color fallback color of the object
     * @param {number} speed speed of the bullet
     * @param {HTMLImageElement} image image to be used for the bullet
     * @param {number} type type of the bullet
     */
    constructor(x, y, width, height, color, speed, image, type) {
        super(x, y, width, height, color)
        this.speed = speed
        this.image = image
        this.type = type
    }

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.y -= this.speed * deltaTime
        if (this.y + this.height < 0) {
            this.isActive = false
        }
        return this.isActive
    }
    
    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
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

    /**
     * @param {number} deltaTime
     * @param {number} canvasHeight
     */
    update(deltaTime, canvasHeight) {
        this.y += this.speed * deltaTime
        if (this.y > canvasHeight) {
            this.isActive = false
            return true
        }
        return false
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
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
    /**
     * @param {number} x x coordinate of the object
     * @param {number} y initial y coordinate of the object
     * @param {number} size size of the object
     * @param {string} type type of the power-up
     * @param {number} speed speed of the power-up
     * @param {HTMLImageElement | null} image image to be used for the power-up
     */
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

    /**
     * @param {number} deltaTime
     * @param {number} canvasHeight
     */
    update(deltaTime, canvasHeight) {
        this.y += this.speed * deltaTime
        this.rotation += this.rotationSpeed * deltaTime

        if (this.y > canvasHeight) {
            this.isActive = false
        }

        return this.isActive
    }

    /**
     * @param {CanvasRenderingContext2D} ctx 
     */
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
    
    /**
     * @returns {string} type of the power-up
     */
    applyEffect() {
        console.debug(`Power-up of type ${this.type} collected!`)
        return this.type
    }
}

export class Explosion {
    /**
     * @param {number} x x coordinate of the explosion
     * @param {number} y y coordinate of the explosion
     * @param {number} size size of the explosion
     */
    constructor(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.lifetime = 0.5 // seconds
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

    /**
     * @param {number} deltaTime
     */
    update(deltaTime) {
        this.lifetime -= deltaTime

        for (const particle of this.particles) {
            particle.x += particle.vx * deltaTime * 60
            particle.y += particle.vy * deltaTime * 60
            particle.size *= Math.pow(0.95, deltaTime * 60)
        }

        if (this.lifetime <= 0) {
            this.isActive = false
        }

        return this.isActive
    }

    /**
     * @param {CanvasRenderingContext2D} ctx
     */
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
